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

## Deployment

### ⚠️ Important: Backend Deployment

**Vercel does NOT support WebSockets/Socket.io** in serverless functions. You need to deploy your backend separately on a platform that supports persistent connections:

**Recommended Backend Hosting Options:**
- **Railway** (Recommended) - Easy deployment, supports WebSockets
- **Render** - Free tier available, supports WebSockets
- **Fly.io** - Good for Node.js apps with WebSockets
- **DigitalOcean App Platform** - Supports WebSockets
- **Heroku** - Paid, but reliable

**Backend Deployment Steps (Example for Railway):**

1. Go to [Railway.app](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Add a new service → Select your repo → Choose `server` as root directory
4. Add environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string
   - `CLIENT_URL` - Your Vercel frontend URL (set after deploying frontend)
   - `PORT` - 5000 (Railway sets this automatically)
   - `NODE_ENV` - production
5. Railway will auto-detect and deploy your Node.js app

### Frontend Deployment on Vercel

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - **Root Directory**: `client`
     - **Framework Preset**: Create React App
     - **Build Command**: `npm install && npm run build`
     - **Output Directory**: `build`
   - Add environment variables:
     - `REACT_APP_API_URL` - Your backend URL (e.g., `https://your-api.railway.app/api`)
     - `REACT_APP_SOCKET_URL` - Your backend URL (e.g., `https://your-api.railway.app`)
   - Click "Deploy"

3. **Deploy via CLI** (alternative):
   ```bash
   cd client
   vercel
   ```
   Follow the prompts and add environment variables when asked.

**Important Notes:**
- After deploying backend, update `CLIENT_URL` in backend environment variables with your Vercel URL
- After deploying frontend, update `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` in Vercel dashboard
- Make sure your MongoDB Atlas allows connections from your backend hosting provider's IP addresses (0.0.0.0/0 for Network Access)
- The `vercel.json` file in the root is configured for frontend deployment

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

