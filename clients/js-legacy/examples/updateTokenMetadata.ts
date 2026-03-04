import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { tokenMetadataUpdateFieldWithRentTransfer } from '../src';

const RPC_URL = process.env.RPC_URL ?? clusterApiUrl('devnet');
const KEYPAIR_PATH =
    process.env.KEYPAIR ??
    path.join(process.env.HOME ?? process.env.USERPROFILE ?? '.', '.config', 'solana', 'id.json');

const ALLOWED_FIELDS = ['name', 'symbol', 'uri'] as const;
type Field = (typeof ALLOWED_FIELDS)[number];

function loadKeypair(): Keypair {
    const base58 = process.env.PRIVATE_KEY_BASE58;
    if (base58) {
        return Keypair.fromSecretKey(bs58.decode(base58));
    }
    const secret = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
}

function isField(s: string): s is Field {
    return ALLOWED_FIELDS.includes(s as Field);
}

async function main() {
    const mintArg = process.env.MINT ?? process.argv[2];
    const fieldArg = process.env.FIELD ?? process.argv[3];
    const valueArg = process.env.VALUE ?? process.argv[4];

    if (!mintArg) {
        console.error('Usage: npx tsx examples/updateTokenMetadata.ts <MINT_ADDRESS> <field> <value>');
        console.error('   Or set env: MINT=... FIELD=name|symbol|uri VALUE=...');
        console.error('Example: npx tsx examples/updateTokenMetadata.ts <mint> uri https://new-url.com/metadata.json');
        process.exit(1);
    }

    if (!fieldArg || !valueArg) {
        console.error('Provide FIELD and VALUE (e.g. uri https://example.com/new-metadata.json)');
        process.exit(1);
    }

    if (!isField(fieldArg)) {
        console.error(`Field must be one of: ${ALLOWED_FIELDS.join(', ')}`);
        process.exit(1);
    }

    const connection = new Connection(RPC_URL, 'confirmed');
    const payer = loadKeypair();
    const mint = new PublicKey(mintArg);

    const sig = await tokenMetadataUpdateFieldWithRentTransfer(
        connection,
        payer,
        mint,
        payer.publicKey,
        fieldArg,
        valueArg,
        [],
        { commitment: 'confirmed' },
    );

    console.log('Metadata updated.');
    console.log('Mint:   ', mint.toBase58());
    console.log('Field:  ', fieldArg);
    console.log('Value:  ', valueArg);
    console.log('Signature:', sig);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
