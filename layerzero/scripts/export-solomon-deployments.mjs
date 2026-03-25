#!/usr/bin/env node
/**
 * Copy SOLOMON deployment artifacts into deployments-solomon/mainnet for a clean audit trail.
 * Source: hardhat-deploy `deployments/<network>/MyOFT_SOLOMON.json` and Solana `deployments/solana-mainnet/OFT-SOLOMON.json`.
 *
 * Usage: `pnpm run solomon:export-deployments` (from `layerzero/`)
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
const srcDeployments = join(root, 'deployments')
const outBase = join(root, 'deployments-solomon', 'mainnet')

function ensureDir(dir) {
    mkdirSync(dir, { recursive: true })
}

const manifest = {
    exportedAt: new Date().toISOString(),
    solana: [],
    evm: [],
    notes: 'Re-run after each deploy/wire. EIDs: see chain-config.ts and LayerZero metadata API.',
}

ensureDir(join(outBase, 'solana'))
ensureDir(join(outBase, 'evm'))
ensureDir(join(outBase, 'non-evm'))

const solanaSrc = join(srcDeployments, 'solana-mainnet', 'OFT-SOLOMON.json')
if (existsSync(solanaSrc)) {
    const dest = join(outBase, 'solana', 'OFT-SOLOMON.json')
    copyFileSync(solanaSrc, dest)
    manifest.solana.push({
        from: relative(root, solanaSrc),
        to: relative(root, dest),
    })
}

if (!existsSync(srcDeployments)) {
    console.warn('No deployments/ folder yet; nothing to export.')
    writeFileSync(join(outBase, 'manifest.json'), JSON.stringify(manifest, null, 2))
    process.exit(0)
}

for (const name of readdirSync(srcDeployments)) {
    const p = join(srcDeployments, name)
    if (!statSync(p).isDirectory()) continue
    if (name.startsWith('solana-')) continue

    const oft = join(p, 'MyOFT_SOLOMON.json')
    if (existsSync(oft)) {
        const destDir = join(outBase, 'evm', name)
        ensureDir(destDir)
        const dest = join(destDir, 'MyOFT_SOLOMON.json')
        copyFileSync(oft, dest)
        manifest.evm.push({
            hardhatNetwork: name,
            from: relative(root, oft),
            to: relative(root, dest),
        })
    }
}

writeFileSync(join(outBase, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`SOLOMON export written under ${relative(process.cwd(), outBase)} (see manifest.json)`)
