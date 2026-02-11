import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { facilitator } from '@coinbase/x402';
import { getUnifiedProfile } from '@basecred/sdk';
import fs from 'fs';

// --- Config ---
const PORT = process.env.X402_PORT || 4021;
const PAY_TO = process.env.TREASURY_WALLET;
if (!PAY_TO) {
  console.error('FATAL: TREASURY_WALLET not set in environment. Refusing to start.');
  process.exit(1);
}

// --- Rate Limiting ---
const freeLimiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  max: 30,                 // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// --- Request Logging ---
function logRequest(req, paid = false) {
  const entry = `${new Date().toISOString()} | ${req.ip} | ${paid ? 'PAID' : 'FREE'} | ${req.method} ${req.originalUrl}\n`;
  fs.appendFileSync('access.log', entry);
}
const NETWORK = 'eip155:8453'; // Base mainnet

// --- Basecred SDK config ---
const basecredConfig = {
  ethos: {
    baseUrl: 'https://api.ethos.network',
    clientId: 'x402-reputation-server@1.0.0',
  },
};
if (process.env.TALENT_API_KEY) {
  basecredConfig.talent = {
    baseUrl: 'https://api.talentprotocol.com',
    apiKey: process.env.TALENT_API_KEY,
  };
}
if (process.env.NEYNAR_API_KEY) {
  basecredConfig.farcaster = {
    enabled: true,
    neynarApiKey: process.env.NEYNAR_API_KEY,
    qualityThreshold: 0.5,
  };
}

// --- Express app ---
const app = express();
app.use(express.json());

// --- x402 Resource Server ---
const facilitatorClient = new HTTPFacilitatorClient(facilitator);
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(NETWORK, new ExactEvmScheme());

// --- x402 Payment Routes ---
const routes = {
  'GET /reputation/full-report': {
    accepts: {
      scheme: 'exact',
      price: '$2.00',
      network: NETWORK,
      payTo: PAY_TO,
    },
    description: 'Full reputation profile with all data sources (Ethos, Talent Protocol, Farcaster/Neynar)',
  },
};

app.use(paymentMiddleware(routes, resourceServer));

// --- Free: Health ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'x402-reputation-server',
    version: '1.0.0',
    network: NETWORK,
    endpoints: {
      '/health': 'FREE',
      '/reputation/simple-report?address=0x...': 'FREE - summary scores',
      '/reputation/full-report?address=0x...': '$2.00 USDC - full profile',
    },
  });
});

// --- Free: Simple report ---
app.get('/reputation/simple-report', freeLimiter, async (req, res) => {
  const { address } = req.query;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Valid Ethereum address required (?address=0x...)' });
  }

  logRequest(req, false);

  try {
    const profile = await getUnifiedProfile(address, basecredConfig);
    const summary = buildSummary(profile);
    res.json({
      address,
      summary,
      _note: 'For full profile data, use /reputation/full-report ($2.00 USDC)',
    });
  } catch (err) {
    console.error('Reputation summary error:', err);
    res.status(500).json({ error: 'Failed to fetch reputation. Please try again later.' });
  }
});

// --- Paid ($2 USDC): Full reputation report ---
app.get('/reputation/full-report', async (req, res) => {
  const { address } = req.query;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Valid Ethereum address required (?address=0x...)' });
  }

  logRequest(req, true);

  try {
    const profile = await getUnifiedProfile(address, basecredConfig);
    const insights = await generateInsights(address, profile);
    const humanReadable = buildHumanReadable(address, profile, insights);
    res.json({
      address,
      humanReadable,
      profile,
      sources: {
        ethos: profile.ethos ? 'available' : 'not found',
        talent: profile.talent ? 'available' : 'not found',
        farcaster: profile.farcaster ? 'available' : 'not found',
      },
      _payment: {
        amount: '$2.00',
        currency: 'USDC',
        network: 'Base (eip155:8453)',
      },
    });
  } catch (err) {
    console.error('Full reputation error:', err);
    res.status(500).json({ error: 'Failed to fetch reputation. Please try again later.' });
  }
});

// --- Helper: Build summary from full profile ---
function buildSummary(profile) {
  const summary = {};

  if (profile.ethos?.data) {
    summary.ethos = {
      score: profile.ethos.data.score,
      reviews: profile.ethos.data.numberOfReviews,
    };
  }

  if (profile.talent?.data) {
    const t = profile.talent.data;
    summary.talent = {
      builderScore: t.builderScore,
      builderLevel: t.builderLevel?.level,
      creatorScore: t.creatorScore,
      creatorLevel: t.creatorLevel?.level,
    };
  }

  if (profile.farcaster?.data) {
    summary.farcaster = {
      score: profile.farcaster.data.userScore,
      passesQuality: profile.farcaster.signals?.passesQualityThreshold,
    };
  }

  if (profile.recency) {
    summary.recency = profile.recency.bucket;
  }

  return summary;
}

// --- AI Insights via Sonnet ---
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

