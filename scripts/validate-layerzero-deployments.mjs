#!/usr/bin/env node
/**
 * Validates that LayerZero deployment files exist for QUICK, SOLID, SOLOMON, GAINE.
 * Use after creating OFT Stores to ensure OFT-QUICK.json, OFT-SOLID.json, OFT-SOLOMON.json, OFT-GAINE.json exist.
 * Usage: node scripts/validate-layerzero-deployments.mjs [deploymentsDir]
 * Default: layerzero/deployments/solana-testnet
 */

import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const defaultDir = resolve(root, 'layerzero/deployments/solana-testnet');

const NAMES = ['QUICK', 'SOLID', 'SOLOMON', 'GAINE'];

const dir = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : defaultDir;
const missing = NAMES.filter((name) => !existsSync(resolve(dir, `OFT-${name}.json`)));

if (missing.length > 0) {
  console.error(`Missing deployment files in ${dir}:`);
  missing.forEach((name) => console.error(`  - OFT-${name}.json`));
  console.error('\nCreate OFT Stores with --deployment-name for each token. See LAYERZERO_DEPLOY.md.');
  process.exit(1);
}

console.log(`LayerZero deployments OK: ${NAMES.map((n) => `OFT-${n}.json`).join(', ')} in ${dir}`);
process.exit(0);
