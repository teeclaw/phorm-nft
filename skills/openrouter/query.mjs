#!/usr/bin/env node
/**
 * OpenRouter Query Script
 * Usage: node query.mjs [model] <prompt>
 */

import 'dotenv/config';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_BASE = 'https://openrouter.ai/api/v1';

if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY not set in environment');
  process.exit(1);
}

async function query(model, prompt) {
  try {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://openclaw.ai',
        'X-Title': 'OpenClaw Agent'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid API response format');
    }

    const message = data.choices[0].message.content;
    const usedModel = data.model || model;
    
    console.log(`**Model:** ${usedModel}\n\n${message}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

async function listModels() {
  try {
    const response = await fetch(`${API_BASE}/models`, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter and show popular models
    const popularModels = data.data
      .filter(m => {
        const id = m.id.toLowerCase();
        return id.includes('claude') || 
               id.includes('gpt-4') || 
               id.includes('gemini') ||
               id.includes('llama-3') ||
               id === 'openrouter/auto';
      })
      .slice(0, 20)
      .map(m => `• ${m.id} - ${m.name}`)
      .join('\n');

    console.log(`**Popular OpenRouter Models:**\n\n${popularModels}\n\nFor all models, visit: https://openrouter.ai/models`);
    
  } catch (error) {
    console.error(`❌ Error listing models: ${error.message}`);
    process.exit(1);
  }
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node query.mjs [model] <prompt>');
  console.error('   or: node query.mjs list');
  process.exit(1);
}

if (args[0] === 'list' || args[0] === 'models') {
  await listModels();
} else if (args.length === 1) {
  // Single arg = prompt only, use auto model
  await query('openrouter/auto', args[0]);
} else {
  // First arg = model, rest = prompt
  const model = args[0];
  const prompt = args.slice(1).join(' ');
  await query(model, prompt);
}
