# OpenRouter Skill

Access 300+ AI models via OpenRouter API from OpenClaw/Telegram.

## Setup

1. API key is already configured: `OPENROUTER_API_KEY` in `~/.openclaw/.env`
2. Dependencies installed (dotenv)

## Usage from Telegram

### Basic Query (Auto Model Selection)

```
@agent use openrouter to explain quantum computing
```

or

```
openrouter what is the capital of france?
```

### Query Specific Model

```
openrouter anthropic/claude-opus-4.6 explain bitcoin
openrouter google/gemini-3-pro-preview write a haiku
openrouter openai/gpt-4o summarize this article
```

### List Available Models

```
openrouter list
```

or

```
openrouter models
```

## Direct CLI Usage

```bash
# Auto model
cd ~/.openclaw/workspace/skills/openrouter
source ~/.openclaw/.env
node query.mjs "your question here"

# Specific model
node query.mjs anthropic/claude-opus-4.6 "your question here"

# List models
node query.mjs list
```

## How It Works

1. User sends message containing "openrouter" keyword
2. OpenClaw reads SKILL.md and understands how to use the skill
3. Agent calls `query.mjs` with appropriate arguments
4. Response is sent back to Telegram

## Popular Models

- `openrouter/auto` - Automatic best model selection (default)
- `anthropic/claude-opus-4.6` - Latest Claude Opus
- `anthropic/claude-sonnet-4.6` - Latest Claude Sonnet
- `google/gemini-3-pro-preview` - Gemini 3 Pro
- `openai/gpt-4o` - GPT-4 Omni

Browse all models: https://openrouter.ai/models

## Cost

Pricing varies by model. Most queries cost $0.001-0.01. Check https://openrouter.ai/models for specific pricing.

## Files

- `SKILL.md` - Skill documentation (read by OpenClaw)
- `query.mjs` - Main query script
- `package.json` - Dependencies
- `README.md` - This file
