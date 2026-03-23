# Gold-backed RWA chain reference (for contract addresses)

## Purpose
This document is a **reference** for locating **legitimate gold-backed token contract addresses** (CA) on major chains, using a reproducible research workflow.

It is **not** the same as LayerZero OFT peer configuration. In this repo, **Solomon OFT peers are your deployed contracts** (for example, `MyOFT_SOLOMON` on each destination chain), not third-party gold token contracts like XAUT/PAXG/XAUm.

## Reproducible method (how to find chain names + CAs)
1. Go to [`rwa.xyz`](https://rwa.xyz) (top RWA aggregator).
2. Search for `gold` or filter `Commodities`.
3. Click each gold asset page and extract:
   - Chain list
   - Contract address (CA) per chain
   - Supply / audit / redemption notes (as listed)
4. Cross-check legitimacy (do not rely on a single listing):
   - Issuer/custodian references (for example, issuer sites like `paxos.com/paxgold`, `gold.tether.to`, `matrixdock.com`)
   - Chain explorer verification for the listed CA (Etherscan/Polygonscan/Solscan/etc.)
   - Redemption/proof-of-reserves signals (audits, redemption process, regulated issuer/custodian where applicable)
5. Only after verification: treat CA values as inputs for off-chain integrations (price feeds, liquidity routing, UI linking, etc.).

### Legitimacy checklist (keep it strict)
- Regulated issuer / clear legal entity where applicable
- Named custodian / vault operator and stated redemption process
- Public audits / proof-of-reserves / serialization or other credible proof mechanisms
- No “meme” gold token clones (hundreds exist on some chains)

## LZ compatibility check (what “supported” means)
LayerZero supports many networks, but you still need to confirm the specific chain is enabled for your OFT deployment.

Use the LayerZero metadata list: `https://layerzero.network` and verify your chain is available for OFT/OApp wiring (EIDs).

## Starting reference set (non-authoritative; verify on-chain)
The table below mirrors the initial shortlist collected for your milestone. **Re-verify every CA** using the method above before using them as integration inputs.

### Physical (1:1) gold-backed tokens
| Token | Chain | Contract address (CA) | Notes / verification |
|---|---|---|---|
| XAUT | Ethereum | `0x68749665FF8D2d112Fa859AA293F07A622782F38T` | Tether Gold; verify on Etherscan and issuer site; confirm OFT-relevant chain support separately |
| XAUT | Avalanche | `0x30974f73a4ac9e606ed80da928e454977ac486d2` | Tether Gold; verify on explorer and issuer site |
| PAXG | Ethereum | `0x45804880de22913dafe09f4980848ece6ecaf78` | Pax Gold; verify on Etherscan and Paxos |
| XAUm | Ethereum | `0x2103e845c5e135493bb6c2a4f0b8651956ea8682` | Matrixdock Gold; verify on Etherscan/issuer |
| XAUm | BNB Chain | `0x23ae4fd8e7844cdbc97775496ebd0e8248656028` | Matrixdock Gold; verify on explorer |
| XAUm | Solana (Token-2022 mint) | `5aLhp9VnUEKcsdtkfsf2DUgpJfomx7GmYVny24dHUZoB` | Verify on Solscan; note Token-2022 metadata handling |
| XAUm | Sui (Move object/type) | `0x9d297676e7a4b771ab023291377b2adfaa4938fb9080b8d12430e4b108b836a9::xaum::XAUM` | Move type reference; this repo does not yet include Sui wiring |
| GOLD (OroGold) | Solana | `GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6AG` | Verify issuer/custodian details and Solscan |
| GLDr (Gold rStock) | Solana | `AEv6xLECJ2KKmwFGX85mHb9S2c2BQE7dqE5midyrXHBbX` | Verify issuer/remora details and Solscan |

### Important: CA table vs OFT peers
- You generally do **not** add XAUT/PAXG/XAUm CAs into `layerzero.config.ts` for Solomon.
- Instead, you deploy `MyOFT_SOLOMON` (your OFT) on each destination chain and wire peers between:
  - Solana OFT Store (from `layerzero/deployments/solana-*/OFT-SOLOMON.json`)
  - Destination-chain `MyOFT_SOLOMON` contracts

## Suggested next step (where to use this doc)
- If you want to build UI/integration features for gold token liquidity or price tracking, use this doc to find CAs.
- If you want to expand Solomon’s cross-chain transfers, update `layerzero/hardhat.config.ts` and `layerzero/layerzero.config.ts` (Phase 2 mainnet wiring).

