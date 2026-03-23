# Solomon OFT: Solana mainnet <-> Sui (LayerZero) track

This is a Phase 2+ documentation track for connecting your **Solomon** OFT (canonical on Solana) to a **Sui** OFT/OApp via LayerZero.

## Important scope note (this repo)
This codebase’s current automation (`layerzero/tasks/*`) is built for **Solana <-> EVM** pathways.
For **Sui**, you should expect to either:
1. Configure the Sui side directly using LayerZero’s Sui packages/SDK, and configure the Solana side using LayerZero’s Solana tooling/SDK, or
2. Extend this repo’s tooling to support Sui chain type end-to-end.

This doc focuses on the correct LayerZero OFT/OApp concepts and the metadata you need, not on wiring code in this repo.

## The key Sui requirement: peer = OFT package ID (not object ID)
On Sui, when you deploy/publish an OFT, LayerZero peers on the remote chain must use the **OFT package ID** (the published Move package address), not the deployed instance/object ID.

The “OFT Package ID (not object ID)” is what remote chains must store as the peer address.

## Sui mainnet EID + endpoints (from LayerZero metadata)
Use the metadata API to source the values reproducibly:
`https://metadata.layerzero-api.com/v1/metadata`

For Sui **mainnet**, the metadata entry contains:
- `eid`: `30378`
- `endpointV2.address`: `0x31beaef889b08b9c3b37d19280fc1f8b75bae5b2de2410fc3120f403e9a36dac`
- `executor.address`: `0xde7fe1a6648d587fcc991f124f3aa5b6389340610804108094d5c5fbf61d1989`

DVNs are also included under `dvns` in the same metadata entry (use those IDs/addresses for DVN configuration).

## Deploy / publish the Solomon OFT on Sui (high level)
Follow the official LayerZero Sui OFT docs and do:

1. Deploy your Move package (your Sui OFT code).
2. Publish the package to get the **OFT package ID**.
3. Deploy/register the OFT instance and initialize it via the OFT SDK (the init ticket pattern is used in LayerZero’s Sui OFT flow).
4. Save the OFT package ID and (if applicable) the OApp object ID and init ticket for troubleshooting.

## Configure peers (Solana <-> Sui) at the right layer
### What to set on the EVM/Solana side
When configuring your OFT on a chain that sends to Sui, you set the peer for the Sui EID to the Sui **OFT package ID**.

Conceptually on EVM you’d do something like:
```solidity
// Sui mainnet
myOFT.setPeer(
  30378,                     // dstEid (Sui)
  bytes32(0x0601_..._beef) // your Sui OFT package ID (not object ID)
);
```

For Solana, the same conceptual requirement holds: the “peer address” you configure for `dstEid = 30378` must be the Sui OFT package ID.

### Order of configuration (Sui OFT best practice)
LayerZero’s Sui OFT configuration guidance recommends configuring in this order:
1. Libraries (optional custom send/receive libs)
2. DVNs (required for secure message verification)
3. Enforced options (optional gas buffers / limits)
4. OFT settings (optional rate limits/fees)
5. Peer (required; called last to open the pathway)

## How this connects to your Solomon rollout plan
To integrate Sui into the “gold-backed token / Solomon” milestone:
1. Ensure your **Solomon OFT store on Solana mainnet** is already live (you have `layerzero/deployments/solana-mainnet/OFT-SOLOMON.json`).
2. Deploy/initialize the Solomon OFT on Sui (get the Sui OFT package ID).
3. Configure Solana and Sui peers for `eid 30378` (peer address = package ID).
4. Run a canary transfer:
   - If using Solana->Sui sends through tooling that does not support Sui yet in this repo, use the official Sui SDK / LayerZero Sui OFT SDK integration instead.

## Metadata-driven “repeatable wiring checklist”
- Always re-pull the Sui mainnet `eid` and any executor/DVN addresses from:
  `https://metadata.layerzero-api.com/v1/metadata`
- Always verify peer inputs use:
  - Sui peer = OFT package ID
  - Remote chain peer storage uses the correct encoded form required by that chain’s SDK/tooling

