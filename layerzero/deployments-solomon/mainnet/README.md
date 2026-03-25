# SOLOMON mainnet deployment exports

Populated by `pnpm run solomon:export-deployments` from the [`layerzero/`](../) package (see [`scripts/export-solomon-deployments.mjs`](../scripts/export-solomon-deployments.mjs)). Sources are **hardhat-deploy** outputs under `deployments/<network>/` plus Solana `deployments/solana-mainnet/OFT-SOLOMON.json`.

| Path | Contents |
|------|----------|
| `solana/` | Copy of `deployments/solana-mainnet/OFT-SOLOMON.json` |
| `evm/<network>/` | Copy of `deployments/<network>/MyOFT_SOLOMON.json` (Hardhat network name, e.g. `ethereum`, `arbitrum`) |
| `non-evm/` | Manual artifacts only (Sui package ID, Aptos, Tron, etc.) — see `non-evm/README.md` |
| `manifest.json` | Index of last export paths and timestamp (safe to commit; see repo root `.gitignore` exceptions) |

Re-run the export after each deploy or wire so this tree matches on-chain reality.
