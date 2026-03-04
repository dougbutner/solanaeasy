import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import {
    ExtensionType,
    LENGTH_SIZE,
    TYPE_SIZE,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMetadataPointerInstruction,
    createInitializeMintInstruction,
    createInitializeTransferFeeConfigInstruction,
    createTransferCheckedInstruction,
    createHarvestWithheldTokensToMintInstruction,
    createWithdrawWithheldTokensFromMintInstruction,
    getMintLen,
    getOrCreateAssociatedTokenAccount,
    getAccount,
    mintTo,
} from '../src';
import type { Account } from '../src';
import { createInitializeInstruction, pack, type TokenMetadata } from '@solana/spl-token-metadata';

const NAME = 'SOLID';
const SYMBOL = 'SOLID';
const DECIMALS = 6;
const TOTAL_SUPPLY = 999_369n * 10n ** BigInt(DECIMALS);
const TRANSFER_FEE_BPS = 200; // 2%
const MAX_FEE = (TOTAL_SUPPLY * 200n) / 10_000n; // 2% of total supply in base units
const DEFAULT_METADATA_URI = 'https://example.com/solid.json';

const RPC_URL = process.env.RPC_URL ?? clusterApiUrl('devnet');
const KEYPAIR_PATH =
    process.env.KEYPAIR ??
    path.join(process.env.HOME ?? process.env.USERPROFILE ?? '.', '.config', 'solana', 'id.json');
const METADATA_URI = process.env.SOLID_METADATA_URI ?? DEFAULT_METADATA_URI;

/** Env var for mint keypair: base58 private key, or path to keypair JSON (vanity mint address). */
const MINT_KEYPAIR_ENV = 'SOLID_MINT_PRIVATE_KEY_BASE58';
const MINT_KEYPAIR_PATH_ENV = 'SOLID_MINT_KEYPAIR';

type Mode = 'create' | 'distribute';

function loadKeypair(): Keypair {
    const base58 = process.env.PRIVATE_KEY_BASE58;
    if (base58) {
        return Keypair.fromSecretKey(bs58.decode(base58));
    }
    const secret = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
}

/** Load mint keypair from .env so the mint address is your pre-generated (e.g. vanity) address. */
function loadMintKeypair(): Keypair {
    const base58 = process.env[MINT_KEYPAIR_ENV];
    if (base58?.trim()) {
        return Keypair.fromSecretKey(bs58.decode(base58));
    }
    const keypairPath = process.env[MINT_KEYPAIR_PATH_ENV];
    if (keypairPath?.trim()) {
        const secret = JSON.parse(fs.readFileSync(path.resolve(keypairPath), 'utf8'));
        return Keypair.fromSecretKey(Uint8Array.from(secret));
    }
    return Keypair.generate();
}

function chunk<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        result.push(items.slice(i, i + size));
    }
    return result;
}

async function createSolidMint(connection: Connection, payer: Keypair) {
    const mint = loadMintKeypair();
    const metadata: TokenMetadata = {
        mint: mint.publicKey,
        name: NAME,
        symbol: SYMBOL,
        uri: METADATA_URI,
        additionalMetadata: [],
    };

    const mintLen = getMintLen([ExtensionType.TransferFeeConfig, ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const rent = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    const tx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint.publicKey,
            space: mintLen,
            lamports: rent,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
            mint.publicKey,
            payer.publicKey,
            mint.publicKey,
            TOKEN_2022_PROGRAM_ID,
        ),
        createInitializeTransferFeeConfigInstruction(
            mint.publicKey,
            payer.publicKey,
            payer.publicKey,
            TRANSFER_FEE_BPS,
            MAX_FEE,
            TOKEN_2022_PROGRAM_ID,
        ),
        createInitializeMintInstruction(mint.publicKey, DECIMALS, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            mint: mint.publicKey,
            metadata: mint.publicKey,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            mintAuthority: payer.publicKey,
            updateAuthority: payer.publicKey,
        }),
    );

    await sendAndConfirmTransaction(connection, tx, [payer, mint], { commitment: 'confirmed' });

    const treasuryAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint.publicKey,
        payer.publicKey,
        false,
        'confirmed',
        undefined,
        TOKEN_2022_PROGRAM_ID,
    );

    await mintTo(
        connection,
        payer,
        mint.publicKey,
        treasuryAccount.address,
        payer.publicKey,
        TOTAL_SUPPLY,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID,
    );

    return { mint: mint.publicKey, treasury: treasuryAccount };
}

