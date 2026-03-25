/**
 * Phased chain matrix for LayerZero OFT (SOLOMON mainnet rollout).
 *
 * EIDs must match `@layerzerolabs/lz-definitions` / LayerZero metadata API:
 * https://metadata.layerzero-api.com/v1/metadata
 *
 * Re-verify before each production deploy.
 */
import { EndpointId } from '@layerzerolabs/lz-definitions'

export const SOLANA_TESTNET_EID = 40168
export const SOLANA_MAINNET_EID = 30168

/** Testnet (Phase 1): Solana + one EVM testnet */
export const TESTNET_CHAINS = [
    { name: 'Solana', eid: SOLANA_TESTNET_EID },
    { name: 'Arbitrum Sepolia', eid: 40231 },
] as const

/**
 * SOLOMON mainnet EVM chain: must match a `networks` key in `hardhat.config.ts` for deploy/wire.
 */
export type SolomonMainnetEvmChain = {
    name: string
    eid: EndpointId
    hardhatNetwork: string
}

/** Phase A — repo bootstrap: highest-traffic EVM L1/L2s (7 chains + Solana canonical). */
export const SOLOMON_MAINNET_PHASE_A_EVM: readonly SolomonMainnetEvmChain[] = [
    { name: 'Ethereum', eid: EndpointId.ETHEREUM_V2_MAINNET, hardhatNetwork: 'ethereum' },
    { name: 'Arbitrum', eid: EndpointId.ARBITRUM_V2_MAINNET, hardhatNetwork: 'arbitrum' },
    { name: 'Optimism', eid: EndpointId.OPTIMISM_V2_MAINNET, hardhatNetwork: 'optimism' },
    { name: 'Base', eid: EndpointId.BASE_V2_MAINNET, hardhatNetwork: 'base' },
    { name: 'BSC', eid: EndpointId.BSC_V2_MAINNET, hardhatNetwork: 'bsc' },
    { name: 'Polygon', eid: EndpointId.POLYGON_V2_MAINNET, hardhatNetwork: 'polygon' },
    { name: 'Avalanche', eid: EndpointId.AVALANCHE_V2_MAINNET, hardhatNetwork: 'avalanche' },
]

/**
 * Phase B — extended EVM rollout (from your target list). Add hardhat `networks` + RPC envs before wiring.
 * Order: roughly by ecosystem / L2 relevance, not TVL rank.
 */
export const SOLOMON_MAINNET_PHASE_B_EVM: readonly SolomonMainnetEvmChain[] = [
    { name: 'Linea', eid: EndpointId.ZKCONSENSYS_V2_MAINNET, hardhatNetwork: 'linea' },
    { name: 'Mantle', eid: EndpointId.MANTLE_V2_MAINNET, hardhatNetwork: 'mantle' },
    { name: 'Blast', eid: EndpointId.BLAST_V2_MAINNET, hardhatNetwork: 'blast' },
    { name: 'Scroll', eid: EndpointId.SCROLL_V2_MAINNET, hardhatNetwork: 'scroll' },
    { name: 'Manta Pacific', eid: EndpointId.MANTA_V2_MAINNET, hardhatNetwork: 'manta' },
    { name: 'opBNB', eid: EndpointId.OPBNB_V2_MAINNET, hardhatNetwork: 'opbnb' },
    { name: 'Mode', eid: EndpointId.MODE_V2_MAINNET, hardhatNetwork: 'mode' },
    { name: 'Fraxtal', eid: EndpointId.FRAXTAL_V2_MAINNET, hardhatNetwork: 'fraxtal' },
    { name: 'Metis', eid: EndpointId.METIS_V2_MAINNET, hardhatNetwork: 'metis' },
    { name: 'Fantom', eid: EndpointId.FANTOM_V2_MAINNET, hardhatNetwork: 'fantom' },
    { name: 'Gnosis', eid: EndpointId.GNOSIS_V2_MAINNET, hardhatNetwork: 'gnosis' },
    { name: 'Celo', eid: EndpointId.CELO_V2_MAINNET, hardhatNetwork: 'celo' },
    { name: 'Moonbeam', eid: EndpointId.MOONBEAM_V2_MAINNET, hardhatNetwork: 'moonbeam' },
    { name: 'Moonriver', eid: EndpointId.MOONRIVER_V2_MAINNET, hardhatNetwork: 'moonriver' },
    { name: 'Harmony', eid: EndpointId.HARMONY_V2_MAINNET, hardhatNetwork: 'harmony' },
    { name: 'Kava', eid: EndpointId.KAVA_V2_MAINNET, hardhatNetwork: 'kava' },
    { name: 'Cronos (EVM)', eid: EndpointId.CRONOSEVM_V2_MAINNET, hardhatNetwork: 'cronosevm' },
    { name: 'Injective (EVM)', eid: EndpointId.INJECTIVEEVM_V2_MAINNET, hardhatNetwork: 'injectiveevm' },
    { name: 'Sei', eid: EndpointId.SEI_V2_MAINNET, hardhatNetwork: 'sei' },
    { name: 'Hedera', eid: EndpointId.HEDERA_V2_MAINNET, hardhatNetwork: 'hedera' },
    { name: 'Kaia', eid: EndpointId.KLAYTN_V2_MAINNET, hardhatNetwork: 'kaia' },
    { name: 'CoreDAO', eid: EndpointId.COREDAO_V2_MAINNET, hardhatNetwork: 'coredao' },
    { name: 'Conflux', eid: EndpointId.CONFLUX_V2_MAINNET, hardhatNetwork: 'conflux' },
    { name: 'Meter', eid: EndpointId.METER_V2_MAINNET, hardhatNetwork: 'meter' },
    { name: 'Canto', eid: EndpointId.CANTO_V2_MAINNET, hardhatNetwork: 'canto' },
    { name: 'Flare', eid: EndpointId.FLARE_V2_MAINNET, hardhatNetwork: 'flare' },
    { name: 'Astar', eid: EndpointId.ASTAR_V2_MAINNET, hardhatNetwork: 'astar' },
    { name: 'Berachain', eid: EndpointId.BERA_V2_MAINNET, hardhatNetwork: 'bera' },
    { name: 'Monad', eid: EndpointId.MONAD_V2_MAINNET, hardhatNetwork: 'monad' },
    { name: 'Movement', eid: EndpointId.MOVEMENT_V2_MAINNET, hardhatNetwork: 'movement' },
    { name: 'Plume', eid: EndpointId.PLUME_V2_MAINNET, hardhatNetwork: 'plume' },
    { name: 'Initia', eid: EndpointId.INITIA_V2_MAINNET, hardhatNetwork: 'initia' },
    { name: 'IOTA EVM', eid: EndpointId.IOTA_V2_MAINNET, hardhatNetwork: 'iota' },
    { name: 'Rootstock', eid: EndpointId.ROOTSTOCK_V2_MAINNET, hardhatNetwork: 'rootstock' },
    { name: 'Fuse', eid: EndpointId.FUSE_V2_MAINNET, hardhatNetwork: 'fuse' },
    { name: 'Bahamut', eid: EndpointId.BAHAMUT_V2_MAINNET, hardhatNetwork: 'bahamut' },
    { name: 'Chiliz', eid: EndpointId.CHILIZ_V2_MAINNET, hardhatNetwork: 'chiliz' },
    { name: 'Peaq', eid: EndpointId.PEAQ_V2_MAINNET, hardhatNetwork: 'peaq' },
    { name: 'Aurora (NEAR)', eid: EndpointId.AURORA_V2_MAINNET, hardhatNetwork: 'aurora' },
]

