#!/usr/bin/env node
/**
 * BaseCred Reputation Handler
 * Integrates @basecred/sdk for x402-gated reputation checks
 */

const { getUnifiedProfile } = require('@basecred/sdk');
require('dotenv').config({ path: '/home/phan_harry/.openclaw/.env' });

/**
 * Check reputation for an Ethereum address
 * @param {string} address - Ethereum address to check
 * @returns {Promise<object>} Unified reputation profile
 */
async function checkReputation(address) {
  try {
    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return {
        error: 'Invalid address format',
        message: 'Please provide a valid Ethereum address (0x...)',
      };
    }

    // Configure SDK with available API keys
    const config = {
      ethos: {
        baseUrl: 'https://api.ethos.network',
        clientId: 'mr-tee-a2a@1.0.0',
      },
    };

    // Add Talent Protocol if API key available
    if (process.env.TALENT_API_KEY) {
      config.talent = {
        baseUrl: 'https://api.talentprotocol.com',
        apiKey: process.env.TALENT_API_KEY,
      };
    }

    // Add Farcaster (Neynar) if API key available
    if (process.env.NEYNAR_API_KEY) {
      config.farcaster = {
        enabled: true,
        neynarApiKey: process.env.NEYNAR_API_KEY,
        qualityThreshold: 0.5,
      };
    }

    // Fetch unified profile
    const profile = await getUnifiedProfile(address, config);

    // Return the raw unified profile
    return {
      success: true,
      address,
      timestamp: new Date().toISOString(),
      profile,
      sources: {
        ethos: profile.availability.ethos === 'available',
        talent: config.talent ? profile.availability.talent === 'available' : 'not_configured',
        farcaster: config.farcaster ? profile.availability.farcaster === 'available' : 'not_configured',
      },
    };

  } catch (error) {
    console.error('BaseCred reputation check error:', error);
    return {
      error: 'Reputation check failed',
      message: error.message,
      address,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Extract summary statistics from unified profile
 * @param {object} response - Response from checkReputation
 * @returns {object} Summary stats
 */
function getSummary(response) {
  if (response.error) {
    return { error: response.error };
  }

  const { profile } = response;
  const summary = {
    address: response.address,
    timestamp: response.timestamp,
  };

  // Ethos summary
  if (profile.ethos?.data) {
    summary.ethos = {
      score: profile.ethos.data.score,
      level: profile.ethos.data.credibilityLevel?.level,
      vouches: profile.ethos.data.vouchesReceived,
      reviews: profile.ethos.data.reviews,
    };
  }

  // Talent summary
  if (profile.talent?.data) {
    summary.talent = {
      builderScore: profile.talent.data.builderScore,
      builderLevel: profile.talent.data.builderLevel?.level,
      builderRank: profile.talent.data.builderRankPosition,
      creatorScore: profile.talent.data.creatorScore,
      creatorLevel: profile.talent.data.creatorLevel?.level,
      creatorRank: profile.talent.data.creatorRankPosition,
    };
  }

  // Farcaster summary
  if (profile.farcaster?.data) {
    summary.farcaster = {
      score: profile.farcaster.data.userScore,
      passesQuality: profile.farcaster.signals?.passesQualityThreshold,
    };
  }

  // Recency
  if (profile.recency) {
    summary.recency = profile.recency.bucket;
  }

  return summary;
}

module.exports = { checkReputation, getSummary };

// CLI usage: node basecred-handler.js 0x123...
if (require.main === module) {
  const address = process.argv[2];
  if (!address) {
    console.error('Usage: node basecred-handler.js <ethereum_address>');
    process.exit(1);
  }

  checkReputation(address)
    .then(result => {
      console.log('\n=== Full Profile ===');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\n=== Summary ===');
      console.log(JSON.stringify(getSummary(result), null, 2));
      
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
