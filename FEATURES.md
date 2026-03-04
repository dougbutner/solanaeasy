# Token-2022: Features and implementation status

This document lists program capabilities, client coverage, and documented deployment flows for this repo.

## 1. Program capabilities

The on-chain **Token-2022** program (`program/`, program id `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`) implements:

### Core instructions

- **Mint/account:** `initializeMint`, `initializeMint2`, `initializeAccount`, `initializeAccount2`, `initializeAccount3`, `initializeMultisig`, `initializeMultisig2`, `getAccountDataSize`, `initializeImmutableOwner`, `createNativeMint`, `syncNative`
- **Transfers & approvals:** `transfer`, `transferChecked`, `approve`, `approveChecked`, `revoke`
- **Supply:** `mintTo`, `mintToChecked`, `burn`, `burnChecked`
- **Authority:** `setAuthority`
- **Account lifecycle:** `closeAccount`, `freezeAccount`, `thawAccount`
- **Utilities:** `amountToUiAmount`, `uiAmountToAmount`, `initializeMintCloseAuthority`

### Extension instructions

| Extension | Instructions |
|-----------|--------------|
| **Transfer Fee** | `initializeTransferFeeConfig`, `transferCheckedWithFee`, `withdrawWithheldTokensFromMint`, `withdrawWithheldTokensFromAccounts`, `harvestWithheldTokensToMint`, `setTransferFee` |
| **Confidential Transfer** | `initializeConfidentialTransferMint`, `updateConfidentialTransferMint`, `configureConfidentialTransferAccount`, `approveConfidentialTransferAccount`, `emptyConfidentialTransferAccount`, `confidentialDeposit`, `confidentialWithdraw`, `confidentialTransfer`, `applyConfidentialPendingBalance`, `enableConfidentialCredits`, `disableConfidentialCredits`, `enableNonConfidentialCredits`, `disableNonConfidentialCredits` |
| **Confidential Transfer Fee** | `initializeConfidentialTransferFee`, `confidentialTransferWithFee`, `withdrawWithheldTokensFromMintForConfidentialTransferFee`, `withdrawWithheldTokensFromAccountsForConfidentialTransferFee`, `harvestWithheldTokensToMintForConfidentialTransferFee`, `enableHarvestToMint`, `disableHarvestToMint` |
| **Default Account State** | `initializeDefaultAccountState`, `updateDefaultAccountState` |
| **Reallocate** | `reallocate` |
| **Memo Transfers** | `enableMemoTransfers`, `disableMemoTransfers` |
| **Non-Transferable** | `initializeNonTransferableMint` |
| **Interest-Bearing Mint** | `initializeInterestBearingMint`, `updateRateInterestBearingMint` |
| **CPI Guard** | `enableCpiGuard`, `disableCpiGuard` |
| **Permanent Delegate** | `initializePermanentDelegate` |
| **Transfer Hook** | `initializeTransferHook`, `updateTransferHook` |
| **Metadata Pointer** | `initializeMetadataPointer`, `updateMetadataPointer` |
| **Group Pointer** | `initializeGroupPointer`, `updateGroupPointer` |
| **Group Member Pointer** | `initializeGroupMemberPointer`, `updateGroupMemberPointer` |
| **Scaled UI Amount** | `initializeScaledUiAmountMint`, `updateMultiplierScaledUiMint` |
| **Pausable** | `initializePausableConfig`, `pause`, `resume` |
| **Token Metadata** | `initializeTokenMetadata`, `updateTokenMetadataField`, `removeTokenMetadataKey`, `updateTokenMetadataUpdateAuthority`, `emitTokenMetadata` |
| **Token Group** | `initializeTokenGroup`, `updateTokenGroupMaxSize`, `updateTokenGroupUpdateAuthority`, `initializeTokenGroupMember` |

Additional: `withdrawExcessLamports`, associated token instructions (e.g. create idempotent).

The **ElGamal registry** program (`confidential/elgamal-registry`) supports confidential transfer by registering auditor and authority ElGamal pubkeys. Proof generation and extraction live in `confidential/proof-generation` and `confidential/proof-extraction`.

---

## 2. Client coverage

| Client | Location | Status |
|--------|----------|--------|
| **CLI** | `clients/cli` | Full Token-2022 and confidential flows; uses `spl-token-2022` and proof-generation. |
| **JS (generated)** | `clients/js` | Auto-generated from IDL; full instruction set; tests for transfer fee, token metadata, token group, pausable, memo transfer, confidential transfer fee, and others. |
| **JS-legacy** | `clients/js-legacy` | Manual client: core instructions plus extension helpers (transfer fee, metadata pointer, token metadata, token group, memo, CPI guard, default state, group/group-member pointers, interest-bearing, scaled UI amount, pausable, etc.). Transfer fee and metadata used by QUICK/SOLID/SOLOMON examples. Confidential transfer: use generated `clients/js` or CLI; no high-level helpers in js-legacy. |
| **Rust-legacy** | `clients/rust-legacy` | Implemented; in workspace; tests in `clients/rust-legacy/tests/`. |
| **Rust (generated)** | `clients/rust` | Present; not yet wired into root workspace (see [Rust client](#rust-generated-client) below). |

---

## 3. Documented flows (QUICK / SOLID / SOLOMON)

Deployment is described in **[DEPLOY.md](DEPLOY.md)**.

- **Create mints:** `clients/js-legacy/examples/quickToken.ts`, `solidToken.ts`, `solomonToken.ts` — Token-2022 mints with 999,369 supply, 6 decimals, 2% transfer fee, metadata pointer.
- **Distribute withheld fees:** Same scripts with `distribute` (harvest to mint, then withdraw to treasury).
- **Update metadata:** `clients/js-legacy/examples/updateTokenMetadata.ts` — update `name`, `symbol`, or `uri` (update authority required).
- **Config:** `.env` in `clients/js-legacy` (e.g. `RPC_URL`, `PRIVATE_KEY_BASE58`, `*_METADATA_URI`, optional `*_MINT_KEYPAIR` for vanity mints). Metadata templates: `metadata-quick.json`, `metadata-solid.json`, `metadata-solomon.json`.

---

## Rust generated client

The Rust client in `clients/rust` is generated from the IDL but is not yet included in the root Cargo workspace. Use `clients/rust-legacy` for Rust usage until the generated client is fully integrated.
