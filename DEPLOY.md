# Token minting: QUICK, SOLID, SOLOMON

This repo mints three Token-2022 tokens: **QUICK**, **SOLID**, and **SOLOMON**. Each uses:

- **Supply:** 999,369 tokens (999,369 × 10^6 base units)
- **Decimals:** 6
- **Transfer fee:** 2% (200 bps)
- **Program:** Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)
- **Metadata:** Pointer extension (name, symbol, URI updateable by update authority)

**Prereqs:** Node 20+, pnpm, a funded payer keypair. Run from `clients/js-legacy`.

---

## .env

Set in `clients/js-legacy/.env` (or env when running):

| Variable | Required | Description |
|----------|----------|-------------|
| `RPC_URL` | Yes | e.g. `https://api.mainnet-beta.solana.com` or `https://api.devnet.solana.com` |
| `PRIVATE_KEY_BASE58` | Yes* | Payer wallet secret (base58). *Or use `KEYPAIR` path. |
| `QUICK_METADATA_URI` | Yes for QUICK | Public URL to QUICK metadata JSON |
| `SOLID_METADATA_URI` | Yes for SOLID | Public URL to SOLID metadata JSON |
| `SOLOMON_METADATA_URI` | Yes for SOLOMON | Public URL to SOLOMON metadata JSON |
| `QUICK_MINT_PRIVATE_KEY_BASE58` | Optional | Base58 mint keypair → mint address = that pubkey |
| `QUICK_MINT_KEYPAIR` | Optional | Path to mint keypair JSON (alternative to above) |
| `SOLID_MINT_PRIVATE_KEY_BASE58` | Optional | Same for SOLID |
| `SOLID_MINT_KEYPAIR` | Optional | Same for SOLID |
| `SOLOMON_MINT_PRIVATE_KEY_BASE58` | Optional | Same for SOLOMON |
| `SOLOMON_MINT_KEYPAIR` | Optional | Same for SOLOMON |

---

## Create tokens

From `clients/js-legacy`:

```bash
pnpm install
```

**QUICK**
```bash
# Set QUICK_METADATA_URI in .env (and optionally QUICK_MINT_* for fixed mint address)
npx tsx examples/quickToken.ts
# Distribute withheld fees later:
MINT=<QUICK mint address> npx tsx examples/quickToken.ts distribute
```

**SOLID**
```bash
# Set SOLID_METADATA_URI in .env (and optionally SOLID_MINT_*)
npx tsx examples/solidToken.ts
MINT=<SOLID mint address> npx tsx examples/solidToken.ts distribute
```

**SOLOMON**
```bash
# Set SOLOMON_METADATA_URI in .env (and optionally SOLOMON_MINT_*)
npx tsx examples/solomonToken.ts
MINT=<SOLOMON mint address> npx tsx examples/solomonToken.ts distribute
```

Each script prints **Mint** and **Treasury ATA**. Save the mint addresses.

---

## Pre-generated (vanity) mint address

By default the script creates a new random keypair for the mint. To use a fixed/vanity mint address:

- Set **`<TOKEN>_MINT_PRIVATE_KEY_BASE58`** to the base58 secret of the mint keypair, or  
- Set **`<TOKEN>_MINT_KEYPAIR`** to the path to the mint keypair JSON (e.g. from `solana-keygen grind`).

The mint account is created at that keypair’s **public key**. Replace `<TOKEN>` with `QUICK`, `SOLID`, or `SOLOMON`.

---

## Metadata files and updates

- **Templates:** `metadata-quick.json`, `metadata-solid.json`, `metadata-solomon.json` in `clients/js-legacy/`. Edit, host (e.g. GitHub, IPFS), and set the corresponding `*_METADATA_URI` in `.env`.
- **Update metadata after mint:** Use `updateTokenMetadata.ts`. Payer must be the **update authority** of the mint.

```bash
cd clients/js-legacy
# Update URI
MINT=<mint address> FIELD=uri VALUE=https://example.com/new-metadata.json npx tsx examples/updateTokenMetadata.ts
# Or with args
npx tsx examples/updateTokenMetadata.ts <MINT_ADDRESS> uri https://new-url.com/metadata.json
npx tsx examples/updateTokenMetadata.ts <MINT_ADDRESS> name "New Name"
npx tsx examples/updateTokenMetadata.ts <MINT_ADDRESS> symbol NEW
```

Allowed fields: `name`, `symbol`, `uri`.

---

## Files summary (minting)

| Purpose | File |
|--------|------|
| Mint QUICK | `clients/js-legacy/examples/quickToken.ts` |
| Mint SOLID | `clients/js-legacy/examples/solidToken.ts` |
| Mint SOLOMON | `clients/js-legacy/examples/solomonToken.ts` |
| QUICK metadata template | `clients/js-legacy/metadata-quick.json` |
| SOLID metadata template | `clients/js-legacy/metadata-solid.json` |
| SOLOMON metadata template | `clients/js-legacy/metadata-solomon.json` |
| Update any token metadata | `clients/js-legacy/examples/updateTokenMetadata.ts` |
| Env / config | `clients/js-legacy/.env` |

Program id for all: **TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb**.
