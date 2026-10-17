* mypersonalai — DevMind (static demo)

This repository contains a small static web demo that embeds your DevMind system prompt and provides an owner-only, password-protected chat UI. It runs fully in the browser and optionally supports calling an OpenAI-compatible API endpoint if you configure BASE_URL, MODEL and an API key.

Quick start (local):

1. Clone:
   git clone https://github.com/amol8446281689-sys/mypersonalai
   cd mypersonalai

2. Open index.html in your browser (double-click). For a simple local server:
   python -m http.server 8000
   then visit http://localhost:8000

3. On first load, set an owner password. This demo stores the password locally in browser storage for gating only — it's not secure for production. For secure deployments use real auth and server-side checks.

Settings:
- ⚙️ Settings allows you to set BASE_URL, MODEL, and optionally paste an API key for direct browser calls. For production, use a server-side proxy and GitHub Actions secrets; do not store sensitive keys in client-side storage.

Live site (GitHub Pages):
If you want this hosted on GitHub Pages, enable Pages in the repository settings (source: main branch) — or I can enable it for you if you request.

Features implemented:
- Owner-only password gate (client-side)
- Embedded system prompt (DevMind)
- Chat UI with developer-friendly fallback responder (local rule-based) if no API configured
- Approval modal before any model call showing estimated model calls
- Lessons memory saved locally only after owner approval

Security notes:
- This is a demo. Do NOT store real API keys in public repos or share owner passwords.

