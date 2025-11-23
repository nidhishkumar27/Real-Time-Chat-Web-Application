import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  users: [],
  onlineUsers: new Set(),
  selectedUser: null,
  messages: {}, // { userId: [messages] }
  typingUsers: {}, // { userId: boolean }
  
  setUsers: (users) => {
    set({ users });
  },
  
  setOnlineUsers: (userIds) => {
    if (!userIds || !Array.isArray(userIds)) {
      console.warn('[ChatStore] Invalid userIds for setOnlineUsers:', userIds);
      return;
    }
    
    // Normalize all IDs to strings for consistent comparison
    const normalizedIds = userIds.map(id => String(id?.toString() || id)).filter(Boolean);
    console.log('[ChatStore] 📝 Setting online users:', normalizedIds);
    console.log('[ChatStore] Count:', normalizedIds.length);
    set({ onlineUsers: new Set(normalizedIds) });
    
    // Verify it was set
    const current = get().onlineUsers;
    console.log('[ChatStore] ✅ Online users now in store:', Array.from(current));
  },
  
  addOnlineUser: (userId) => {
    if (!userId) {
      console.warn('[ChatStore] Attempted to add online user with no ID');
      return;
    }
    
    console.log('[ChatStore] ➕ Adding online user:', userId);
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      const normalizedId = String(userId?.toString() || userId);
      newSet.add(normalizedId);
      console.log('[ChatStore] ✅ Online users after add:', Array.from(newSet));
      return { onlineUsers: newSet };
    });
  },
  
  removeOnlineUser: (userId) => {
    if (!userId) {
      console.warn('[ChatStore] Attempted to remove online user with no ID');
      return;
    }
    
    console.log('[ChatStore] ➖ Removing online user:', userId);
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      const normalizedId = String(userId?.toString() || userId);
      newSet.delete(normalizedId);
      console.log('[ChatStore] ✅ Online users after remove:', Array.from(newSet));
      return { onlineUsers: newSet };
    });
  },
  
  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },
  
  setMessages: (userId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: messages,
      },
    }));
  },
  
  addMessage: (message, currentUserId) => {
    // Normalize IDs to strings for consistent comparison
    const senderId = (message.sender._id?.toString() || message.sender._id || message.sender.id?.toString() || message.sender.id);
    const recipientId = (message.recipient._id?.toString() || message.recipient._id || message.recipient.id?.toString() || message.recipient.id);
    const currentId = (currentUserId?.toString() || currentUserId);
    
    // Determine conversation key: store under the OTHER user's ID (not current user)
    let conversationUserId;
    if (currentId && senderId === currentId) {
      // Current user sent the message, store under recipient ID
      conversationUserId = recipientId;
    } else if (currentId && recipientId === currentId) {
      // Current user received the message, store under sender ID
      conversationUserId = senderId;
    } else {
      // Fallback: if we can't determine, try to use the selected user
      const selectedUser = get().selectedUser;
      if (selectedUser) {
        const selectedUserId = (selectedUser._id?.toString() || selectedUser.id?.toString() || selectedUser._id || selectedUser.id);
        if (senderId === selectedUserId || recipientId === selectedUserId) {
          conversationUserId = senderId === selectedUserId ? recipientId : senderId;
        } else {
          conversationUserId = senderId; // Default fallback
        }
      } else {
        conversationUserId = senderId; // Default fallback
      }
    }
    
    set((state) => {
      // Check if message already exists in any conversation
      for (const [key, msgs] of Object.entries(state.messages)) {
        if (msgs.some((m) => (m._id?.toString() || m._id) === (message._id?.toString() || message._id))) {
          return state; // Message already exists
        }
      }
      
      // Add to the conversation
      const existingMessages = state.messages[conversationUserId] || [];
      
      return {
        messages: {
          ...state.messages,
          [conversationUserId]: [...existingMessages, message],
        },
      };
    });
  },
  
  setTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping,
      },
    }));
  },
  
  clearTyping: () => {
    set({ typingUsers: {} });
  },
}));

export default useChatStore;

