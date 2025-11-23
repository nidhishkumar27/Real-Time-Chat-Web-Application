import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-chat';

console.log('🔍 Testing MongoDB Atlas connection...');
console.log('📍 Connection URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

// Add database name if not present
let connectionString = MONGODB_URI;
if (!connectionString.includes('/') || connectionString.endsWith('/')) {
  // Add database name
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString = connectionString.replace(/\/(\?|$)/, '/realtime-chat$1');
}

console.log('📝 Using connection string:', connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

mongoose.connect(connectionString, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
  .then(() => {
    console.log('✅ MongoDB Atlas connection SUCCESSFUL!');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    console.log('   Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ MongoDB Atlas connection FAILED!');
    console.log('   Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Check your MONGODB_URI in server/.env file');
    console.log('   2. Verify Network Access in MongoDB Atlas (IP whitelist)');
    console.log('   3. Check database user exists and has correct permissions');
    console.log('   4. Make sure connection string includes database name');
    console.log('   5. Check your internet connection');
    process.exit(1);
  });

