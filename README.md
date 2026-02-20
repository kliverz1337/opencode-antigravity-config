# ⚡ Opencode Antigravity Config

GUI installer for [Antigravity OpenCode](https://opencode.ai) configuration stack — distributed as an npm package.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/kliverz1337/opencode-antigravity-config.git
cd opencode-antigravity-config

# Install dependencies and link globally
npm install
npm link

# Launch the installer GUI
opencode-agc
```

## What It Installs

The installer deploys **6 configuration files** to `~/.config/opencode/`:

| File | Description |
|------|-------------|
| `opencode.json` | Core config — models, providers, plugins |
| `oh-my-opencode.jsonc` | oMo agent overrides & categories |
| `dcp.jsonc` | Dynamic Context Pruning settings |
| `supermemory.jsonc` | Supermemory plugin config |
| `opencode-sync.jsonc` | OpenSync plugin config |
| `package.json` | Plugin dependencies |

## oMo Agent Stack

| Agent | Role | Model |
|-------|------|-------|
| **Sisyphus** | Orchestrator Engine | Gemini 3 Pro (high) |
| **Prometheus** | App Builder | Gemini 3 Pro (high) |
| **Metis** | Senior Coder | Gemini 3 Pro (high) |
| **Hephaestus** | Coder | Gemini 3 Pro (standard) |
| **Momus** | Reviewer | Gemini 3 Pro (standard) |
| **Atlas** | Planner | Gemini 3 Pro (standard) |
| **Oracle** | Advisor | Gemini 3 Pro (high) |
| **Librarian** | Research | Gemini 3 Flash (low) |
| **Explore** | Read-only Scout | Gemini 3 Flash (minimal) |
| **Multimodal Looker** | Vision | Gemini 3 Flash (standard) |

## Available Models

| Model | Context | Thinking |
|-------|---------|----------|
| Gemini 3 Pro | 1M tokens | standard / low / high |
| Gemini 3 Flash | 1M tokens | standard / minimal / low / medium / high |
| Claude 4.6 Sonnet | 200K tokens | standard |
| Claude 4.6 Sonnet Thinking | 200K tokens | low (8K) / max (32K) |
| Claude 4.6 Opus Thinking | 200K tokens | low (8K) / max (32K) |

## GUI Features

- **6-Step Setup Wizard** — intuitive UI guided setup process.
- **oMo AI Model config** — native config tab to assign distinct AI models per oMo agent group.
- **i18n Multi-language** — flip between English and Indonesian natively.
- **System Check** — verifies Node.js, npm, OpenCode, bundled configs.
- **API Key Management** — auto-detects existing keys, live validation.
- **Selective Install** — choose which config files to install.
- **Config Preview** — view decoded config content before installing.
- **Diff View** — compare bundled vs existing config (line-by-line).
- **Export / Import Settings** — save/load API keys & preferences to JSON.
- **Version Check** — check for installer updates (configurable endpoint)
- **Uninstall / Reset** — safely remove configs with automatic backup
- **Backup** — auto-backup existing configs before overwrite
- **Streaming npm install** — real-time output during dependency installation

## After Installation

```bash
# 1. Authenticate with Antigravity
opencode auth login

# 2. Start OpenCode
opencode
```

## API Keys (Optional)

The installer can inject API keys into config files during installation:

| Service | Config File | Get Key From |
|---------|------------|--------------|
| Supermemory | `supermemory.jsonc` | [console.supermemory.ai/keys](https://console.supermemory.ai/keys) |
| OpenSync | `opencode-sync.jsonc` | [opensync.dev](https://opensync.dev) → Settings |

Keys can also be added manually to the config files after installation.

## Development

```bash
# Clone and install
git clone <repo-url>
cd opencode-config
npm install

# Run locally
npm start

# Register global command for testing
npm link
opencode-agc
```

## Architecture

```
opencode-antigravity-config/
├── cli.js           # npm bin entry → launches Electron
├── main.js          # Electron main process + IPC handlers
├── preload.js       # Context bridge (security)
├── renderer.js      # UI logic + modal system
├── i18n.js          # UI translations mapping
├── index.html       # GUI layout (6-step wizard)
├── styles.css       # Native Windows theme
├── config-data.js   # Base64-encoded config payloads
└── package.json     # npm package config + bin
```

## License

ISC
