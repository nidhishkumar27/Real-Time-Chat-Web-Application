import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import { authAPI } from '../services/api';
import socketService from '../services/socket';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const Chat = () => {
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { setUsers, setSelectedUser, selectedUser } = useChatStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('[Chat] Auth check - isAuthenticated:', isAuthenticated, 'token:', token ? 'exists' : 'missing');
    
    if (!isAuthenticated || !token) {
      console.log('[Chat] Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    initializeChat();
    
    return () => {
      // Cleanup on unmount
      socketService.disconnect();
    };
  }, [isAuthenticated, token, navigate]);
  
  const initializeChat = async () => {
    try {
      // Load users first
      const usersData = await authAPI.getUsers();
      setUsers(usersData.users);
      console.log('[Chat] Users loaded:', usersData.users.length);
      
      // Then connect socket (this will trigger online users list)
      socketService.connect(token);
      console.log('[Chat] Socket connecting...');
      
      // Wait a moment for socket connection to establish
      setTimeout(() => {
        const socket = socketService.getSocket();
        if (socket && socket.connected) {
          console.log('[Chat] Socket connected, requesting online users...');
        } else {
          console.warn('[Chat] Socket not connected yet');
        }
      }, 500);
      
      setLoading(false);
    } catch (error) {
      console.error('[Chat] Initialization error:', error);
      if (error.error?.includes('401') || error.error?.includes('unauthorized')) {
        logout();
        navigate('/login');
      }
      setLoading(false);
    }
  };
  
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };
  
  const handleLogout = () => {
    socketService.disconnect();
    logout();
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-base-200">
      {/* Header */}
      <div className="bg-primary text-primary-content p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Real-Time Chat</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.username}</span>
            <button className="btn btn-sm btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat List */}
        <div className="w-full md:w-80 border-r border-base-300 flex flex-col">
          <ChatList onSelectUser={handleSelectUser} />
        </div>
        
        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default Chat;

