const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

const keypair = Keypair.generate();
console.log('Public key:', keypair.publicKey.toBase58());
console.log('Secret key (base58):', bs58.encode(keypair.secretKey));


const keypair = Keypair.generate();
console.log('Public key:', keypair.publicKey.toBase58());
console.log('Secret key (base58):', bs58.encode(keypair.secretKey));
