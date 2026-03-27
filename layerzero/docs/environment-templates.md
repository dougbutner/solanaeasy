# Environment templates (local files only)

Do **not** commit `.env` or `.env*.example` files. Copy the blocks below into **gitignored** files on your machine (for example `layerzero/.env` or `layerzero/.env.solomon.mainnet`).

## Default LayerZero / Hardhat — `layerzero/.env`

```bash
# Testnet / multi-token demo: leave LZ_TARGET_NETWORK unset or set to testnet (default in layerzero.config.ts).
# SOLOMON mainnet: use the SOLOMON mainnet block below in `.env.solomon.mainnet` and set LZ_TARGET_NETWORK=mainnet.

# EVM Variables
# By default, the examples support both mnemonic-based and private key-based authentication
# You don't need to set both of these values, just pick the one that you prefer and set that one
MNEMONIC=
# Private key for EVM contract owner/delegate
PRIVATE_KEY=

# Optional Arbitrum Sepolia RPC (see hardhat.config.ts)
# RPC_URL_ARB_SEPOLIA=

# Optional mainnet RPC endpoints (see hardhat.config.ts).
# These can be left unset if you are okay with the default Tenderly gateway URLs.
# RPC_URL_ETHEREUM=
# RPC_URL_ARBITRUM=
# RPC_URL_OPTIMISM=
# RPC_URL_BASE=
# RPC_URL_BSC=
# RPC_URL_POLYGON=
# RPC_URL_AVALANCHE=
#
# --- SOLOMON mainnet profile ---
# For SOLOMON-only mainnet deploy/wire, use a dedicated env file (see section below) and run:
#   DOTENV_CONFIG_PATH=.env.solomon.mainnet pnpm hardhat lz:deploy --network ethereum
# Phase selection: LZ_SOLOMON_PHASE=a (default, 7 EVM chains) or b|all (Phase A+B).

# CREATE2 salts for vanity MyOFT addresses (hardhat-deploy). Each must be exactly 0x + 64 hex chars (32 bytes).
# Mine salts against this repo's MyOFT bytecode + constructor args + hardhat-deploy's deterministic deployer —
# not the same as grinding an EOA wallet address. See LayerZero deploy docs / README “Deploy” for CREATE2 notes.
# Leave unset to deploy MyOFT_QUICK / MyOFT_SOLID / MyOFT_SOLOMON / MyOFT_GAINE with normal CREATE (non-vanity).
# QUICK_OFT_CREATE2_SALT=
# SOLID_OFT_CREATE2_SALT=
# SOLOMON_OFT_CREATE2_SALT=
# GAINE_OFT_CREATE2_SALT=

# Solana Variables
# Fee payer for Hardhat Solana tasks and for `pnpm run deploy:oft-program:mainnet` (same as LayerZero getSolanaKeypair()).
# Do not commit real keys. Optional: SOLANA_DEPLOY_COMPUTE_UNIT_PRICE for `solana program deploy --with-compute-unit-price`.
SOLANA_PRIVATE_KEY=
SOLANA_KEYPAIR_PATH=
# By default, the Solana example will use the default cluster RPC URL if no other value is provided
RPC_URL_SOLANA=
RPC_URL_SOLANA_TESTNET=
```

## SOLOMON mainnet — `layerzero/.env.solomon.mainnet`

See also: [solomon-rollout-chain-onboarding.md](./solomon-rollout-chain-onboarding.md).

```bash
# SOLOMON mainnet profile — local only; fill in secrets after copying.
# Load when running Hardhat: `DOTENV_CONFIG_PATH=.env.solomon.mainnet pnpm hardhat <task>`

# --- Target network flags ---
LZ_TARGET_NETWORK=mainnet
# `a` = Phase A EVM only (7 chains). `b` or `all` = Phase A + B EVM (full list in chain-config.ts).
LZ_SOLOMON_PHASE=a

# --- EVM deployer (one of) ---
MNEMONIC=
PRIVATE_KEY=

# --- Solana deployer (OFT tasks / program deploy) ---
SOLANA_PRIVATE_KEY=
# SOLANA_KEYPAIR_PATH=
RPC_URL_SOLANA=

# Optional CREATE2 vanity salt for MyOFT_SOLOMON on EVM (0x + 64 hex chars)
# SOLOMON_OFT_CREATE2_SALT=

# --- Phase A RPC overrides (optional; defaults in hardhat.solomon-mainnet-networks.ts) ---
# RPC_URL_ETHEREUM=
# RPC_URL_ARBITRUM=
# RPC_URL_OPTIMISM=
# RPC_URL_BASE=
# RPC_URL_BSC=
# RPC_URL_POLYGON=
# RPC_URL_AVALANCHE=

# --- Phase B RPC overrides (set before deploying/wiring those networks) ---
# RPC_URL_LINEA=
# RPC_URL_MANTLE=
# RPC_URL_BLAST=
# RPC_URL_SCROLL=
# RPC_URL_MANTA=
# RPC_URL_OPBNB=
# RPC_URL_MODE=
# RPC_URL_FRAXTAL=
# RPC_URL_METIS=
# RPC_URL_FANTOM=
# RPC_URL_GNOSIS=
# RPC_URL_CELO=
# RPC_URL_MOONBEAM=
# RPC_URL_MOONRIVER=
# RPC_URL_HARMONY=
# RPC_URL_KAVA=
# RPC_URL_CRONOSEVM=
# RPC_URL_INJECTIVEEVM=
# RPC_URL_SEI=
# RPC_URL_HEDERA=
# RPC_URL_KAIA=
# RPC_URL_COREDAO=
# RPC_URL_CONFLUX=
# RPC_URL_METER=
# RPC_URL_CANTO=
# RPC_URL_FLARE=
# RPC_URL_ASTAR=
# RPC_URL_BERA=
# RPC_URL_MONAD=
# RPC_URL_MOVEMENT=
# RPC_URL_PLASMA=
# RPC_URL_PLUME=
# RPC_URL_INITIA=
# RPC_URL_IOTA=
# RPC_URL_ROOTSTOCK=
# RPC_URL_FUSE=
# RPC_URL_BAHAMUT=
# RPC_URL_CHILIZ=
# RPC_URL_PEAQ=
# RPC_URL_XDC=
# RPC_URL_AURORA=
```
