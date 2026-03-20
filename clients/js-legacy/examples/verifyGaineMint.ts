import 'dotenv/config';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, TokenAccountNotFoundError, getEpochFee, getMint, getTransferFeeConfig } from '../src';

const DECIMALS = 6;
const EXPECT_SUPPLY = 999_369n * 10n ** BigInt(DECIMALS);
const EXPECT_FEE_BPS = 200;

const RPC_URL = process.env.RPC_URL ?? clusterApiUrl('mainnet-beta');

async function main() {
    const args = process.argv.slice(2).filter((a) => a !== '--');
    const mintArg = args[0] ?? process.env.MINT;
    if (!mintArg?.trim()) {
        console.error('Usage: pnpm run verifyGaineMint -- <MINT_PUBKEY>\n   or: MINT=<pubkey> pnpm run verifyGaineMint');
        process.exit(1);
    }

    const mintPk = new PublicKey(mintArg);
    const connection = new Connection(RPC_URL, 'confirmed');
    let mint;
    try {
        mint = await getMint(connection, mintPk, 'confirmed', TOKEN_2022_PROGRAM_ID);
    } catch (e) {
        if (e instanceof TokenAccountNotFoundError) {
            console.error(`No Token-2022 mint account at ${mintPk.toBase58()} on this RPC (${RPC_URL}).`);
            process.exit(1);
        }
        throw e;
    }
    const feeCfg = getTransferFeeConfig(mint);
    if (!feeCfg) {
        console.error('FAIL: mint has no TransferFeeConfig extension');
        process.exit(1);
    }

    const epoch = BigInt((await connection.getEpochInfo('confirmed')).epoch);
    const fee = getEpochFee(feeCfg, epoch);

    const checks: { ok: boolean; label: string; detail: string }[] = [
        { ok: mint.decimals === DECIMALS, label: 'decimals', detail: `got ${mint.decimals}, expect ${DECIMALS}` },
        { ok: mint.supply === EXPECT_SUPPLY, label: 'supply', detail: `got ${mint.supply}, expect ${EXPECT_SUPPLY}` },
        {
            ok: fee.transferFeeBasisPoints === EXPECT_FEE_BPS,
            label: 'transfer fee (bps)',
            detail: `got ${fee.transferFeeBasisPoints}, expect ${EXPECT_FEE_BPS}`,
        },
        { ok: mint.isInitialized, label: 'initialized', detail: String(mint.isInitialized) },
    ];

    let failed = false;
    for (const c of checks) {
        const status = c.ok ? 'OK' : 'FAIL';
        console.log(`${status}  ${c.label}: ${c.detail}`);
        if (!c.ok) failed = true;
    }

    console.log('Mint:', mintPk.toBase58());
    console.log('RPC:', RPC_URL);
    if (failed) process.exit(1);
    console.log('\nAll GAINE mint checks passed.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
