# OpenRouter Agent

Modular AI agent built with OpenRouter SDK, supporting 300+ language models.

## Features

- **Standalone Agent Core** - Runs independently, extensible via hooks
- **OpenRouter SDK** - Unified access to 300+ language models
- **Optional Ink TUI** - Beautiful terminal UI
- **Tool Support** - Time, calculator, and extensible

## Setup

```bash
npm install
```

Set your API key:
```bash
export OPENROUTER_API_KEY='your-key-here'
```

## Usage

### Terminal UI (Interactive)
```bash
npm start
```

### Headless Mode (Command Line)
```bash
npm run start:headless
```

### Development Mode (Auto-reload)
```bash
npm run dev
```

## Architecture

```
src/
├── agent.ts        # Standalone agent core with hooks
├── tools.ts        # Tool definitions
├── cli.tsx         # Ink TUI (optional interface)
└── headless.ts     # Headless usage example
```

## Available Tools

- `get_current_time` - Get current date/time in any timezone
- `calculate` - Perform mathematical calculations

## Events

The agent emits events for hooks:
- `message:user` - User message added
- `message:assistant` - Assistant response complete
- `item:update` - Streaming item update
- `tool:call` - Tool being called
- `tool:result` - Tool returned result
- `error` - Error occurred

## Resources

- OpenRouter Docs: https://openrouter.ai/docs
- Models API: https://openrouter.ai/api/v1/models
- Get API Key: https://openrouter.ai/settings/keys
