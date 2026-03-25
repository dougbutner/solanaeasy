import { EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools'
import { OAppEnforcedOption, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

import { SOLANA_MAINNET_EID, getSolomonMainnetEvmChainsForPhase, parseSolomonPhase } from './chain-config'
import { getOftStoreAddress } from './tasks/solana'

// Note: Do not use address for EVM OmniPointHardhat contracts. Contracts are loaded using hardhat-deploy.
// Deploy names match layerzero/deploy/MyOFT.ts (CREATE2 optional via *_OFT_CREATE2_SALT in .env).
const evmQUICK: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'MyOFT_QUICK',
}
const evmSOLID: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'MyOFT_SOLID',
}
const evmSOLOMON: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'MyOFT_SOLOMON',
}
const evmGAINE: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'MyOFT_GAINE',
}

// QUICK, SOLID, SOLOMON, GAINE: one OFT program on Solana, separate OFT Store per token (OFT-QUICK.json, …)
const solanaTestnetEid = EndpointId.SOLANA_V2_TESTNET
const solanaQUICK: OmniPointHardhat = {
    eid: solanaTestnetEid,
    address: getOftStoreAddress(solanaTestnetEid, 'QUICK'),
}
const solanaSOLID: OmniPointHardhat = {
    eid: solanaTestnetEid,
    address: getOftStoreAddress(solanaTestnetEid, 'SOLID'),
}
const solanaSOLOMON: OmniPointHardhat = {
    eid: solanaTestnetEid,
    address: getOftStoreAddress(solanaTestnetEid, 'SOLOMON'),
}
const solanaGAINE: OmniPointHardhat = {
    eid: solanaTestnetEid,
    address: getOftStoreAddress(solanaTestnetEid, 'GAINE'),
}

const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 80000,
        value: 0,
    },
]

const CU_LIMIT = 200000 // This represents the CU limit for executing the `lz_receive` function on Solana.
const SPL_TOKEN_ACCOUNT_RENT_VALUE = 2039280 // This figure represents lamports (https://solana.com/docs/references/terminology#lamport) on Solana.
/*
 *  Elaboration on `value` when sending OFTs to Solana:
 *   When sending OFTs to Solana, SOL is needed for rent (https://solana.com/docs/core/accounts#rent) to initialize the recipient's token account.
 *   The `2039280` lamports value is the exact rent value needed for SPL token accounts (0.00203928 SOL).
 *   For Token2022 token accounts, you will need to increase `value` to a higher amount, which depends on the token account size, which in turn depends on the extensions that you enable.
 */

const SOLANA_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: CU_LIMIT,
        value: SPL_TOKEN_ACCOUNT_RENT_VALUE,
    },
]

// Learn about Message Execution Options: https://docs.layerzero.network/v2/developers/solana/oft/overview#message-execution-options
// Learn more about the Simple Config Generator - https://docs.layerzero.network/v2/developers/evm/technical-reference/simple-config
export default async function () {
    // note: pathways declared here are automatically bidirectional
    // One EVM OFT deployment per token, each wired to the matching Solana OFT Store
    const target = (process.env.LZ_TARGET_NETWORK ?? 'testnet').toLowerCase()

    if (target === 'mainnet') {
        // SOLOMON-only mainnet: wire Solana OFT store to each EVM chain for the active phase.
        // `LZ_SOLOMON_PHASE=a` (default) = Phase A EVM only; `b` or `all` = Phase A + B.
        const solomonPhase = parseSolomonPhase(process.env.LZ_SOLOMON_PHASE)
        const solanaMainnetEid = SOLANA_MAINNET_EID as unknown as EndpointId
        const solanaSOLOMONMainnet: OmniPointHardhat = {
            eid: solanaMainnetEid,
            address: getOftStoreAddress(solanaMainnetEid, 'SOLOMON'),
        }

        const evmSOLOMONMainnetByChain: OmniPointHardhat[] = getSolomonMainnetEvmChainsForPhase(solomonPhase).map(
            (chain) => ({
                eid: chain.eid,
                contractName: 'MyOFT_SOLOMON',
            })
        )

        const connections = await generateConnectionsConfig(
            evmSOLOMONMainnetByChain.map((evm) => [
                evm,
                solanaSOLOMONMainnet,
                [['LayerZero Labs'], []],
                [15, 32],
                [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
            ]) as any
        )

        return {
            contracts: [...evmSOLOMONMainnetByChain.map((c) => ({ contract: c })), { contract: solanaSOLOMONMainnet }],
            connections,
        }
    }

    // Default: existing Phase 1 testnet wiring (QUICK/SOLID/SOLOMON/GAINE)
    const connections = await generateConnectionsConfig([
        [evmQUICK, solanaQUICK, [['LayerZero Labs'], []], [15, 32], [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS]],
        [evmSOLID, solanaSOLID, [['LayerZero Labs'], []], [15, 32], [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS]],
        [
            evmSOLOMON,
            solanaSOLOMON,
            [['LayerZero Labs'], []],
            [15, 32],
            [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
        ],
        [evmGAINE, solanaGAINE, [['LayerZero Labs'], []], [15, 32], [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS]],
    ])

    return {
        contracts: [
            { contract: evmQUICK },
            { contract: evmSOLID },
            { contract: evmSOLOMON },
            { contract: evmGAINE },
            { contract: solanaQUICK },
            { contract: solanaSOLID },
            { contract: solanaSOLOMON },
            { contract: solanaGAINE },
        ],
        connections,
    }
}