async function generateInsights(address, profile) {
  if (!OPENROUTER_KEY) return null;

  const data = {
    ethos: profile.ethos?.data || null,
    ethosSignals: profile.ethos?.signals || null,
    ethosMeta: profile.ethos?.meta || null,
    talent: profile.talent?.data || null,
    talentSignals: profile.talent?.signals || null,
    farcaster: profile.farcaster?.data || null,
    farcasterSignals: profile.farcaster?.signals || null,
    recency: profile.recency || null,
  };

  const prompt = `You're writing brief, natural commentary for an onchain reputation report for address ${address}.

Here's the raw data:
${JSON.stringify(data, null, 2)}

Write commentary for each section that has data, plus an overall assessment at the end. Rules:
- Conversational tone, like you're explaining to a friend
- 2-3 sentences per section max
- Mention what's strong, what's weak, one actionable improvement
- No headers, no bullet points, no emojis
- Don't repeat the exact numbers (they're already shown above your text)
- Overall assessment: 2-3 sentences tying everything together

Return ONLY a JSON object with these keys (skip keys where data is null):
{
  "ethos": "your commentary...",
  "talent": "your commentary...",
  "farcaster": "your commentary...",
  "overall": "your overall assessment..."
}`;

  const models = [
    { name: 'anthropic/claude-sonnet-4-5', timeout: 15000 },
    { name: 'anthropic/claude-haiku-3-5', timeout: 10000 },
  ];

  for (const { name, timeout } of models) {
    try {
      console.log(`AI insights: trying ${name} (${timeout}ms)...`);
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: name,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(timeout),
      });

      const result = await res.json();
      const content = result.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log(`AI insights: ${name} succeeded`);
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error(`AI insights: ${name} failed — ${err.message}`);
    }
  }

  console.error('AI insights: all models failed, shipping without commentary');
  return null;
}

// --- Helper: Build human-readable report ---
function buildHumanReadable(address, profile, insights = null) {
  const lines = [];
  lines.push(`─────`);
  lines.push(`  REPUTATION REPORT`);
  lines.push(`  ${address}`);
  lines.push(`─────`);
  lines.push('');

  // Ethos
  if (profile.ethos?.data) {
    const e = profile.ethos.data;
    lines.push(`🛡️  ETHOS NETWORK`);
    lines.push(`   Score:        ${e.score} (${e.credibilityLevel?.level || 'Unknown'})`);
    if (e.reviews) {
      lines.push(`   Reviews:      +${e.reviews.positive} / ~${e.reviews.neutral} / -${e.reviews.negative}`);
    }
    lines.push(`   Vouches:      ${e.vouchesReceived || 0} received`);
    if (profile.ethos.signals) {
      lines.push(`   Flags:        ${e.reviews?.negative > 0 ? '⚠️ Has negative reviews' : '✅ No negative reviews'}`);
    }
    if (profile.ethos.meta) {
      lines.push(`   First seen:   ${profile.ethos.meta.firstSeenAt?.split('T')[0] || 'N/A'}`);
      lines.push(`   Active:       ${profile.ethos.meta.activeSinceDays || '?'} days`);
    }
  } else {
    lines.push(`🛡️  ETHOS NETWORK: No profile found`);
  }
  if (insights?.ethos) {
    lines.push('');
    lines.push(`   ${insights.ethos}`);
  }
  lines.push('');

  // Talent
  if (profile.talent?.data) {
    const t = profile.talent.data;
    lines.push(`🏗️  TALENT PROTOCOL`);
    lines.push(`   Builder:      ${t.builderScore} (${t.builderLevel?.level || 'Unknown'})${t.builderRankPosition ? ` — Rank #${t.builderRankPosition}` : ''}`);
    lines.push(`   Creator:      ${t.creatorScore} (${t.creatorLevel?.level || 'Unknown'})${t.creatorRankPosition ? ` — Rank #${t.creatorRankPosition}` : ''}`);
    if (profile.talent.signals) {
      const s = profile.talent.signals;
      lines.push(`   Verified:     ${s.verifiedBuilder ? '✅ Builder' : '❌ Builder'} | ${s.verifiedCreator ? '✅ Creator' : '❌ Creator'}`);
    }
    if (profile.talent.meta?.lastUpdatedAt) {
      lines.push(`   Last updated: ${profile.talent.meta.lastUpdatedAt.split('T')[0]}`);
    }
  } else {
    lines.push(`🏗️  TALENT PROTOCOL: No profile found`);
  }
  if (insights?.talent) {
    lines.push('');
    lines.push(`   ${insights.talent}`);
  }
  lines.push('');

  // Farcaster
  if (profile.farcaster?.data) {
    const f = profile.farcaster.data;
    lines.push(`💜  FARCASTER`);
    lines.push(`   Quality:      ${f.userScore} ${profile.farcaster.signals?.passesQualityThreshold ? '✅ Passes threshold' : '❌ Below threshold'}`);
  } else {
    lines.push(`💜  FARCASTER: No profile found`);
  }
  if (insights?.farcaster) {
    lines.push('');
    lines.push(`   ${insights.farcaster}`);
  }
  lines.push('');

  // Recency
  if (profile.recency) {
    lines.push(`⏱️  RECENCY: ${profile.recency.bucket} (${profile.recency.windowDays}-day window)`);
  }

  if (insights?.overall) {
    lines.push('');
    lines.push(`─────`);
    lines.push('');
    lines.push(`   ${insights.overall}`);
  }

  lines.push('');
  lines.push(`─────`);
  lines.push(`  Powered by Basecred SDK`);
  lines.push(`─────`);

  return lines.join('\n');
}

// --- Start ---
app.listen(PORT, () => {
  console.log(`x402 Reputation Server running on port ${PORT}`);
  console.log(`  Network: ${NETWORK}`);
  console.log(`  Pay to:  ${PAY_TO}`);
  console.log(`  Endpoints:`);
  console.log(`    GET /health              FREE`);
  console.log(`    GET /reputation/simple-report  FREE (summary)`);
  console.log(`    GET /reputation/full-report  $2.00 USDC`);
});
