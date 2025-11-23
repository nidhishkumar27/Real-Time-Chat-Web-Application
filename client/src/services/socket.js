import { io } from 'socket.io-client';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';

class SocketService {
  constructor() {
    this.socket = null;
  }
  
  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }
    
    const chatStore = useChatStore.getState();
    
    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    
    this.socket.on('connect', () => {
      console.log('[Socket] ✅ Connected successfully');
      console.log('[Socket] Socket ID:', this.socket.id);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] ❌ Disconnected. Reason:', reason);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('[Socket] ❌ Connection error:', error.message);
    });
    
    // Handle initial list of online users (received when connecting)
    this.socket.on('users:online', ({ userIds }) => {
      console.log('[Socket] 📥 Received initial online users list:', userIds);
      console.log('[Socket] Count:', userIds?.length || 0);
      
      if (!userIds || !Array.isArray(userIds)) {
        console.warn('[Socket] Invalid users:online data:', userIds);
        return;
      }
      
      // Normalize all IDs to strings for consistent comparison
      const normalizedIds = userIds.map(id => String(id?.toString() || id)).filter(Boolean);
      console.log('[Socket] Normalized IDs:', normalizedIds);
      chatStore.setOnlineUsers(normalizedIds);
    });
    
    // Handle when a user comes online (broadcasted to all other users)
    this.socket.on('user:online', ({ userId }) => {
      if (!userId) {
        console.warn('[Socket] Received user:online with no userId');
        return;
      }
      
      console.log('[Socket] 🔵 User came online:', userId);
      const normalizedId = String(userId?.toString() || userId);
      console.log('[Socket] Normalized ID:', normalizedId);
      chatStore.addOnlineUser(normalizedId);
    });
    
    // Handle when a user goes offline (broadcasted to all other users)
    this.socket.on('user:offline', ({ userId }) => {
      if (!userId) {
        console.warn('[Socket] Received user:offline with no userId');
        return;
      }
      
      console.log('[Socket] 🔴 User went offline:', userId);
      const normalizedId = String(userId?.toString() || userId);
      console.log('[Socket] Normalized ID:', normalizedId);
      chatStore.removeOnlineUser(normalizedId);
    });
    
    // Handle new user registration - add to user list automatically
    this.socket.on('user:registered', ({ user }) => {
      if (!user) {
        console.warn('[Socket] Received user:registered with no user data');
        return;
      }
      
      console.log('[Socket] 🆕 New user registered:', user.username);
      const currentUsers = chatStore.users;
      
      // Check if user already exists in the list
      const userExists = currentUsers.some(u => 
        (u._id?.toString() || u.id?.toString() || u._id || u.id) === (user._id?.toString() || user.id?.toString() || user._id || user.id)
      );
      
      if (!userExists) {
        // Add new user to the list
        const updatedUsers = [...currentUsers, user].sort((a, b) => 
          (a.username || '').localeCompare(b.username || '')
        );
        chatStore.setUsers(updatedUsers);
        console.log('[Socket] ✅ Added new user to list:', user.username);
      }
    });
    
    // Handle messages
    this.socket.on('message:sent', (message) => {
      const currentUser = useAuthStore.getState().user;
      const currentUserId = currentUser?.id || currentUser?._id;
      chatStore.addMessage(message, currentUserId);
    });
    
    this.socket.on('message:received', (message) => {
      const currentUser = useAuthStore.getState().user;
      const currentUserId = currentUser?.id || currentUser?._id;
      chatStore.addMessage(message, currentUserId);
      
      // Show notification if not in current conversation
      const selectedUser = chatStore.selectedUser;
      const senderId = message.sender._id?.toString() || message.sender._id || message.sender.id?.toString() || message.sender.id;
      const selectedUserId = selectedUser?._id?.toString() || selectedUser?.id?.toString() || selectedUser?._id || selectedUser?.id;
      if (!selectedUser || senderId !== selectedUserId) {
        // Could add toast notification here
        console.log('[Socket] New message from:', message.sender.username);
      }
    });
    
    this.socket.on('message:error', ({ error }) => {
      console.error('[Socket] Message error:', error);
    });
    
    // Handle typing indicators
    this.socket.on('typing:started', ({ userId, username }) => {
      chatStore.setTyping(userId, true);
    });
    
    this.socket.on('typing:stopped', ({ userId }) => {
      chatStore.setTyping(userId, false);
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  sendMessage(recipientId, content) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message:send', { recipientId, content });
    } else {
      console.error('[Socket] Not connected');
    }
  }
  
  startTyping(recipientId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing:start', { recipientId });
    }
  }
  
  stopTyping(recipientId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing:stop', { recipientId });
    }
  }
  
  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;

