import 'dotenv/config';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, TokenAccountNotFoundError, getEpochFee, getMint, getTransferFeeConfig } from '../src';

const DECIMALS = 6;
const EXPECTED_FEE_BPS_DEFAULT = 200;

const RPC_URL = process.env.RPC_URL ?? clusterApiUrl('mainnet-beta');

function parseArgs(argv: string[]) {
    const args = argv.slice(2).filter((a) => a !== '--');
    const mintArg = args[0] ?? process.env.MINT;
    const tokenLabel = args[1] ?? process.env.TOKEN_LABEL ?? 'TOKEN';

    const expectedTotalSupplyStr = process.env.EXPECTED_TOTAL_SUPPLY;
    const expectedTotalSupplyTokens = expectedTotalSupplyStr?.trim() ? BigInt(expectedTotalSupplyStr.trim()) : null;

    const expectedFeeBpsStr = process.env.EXPECTED_FEE_BPS;
    const expectedFeeBps = expectedFeeBpsStr?.trim() ? Number(expectedFeeBpsStr.trim()) : EXPECTED_FEE_BPS_DEFAULT;

    if (!mintArg?.trim()) {
        console.error('Usage: pnpm run verifyToken2022Mint -- <MINT_PUBKEY> <TOKEN_LABEL>\n');
        console.error('Env required: EXPECTED_TOTAL_SUPPLY=<integer in whole tokens> (fee defaults to 200 bps)');
        process.exit(1);
    }
    if (expectedTotalSupplyTokens === null) {
        console.error('Missing EXPECTED_TOTAL_SUPPLY env (integer in whole tokens, e.g. 21000000 for QUICK).');
        process.exit(1);
    }
    if (!Number.isFinite(expectedFeeBps)) {
        console.error('Invalid EXPECTED_FEE_BPS (must be a number, e.g. 200).');
        process.exit(1);
    }

    return { mintArg: mintArg.trim(), tokenLabel, expectedTotalSupplyTokens, expectedFeeBps };
}

async function main() {
    const { mintArg, tokenLabel, expectedTotalSupplyTokens, expectedFeeBps } = parseArgs(process.argv);

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

    const expectedSupplyBaseUnits = expectedTotalSupplyTokens * 10n ** BigInt(DECIMALS);

    const checks: { ok: boolean; label: string; detail: string }[] = [
        { ok: mint.decimals === DECIMALS, label: 'decimals', detail: `got ${mint.decimals}, expect ${DECIMALS}` },
        { ok: mint.supply === expectedSupplyBaseUnits, label: 'supply', detail: `got ${mint.supply}, expect ${expectedSupplyBaseUnits}` },
        {
            ok: fee.transferFeeBasisPoints === expectedFeeBps,
            label: 'transfer fee (bps)',
            detail: `got ${fee.transferFeeBasisPoints}, expect ${expectedFeeBps}`,
        },
        { ok: mint.isInitialized, label: 'initialized', detail: String(mint.isInitialized) },
    ];

    let failed = false;
    for (const c of checks) {
        const status = c.ok ? 'OK' : 'FAIL';
        console.log(`${status}  ${tokenLabel} ${c.label}: ${c.detail}`);
        if (!c.ok) failed = true;
    }

    console.log('Mint:', mintPk.toBase58());
    console.log('RPC:', RPC_URL);
    if (failed) process.exit(1);
    console.log(`\nAll ${tokenLabel} mint checks passed.`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

