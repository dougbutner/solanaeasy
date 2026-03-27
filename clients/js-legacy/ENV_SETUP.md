# Local `.env` for this workspace (not committed)

Create `clients/js-legacy/.env` locally (gitignored). Template:

```bash
# =============================================================================
# For QUICK, SOLID, SOLOMON, GAINE mints + LayerZero OFT
# Run: pnpm run validate-env (from repo root).
# GAINE-only mint keys: node scripts/validate-env.mjs --tokens=GAINE
# =============================================================================

# --- Solana RPC ---
# Mainnet: https://api.mainnet-beta.solana.com
# Devnet:  https://api.devnet.solana.com
# Local:   http://localhost:8899
RPC_URL=https://api.devnet.solana.com

# --- Payer wallet (used to pay for mint creation and tx fees) ---
# Base58 private key, or leave empty to use KEYPAIR path
PRIVATE_KEY_BASE58=

# Optional: path to payer keypair JSON (default: ~/.config/solana/id.json)
# KEYPAIR=/path/to/your/payer-keypair.json

# --- Token metadata URIs (public URLs to JSON metadata for each token) ---
QUICK_METADATA_URI=https://example.com/metadata-quick.json
SOLID_METADATA_URI=https://example.com/metadata-solid.json
SOLOMON_METADATA_URI=https://example.com/metadata-solomon.json
GAINE_METADATA_URI=https://example.com/metadata-gain.json

# --- Vanity mint keypairs (required for LayerZero / deploy validation) ---
# For each token set EITHER the base58 private key OR the path to keypair JSON.

# QUICK – set one of:
QUICK_MINT_PRIVATE_KEY_BASE58=
# QUICK_MINT_KEYPAIR=/path/to/quick-mint-keypair.json

# SOLID – set one of:
SOLID_MINT_PRIVATE_KEY_BASE58=
# SOLID_MINT_KEYPAIR=/path/to/solid-mint-keypair.json

# SOLOMON – set one of (vanity e.g. GoLdERbgoL91URFoi5USKQqxYua1YVSUuBCuPtsnzKqy)
SOLOMON_MINT_PRIVATE_KEY_BASE58=
# SOLOMON_MINT_KEYPAIR=/path/to/solomon-mint-keypair.json

# GAINE – set one of:
GAINE_MINT_PRIVATE_KEY_BASE58=
# GAINE_MINT_KEYPAIR=/path/to/gain-mint-keypair.json

# --- Optional: used by scripts when passed via env instead of CLI ---
# MINT=<mint_pubkey>   for distribute mode or updateTokenMetadata
# FIELD=uri VALUE=https://...  for updateTokenMetadata
```
