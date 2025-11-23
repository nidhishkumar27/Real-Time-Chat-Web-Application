#!/usr/bin/env node

/**
 * Helper script to configure app for network access
 * This will update config files with your local IP address
 */

import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) addresses and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost'; // Fallback
}

const localIP = getLocalIP();

console.log('🌐 Network Setup Helper');
console.log('='.repeat(40));
console.log(`📡 Detected Local IP: ${localIP}`);
console.log('');

if (localIP === 'localhost') {
  console.log('⚠️  Could not detect local IP. Using localhost.');
  console.log('   Others will NOT be able to connect from other devices.');
  console.log('');
} else {
  console.log(`✅ Others on your network can access:`);
  console.log(`   Frontend: http://${localIP}:3000`);
  console.log(`   Backend:  http://${localIP}:5000`);
  console.log('');
}

// Update server/.env
const serverEnvPath = path.join(__dirname, 'server', '.env');
let serverEnvContent = '';

if (fs.existsSync(serverEnvPath)) {
  serverEnvContent = fs.readFileSync(serverEnvPath, 'utf8');
  
  // Update CLIENT_URL
  if (serverEnvContent.includes('CLIENT_URL=')) {
    serverEnvContent = serverEnvContent.replace(
      /CLIENT_URL=.*/,
      `CLIENT_URL=http://${localIP}:3000`
    );
  } else {
    serverEnvContent += `\nCLIENT_URL=http://${localIP}:3000\n`;
  }
  
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Updated server/.env');
} else {
  console.log('⚠️  server/.env not found. Creating from template...');
  const templateContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/realtime-chat
JWT_SECRET=my-secret-jwt-key-12345
NODE_ENV=development
CLIENT_URL=http://${localIP}:3000
`;
  fs.writeFileSync(serverEnvPath, templateContent);
  console.log('✅ Created server/.env');
}

// Update or create client/.env
const clientEnvPath = path.join(__dirname, 'client', '.env');
const clientEnvContent = `REACT_APP_API_URL=http://${localIP}:5000/api
REACT_APP_SOCKET_URL=http://${localIP}:5000
`;

if (fs.existsSync(clientEnvPath)) {
  const existing = fs.readFileSync(clientEnvPath, 'utf8');
  let updated = existing;
  
  if (existing.includes('REACT_APP_API_URL=')) {
    updated = updated.replace(/REACT_APP_API_URL=.*/g, `REACT_APP_API_URL=http://${localIP}:5000/api`);
  } else {
    updated += `\nREACT_APP_API_URL=http://${localIP}:5000/api\n`;
  }
  
  if (existing.includes('REACT_APP_SOCKET_URL=')) {
    updated = updated.replace(/REACT_APP_SOCKET_URL=.*/g, `REACT_APP_SOCKET_URL=http://${localIP}:5000`);
  } else {
    updated += `\nREACT_APP_SOCKET_URL=http://${localIP}:5000\n`;
  }
  
  fs.writeFileSync(clientEnvPath, updated);
} else {
  fs.writeFileSync(clientEnvPath, clientEnvContent);
}

console.log('✅ Updated client/.env');
console.log('');
console.log('🎉 Setup complete!');
console.log('');
console.log('📝 Next steps:');
console.log('   1. Restart your servers: npm run dev');
console.log('   2. Share these URLs with others on your network:');
console.log(`      - Frontend: http://${localIP}:3000`);
console.log('');
console.log('⚠️  Important:');
console.log('   - Make sure firewall allows ports 3000 and 5000');
console.log('   - Others must be on the same WiFi/network');
console.log('   - For internet access, you need to deploy publicly');
console.log('');



