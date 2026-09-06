# Architecture

NexusAI Desktop uses a layered architecture:

1. **Renderer** — React UI, chat state, workspace modules.
2. **Agent domain** — provider and tool abstractions; current MVP includes deterministic demo routing.
3. **Preload bridge** — small explicit API exposed with `contextBridge`.
4. **Main process** — native OS operations such as file dialogs and system information.

The renderer is intentionally unable to import Node.js modules directly. New privileged capabilities should be added as narrowly-scoped IPC handlers and corresponding preload methods.
