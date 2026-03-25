# SOLOMON LayerZero rollout — per-chain onboarding checklist

Use this for **each** chain before relying on production liquidity. EIDs and contract addresses must match LayerZero V2 mainnet metadata.

## 1. Verify metadata

1. Open the LayerZero metadata API: `https://metadata.layerzero-api.com/v1/metadata` (or the [deployed contracts](https://docs.layerzero.network/v2/deployments/deployed-contracts) docs).
2. Confirm the chain’s **mainnet `eid`** matches `chain-config.ts` (`SOLOMON_MAINNET_PHASE_A_EVM` / `SOLOMON_MAINNET_PHASE_B_EVM`).
3. Note **EndpointV2**, **executor**, and **DVN** addresses for troubleshooting and Scan links.
4. Optional: compare pathway defaults in [LayerZero Scan — Default Checker](https://layerzeroscan.com/tools/defaults?version=V2) after wiring.

## 2. Repo configuration

1. **EVM (this repo)**  
   - Ensure [`hardhat.config.ts`](../hardhat.config.ts) includes the network (via [`hardhat.solomon-mainnet-networks.ts`](../hardhat.solomon-mainnet-networks.ts)).  
   - Set `RPC_URL_<NETWORK>` in `.env.solomon.mainnet` (see [`.env.solomon.mainnet.example`](../.env.solomon.mainnet.example)).  
   - **Required:** `LZ_TARGET_NETWORK=mainnet` so [`layerzero.config.ts`](../layerzero.config.ts) selects the SOLOMON mainnet graph (not the default testnet wiring).  
   - Choose phase: `LZ_SOLOMON_PHASE=a` (7 EVM chains) or `b` / `all` (Phase A + B).

2. **Solana (canonical)**  
   - OFT program + OFT Store for SOLOMON must exist; deployment JSON under `deployments/solana-mainnet/OFT-SOLOMON.json`.

3. **Non-EVM tracks** (not automated by default Hardhat wiring here)  
   - **Aptos**: see `tasks/aptos/*` and `docs/wiring-to-aptos.md`.  
   - **Sui**: see `docs/solana-to-sui-solomon-track.md` (peer = OFT **package** ID).  
   - **Tron**: use LayerZero Tron tooling / docs; store artifacts under `deployments-solomon/mainnet/non-evm/`.

## 3. Deploy EVM peer (if applicable)

1. Load secrets with **`LZ_TARGET_NETWORK=mainnet`** (e.g. `.env.solomon.mainnet`), e.g.  
   `DOTENV_CONFIG_PATH=.env.solomon.mainnet pnpm hardhat lz:deploy --network <network>`  
   Select / deploy **`MyOFT_SOLOMON`** only for SOLOMON-only rollout.
2. Confirm constructor / initial supply policy matches production (no testnet mint in `contracts/MyOFT.sol`).

## 4. Initialize Solana pathway config (when Solana is involved)

For new Solana ↔ EVM pathways, run once (or after adding paths):

```bash
DOTENV_CONFIG_PATH=.env.solomon.mainnet pnpm hardhat lz:oft:solana:init-config --oapp-config layerzero.config.ts
```

(`LZ_TARGET_NETWORK=mainnet` must be set in that env file or exports.)

## 5. Wire peers and options

```bash
DOTENV_CONFIG_PATH=.env.solomon.mainnet pnpm hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

Use LayerZero docs for [message execution options](https://docs.layerzero.network/v2/developers/solana/oft/overview#message-execution-options) and [Simple Config](https://docs.layerzero.network/v2/developers/evm/technical-reference/simple-config).

## 6. Canary transfer

1. Small amount **Solana → EVM** and **EVM → Solana** (or appropriate pair for that chain).  
2. Confirm delivery on [LayerZero Scan](https://layerzeroscan.com/).  
3. Record tx hashes in your runbook.

## 7. Export deployment snapshot

From `layerzero/`:

```bash
pnpm run solomon:export-deployments
```

Writes copies under `deployments-solomon/mainnet/` and refreshes `manifest.json` (commit separately if you track them in git).

## Phase reference (EVM in this repo)

| Phase | Env | Scope |
|-------|-----|--------|
| A | `LZ_SOLOMON_PHASE=a` (default) | Ethereum, Arbitrum, Optimism, Base, BSC, Polygon, Avalanche |
| B / all | `LZ_SOLOMON_PHASE=b` or `all` | Phase A + extended list in `chain-config.ts` |

Non-EVM targets (Sui, Aptos, Tron, etc.) are listed in `SOLOMON_MAINNET_NON_EVM_ROLLOUT` for planning; onboard using the matching track above.
