import { EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools'
import { OAppEnforcedOption, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

import { getOftStoreAddress } from './tasks/solana'

// Note:  Do not use address for EVM OmniPointHardhat contracts.  Contracts are loaded using hardhat-deploy.
// If you do use an address, ensure artifacts exists.
const arbitrumContract: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'MyOFT', // Note: change this to your production contract name
}

// QUICK, SOLID, SOLOMON, GAINE: one OFT program, separate OFT Store per token (deployments: OFT-QUICK.json, OFT-SOLID.json, OFT-SOLOMON.json, OFT-GAINE.json)
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
// Legacy single-token reference (default OFT.json)
const solanaContract: OmniPointHardhat = {
    eid: solanaTestnetEid,
    address: getOftStoreAddress(solanaTestnetEid),
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
const SPL_TOKEN_ACCOUNT_RENT_VALUE = 2039280 // This figure represents lamports (https://solana.com/docs/references/terminology#lamport) on Solana. Read below for more details.
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
    // QUICK, SOLID, SOLOMON, GAINE: one pathway per token (EVM <-> Solana OFT Store per token)
    const connections = await generateConnectionsConfig([
        [
            arbitrumContract,
            solanaQUICK,
            [['LayerZero Labs'], []],
            [15, 32],
            [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
        ],
        [
            arbitrumContract,
            solanaSOLID,
            [['LayerZero Labs'], []],
            [15, 32],
            [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
        ],
        [
            arbitrumContract,
            solanaSOLOMON,
            [['LayerZero Labs'], []],
            [15, 32],
            [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
        ],
        [
            arbitrumContract,
            solanaGAINE,
            [['LayerZero Labs'], []],
            [15, 32],
            [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
        ],
    ])

    return {
        contracts: [
            { contract: arbitrumContract },
            { contract: solanaQUICK },
            { contract: solanaSOLID },
            { contract: solanaSOLOMON },
            { contract: solanaGAINE },
        ],
        connections,
    }
}
