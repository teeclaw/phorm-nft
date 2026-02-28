# OpenRouter Skill - Usage Guide

## From Telegram

The skill is ready to use. When you mention "openrouter" in your message, I'll know to use this skill.

### Examples

**Basic query (auto model):**
```
openrouter what is quantum entanglement?
```

**Specific model:**
```
openrouter google/gemini-2.5-flash write a poem about the ocean
```

**List models:**
```
openrouter list
```

## How I Use It

When you say "openrouter", I will:

1. Read the SKILL.md to understand the available options
2. Extract your query and model preference (if specified)
3. Run the query.mjs script with appropriate arguments
4. Return the response to you

## Available Models (Popular)

- `openrouter/auto` - Auto-selects best model (default, usually GPT-5 Nano)
- `google/gemini-2.5-flash` - Fast, reliable, good for general queries
- `google/gemini-3-pro-preview` - More capable Gemini
- `anthropic/claude-opus-4.6` - Most capable Claude (requires credits)
- `anthropic/claude-sonnet-4.6` - Balanced Claude (requires credits)

Full list: https://openrouter.ai/models

## Cost & Credits

- Auto model (GPT-5 Nano): Very cheap, usually fractions of a cent
- Gemini models: Free tier available
- Claude/GPT-4: Requires OpenRouter credits

Current account has limited credits. For heavy usage, add credits at: https://openrouter.ai/settings/credits

## Technical Note

- Max response length: 1000 tokens (~750 words)
- API endpoint: https://openrouter.ai/api/v1
- Rate limits apply based on account tier
