import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import socketService from '../services/socket';
import { messagesAPI } from '../services/api';

const ChatWindow = () => {
  const { selectedUser, messages, typingUsers, addMessage } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const selectedUserIdKey = selectedUser ? (selectedUser._id?.toString() || selectedUser.id?.toString() || selectedUser._id || selectedUser.id) : null;
  const conversationMessages = selectedUserIdKey ? (messages[selectedUserIdKey] || []) : [];
  const isTyping = selectedUser && typingUsers[selectedUser._id];
  
  useEffect(() => {
    if (selectedUser) {
      loadConversation();
    }
  }, [selectedUser]);
  
  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);
  
  const loadConversation = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const userId = selectedUser._id || selectedUser.id;
      const data = await messagesAPI.getConversation(userId);
      const userIdKey = userId?.toString() || userId;
      useChatStore.getState().setMessages(userIdKey, data.messages);
    } catch (err) {
      setError(err.error || 'Failed to load conversation');
      console.error('[ChatWindow] Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedUser || loading) return;
    
    const content = messageInput.trim();
    setMessageInput('');
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketService.stopTyping(selectedUser._id);
    
    // Send message via socket
    socketService.sendMessage(selectedUser._id, content);
  };
  
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (!selectedUser) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Start typing indicator
    socketService.startTyping(selectedUser._id);
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(selectedUser._id);
    }, 3000);
  };
  
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-100">
        <div className="text-center text-gray-500">
          <p className="text-xl">Select a user to start chatting</p>
        </div>
      </div>
    );
  }
  
  const selectedUserId = selectedUser._id?.toString() || selectedUser.id?.toString() || selectedUser._id || selectedUser.id;
  const isOnline = useChatStore.getState().onlineUsers.has(selectedUserId) || 
                   Array.from(useChatStore.getState().onlineUsers).some(id => id?.toString() === selectedUserId?.toString());
  
  return (
    <div className="flex-1 flex flex-col bg-base-100">
      {/* Header */}
      <div className="bg-base-200 p-4 border-b border-base-300">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              <span>{selectedUser.username.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div>
            <div className="font-semibold">{selectedUser.username}</div>
            <div className="text-xs text-gray-500">
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          conversationMessages.map((message) => {
            const currentUserId = currentUser?.id?.toString() || currentUser?._id?.toString() || currentUser?.id || currentUser?._id;
            const senderId = message.sender._id?.toString() || message.sender._id;
            const isOwn = senderId === currentUserId;
            
            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`chat ${
                    isOwn ? 'chat-end' : 'chat-start'
                  } max-w-xs lg:max-w-md`}
                >
                  <div className="chat-header">
                    {!isOwn && message.sender.username}
                    <time className="text-xs opacity-50 ml-2">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <div
                    className={`chat-bubble ${
                      isOwn ? 'chat-bubble-primary' : 'chat-bubble-base-300'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat chat-start">
              <div className="chat-bubble chat-bubble-base-300">
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t border-base-300 p-4">
        <form onSubmit={handleSendMessage}>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="input input-bordered flex-1"
              value={messageInput}
              onChange={handleInputChange}
              disabled={loading}
              maxLength={1000}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!messageInput.trim() || loading}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

