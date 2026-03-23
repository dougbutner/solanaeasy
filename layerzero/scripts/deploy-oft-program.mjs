#!/usr/bin/env node
/**
 * Deploy the OFT program using the fee payer from layerzero/.env only.
 *
 * LayerZero Hardhat tasks use getSolanaKeypair() which reads SOLANA_PRIVATE_KEY
 * (see @layerzerolabs/devtools-solana). The Solana CLI still requires --keypair
 * as a file path, so we write a short-lived JSON keypair under os.tmpdir() and
 * delete it immediately after deploy.
 *
 * Usage (from layerzero/):
 *   node scripts/deploy-oft-program.mjs [CLUSTER] [PROGRAM_KEYPAIR_PATH] [PROGRAM_SO_PATH]
 *
 * Defaults:
 *   CLUSTER=mainnet-beta
 *   PROGRAM_KEYPAIR_PATH=./target/deploy/oft-keypair.json
 *   PROGRAM_SO_PATH=./target/cargo-sbf/deploy/oft.so
 *
 * Optional: SOLANA_DEPLOY_COMPUTE_UNIT_PRICE=micro-lamports for --with-compute-unit-price
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const layerzeroRoot = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(layerzeroRoot, '.env') })

if (process.env.SOLANA_KEYPAIR_PATH?.trim()) {
    console.error(
        'This script uses SOLANA_PRIVATE_KEY only. Unset SOLANA_KEYPAIR_PATH or use solana CLI directly with that file.',
    )
    process.exit(1)
}

if (!process.env.SOLANA_PRIVATE_KEY?.trim()) {
    console.error('Missing SOLANA_PRIVATE_KEY in layerzero/.env (base58 or JSON uint8 array).')
    process.exit(1)
}

const cluster = process.argv[2] || 'mainnet-beta'
const programKeypair = path.resolve(
    layerzeroRoot,
    process.argv[3] || path.join('target', 'deploy', 'oft-keypair.json'),
)
const programSo = path.resolve(
    layerzeroRoot,
    process.argv[4] || path.join('target', 'cargo-sbf', 'deploy', 'oft.so'),
)

if (!fs.existsSync(programKeypair)) {
    console.error(`Program keypair not found: ${programKeypair}\nRun: anchor keys sync -p oft`)
    process.exit(1)
}
if (!fs.existsSync(programSo)) {
    console.error(`Program binary not found: ${programSo}\nBuild with OFT_ID set, e.g.:\n  OFT_ID=<pubkey> cargo build-sbf --manifest-path programs/oft/Cargo.toml --arch v1`)
    process.exit(1)
}

const keypair = getKeypairFromEnvironment('SOLANA_PRIVATE_KEY')
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lz-sol-payer-'))
const tmpKeypairPath = path.join(tmpDir, 'keypair.json')

fs.writeFileSync(tmpKeypairPath, JSON.stringify(Array.from(keypair.secretKey)), { mode: 0o600 })

const args = ['program', 'deploy', '--program-id', programKeypair, programSo, '-u', cluster, '--keypair', tmpKeypairPath]

const cup = process.env.SOLANA_DEPLOY_COMPUTE_UNIT_PRICE?.trim()
if (cup) {
    args.push('--with-compute-unit-price', cup)
}

console.log(`Deploying OFT program to ${cluster}`)
console.log(`  payer (from SOLANA_PRIVATE_KEY): ${keypair.publicKey.toBase58()}`)
console.log(`  program id keypair: ${programKeypair}`)
console.log(`  program .so: ${programSo}`)

let status = 1
try {
    const r = spawnSync('solana', args, { stdio: 'inherit' })
    status = r.status ?? 1
} finally {
    try {
        fs.unlinkSync(tmpKeypairPath)
    } catch {
        /* ignore */
    }
    try {
        fs.rmdirSync(tmpDir)
    } catch {
        /* ignore */
    }
}

process.exit(status)
