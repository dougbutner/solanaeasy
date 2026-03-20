# Token minting: QUICK, SOLID, SOLOMON, GAINE

This repo mints four Token-2022 tokens: **QUICK**, **SOLID**, **SOLOMON**, and **GAINE**. Each uses:

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
| `GAINE_METADATA_URI` | Yes for GAINE | Public URL to GAINE metadata JSON |
| `QUICK_MINT_PRIVATE_KEY_BASE58` | Optional | Base58 mint keypair → mint address = that pubkey |
| `QUICK_MINT_KEYPAIR` | Optional | Path to mint keypair JSON (alternative to above) |
| `SOLID_MINT_PRIVATE_KEY_BASE58` | Optional | Same for SOLID |
| `SOLID_MINT_KEYPAIR` | Optional | Same for SOLID |
| `SOLOMON_MINT_PRIVATE_KEY_BASE58` | Optional | Same for SOLOMON |
| `SOLOMON_MINT_KEYPAIR` | Optional | Same for SOLOMON |
| `GAINE_MINT_PRIVATE_KEY_BASE58` | Optional | Same for GAINE |
| `GAINE_MINT_KEYPAIR` | Optional | Same for GAINE |

---

## Create tokens

From `clients/js-legacy`:

```bash
pnpm install
```

Use **`pnpm run …Token`** from `clients/js-legacy` (uses local **`tsx`**). Do not use **`npx tsx`**: it uses a global cache and can pick the wrong `esbuild` binary.

`package.json` sets **`pnpm.supportedArchitectures`** so optional packages (including `@esbuild/darwin-x64` and `@esbuild/darwin-arm64`) install for common OS/CPU pairs. After changing that or if you still see an esbuild platform error, run:

```bash
cd clients/js-legacy && rm -rf node_modules && pnpm install
```

on the same machine (and same Rosetta vs native) as the `node` you run. Align Terminal’s “Open using Rosetta” with how Node was installed ([nodejs.org](https://nodejs.org/) universal builds help).

**QUICK**
```bash
# Set QUICK_METADATA_URI in .env (and optionally QUICK_MINT_* for fixed mint address)
pnpm run quickToken
# Distribute withheld fees later:
MINT=<QUICK mint address> pnpm run quickToken -- distribute
```

**SOLID**
```bash
# Set SOLID_METADATA_URI in .env (and optionally SOLID_MINT_*)
pnpm run solidToken
MINT=<SOLID mint address> pnpm run solidToken -- distribute
```

**GAINE**
```bash
# Set GAINE_METADATA_URI in .env (and optionally GAINE_MINT_*)
pnpm run gainToken
MINT=<GAINE mint address> pnpm run gainToken -- distribute
```

### GAINE on Solana mainnet (checklist)

1. **Metadata** — Host `metadata-gain.json` (or your final JSON) at a stable HTTPS URL; set `GAINE_METADATA_URI` in `clients/js-legacy/.env`.
2. **Vanity mint** — Set `GAINE_MINT_PRIVATE_KEY_BASE58` or `GAINE_MINT_KEYPAIR` so the mint pubkey matches your planned address (see [LAYERZERO_PROGRESS.md](LAYERZERO_PROGRESS.md)).
3. **Payer** — Set `PRIVATE_KEY_BASE58` **or** `KEYPAIR` to a funded mainnet wallet (fees + rent for mint + mint transaction).
4. **RPC** — Set `RPC_URL=https://api.mainnet-beta.solana.com` (or your provider) for the run, or put it in `.env`.
5. **Preflight** — From repo root, optional mint-key-only check before LayerZero quartet:  
   `node scripts/validate-env.mjs --tokens=GAINE`
6. **Create mint + mint full supply** — From `clients/js-legacy`:  
   `pnpm run gainToken`  
   Save the printed **Mint** and **Treasury ATA**.
7. **Verify on-chain** (before other chains):  
   `pnpm run verifyGaineMint -- <MINT_PUBKEY>`  
   with the same `RPC_URL`. Expect decimals `6`, supply `999369000000`, transfer fee `200` bps.

**SOLOMON**
```bash
# Set SOLOMON_METADATA_URI in .env (and optionally SOLOMON_MINT_*)
pnpm run solomonToken
MINT=<SOLOMON mint address> pnpm run solomonToken -- distribute
```

Each script prints **Mint** and **Treasury ATA**. Save the mint addresses.

---

## Pre-generated (vanity) mint address

By default the script creates a new random keypair for the mint. To use a fixed/vanity mint address:

- Set **`<TOKEN>_MINT_PRIVATE_KEY_BASE58`** to the base58 secret of the mint keypair, or  
- Set **`<TOKEN>_MINT_KEYPAIR`** to the path to the mint keypair JSON (e.g. from `solana-keygen grind`).

The mint account is created at that keypair’s **public key**. Replace `<TOKEN>` with `QUICK`, `SOLID`, `SOLOMON`, or `GAINE`.

---

## Metadata files and updates

- **Templates:** `metadata-quick.json`, `metadata-solid.json`, `metadata-solomon.json`, `metadata-gain.json` in `clients/js-legacy/`. Edit, host (e.g. GitHub, IPFS), and set the corresponding `*_METADATA_URI` in `.env`.
- **Update metadata after mint:** Use `updateTokenMetadata.ts`. Payer must be the **update authority** of the mint.

```bash
cd clients/js-legacy
# Update URI
MINT=<mint address> FIELD=uri VALUE=https://example.com/new-metadata.json pnpm exec tsx examples/updateTokenMetadata.ts
# Or with args
pnpm exec tsx examples/updateTokenMetadata.ts <MINT_ADDRESS> uri https://new-url.com/metadata.json
pnpm exec tsx examples/updateTokenMetadata.ts <MINT_ADDRESS> name "New Name"
pnpm exec tsx examples/updateTokenMetadata.ts <MINT_ADDRESS> symbol NEW
```

Allowed fields: `name`, `symbol`, `uri`.

---

## Files summary (minting)

| Purpose | File |
|--------|------|
| Mint QUICK | `clients/js-legacy/examples/quickToken.ts` |
| Mint SOLID | `clients/js-legacy/examples/solidToken.ts` |
| Mint GAINE | `clients/js-legacy/examples/gainToken.ts` |
| Mint SOLOMON | `clients/js-legacy/examples/solomonToken.ts` |
| QUICK metadata template | `clients/js-legacy/metadata-quick.json` |
| SOLID metadata template | `clients/js-legacy/metadata-solid.json` |
| GAINE metadata template | `clients/js-legacy/metadata-gain.json` |
| SOLOMON metadata template | `clients/js-legacy/metadata-solomon.json` |
| Update any token metadata | `clients/js-legacy/examples/updateTokenMetadata.ts` |
| Env / config | `clients/js-legacy/.env` |

Program id for all: **TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb**.
