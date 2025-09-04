const socketIo = require('socket.io');

// Store active connections
const activeUsers = new Map();
const activeAdmins = new Map();

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User authentication and room joining
    socket.on('authenticate', (data) => {
      const { userId, userType } = data;

      if (userId) {
        // Leave previous rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join user-specific room
        socket.join(`user_${userId}`);
        activeUsers.set(userId, socket.id);

        if (userType === 'admin') {
          socket.join('admin_room');
          activeAdmins.set(userId, socket.id);
        }

        console.log(`User ${userId} authenticated and joined rooms`);
      }
    });

    // Handle booking updates
    socket.on('booking_update', (data) => {
      const { bookingId, status, userId } = data;

      // Notify the specific user
      if (userId) {
        io.to(`user_${userId}`).emit('booking_status_update', {
          bookingId,
          status,
          message: `Your booking status has been updated to: ${status}`,
          timestamp: new Date()
        });
      }

      // Notify all admins
      io.to('admin_room').emit('admin_booking_update', {
        bookingId,
        status,
        userId,
        timestamp: new Date()
      });
    });

    // Handle payment updates
    socket.on('payment_update', (data) => {
      const { bookingId, status, userId, amount } = data;

      io.to(`user_${userId}`).emit('payment_status_update', {
        bookingId,
        status,
        amount,
        message: `Payment ${status}: $${amount}`,
        timestamp: new Date()
      });
    });

    // Handle new car listings (for admins)
    socket.on('new_car_listing', (data) => {
      const { carId, ownerId, carData } = data;

      io.to('admin_room').emit('admin_new_car', {
        carId,
        ownerId,
        carData,
        message: 'New car listing requires approval',
        timestamp: new Date()
      });
    });

    // Handle chat messages
    socket.on('send_message', (data) => {
      const { senderId, receiverId, message, bookingId } = data;

      const messageData = {
        senderId,
        receiverId,
        message,
        bookingId,
        timestamp: new Date()
      };

      // Send to receiver
      if (receiverId) {
        io.to(`user_${receiverId}`).emit('receive_message', messageData);
      }

      // Send to sender (confirmation)
      io.to(`user_${senderId}`).emit('message_sent', messageData);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { senderId, receiverId } = data;
      io.to(`user_${receiverId}`).emit('user_typing', { senderId, isTyping: true });
    });

    socket.on('typing_stop', (data) => {
      const { senderId, receiverId } = data;
      io.to(`user_${receiverId}`).emit('user_typing', { senderId, isTyping: false });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Remove from active users
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          break;
        }
      }

      // Remove from active admins
      for (const [userId, socketId] of activeAdmins.entries()) {
        if (socketId === socket.id) {
          activeAdmins.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

// Utility functions for emitting events from other parts of the application
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToAdmins = (event, data) => {
  if (io) {
    io.to('admin_room').emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const getActiveUsers = () => {
  return Array.from(activeUsers.keys());
};

const getActiveAdmins = () => {
  return Array.from(activeAdmins.keys());
};

const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToAdmins,
  emitToAll,
  getActiveUsers,
  getActiveAdmins,
  isUserOnline
};
