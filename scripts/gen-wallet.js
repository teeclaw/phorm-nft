#!/usr/bin/env node
// Generate a new wallet keypair
// SECURITY: Private key is printed ONCE to stdout and never written to disk in plaintext
// Pipe output directly into GPG or the update script

const { generatePrivateKey, privateKeyToAccount } = require('viem/accounts');

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

// Output as JSON for easy parsing
const result = {
  address: account.address,
  privateKey: privateKey,
};

// Print to stdout only — caller must handle securely
process.stdout.write(JSON.stringify(result) + '\n');
