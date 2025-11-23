# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, Socket.io, and MongoDB.

## Features

- 🔐 User authentication (Signup/Login with JWT)
- 💬 Real-time one-to-one messaging with Socket.io
- 📱 Online/Offline user presence indicators
- 💾 Message persistence with MongoDB
- 🎨 Modern UI with TailwindCSS and DaisyUI
- 📱 Responsive design
- 🔒 Protected routes
- ✅ Input validation and error handling

## Tech Stack

### Frontend
- React 18
- Socket.io Client
- Zustand (State Management)
- React Router
- TailwindCSS + DaisyUI
- Axios

### Backend
- Node.js + Express
- Socket.io
- MongoDB + Mongoose
- JWT Authentication
- Bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd realtime-chat-app
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:

**Server** (`server/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/realtime-chat
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/realtime-chat?appName=Cluster0

JWT_SECRET=your-secret-key-here
PORT=5000
CLIENT_URL=http://localhost:3000
```

**Client** (`client/.env`):
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Running the Application

### Development Mode

Run both server and client concurrently:
```bash
npm run dev
```

Or run them separately:

**Terminal 1 - Server:**
```bash
npm run server
```

**Terminal 2 - Client:**
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment on Render

### Backend Deployment

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: `Node`
4. Add environment variables in Render dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string
   - `CLIENT_URL` - Your frontend URL (set after deploying frontend)
   - `PORT` - 5000 (or leave default)
   - `NODE_ENV` - production

### Frontend Deployment

1. Create a new **Static Site** on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
4. Add environment variables:
   - `REACT_APP_API_URL` - Your backend URL (e.g., `https://your-api.onrender.com`)
   - `REACT_APP_SOCKET_URL` - Your backend URL (same as above)

### Alternative: Using render.yaml

You can use the provided `render.yaml` file for automated deployment:

1. Push your code to GitHub
2. In Render dashboard, select "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and use `render.yaml`

**Important Notes for Render:**
- After deploying backend, update `CLIENT_URL` in backend environment variables
- After deploying frontend, update `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` in frontend environment variables
- Make sure your MongoDB Atlas allows connections from Render's IP addresses (0.0.0.0/0 for Network Access)

## Project Structure

```
realtime-chat-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API and Socket services
│   │   ├── store/         # Zustand stores
│   │   └── utils/         # Utility functions
│   └── public/
├── server/                 # Express backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── socket/            # Socket.io handlers
│   └── server.js          # Main server file
└── package.json           # Root package.json
```

## API Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (for chat list)
- `GET /api/messages/:userId` - Get messages with a user
- `GET /api/health` - Health check

## Socket Events

### Client → Server
- `message:send` - Send a message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

### Server → Client
- `message:received` - Receive a new message
- `message:sent` - Message sent confirmation
- `users:online` - List of online users
- `user:online` - User came online
- `user:offline` - User went offline
- `user:registered` - New user registered
- `typing:indicator` - Typing indicator from another user

## License

ISC

