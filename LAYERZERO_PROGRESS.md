# LayerZero OFT rollout – progress tracker

**Purpose:** Track deployment and verification progress for QUICK, SOLID, and SOLOMON. Update this file after each verified deployment or milestone. Do not mark steps complete until verification (e.g. successful transfer or `solana-verify`) has been done.

Reference: [LayerZero Solana OFT overview](https://docs.layerzero.network/v2/developers/solana/oft/overview), [oft-solana example](https://github.com/LayerZero-Labs/devtools/tree/main/examples/oft-solana).

---

## Tokens we mint to (explicit list)

| Token   | Solana mint (vanity) | Key of Coin / CMC pubkey | Env vars for mint keypair | Status |
|--------|----------------------|---------------------------|----------------------------|--------|
| **QUICK** | _set in .env_       | —                         | `QUICK_MINT_PRIVATE_KEY_BASE58` or `QUICK_MINT_KEYPAIR` | Not deployed |
| **SOLID** | _set in .env_       | —                         | `SOLID_MINT_PRIVATE_KEY_BASE58` or `SOLID_MINT_KEYPAIR` | Not deployed |
| **SOLOMON** | `GoLdERbgoL91URFoi5USKQqxYua1YVSUuBCuPtsnzKqy` | `GoLDEDmbque3qd1xfmnzMtg7HMju8p4UoaRX1vBsehjA` | `SOLOMON_MINT_PRIVATE_KEY_BASE58` or `SOLOMON_MINT_KEYPAIR` | Not deployed |

All three must use **vanity** Solana mints; the final token mint on Solana must be vanity (not only the dev/payer keypair). Required env vars must be set and validated before any deploy step.

---

## Step order and completion

Follow this order; do not skip. Mark ✅ only after verification (e.g. on-chain check or successful test transfer).

### Prerequisites

| Step | Description | Devnet | Mainnet |
|------|-------------|--------|---------|
| P0 | Vanity mint keys (QUICK, SOLID, SOLOMON) set in `.env`; `pnpm run validate-env` passes | ⬜ | ⬜ |
| P1 | Tokens minted on Solana (Token-2022) at vanity addresses via `quickToken.ts` / `solidToken.ts` / `solomonToken.ts` | ⬜ | ⬜ |

### Phase 1: OFT foundation (testnet)

| Step | Description | Verified |
|------|-------------|----------|
| 1.1 | Scaffold LayerZero workspace: `LZ_ENABLE_SOLANA_OFT_EXAMPLE=1 npx create-lz-oapp@latest` → select OFT (Solana), e.g. in `layerzero/` | ⬜ |
| 1.2 | Deploy **own OFT program instance** to devnet (required for upgrade-authority control; one program for all three tokens) | ⬜ |
| 1.3 | Create OFT Store for **QUICK** (link existing vanity mint to OFT Store; rename/save `deployments/solana-devnet/OFT.json` as e.g. `OFT-QUICK.json` before next) | ⬜ |
| 1.4 | Create OFT Store for **SOLID** (use separate config or renamed deployment file) | ⬜ |
| 1.5 | Create OFT Store for **SOLOMON** (same) | ⬜ |
| 1.6 | Wire testnet peers (PeerConfig per chain, EIDs from [metadata](https://metadata.layerzero-api.com/v1/metadata)); set enforced options or extra options (gas / msg.value) | ⬜ |
| 1.7 | End-to-end transfer test Solana ↔ EVM testnet (e.g. Sepolia); validate ATA/Token-2022 behavior | ⬜ |
| 1.8 | (Optional) Verify OFT program: `solana-verify verify-from-repo` per [docs](https://docs.layerzero.network/v2/developers/solana/oft/overview#optional-verify-the-oft-program) | ⬜ |

**Phase 1 complete when:** All three tokens have OFT Stores on devnet and at least one successful cross-chain transfer is verified. Update table above with ✅ and date.

### Phase 2: Mainnet bootstrap

| Step | Description | Verified |
|------|-------------|----------|
| 2.1 | Deploy OFT program to mainnet (or reuse if single program); ensure vanity mints only | ⬜ |
| 2.2 | Create/wire OFT Stores for QUICK, SOLID, SOLOMON on mainnet | ⬜ |
| 2.3 | Wire initial mainnet peers: Ethereum, Arbitrum, Optimism, Base, BSC, Polygon, Avalanche (eids from metadata) | ⬜ |
| 2.4 | Set enforced options / rate limits; run canary transfers with small amounts | ⬜ |
| 2.5 | (Recommended) Verify OFT program on mainnet and submit to OtterSec API for Verified status | ⬜ |

**Phase 2 complete when:** All three tokens live on mainnet OFT with canary-verified transfers. Update table above with ✅ and date.

### Phase 3: Expand to all compatible chains

| Step | Description | Verified |
|------|-------------|----------|
| 3.1 | Build chain matrix from LayerZero metadata API; add peers for all OFT-compatible chains (target top 100+) | ⬜ |
| 3.2 | Per-chain: peer config → quote check → canary → production enable | ⬜ |

---

## Verification log

Record each verification event (date, cluster, token, what was verified).

| Date | Cluster | Token(s) | What was verified |
|------|---------|----------|--------------------|
| _none yet_ | — | — | — |

---

## Notes

- **Token-2022:** LayerZero has [limited extension support](https://docs.layerzero.network/v2/developers/solana/oft/overview#token-extensions); Transfer Hook only with OFT fees = 0. Test each pathway.
- **Multiple OFTs:** Same OFT program can create multiple OFT Stores; for each new token rename or duplicate `deployments/solana-<CLUSTER>/OFT.json` (or use different config) so deployments are not overwritten.
- **Options:** At least one of `enforcedOptions` or `extraOptions` is required per send; for Solana→EVM set executor gas (e.g. 60_000); for EVM→Solana set `msg.value` for ATA creation (Token-2022 may need more than 2_039_280 lamports).
