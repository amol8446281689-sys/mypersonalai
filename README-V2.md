# MyPersonalAI Engineer V2

A self-hostable, browser-based personal AI coding workspace. This version adds a server-side login session, a local-first AI option through Ollama, an optional OpenAI-compatible API provider, and a confined file editor.

## Important: preserve the existing V1

This bundle is a V2 foundation. It does not overwrite your existing `index.html` or remove V1. Add it in a separate folder or branch, review it, and test before switching your live site.

## Requirements

- Node.js 20 or newer
- For local AI: Ollama installed on the same machine as the Node server
- Optional: an OpenAI-compatible API endpoint and key

## Run on Windows 11

1. Extract the ZIP.
2. Open the extracted folder in Terminal/PowerShell.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Edit `.env`: set `SESSION_SECRET` to a random string of at least 32 characters and set `ADMIN_PASSWORD` to a unique password of at least 12 characters.
6. For local AI, install Ollama and run `ollama pull qwen2.5-coder:7b`. Ensure `OLLAMA_MODEL=qwen2.5-coder:7b` in `.env`.
7. Run `npm start`.
8. Open `http://127.0.0.1:3000` in your browser and sign in.

## Remote AI

Set `REMOTE_AI_BASE_URL` to the provider's API base URL (without `/chat/completions`), `REMOTE_AI_API_KEY`, and `REMOTE_AI_MODEL`. The key is read only by the server and is not sent to the browser. Use only a provider you trust; remote prompts may leave your machine.

## Workspace

The Code workspace editor can list, read, and save text files inside `WORKSPACE_DIR` (default `./workspace`). It rejects absolute paths and path traversal. It does not execute AI-generated code automatically.

## Browser access from outside your machine

Do not expose the raw Node server directly to the public internet. For remote use, place it behind HTTPS with a reverse proxy and preferably a VPN or identity-aware access layer. Set `NODE_ENV=production` when HTTPS is configured so secure session cookies are enabled. Use a strong unique password and secret; keep `.env`, `data/`, and `workspace/` out of public repositories. GitHub Pages alone cannot run this backend or keep server-side secrets private.

## Security scope and limitations

- Server-side password check, bcrypt hash during runtime, rate-limited login, HttpOnly/SameSite session cookie, Helmet headers, request-size limits, and workspace path confinement are included.
- This is a starter, not a penetration-tested production product. Before public launch, add persistent account management, CSRF protection appropriate to the deployment, audit logging, backup/restore, dependency scanning, HTTPS/proxy configuration tests, and an external security review.
- The configured admin password is loaded from `.env`; change it by editing `.env` and restarting.
- The app does not have permission to change the GitHub repository automatically. This source bundle must be reviewed and then uploaded/committed by the repository owner or an authorized write-enabled coding environment.
