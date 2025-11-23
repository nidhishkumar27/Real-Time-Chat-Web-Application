import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Test with new password
const connectionString = 'mongodb+srv://nidhishkumar27:Test123@cluster0.sapsjdq.mongodb.net/realtime-chat?appName=Cluster0';

console.log('🔍 Testing MongoDB Atlas connection with new password...');
console.log('📍 Connection URI:', connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
console.log('');

mongoose.connect(connectionString, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ MongoDB Atlas connection SUCCESSFUL!');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    console.log('   Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('');
    console.log('📝 Use this connection string in your server/.env file:');
    console.log(connectionString);
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ MongoDB Atlas connection FAILED!');
    console.log('   Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Verify password is correct in MongoDB Atlas');
    console.log('   2. Check Network Access is configured (0.0.0.0/0)');
    console.log('   3. Verify user exists in Database Access');
    console.log('   4. Check your internet connection');
    process.exit(1);
  });



