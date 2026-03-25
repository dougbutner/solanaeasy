/**
 * Hardhat networks for SOLOMON mainnet EVM rollout (Phase A + B).
 * Override with RPC_URL_* env vars (see `.env.solomon.mainnet.example`).
 *
 * Defaults are public RPC endpoints for convenience — use dedicated providers in production.
 */
import { EndpointId } from '@layerzerolabs/lz-definitions'

import { SOLOMON_MAINNET_PHASE_A_EVM, SOLOMON_MAINNET_PHASE_B_EVM } from './chain-config'

import type { HttpNetworkAccountsUserConfig, HttpNetworkUserConfig } from 'hardhat/types'

type NetworkEntry = {
    hardhatNetwork: string
    eid: EndpointId
    defaultUrl: string
    envKey: string
}

const RPC_ENV = (key: string, fallback: string) => process.env[key] || fallback

const ENTRIES: NetworkEntry[] = [
    ...SOLOMON_MAINNET_PHASE_A_EVM.map((c) => ({
        hardhatNetwork: c.hardhatNetwork,
        eid: c.eid,
        defaultUrl: defaultRpcForPhaseA(c.hardhatNetwork),
        envKey: rpcEnvKeyFor(c.hardhatNetwork),
    })),
    ...SOLOMON_MAINNET_PHASE_B_EVM.map((c) => ({
        hardhatNetwork: c.hardhatNetwork,
        eid: c.eid,
        defaultUrl: defaultRpcForPhaseB(c.hardhatNetwork),
        envKey: rpcEnvKeyFor(c.hardhatNetwork),
    })),
]

function rpcEnvKeyFor(hardhatNetwork: string): string {
    return `RPC_URL_${hardhatNetwork.replace(/-/g, '_').toUpperCase()}`
}

function defaultRpcForPhaseA(net: string): string {
    const map: Record<string, string> = {
        ethereum: 'https://ethereum.gateway.tenderly.co',
        arbitrum: 'https://arbitrum.gateway.tenderly.co',
        optimism: 'https://optimism.gateway.tenderly.co',
        base: 'https://base.gateway.tenderly.co',
        bsc: 'https://bsc.gateway.tenderly.co',
        polygon: 'https://polygon.gateway.tenderly.co',
        avalanche: 'https://avalanche.gateway.tenderly.co',
    }
    return map[net] ?? 'https://ethereum.gateway.tenderly.co'
}

function defaultRpcForPhaseB(net: string): string {
    const map: Record<string, string> = {
        linea: 'https://rpc.linea.build',
        mantle: 'https://rpc.mantle.xyz',
        blast: 'https://rpc.blast.io',
        scroll: 'https://rpc.scroll.io',
        manta: 'https://pacific-rpc.manta.network/http',
        opbnb: 'https://opbnb-mainnet-rpc.bnbchain.org',
        mode: 'https://mainnet.mode.network',
        fraxtal: 'https://rpc.frax.com',
        metis: 'https://andromeda.metis.io/?owner=1088',
        fantom: 'https://rpc.ftm.tools',
        gnosis: 'https://rpc.gnosischain.com',
        celo: 'https://forno.celo.org',
        moonbeam: 'https://rpc.api.moonbeam.network',
        moonriver: 'https://rpc.api.moonriver.moonbeam.network',
        harmony: 'https://api.harmony.one',
        kava: 'https://evm.kava.io',
        cronosevm: 'https://evm.cronos.org',
        injectiveevm: 'https://sentry.evm-rpc.injective.network',
        sei: 'https://evm-rpc.sei-apis.com',
        hedera: 'https://mainnet.hashio.io/api',
        kaia: 'https://public-en.node.kaia.io',
        coredao: 'https://rpc.coredao.org',
        conflux: 'https://evm.confluxrpc.com',
        meter: 'https://rpc.meter.io',
        canto: 'https://canto.gravitychain.io',
        flare: 'https://flare-api.flare.network/ext/C/rpc',
        astar: 'https://rpc.astar.network:8545',
        bera: 'https://rpc.berachain.com',
        monad: 'https://rpc.monad.xyz',
        movement: 'https://mainnet.movementnetwork.xyz/v1',
        plume: 'https://rpc.plumenetwork.xyz',
        initia: 'https://rpc.initia.xyz',
        iota: 'https://json-rpc.evm.iotaledger.net',
        rootstock: 'https://public-node.rsk.co',
        fuse: 'https://rpc.fuse.io',
        bahamut: 'https://rpc1.ftnchain.com',
        chiliz: 'https://rpc.chiliz.com',
        peaq: 'https://peaq.api.onfinality.io/public',
        aurora: 'https://mainnet.aurora.dev',
    }
    return map[net] ?? 'https://ethereum.gateway.tenderly.co'
}

/** Deduplicate by hardhat network key (Phase A + B may not overlap). */
function uniqueEntries(entries: NetworkEntry[]): NetworkEntry[] {
    const seen = new Set<string>()
    const out: NetworkEntry[] = []
    for (const e of entries) {
        if (seen.has(e.hardhatNetwork)) continue
        seen.add(e.hardhatNetwork)
        out.push(e)
    }
    return out
}

export function buildSolomonMainnetNetworks(
    accounts: HttpNetworkAccountsUserConfig | undefined
): Record<string, HttpNetworkUserConfig> {
    const networks: Record<string, HttpNetworkUserConfig> = {}
    for (const { hardhatNetwork, eid, defaultUrl, envKey } of uniqueEntries(ENTRIES)) {
        networks[hardhatNetwork] = {
            eid,
            url: RPC_ENV(envKey, defaultUrl),
            accounts,
        }
    }
    return networks
}
