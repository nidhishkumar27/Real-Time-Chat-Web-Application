import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually
const envPath = join(__dirname, '.env');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf8');
  console.log('✅ Found .env file');
  
  // Parse .env manually
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  });
} catch (error) {
  console.log('⚠️ Could not read .env file:', error.message);
}

dotenv.config();

console.log('🔍 Testing MongoDB Atlas connection...\n');

// Test different password encodings
const username = 'nidhishkumar27';
const password = 'nidhishkumar@27';
const host = 'cluster0.sapsjdq.mongodb.net';
const database = 'realtime-chat';

const connectionStrings = [
  // Option 1: URL-encoded @ as %40
  `mongodb+srv://${username}:nidhishkumar%4027@${host}/${database}?appName=Cluster0`,
  // Option 2: Double URL-encoded
  `mongodb+srv://${username}:nidhishkumar%2540@${host}/${database}?appName=Cluster0`,
  // Option 3: From .env file
  process.env.MONGODB_URI || '',
];

console.log('Testing connection strings:\n');

for (let i = 0; i < connectionStrings.length; i++) {
  const uri = connectionStrings[i];
  if (!uri) continue;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${i + 1}: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ SUCCESS! Connection string works!');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    console.log('\n📝 Use this connection string in your .env file:');
    console.log(uri);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
}

console.log('\n' + '='.repeat(60));
console.log('❌ All connection strings failed!');
console.log('\n💡 Next steps:');
console.log('   1. Verify username and password in MongoDB Atlas');
console.log('   2. Check if user exists in Database Access');
console.log('   3. Verify Network Access is configured');
console.log('   4. Try resetting password in Atlas (without @ symbol)');
console.log('   5. Make sure password matches exactly in Atlas');

process.exit(1);



