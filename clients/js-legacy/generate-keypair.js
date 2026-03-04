import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const keypair = Keypair.generate();
console.log('Public key:', keypair.publicKey.toBase58());
console.log('Secret key (base58):', bs58.encode(keypair.secretKey));
