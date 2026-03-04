// Quick script to show metadata and hosting options for QUICK, SOLID, SOLOMON
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'metadata-quick.json';
const metadataPath = path.join(__dirname, file);
const metadata = fs.existsSync(metadataPath) ? fs.readFileSync(metadataPath, 'utf8') : '{}';

console.log('📋 Metadata JSON Content:');
console.log('─'.repeat(50));
console.log(metadata);
console.log('─'.repeat(50));
console.log('');
console.log('🚀 Quick Hosting Options:');
console.log('');
console.log('1. GitHub Gist (FASTEST - Recommended for testing):');
console.log('   → Go to: https://gist.github.com');
console.log('   → Create new public gist');
console.log('   → Filename: metadata.json');
console.log('   → Paste the JSON above');
console.log('   → Click "Create public gist"');
console.log('   → Click "Raw" button');
console.log('   → Copy the URL');
console.log('');
console.log('2. IPFS via Pinata (Permanent):');
console.log('   → Go to: https://pinata.cloud');
console.log('   → Sign up (free)');
console.log('   → Upload metadata.json');
console.log('   → Get IPFS URL');
console.log('');
console.log('3. IPFS via NFT.Storage (Permanent):');
console.log('   → Go to: https://nft.storage');
console.log('   → Sign up (free)');
console.log('   → Upload metadata.json');
console.log('   → Get IPFS URL');
console.log('');
console.log('Once you have the URL, set QUICK_METADATA_URI, SOLID_METADATA_URI, or SOLOMON_METADATA_URI in .env');
console.log('Usage: node upload-to-ipfs.js [metadata-quick.json|metadata-solid.json|metadata-solomon.json]');
