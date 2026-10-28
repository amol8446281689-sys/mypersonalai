# MyPersonalAI Engineer

A self-hostable, private AI coding engineer workspace built with React 19, TypeScript, Vite, and Tailwind CSS.

## Features

- **Private Workspace Authentication**: Password gate with rate-limiting protection, min-12 character validation, and secure session management.
- **AI Engineer (Chat)**:
  - Supports Local AI (Ollama with `qwen2.5-coder:7b`) and Remote AI (OpenAI-compatible APIs).
  - Intelligent built-in DevMind rule-based engineering responder for instant answers, architecture scaling, bug diagnosis, and project roadmaps.
  - Optional owner execution approval modal before external API calls.
  - Automatic lesson extraction & learning memory.
- **Code Workspace (Editor)**:
  - Sandboxed file explorer with file size tracking.
  - Full text code editor with file creation, saving, downloading, and syntax statistics.
  - Path traversal protection ensuring files stay strictly within the workspace folder.
- **Setup & Status**:
  - Live system telemetry, local Ollama copyable setup commands, remote API configuration, security guidelines, and lessons management.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application runs on port 3000 (`http://localhost:3000`).
Default administrator test password: `admin12345678`.
