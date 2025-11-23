import Message from '../models/Message.js';
import User from '../models/User.js';

export const setupSocketHandlers = (socket, io, connectedUsers) => {
  // Handle sending a message
  socket.on('message:send', async (data) => {
    try {
      const { recipientId, content } = data;
      
      // Validation
      if (!recipientId || !content || content.trim().length === 0) {
        socket.emit('message:error', { error: 'Invalid message data' });
        return;
      }
      
      if (content.length > 1000) {
        socket.emit('message:error', { error: 'Message too long (max 1000 characters)' });
        return;
      }
      
      // Verify recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        socket.emit('message:error', { error: 'Recipient not found' });
        return;
      }
      
      // Create and save message
      const message = new Message({
        sender: socket.userId,
        recipient: recipientId,
        content: content.trim(),
      });
      
      await message.populate('sender', 'username');
      await message.populate('recipient', 'username');
      await message.save();
      
      // Check if recipient is online
      const recipientSocketId = connectedUsers.get(recipientId);
      
      // Prepare message data for emission
      const messageData = {
        _id: message._id,
        sender: {
          _id: message.sender._id,
          username: message.sender.username,
        },
        recipient: {
          _id: message.recipient._id,
          username: message.recipient.username,
        },
        content: message.content,
        read: message.read,
        createdAt: message.createdAt,
      };
      
      // Send to sender (confirmation)
      socket.emit('message:sent', messageData);
      
      // Send to recipient if online
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message:received', messageData);
      }
      
      console.log(`[Socket] Message sent from ${socket.userId} to ${recipientId}`);
    } catch (error) {
      console.error('[Socket] Error sending message:', error.message);
      socket.emit('message:error', { error: 'Failed to send message' });
    }
  });
  
  // Handle typing indicator
  socket.on('typing:start', (data) => {
    const { recipientId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('typing:started', {
        userId: socket.userId,
        username: socket.user.username,
      });
    }
  });
  
  socket.on('typing:stop', (data) => {
    const { recipientId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('typing:stopped', {
        userId: socket.userId,
      });
    }
  });
  
  // Handle message read status
  socket.on('message:read', async (data) => {
    try {
      const { messageId } = data;
      
      await Message.updateOne(
        { _id: messageId, recipient: socket.userId },
        { read: true }
      );
      
      console.log(`[Socket] Message ${messageId} marked as read`);
    } catch (error) {
      console.error('[Socket] Error marking message as read:', error.message);
    }
  });
};



