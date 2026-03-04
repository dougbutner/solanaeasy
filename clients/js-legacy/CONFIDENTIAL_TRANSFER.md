# Confidential transfer (Token-2022)

This document describes how to use **confidential transfer** with Token-2022 from JavaScript/TypeScript in this repo.

## Supported in this repo

- **On-chain:** The Token-2022 program and the ElGamal registry program (`confidential/elgamal-registry`) support confidential transfer. Instructions include `initializeConfidentialTransferMint`, `configureConfidentialTransferAccount`, `confidentialDeposit`, `confidentialWithdraw`, `confidentialTransfer`, `applyConfidentialPendingBalance`, and others.
- **CLI:** The `spl-token` CLI in `clients/cli` supports confidential transfer flows (including proof generation via the Rust proof-generation crate).
- **Generated JS client:** The auto-generated client in `clients/js` (`@solana-program/token-2022`) exposes all confidential transfer instructions. It uses `@solana/kit` (web3.js v2).

## Not in js-legacy

The **js-legacy** client (`@solana/spl-token`, `clients/js-legacy`) does **not** include high-level helpers or examples for confidential transfer. Proof generation for confidential transfers is implemented in **Rust** (`confidential/proof-generation`), so full flows (mint, transfer, withdraw with proofs) are done via the CLI or Rust.

## How to use confidential transfer from JS

1. **Instructions only (no proofs):** Use the generated client from `clients/js`:
   - Build it: from repo root, `pnpm install` then `cd clients/js && pnpm build`.
   - Import instructions from `@solana-program/token-2022` (or the local built package), e.g. `createInitializeConfidentialTransferMintInstruction`, `createConfidentialDepositInstruction`, etc. You still need to supply proof data from the Rust proof-generation crate or the CLI for instructions that require proofs.

2. **Full flow with proofs:** Use the **CLI** (`clients/cli`, binary `spl-token`) or the **Rust** crates (`confidential/proof-generation`, `confidential/proof-extraction`) to build and sign transactions that include proofs.

## Summary

| Need | Use |
|------|-----|
| Build confidential transfer instructions in JS | `clients/js` (generated client) |
| Full flow (including ZK proofs) | CLI or Rust (`confidential/proof-generation`) |
| QUICK/SOLID/SOLOMON-style tokens (transfer fee, metadata) | This js-legacy client and `examples/quickToken.ts`, etc. |

See [FEATURES.md](../../FEATURES.md) for program capabilities and client coverage.
