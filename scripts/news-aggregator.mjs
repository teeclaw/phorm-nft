#!/usr/bin/env node
/**
 * Resilient News Aggregator
 * Fetches trending crypto/tech news from multiple sources with automatic fallback
 * 
 * Usage: node scripts/news-aggregator.mjs [--limit N] [--format json|text]
 * 
 * Sources (in priority order):
 * 1. HackerNews Algolia API (reliable, no auth)
 * 2. Decrypt.co RSS feed (reliable, crypto-focused)
 * 3. CoinDesk RSS feed (backup crypto source)
 * 4. Cointelegraph RSS feed (backup crypto source)
 * 5. The Block RSS feed (via alternate endpoint)
 * 
 * Returns: Aggregated news items with metadata
 */

import https from 'https';
import http from 'http';

const TIMEOUTS = {
  connection: 10000,
  response: 15000
};

const SOURCES = {
  hackernews: {
    name: 'HackerNews',
    url: 'https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=15',
    parser: parseHackerNews,
    priority: 1
  },
  decrypt: {
    name: 'Decrypt',
    url: 'https://decrypt.co/feed',
    parser: parseRSS,
    priority: 2
  },
  coindesk: {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    parser: parseRSS,
    priority: 3
  },
  cointelegraph: {
    name: 'Cointelegraph',
    url: 'https://cointelegraph.com/rss',
    parser: parseRSS,
    priority: 4
  }
};

async function fetchWithTimeout(url, timeout = TIMEOUTS.response) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${timeout}ms`));
    }, timeout);

    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MrTee-NewsBot/1.0)'
      },
      timeout: TIMEOUTS.connection
    }, (res) => {
      if (res.statusCode !== 200) {
        clearTimeout(timeoutId);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeoutId);
        resolve(data);
      });
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

function parseHackerNews(data) {
  try {
    const json = JSON.parse(data);
    return json.hits.slice(0, 10).map(hit => ({
      title: hit.title || hit.story_title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      timestamp: new Date(hit.created_at).toISOString(),
      source: 'HackerNews',
      score: hit.points || 0
    }));
  } catch (err) {
    throw new Error(`HackerNews parse failed: ${err.message}`);
  }
}

function parseRSS(data) {
  try {
    // Simple regex-based RSS parser (good enough for this use case)
    const items = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s;
    const linkRegex = /<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/s;

    let match;
    while ((match = itemRegex.exec(data)) !== null && items.length < 10) {
      const itemXml = match[1];
      const title = titleRegex.exec(itemXml)?.[1]?.trim();
      const url = linkRegex.exec(itemXml)?.[1]?.trim();
      const pubDate = pubDateRegex.exec(itemXml)?.[1]?.trim();

      if (title && url) {
        items.push({
          title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
          url: url.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
          timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: 'RSS',
          score: 0
        });
      }
    }
    return items;
  } catch (err) {
    throw new Error(`RSS parse failed: ${err.message}`);
  }
}

async function fetchSource(sourceKey) {
  const source = SOURCES[sourceKey];
  const startTime = Date.now();
  
  try {
    const data = await fetchWithTimeout(source.url);
    const items = source.parser(data);
    const elapsed = Date.now() - startTime;
    
    return {
      source: source.name,
      success: true,
      items: items,
      count: items.length,
      elapsed_ms: elapsed
    };
  } catch (err) {
    return {
      source: source.name,
      success: false,
      error: err.message,
      items: [],
      count: 0,
      elapsed_ms: Date.now() - startTime
    };
  }
}

async function aggregateNews(options = {}) {
  const limit = options.limit || 20;
  const results = [];
  const allItems = [];

  // Fetch all sources in parallel
  const fetchPromises = Object.keys(SOURCES).map(key => fetchSource(key));
  const sourceResults = await Promise.all(fetchPromises);

  for (const result of sourceResults) {
    results.push(result);
    if (result.success) {
      allItems.push(...result.items);
    }
  }

  // Deduplicate by URL
  const seen = new Set();
  const uniqueItems = allItems.filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  // Sort by timestamp (newest first), then by score
  uniqueItems.sort((a, b) => {
    const timeDiff = new Date(b.timestamp) - new Date(a.timestamp);
    if (timeDiff !== 0) return timeDiff;
    return b.score - a.score;
  });

  return {
    timestamp: new Date().toISOString(),
    sources: results,
    items: uniqueItems.slice(0, limit),
    stats: {
      sources_attempted: results.length,
      sources_succeeded: results.filter(r => r.success).length,
      sources_failed: results.filter(r => !r.success).length,
      total_items: uniqueItems.length,
      items_returned: Math.min(uniqueItems.length, limit)
    }
  };
}

function formatTextOutput(data) {
  const output = [];
  
  output.push('=== News Aggregator Results ===\n');
  output.push(`Fetched: ${data.timestamp}`);
  output.push(`Sources: ${data.stats.sources_succeeded}/${data.stats.sources_attempted} succeeded\n`);

  // Source status
  output.push('Source Status:');
  for (const source of data.sources) {
    const status = source.success ? '✅' : '❌';
    const detail = source.success 
      ? `${source.count} items (${source.elapsed_ms}ms)`
      : `failed: ${source.error}`;
    output.push(`  ${status} ${source.source}: ${detail}`);
  }
  output.push('');

  // Items
  output.push(`Top ${data.items.length} Items:\n`);
  data.items.forEach((item, i) => {
    output.push(`${i + 1}. ${item.title}`);
    output.push(`   ${item.url}`);
    output.push(`   [${item.source} | ${new Date(item.timestamp).toLocaleString()}]`);
    output.push('');
  });

  return output.join('\n');
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  const options = {
    limit: 20,
    format: 'text'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--format' && args[i + 1]) {
      options.format = args[i + 1];
      i++;
    }
  }

  const data = await aggregateNews(options);

  if (options.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(formatTextOutput(data));
  }

  // Exit with error if all sources failed
  if (data.stats.sources_succeeded === 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
}

export { aggregateNews, fetchSource, SOURCES };
