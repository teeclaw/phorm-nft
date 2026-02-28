---
name: openrouter
version: 1.0.0
description: Query 300+ AI models via OpenRouter API from Telegram
homepage: https://openrouter.ai
metadata:
  openrouter:
    emoji: "🔀"
    category: "ai"
    api_base: "https://openrouter.ai/api/v1"
---

# OpenRouter Skill

Access 300+ AI models via OpenRouter API directly from Telegram.

## When to Use This Skill

Use when the user wants to:
- Query a specific AI model (Claude, GPT, Gemini, etc.)
- Compare responses from different models
- Use models not available in OpenClaw's default setup
- Access cutting-edge or specialized models

## Setup

API key is already configured in `~/.openclaw/.env` as `OPENROUTER_API_KEY`.

## Usage

### Basic Query

Say: `openrouter <query>`

Example:
```
openrouter what is the capital of france?
```

### Specify Model

Say: `openrouter <model> <query>`

Example:
```
openrouter claude-opus what is quantum computing?
openrouter gpt-4 explain bitcoin
openrouter gemini-pro summarize this text
```

### List Available Models

Say: `openrouter list` or `openrouter models`

### Model Categories

Common model prefixes:
- `claude-*` - Anthropic Claude models
- `gpt-*` - OpenAI GPT models
- `gemini-*` - Google Gemini models
- `llama-*` - Meta Llama models
- `mistral-*` - Mistral AI models

## How It Works

1. User sends query in Telegram
2. Agent detects "openrouter" keyword
3. Script calls OpenRouter API
4. Response sent back to Telegram

## Commands

| Command | Action |
|---------|--------|
| `openrouter <query>` | Query with default model (auto) |
| `openrouter <model> <query>` | Query specific model |
| `openrouter list` | List popular models |
| `openrouter models` | List all available models |

## Model Discovery

Models change frequently. Use `openrouter list` to see current options.

Popular models:
- `openrouter/auto` - Automatic best model selection
- `anthropic/claude-opus-4` - Latest Claude Opus
- `anthropic/claude-sonnet-4` - Latest Claude Sonnet
- `openai/gpt-4` - GPT-4
- `google/gemini-pro` - Gemini Pro

## Technical Details

**API Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Authentication:** Bearer token (OPENROUTER_API_KEY)

**Rate Limits:** Varies by model and account tier

## Resources

- OpenRouter Docs: https://openrouter.ai/docs
- Browse Models: https://openrouter.ai/models
- Get API Key: https://openrouter.ai/settings/keys