async function getHolderAccounts(connection: Connection, mint: PublicKey): Promise<Account[]> {
    const accounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
        commitment: 'confirmed',
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: mint.toBase58(),
                },
            },
        ],
    });

    return Promise.all(
        accounts.map(({ pubkey }) => getAccount(connection, pubkey, 'confirmed', TOKEN_2022_PROGRAM_ID)),
    );
}

async function harvestAndDistribute(connection: Connection, payer: Keypair, mint: PublicKey) {
    const withdrawAuthority = payer;
    const holders = await getHolderAccounts(connection, mint);
    if (holders.length === 0) {
        console.log('No holder accounts found for this mint.');
        return;
    }

    const feeVault = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        withdrawAuthority.publicKey,
        false,
        'confirmed',
        undefined,
        TOKEN_2022_PROGRAM_ID,
    );

    const harvestTx = new Transaction().add(
        createHarvestWithheldTokensToMintInstruction(
            mint,
            holders.map((h) => h.address),
            TOKEN_2022_PROGRAM_ID,
        ),
        createWithdrawWithheldTokensFromMintInstruction(
            mint,
            feeVault.address,
            withdrawAuthority.publicKey,
            [],
            TOKEN_2022_PROGRAM_ID,
        ),
    );

    await sendAndConfirmTransaction(connection, harvestTx, [payer, withdrawAuthority], { commitment: 'confirmed' });

    const vaultInfo = await getAccount(connection, feeVault.address, 'confirmed', TOKEN_2022_PROGRAM_ID);
    const totalToDistribute = vaultInfo.amount;
    if (totalToDistribute === 0n) {
        console.log('No withheld fees available to distribute.');
        return;
    }
    const totalHeld = holders.reduce((sum, h) => sum + h.amount, 0n);
    if (totalHeld === 0n) {
        console.log('No holder balances detected; aborting distribution.');
        return;
    }

    const chunks = chunk(
        holders.filter((h) => h.amount > 0n),
        8,
    );

    for (const group of chunks) {
        const tx = new Transaction();
        for (const holder of group) {
            const share = (totalToDistribute * holder.amount) / totalHeld;
            if (share === 0n) continue;
            tx.add(
                createTransferCheckedInstruction(
                    feeVault.address,
                    mint,
                    holder.address,
                    withdrawAuthority.publicKey,
                    share,
                    DECIMALS,
                    [],
                    TOKEN_2022_PROGRAM_ID,
                ),
            );
        }
        if (tx.instructions.length > 0) {
            await sendAndConfirmTransaction(connection, tx, [payer, withdrawAuthority], { commitment: 'confirmed' });
        }
    }
}

async function main() {
    const mode = (process.argv[2] as Mode | undefined) ?? 'create';
    const connection = new Connection(RPC_URL, 'confirmed');
    const payer = loadKeypair();

    if (mode === 'create') {
        const { mint, treasury } = await createSolidMint(connection, payer);
        console.log('SOLID mint:', mint.toBase58());
        if (process.env[MINT_KEYPAIR_ENV] || process.env[MINT_KEYPAIR_PATH_ENV]) {
            console.log('(Mint address from pre-generated keypair in .env)');
        }
        console.log('Treasury ATA:', treasury.address.toBase58());
        console.log('Decimals:', DECIMALS);
        console.log('Transfer fee: 2% (200 bps), max fee', MAX_FEE.toString());
        return;
    }

    const mintArg = process.env.MINT;
    if (!mintArg) throw new Error('Set MINT env var when running in distribute mode');
    await harvestAndDistribute(connection, payer, new PublicKey(mintArg));
    console.log('Harvested and distributed withheld fees for', mintArg);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
