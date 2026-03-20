# LayerZero OFT deploy – QUICK, SOLID, SOLOMON, GAINE

This doc covers **cross-chain OFT deployment and operations**. For **minting** the four tokens on Solana only, see [DEPLOY.md](DEPLOY.md).

---

## Architecture

- **Tokens:** QUICK, SOLID, SOLOMON, GAINE (Token-2022, 999,369 supply, 6 decimals, 2% fee). Solana is canonical; OFT used for cross-chain.
- **One OFT program** (single Anchor program instance) for all four tokens.
- **Four OFT Stores** (one per token); each Store is a PDA bound to a mint + escrow. Deployment files are separate so they are not overwritten:
  - `layerzero/deployments/solana-testnet/OFT-QUICK.json`
  - `layerzero/deployments/solana-testnet/OFT-SOLID.json`
  - `layerzero/deployments/solana-testnet/OFT-SOLOMON.json`
  - `layerzero/deployments/solana-testnet/OFT-GAINE.json`
- **Vanity mints required:** All four Solana mints must come from pre-generated keypairs set in `.env` (see [DEPLOY.md](DEPLOY.md) and env validation below).

---

## Prerequisites

1. **Env validation (required before any deploy)**  
   From repo root:
   ```bash
   pnpm run validate-env
   ```
   This checks that at least one of `QUICK_MINT_PRIVATE_KEY_BASE58` or `QUICK_MINT_KEYPAIR` (and same for SOLID, SOLOMON, GAINE) is set in `clients/js-legacy/.env`. If any are missing, the script exits with code 1 and lists what to set. **Do not run deploy steps until this passes.**

2. **Mint tokens on Solana**  
   Create QUICK, SOLID, SOLOMON, GAINE at vanity addresses using `quickToken.ts` / `solidToken.ts` / `solomonToken.ts` / `gainToken.ts` as in [DEPLOY.md](DEPLOY.md). Save each mint address.

3. **LayerZero workspace**  
   The `layerzero/` directory is the scaffolded OFT (Solana + EVM) example. Install and build from `layerzero/`:
   ```bash
   cd layerzero && pnpm install && pnpm run compile
   ```

---

## Phases (summary)

| Phase | Scope | Chains |
|-------|--------|--------|
| **1** | OFT foundation | Solana devnet/testnet + one EVM testnet (e.g. Arbitrum Sepolia) |
| **2** | Mainnet bootstrap | Solana mainnet + Ethereum, Arbitrum, Optimism, Base, BSC, Polygon, Avalanche |
| **3** | Expand | All OFT-compatible chains (metadata API–driven) |

Detailed step order and verification checklist: [LAYERZERO_PROGRESS.md](LAYERZERO_PROGRESS.md).

---

## Chain matrix (EIDs)

Endpoint IDs (EIDs) and peer config come from the LayerZero metadata API. Use:

- **Metadata API:** `https://metadata.layerzero-api.com/v1/metadata`
- **Phased config:** `layerzero/chain-config.ts` (testnet + mainnet bootstrap EIDs; update from API as needed).

Example testnet EIDs (confirm from API):

| Network | EID (example testnet) |
|---------|------------------------|
| Solana (testnet) | 40168 |
| Arbitrum Sepolia | 40231 |

Example mainnet EIDs (confirm from API):

| Network | EID (example mainnet) |
|---------|------------------------|
| Solana (mainnet) | 30168 |
| Ethereum | 30101 |
| Arbitrum | 30110 |
| Optimism | 30111 |
| Base | 30184 |
| BSC | 30102 |
| Polygon | 30109 |
| Avalanche | 30106 |

`layerzero/layerzero.config.ts` is wired for **testnet** with QUICK, SOLID, SOLOMON, GAINE OFT Store addresses (from `OFT-QUICK.json`, `OFT-SOLID.json`, `OFT-SOLOMON.json`, `OFT-GAINE.json`). For mainnet, add/duplicate config for mainnet EIDs and deployment paths.

---

## Commands (layerzero workspace)

Run from `layerzero/` unless noted.

- **Create OFT Adapter (Mint-And-Burn) for an existing mint** – one OFT Store per token, saves to `OFT-<NAME>.json`:
  ```bash
  npx hardhat lz:oft-adapter:solana:create \
    --eid 40168 \
    --program-id <OFT_PROGRAM_ID> \
    --mint <QUICK_MINT_PUBKEY> \
    --token-program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
    --deployment-name QUICK
  ```
  Repeat for SOLID, SOLOMON, and GAINE with:
  - `--mint <SOLID_MINT_PUBKEY>` and `--deployment-name SOLID`
  - `--mint <SOLOMON_MINT_PUBKEY>` and `--deployment-name SOLOMON`
  - `--mint <GAINE_MINT_PUBKEY>` and `--deployment-name GAINE`

- **Wire peers**  
  Use the LayerZero toolbox tasks to set peer config (EVM ↔ Solana) per token. See `layerzero/README.md` and `tasks/common/wire.ts`.

- **Quote / send**  
  - **Quote:** Use the send task with dry-run or quote-only if available (e.g. `quoteSend` / `quote` in tasks). Always run a quote before sending.
  - **Canary:** Send a small amount first; verify on destination chain before enabling larger transfers.

---

## Safety and rollback

- **Before send:** Run `pnpm run validate-env` (root); run quote in `layerzero/` for the path you use.
- **Deployment check:** After creating OFT Stores, run `pnpm run validate-layerzero-deployments` (root) to ensure `OFT-QUICK.json`, `OFT-SOLID.json`, `OFT-SOLOMON.json`, `OFT-GAINE.json` exist under `layerzero/deployments/solana-testnet` (or pass the deployment dir as argument).
- **Canary:** Do a small transfer and verify balance/ATA on destination; then scale.
- **Rollback:** To disable a path or pause:
  - **EVM:** Pause the OFT contract or remove peer config if supported.
  - **Solana:** Use LayerZero tasks to clear or update peer config / pause as per [LayerZero Solana OFT docs](https://docs.layerzero.network/v2/developers/solana/oft/overview).
  - Document the change and update [LAYERZERO_PROGRESS.md](LAYERZERO_PROGRESS.md) Verification log.

---

## Files reference

| Purpose | Location |
|--------|----------|
| Mint tokens (Solana only) | [DEPLOY.md](DEPLOY.md), `clients/js-legacy/examples/*Token.ts` |
| Env validation | `pnpm run validate-env` (root), `scripts/validate-env.mjs` |
| Deployment file check | `pnpm run validate-layerzero-deployments` (root), `scripts/validate-layerzero-deployments.mjs` |
| OFT workspace | `layerzero/` |
| OFT config (contracts + connections) | `layerzero/layerzero.config.ts` |
| Deployment outputs (per token) | `layerzero/deployments/solana-testnet/OFT-QUICK.json` (and SOLID, SOLOMON, GAINE) |
| Progress and verification log | [LAYERZERO_PROGRESS.md](LAYERZERO_PROGRESS.md) |
