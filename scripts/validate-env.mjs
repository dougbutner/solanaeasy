#!/usr/bin/env node
/**
 * Validates that QUICK, SOLID, SOLOMON, and GAINE vanity mint keys are set before deploy.
 * Exits with code 1 and lists missing vars if any required env is missing.
 * Usage: node scripts/validate-env.mjs [path-to-.env]
 * Default .env: clients/js-legacy/.env
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const defaultEnvPath = resolve(root, 'clients/js-legacy/.env');

const tokenEnvVars = [
  { token: 'QUICK', base58: 'QUICK_MINT_PRIVATE_KEY_BASE58', keypair: 'QUICK_MINT_KEYPAIR' },
  { token: 'SOLID', base58: 'SOLID_MINT_PRIVATE_KEY_BASE58', keypair: 'SOLID_MINT_KEYPAIR' },
  { token: 'SOLOMON', base58: 'SOLOMON_MINT_PRIVATE_KEY_BASE58', keypair: 'SOLOMON_MINT_KEYPAIR' },
  { token: 'GAINE', base58: 'GAINE_MINT_PRIVATE_KEY_BASE58', keypair: 'GAINE_MINT_KEYPAIR' },
];

function loadEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  const raw = readFileSync(path, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return env;
}

function validate(envPath = defaultEnvPath) {
  const env = { ...process.env, ...loadEnv(envPath) };
  const missing = [];

  for (const { token, base58, keypair } of tokenEnvVars) {
    const hasBase58 = env[base58] && String(env[base58]).length > 0;
    const keypairPath = env[keypair];
    const hasKeypair =
      keypairPath &&
      (existsSync(keypairPath) ||
        existsSync(resolve(process.cwd(), keypairPath)) ||
        existsSync(resolve(root, keypairPath)));
    if (!hasBase58 && !hasKeypair) {
      missing.push(`  - ${token}: set either ${base58} or ${keypair} (and ensure file exists)`);
    }
  }

  return missing;
}

const envPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : defaultEnvPath;
const missing = validate(envPath);

if (missing.length > 0) {
  console.error('LayerZero / mint deploy requires vanity mint keys for QUICK, SOLID, SOLOMON, and GAINE.');
  console.error('Missing or invalid env (check ' + envPath + '):');
  missing.forEach((m) => console.error(m));
  console.error('\nDeploy is blocked until these are set. See DEPLOY.md and LAYERZERO_DEPLOY.md.');
  process.exit(1);
}

console.log('Env validation passed: QUICK, SOLID, SOLOMON, GAINE mint keys are set.');
process.exit(0);
