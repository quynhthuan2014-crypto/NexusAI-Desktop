# NexusAI Desktop

> A privacy-conscious AI desktop workspace with chat, memory, vision preview, local file tools, permissions, and an extensible agent architecture.

NexusAI Desktop is a desktop-first AI workspace built with Electron, React, TypeScript, and Vite. The repository is designed to be useful even before an external AI provider is configured: it starts in a Demo/Offline mode and keeps machine tools behind explicit user actions.

## Highlights

- **Assistant** — chat UI with a deterministic offline fallback.
- **Tools** — calculator, system information, and agent status.
- **Files** — open text, Markdown, JSON, CSV, and log files locally.
- **Vision** — local image preview without an automatic upload.
- **Memory** — user-managed context for the workspace.
- **Permission-first architecture** — sensitive tools are explicit actions instead of background automation.
- **Provider-ready settings** — room for OpenAI-compatible and local model adapters.
- **Cross-platform packaging** — electron-builder targets Windows, macOS, and Linux.

## Run locally

Requirements: Node.js 20+ and npm 10+.

```bash
npm install
npm test
npm run dev
```

Build installers:

```bash
npm run build
```

## Architecture

```text
Electron main process
  ├── system tools
  ├── file dialog / local file IO
  └── secure preload bridge
           │
           ▼
React renderer
  ├── Assistant
  ├── Memory
  ├── Vision
  ├── Files
  ├── Tools
  └── Settings
```

The renderer does not get direct Node.js access. Electron uses `contextIsolation`, `nodeIntegration: false`, and a small preload API.

## AI provider

The current MVP intentionally uses a Demo/Offline provider so the app has a working path without exposing or hard-coding API secrets. A real provider can be implemented behind a provider adapter and credentials should be stored with the operating system's secure credential facilities.

## Security notes

This repository does not request administrator privileges, does not hide background processes, and does not ship API keys. Tool execution should remain explicit and user-visible as the project grows.

## Project status

**MVP / active development**. Core shell and local tools are implemented; real model adapters, streaming, secure credential storage, richer agent planning, and signed releases are planned next.
