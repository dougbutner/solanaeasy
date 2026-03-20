/**
 * Phased chain matrix for LayerZero OFT.
 * EIDs: https://metadata.layerzero-api.com/v1/metadata
 * Update EIDs from API when deploying.
 */
export const SOLANA_TESTNET_EID = 40168
export const SOLANA_MAINNET_EID = 30168

/** Testnet (Phase 1): Solana + one EVM testnet */
export const TESTNET_CHAINS = [
  { name: 'Solana', eid: SOLANA_TESTNET_EID },
  { name: 'Arbitrum Sepolia', eid: 40231 },
] as const

/** Mainnet bootstrap (Phase 2) */
export const MAINNET_CHAINS = [
  { name: 'Solana', eid: SOLANA_MAINNET_EID },
  { name: 'Ethereum', eid: 30101 },
  { name: 'Arbitrum', eid: 30110 },
  { name: 'Optimism', eid: 30111 },
  { name: 'Base', eid: 30184 },
  { name: 'BSC', eid: 30102 },
  { name: 'Polygon', eid: 30109 },
  { name: 'Avalanche', eid: 30106 },
] as const

export const TOKEN_DEPLOYMENT_NAMES = ['QUICK', 'SOLID', 'SOLOMON', 'GAINE'] as const
