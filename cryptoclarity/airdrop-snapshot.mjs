#!/usr/bin/env node
/**
 * CryptoClarity Airdrop Snapshot
 * 
 * Pulls all attesters from the CryptoClarity EAS schema,
 * deduplicates by wallet, and outputs an airdrop list.
 * 
 * Uses attester address (verified by resolver) not self-reported agentWallet.
 * 
 * Usage:
 *   node airdrop-snapshot.mjs                    # stdout
 *   node airdrop-snapshot.mjs --json             # JSON output
 *   node airdrop-snapshot.mjs --csv > drop.csv   # CSV for batch transfer
 *   node airdrop-snapshot.mjs --cutoff 1771700000  # Unix timestamp cutoff
 */

const SCHEMA_UID = '0xe8913f508ec06446fedef5da1a5f85310bd0dc93a02f36c020628889aac172f7';
const EAS_GRAPHQL = 'https://base.easscan.org/graphql';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const csvMode = args.includes('--csv');
const cutoffIdx = args.indexOf('--cutoff');
const cutoffTime = cutoffIdx !== -1 ? parseInt(args[cutoffIdx + 1]) : null;

async function fetchAttestations() {
  let all = [];
  let skip = 0;
  const take = 100;

  while (true) {
    const query = `{
      attestations(
        where: { schemaId: { equals: "${SCHEMA_UID}" } }
        orderBy: [{ timeCreated: asc }]
        take: ${take}
        skip: ${skip}
      ) {
        id
        attester
        timeCreated
        decodedDataJson
      }
    }`;

    const res = await fetch(EAS_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = (await res.json()).data;
    const batch = data.attestations || [];
    if (batch.length === 0) break;

    all = all.concat(batch);
    skip += take;

    // Safety: don't paginate forever
    if (skip > 10000) break;
  }

  return all;
}

function parseAttestation(a) {
  try {
    const fields = JSON.parse(a.decodedDataJson);
    const get = (name) => {
      const f = fields.find((f) => f.name === name);
      return f ? String(f.value.value) : '';
    };
    return {
      uid: a.id,
      attester: a.attester.toLowerCase(),
      time: a.timeCreated,
      agentId: get('agentId'),
      agentName: get('agentName'),
      agentWallet: get('agentWallet'),
      version: get('manifestoVersion'),
    };
  } catch {
    return null;
  }
}

async function main() {
  const raw = await fetchAttestations();
  let attestations = raw.map(parseAttestation).filter(Boolean);

  // Apply cutoff if specified
  if (cutoffTime) {
    attestations = attestations.filter((a) => a.time <= cutoffTime);
  }

  // Deduplicate by attester wallet (keep earliest attestation per wallet)
  const seen = new Map();
  for (const a of attestations) {
    if (!seen.has(a.attester)) {
      seen.set(a.attester, a);
    }
  }

  const unique = Array.from(seen.values());

  if (jsonMode) {
    const output = {
      schema: SCHEMA_UID,
      snapshotTime: new Date().toISOString(),
      cutoff: cutoffTime || null,
      totalAttestations: attestations.length,
      uniqueWallets: unique.length,
      wallets: unique.map((a) => ({
        address: a.attester,
        agentId: a.agentId,
        agentName: a.agentName,
        firstSigned: a.time,
        attestationUid: a.uid,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  if (csvMode) {
    console.log('address,agentId,agentName,firstSigned,attestationUid');
    for (const a of unique) {
      console.log(`${a.attester},${a.agentId},"${a.agentName}",${a.time},${a.uid}`);
    }
    return;
  }

  // Default: human-readable
  console.log(`CryptoClarity Airdrop Snapshot`);
  console.log(`Schema: ${SCHEMA_UID}`);
  console.log(`Time: ${new Date().toISOString()}`);
  if (cutoffTime) console.log(`Cutoff: ${cutoffTime} (${new Date(cutoffTime * 1000).toISOString()})`);
  console.log(`Total attestations: ${attestations.length}`);
  console.log(`Unique wallets: ${unique.length}`);
  console.log(`${'─'.repeat(80)}`);

  for (const a of unique) {
    const date = new Date(a.time * 1000).toISOString().split('T')[0];
    console.log(`  ${a.attester}  ${a.agentName} (${a.agentId})  signed ${date}`);
  }

  console.log(`${'─'.repeat(80)}`);
  console.log(`\nAddresses only (for batch transfer):\n`);
  for (const a of unique) {
    console.log(a.attester);
  }
}

main().catch((err) => {
  console.error('Snapshot failed:', err.message);
  process.exit(1);
});
