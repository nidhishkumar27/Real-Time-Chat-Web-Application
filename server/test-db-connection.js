import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-chat';

console.log('🔍 Testing MongoDB connection...');
console.log('📍 Connection URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials if any

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection SUCCESSFUL!');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    console.log('   Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ MongoDB connection FAILED!');
    console.log('   Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Open MongoDB Compass and verify it connects');
    console.log('   3. Check your MONGODB_URI in server/.env file');
    console.log('   4. Default URI: mongodb://localhost:27017/realtime-chat');
    process.exit(1);
  });

