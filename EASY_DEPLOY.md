**What was added**
- Example script `clients/js-legacy/examples/easyToken.ts` builds an EASY mint that uses Token-2022 transfer-fee and metadata-pointer extensions.
- Defaults: name/symbol `EASY`, decimals `6`, total supply `21,000,000 * 10^6`, transfer fee `2%` (200 bps) capped at `420,000,000,000` base units, no other fees/burn hooks. The payer becomes the mint authority, transfer-fee config authority, metadata update authority, and withheld-fee withdraw authority.
- A `distribute` mode harvests withheld fees and pays them pro-rata to holders using the transfer-fee extension.

**Prereqs**
- Node 20+, pnpm, Solana CLI with a funded keypair.
- This repo already contains the JS legacy client used by the example.

**Create the EASY mint**
```
cd clients/js-legacy
pnpm install
RPC_URL=https://api.mainnet-beta.solana.com \
PRIVATE_KEY_BASE58=<base58 secret or omit to use KEYPAIR path> \
EASY_METADATA_URI=https://example.com/easy.json \
npx tsx examples/easyToken.ts
```
- Outputs the mint address and the payer’s treasury ATA that holds the full supply.
- The mint uses the Token-2022 program id `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` so wallets/bridges (including Fireblocks) must target that program id, not the legacy SPL token id.

**Distribute withheld transfer fees**
```
cd clients/js-legacy
RPC_URL=https://api.mainnet-beta.solana.com \
PRIVATE_KEY_BASE58=<base58 secret or omit to use KEYPAIR path> \
MINT=<EASY mint address> \
npx tsx examples/easyToken.ts distribute
```
- The payer key signs as the withdraw-withheld authority.
- The script:
  - Finds all token accounts for the mint.
  - Harvests withheld fees to the mint, withdraws them into the payer’s ATA, then transfers them pro-rata to holders.
  - Transfers use Token-2022 semantics, so they incur the 2% fee; if you want fee-free redistribution, temporarily set transferFeeBasisPoints to 0 with `setTransferFee` (transfer-fee config authority) before distributing, then restore to 200 bps.

**Fireblocks bridge notes**
- Fireblocks supports Token-2022; when adding the asset, provide:
  - Mint address from the create step.
  - Program id: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`.
  - Decimals: `6`.
  - Symbol/name: `EASY`.
- Fireblocks deposit/withdraw calls should reference the Token-2022 program id. No burn authority is configured; all supply is in the treasury ATA.
- The withdraw-withheld authority should be a Fireblocks workspace vault if you want Fireblocks to sweep and distribute fees; otherwise run the `distribute` mode with a locally controlled keypair.

**Key parameters (on-chain)**
- Decimals: 6
- Supply: 21,000,000 (21,000,000,000,000 base units)
- Transfer fee: 200 bps, max fee 420,000,000,000 base units
- Metadata pointer and token metadata set to name/symbol `EASY` and URI from `EASY_METADATA_URI`
