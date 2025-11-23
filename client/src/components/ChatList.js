import React, { useEffect } from 'react';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';

const ChatList = ({ onSelectUser }) => {
  const { users, selectedUser, onlineUsers } = useChatStore();
  const { user: currentUser } = useAuthStore();
  
  // Debug logging
  React.useEffect(() => {
    console.log('[ChatList] Users:', users.length);
    console.log('[ChatList] Online users:', Array.from(onlineUsers));
    console.log('[ChatList] Current user:', currentUser?.id);
  }, [users, onlineUsers, currentUser]);
  
  return (
    <div className="h-full bg-base-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <div className="space-y-2">
          {users.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No users available
            </div>
          ) : (
            users.map((user) => {
              // Normalize user ID to string for consistent comparison
              const userId = String(user._id?.toString() || user.id?.toString() || user._id || user.id);
              const currentUserId = String(currentUser?.id?.toString() || currentUser?._id?.toString() || currentUser?.id || currentUser?._id || '');
              
              // Skip showing current user in the list
              if (userId === currentUserId) {
                return null; // Don't show yourself in the list
              }
              
              // Check if user is online - normalize all IDs to strings
              const isOnline = Array.from(onlineUsers).some(onlineId => {
                const normalizedOnlineId = String(onlineId?.toString() || onlineId);
                const normalizedUserId = String(userId?.toString() || userId);
                const matches = normalizedOnlineId === normalizedUserId;
                if (matches) {
                  console.log(`[ChatList] ✅ User ${user.username} is online. ID match: ${normalizedUserId}`);
                }
                return matches;
              });
              
              // Debug logging
              if (!isOnline) {
                console.log(`[ChatList] ⚠️ User ${user.username} appears offline. UserId: ${userId}, Online users:`, Array.from(onlineUsers));
              }
              
              const isSelected = String(selectedUser?._id?.toString() || selectedUser?.id?.toString() || selectedUser?._id || selectedUser?.id || '') === userId;
              
              return (
                <div
                  key={user._id}
                  onClick={() => onSelectUser(user)}
                  className={`card cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary text-primary-content' : 'bg-base-100 hover:bg-base-300'
                  }`}
                >
                  <div className="card-body py-3">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-12">
                          <span className="text-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{user.username}</div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          <span className="text-xs opacity-70">
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;