/**
 * Non-EVM / separate-tooling tracks (not wired by this repo’s default Hardhat EVM flow).
 * See `docs/solomon-rollout-chain-onboarding.md`.
 */
export const SOLOMON_MAINNET_NON_EVM_ROLLOUT = [
    { name: 'Solana', eid: SOLANA_MAINNET_EID, track: 'canonical_svm' as const },
    { name: 'Sui', eid: 30378, track: 'move_sui' as const },
    { name: 'Aptos', eid: 30108, track: 'move_aptos' as const },
    { name: 'Tron', eid: 30420, track: 'tron' as const },
] as const

export type SolomonPhase = 'a' | 'b' | 'all'

const PHASE_ALIASES: Record<string, SolomonPhase> = {
    a: 'a',
    phasea: 'a',
    'phase-a': 'a',
    b: 'b',
    phaseb: 'b',
    'phase-b': 'b',
    all: 'all',
}

/**
 * Read `LZ_SOLOMON_PHASE` (default `a`). Use `b` for Phase A+B EVM, `all` same as `b` for EVM lists.
 */
export function parseSolomonPhase(raw?: string): SolomonPhase {
    const key = (raw ?? process.env.LZ_SOLOMON_PHASE ?? 'a').toLowerCase().replace(/\s+/g, '')
    return PHASE_ALIASES[key] ?? 'a'
}

/** EVM chains to wire for SOLOMON on mainnet for the given phase (excludes Solana). */
export function getSolomonMainnetEvmChainsForPhase(phase: SolomonPhase): SolomonMainnetEvmChain[] {
    if (phase === 'a') {
        return [...SOLOMON_MAINNET_PHASE_A_EVM]
    }
    return [...SOLOMON_MAINNET_PHASE_A_EVM, ...SOLOMON_MAINNET_PHASE_B_EVM]
}

/**
 * @deprecated Prefer `getSolomonMainnetEvmChainsForPhase(parseSolomonPhase())` for wiring.
 * Kept for compatibility: Solana + Phase A EVM (original MAINNET_CHAINS shape).
 */
export const MAINNET_CHAINS = [
    { name: 'Solana', eid: SOLANA_MAINNET_EID },
    ...SOLOMON_MAINNET_PHASE_A_EVM.map(({ name, eid }) => ({ name, eid: eid as unknown as number })),
] as const

export const TOKEN_DEPLOYMENT_NAMES = ['QUICK', 'SOLID', 'SOLOMON', 'GAINE'] as const
