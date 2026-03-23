import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import {
    TOKEN_2022_PROGRAM_ID,
    AuthorityType,
    createSetAuthorityInstruction,
    getMint,
} from '../src';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RPC_URL = process.env.RPC_URL ?? clusterApiUrl('mainnet-beta');
const KEYPAIR_PATH =
    process.env.KEYPAIR ??
    path.join(process.env.HOME ?? process.env.USERPROFILE ?? '.', '.config', 'solana', 'id.json');

/** Default: LayerZero SOLOMON mainnet deployment written by `lz:oft:solana:create`. */
const DEFAULT_OFT_DEPLOYMENT_JSON = path.resolve(
    __dirname,
    '../../../layerzero/deployments/solana-mainnet/OFT-SOLOMON.json',
);

function loadAuthoritySigner(): Keypair {
    const base58 = process.env.PRIVATE_KEY_BASE58;
    if (base58) {
        return Keypair.fromSecretKey(bs58.decode(base58));
    }
    if (!fs.existsSync(KEYPAIR_PATH)) {
        throw new Error(
            `No signer: set PRIVATE_KEY_BASE58 in clients/js-legacy/.env (current mint authority) or KEYPAIR. Default path was ${KEYPAIR_PATH}.`,
        );
    }
    const secret = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
}

type Deployment = { mint: string; oftStore: string };

function loadDeployment(): Deployment {
    const p = process.env.OFT_DEPLOYMENT_JSON?.trim() || DEFAULT_OFT_DEPLOYMENT_JSON;
    if (!fs.existsSync(p)) {
        throw new Error(
            `Missing deployment JSON: ${p}\nSet OFT_DEPLOYMENT_JSON or pass mint + oftStore on the CLI.\nUsage: pnpm exec tsx examples/transferMintAuthorityToOftStore.ts -- <MINT> <OFT_STORE_OR_NEW_MINT_AUTHORITY>`,
        );
    }
    const j = JSON.parse(fs.readFileSync(p, 'utf8')) as Deployment;
    if (!j.mint || !j.oftStore) {
        throw new Error(`Invalid deployment file (need mint + oftStore): ${p}`);
    }
    return j;
}

async function main() {
    const args = process.argv.slice(2).filter((a) => a !== '--');
    let mintStr: string;
    let newAuthStr: string;

    if (args.length >= 2) {
        mintStr = args[0];
        newAuthStr = args[1];
    } else {
        const d = loadDeployment();
        mintStr = d.mint;
        newAuthStr = d.oftStore;
    }

    const mint = new PublicKey(mintStr);
    const newMintAuthority = new PublicKey(newAuthStr);
    const signer = loadAuthoritySigner();
    const connection = new Connection(RPC_URL, 'confirmed');

    const before = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    if (before.mintAuthority === null) {
        console.error('Mint authority is already null; nothing to transfer.');
        process.exit(1);
    }
    if (!before.mintAuthority.equals(signer.publicKey)) {
        console.error(
            `Current mint authority is ${before.mintAuthority.toBase58()} but PRIVATE_KEY_BASE58 is ${signer.publicKey.toBase58()}.\n` +
                'Sign with the wallet that is the current mint authority.',
        );
        process.exit(1);
    }
    if (before.mintAuthority.equals(newMintAuthority)) {
        console.log(`Mint authority is already ${newMintAuthority.toBase58()}; no transaction sent.`);
        return;
    }

    const ix = createSetAuthorityInstruction(
        mint,
        signer.publicKey,
        AuthorityType.MintTokens,
        newMintAuthority,
        [],
        TOKEN_2022_PROGRAM_ID,
    );

    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [signer], { commitment: 'confirmed' });

    const after = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    if (!after.mintAuthority?.equals(newMintAuthority)) {
        console.error('Transaction confirmed but mint authority mismatch:', after.mintAuthority?.toBase58());
        process.exit(1);
    }

    console.log('SetAuthority (MintTokens) confirmed.');
    console.log('Signature:', sig);
    console.log('Mint:', mint.toBase58());
    console.log('New mint authority:', newMintAuthority.toBase58());
    console.log('RPC:', RPC_URL);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
