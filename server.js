require("dotenv").config();
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const WORKSPACE = path.resolve(process.env.WORKSPACE_DIR || path.join(ROOT, "workspace"));
const DEV_AUTH_BYPASS = process.env.DISABLE_AUTH === "true" && process.env.NODE_ENV !== "production";
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(WORKSPACE, { recursive: true });

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.error("ERROR: Set SESSION_SECRET to a random value of at least 32 characters in .env");
  process.exit(1);
}
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
  console.error("ERROR: Set ADMIN_PASSWORD to a strong password of at least 12 characters in .env");
  process.exit(1);
}
const adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12);

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  }
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(session({
  name: "mypersonalai.sid",
  store: new SQLiteStore({ db: "sessions.sqlite", dir: DATA_DIR }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000
  }
}));
app.use("/api/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false }));

function requireAuth(req, res, next) {
  if (DEV_AUTH_BYPASS) return next();
  if (!req.session || req.session.authenticated !== true) return res.status(401).json({ error: "Please sign in first." });
  next();
}
function safePath(relativePath) {
  if (typeof relativePath !== "string" || !relativePath.trim()) throw new Error("A file path is required.");
  if (relativePath.includes("\0") || path.isAbsolute(relativePath)) throw new Error("Invalid path.");
  const resolved = path.resolve(WORKSPACE, relativePath);
  if (resolved !== WORKSPACE && !resolved.startsWith(WORKSPACE + path.sep)) throw new Error("Path escapes the workspace.");
  return resolved;
}
async function requestJson(url, options, timeoutMs = 90000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const body = await response.text();
    let data;
    try { data = JSON.parse(body); } catch { data = { raw: body }; }
    if (!response.ok) throw new Error(data.error?.message || data.error || `AI provider returned HTTP ${response.status}`);
    return data;
  } finally { clearTimeout(timer); }
}

app.get("/api/health", (_req, res) => res.json({
  name: "MyPersonalAI Engineer",
  version: "2.0.0",
  localAIConfigured: Boolean(process.env.OLLAMA_BASE_URL && process.env.OLLAMA_MODEL),
  remoteAIConfigured: Boolean(process.env.REMOTE_AI_BASE_URL && process.env.REMOTE_AI_MODEL && process.env.REMOTE_AI_API_KEY)
}));

app.get("/api/session", (req, res) => res.json({ authenticated: req.session?.authenticated === true }));

function finishLogin(req, res) {
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: "Could not start a secure session." });
    req.session.authenticated = true;
    req.session.save(saveErr => saveErr ? res.status(500).json({ error: "Could not save session." }) : res.json({ ok: true }));
  });
}

app.post("/api/login", async (req, res) => {
  // Dev bypass: auto-login when explicitly allowed
  if (DEV_AUTH_BYPASS) {
    return finishLogin(req, res);
  }

  const password = String(req.body?.password || "");

  // Normal admin password check
  try {
    if (await bcrypt.compare(password, adminHash)) return finishLogin(req, res);
  } catch (e) {
    // fall through to other checks
  }

  // Development-time temporary password options (do NOT enable in production)
  if (process.env.NODE_ENV !== "production") {
    // 1) ENV variable TEMP_ADMIN_PASSWORD (requires server restart to take effect)
    if (process.env.TEMP_ADMIN_PASSWORD && password === String(process.env.TEMP_ADMIN_PASSWORD)) {
      return finishLogin(req, res);
    }

    // 2) One-time temp password file: data/temp_admin_password (create this file with the desired password)
    //    The file will be deleted after a successful login to avoid lingering credential exposure.
    try {
      const tempFile = path.join(DATA_DIR, "temp_admin_password");
      if (fs.existsSync(tempFile)) {
        const temp = fs.readFileSync(tempFile, "utf8").trim();
        if (temp && password === temp) {
          try { fs.unlinkSync(tempFile); } catch (e) { /* ignore deletion errors */ }
          return finishLogin(req, res);
        }
      }
    } catch (e) {
      // ignore file errors and continue to reject
    }
  }

  return res.status(401).json({ error: "Password is incorrect." });
});

app.post("/api/logout", requireAuth, (req, res) => req.session.destroy(() => {
  res.clearCookie("mypersonalai.sid", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  res.json({ ok: true });
}));

app.get("/api/files", requireAuth, (_req, res) => {
  function walk(dir, prefix = "") {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const rel = path.posix.join(prefix, entry.name);
      if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel));
      else out.push({ path: rel, size: fs.statSync(path.join(dir, entry.name)).size });
      if (out.length > 500) break;
    }
    return out;
  }
  res.json({ files: walk(WORKSPACE).slice(0, 500) });
});
app.get("/api/file", requireAuth, (req, res) => {
  try {
    const p = safePath(req.query.path);
    if (!fs.existsSync(p) || !fs.statSync(p).isFile()) return res.status(404).json({ error: "File not found." });
    if (fs.statSync(p).size > 1024 * 1024) return res.status(413).json({ error: "Files over 1 MB are not displayed in the editor." });
    res.json({ path: req.query.path, content: fs.readFileSync(p, "utf8") });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.put("/api/file", requireAuth, (req, res) => {
  try {
    const p = safePath(req.body?.path);
    const content = req.body?.content;
    if (typeof content !== "string") return res.status(400).json({ error: "File content must be text." });
    if (Buffer.byteLength(content, "utf8") > 1024 * 1024) return res.status(413).json({ error: "Maximum file size is 1 MB." });
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, { encoding: "utf8", mode: 0o600 });
    res.json({ ok: true, path: path.relative(WORKSPACE, p) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.post("/api/chat", requireAuth, async (req, res) => {
  const provider = req.body?.provider === "remote" ? "remote" : "local";
  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 30) return res.status(400).json({ error: "Send between 1 and 30 messages." });
  const clean = messages.map(m => ({
    role: ["system", "user", "assistant"].includes(m?.role) ? m.role : "user",
    content: String(m?.content || "").slice(0, 20000)
  }));
  try {
    let answer;
    if (provider === "remote") {
      const base = process.env.REMOTE_AI_BASE_URL;
      const model = process.env.REMOTE_AI_MODEL;
      const key = process.env.REMOTE_AI_API_KEY;
      if (!base || !model || !key) return res.status(400).json({ error: "Remote AI is not configured in .env." });
      const data = await requestJson(base.replace(/\/+$/, "") + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({ model, messages: clean, temperature: 0.2 })
      });
      answer = data.choices?.[0]?.message?.content || "The provider returned no text.";
    } else {
      const base = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
      const model = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";
      const data = await requestJson(base + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: clean, stream: false })
      });
      answer = data.message?.content || "Ollama returned no text.";
    }
    res.json({ answer, provider });
  } catch (e) {
    const msg = e.name === "AbortError" ? "AI request timed out." : e.message;
    res.status(502).json({ error: msg });
  }
});

app.use(express.static(path.join(ROOT, "public"), { extensions: ["html"] }));
app.get("*", (_req, res) => res.sendFile(path.join(ROOT, "public", "index.html")));
app.listen(PORT, "127.0.0.1", () => {
  console.log(`MyPersonalAI Engineer running at http://127.0.0.1:${PORT}`);
  console.log(`Workspace: ${WORKSPACE}`);
  console.log("For remote access, use HTTPS behind a reverse proxy/VPN; do not expose the raw Node port to the internet.");
});
