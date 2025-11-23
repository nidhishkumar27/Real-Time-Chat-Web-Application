# Real-Time Chat Application

A full-stack real-time chat application built with React, Socket.io, MongoDB, and Express.

## Features

- ✅ User authentication (Signup/Login with JWT)
- ✅ Real-time one-to-one chat using Socket.io
- ✅ Message persistence with MongoDB
- ✅ Online/Offline presence indicators
- ✅ Responsive UI with TailwindCSS and DaisyUI
- ✅ Global state management with Zustand
- ✅ Error handling (client and server)
- ✅ Input validation and logging

## Tech Stack

### Backend
- Node.js + Express
- Socket.io for real-time communication
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

### Frontend
- React
- Socket.io-client
- Zustand for state management
- TailwindCSS + DaisyUI for styling
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Installation

1. Install root dependencies:
```bash
npm run install-all
```

Or install manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

2. Set up environment variables:

In `server/` directory, create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/realtime-chat
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

3. Start MongoDB (if running locally):
```bash
# Make sure MongoDB is running on localhost:27017
# Or update MONGODB_URI in .env to your MongoDB connection string
```

4. Run the application:

**Option 1: Run both server and client together**
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
realtime-chat-app/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── store/       # Zustand stores
│   │   ├── services/    # API and Socket services
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main app component
│   └── package.json
├── server/              # Express backend
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── socket/          # Socket.io handlers
│   ├── server.js        # Main server file
│   └── package.json
└── package.json         # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/users` - Get all users (protected)

### Messages
- `GET /api/messages/:recipientId` - Get conversation (protected)

## Socket Events

### Client → Server
- `message:send` - Send a message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:read` - Mark message as read

### Server → Client
- `message:sent` - Message sent confirmation
- `message:received` - New message received
- `message:error` - Message error
- `user:online` - User came online
- `user:offline` - User went offline
- `users:online` - List of online users
- `typing:started` - User started typing
- `typing:stopped` - User stopped typing

## License

ISC



