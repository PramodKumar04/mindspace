import { Server } from 'socket.io';
import User from '../models/User.js';
import { hashSessionToken } from './sessionService.js';

const rooms = new Map();
const socketToRoom = new Map();
const socketUsers = new Map();

const getRoomState = (roomCode) => {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, {
      participants: new Map(),
      messages: []
    });
  }

  return rooms.get(roomCode);
};

const serializeParticipants = (roomState) => {
  return Array.from(roomState.participants.values());
};

const findUserBySessionToken = async (token) => {
  if (!token) {
    return null;
  }

  const now = new Date();
  const tokenHash = hashSessionToken(token);

  let user = await User.findOne({
    sessionTokenHash: tokenHash,
    sessionExpiresAt: { $gt: now },
    isActive: true
  }).select('name email role collegeId token sessionExpiresAt');

  if (!user) {
    user = await User.findOne({
      token,
      isActive: true
    }).select('name email role collegeId token sessionExpiresAt');
  }

  if (!user) {
    return null;
  }

  if (user.sessionExpiresAt && user.sessionExpiresAt <= now) {
    return null;
  }

  return user;
};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const user = await findUserBySessionToken(token);

      if (!user) {
        return next(new Error('Unauthorized socket connection'));
      }

      socket.user = {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: String(user.collegeId)
      };

      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-call', ({ roomCode, displayName } = {}) => {
      const normalizedRoomCode = String(roomCode || '').trim().toUpperCase();
      if (!normalizedRoomCode) {
        return;
      }

      const roomState = getRoomState(normalizedRoomCode);
      const participant = {
        socketId: socket.id,
        userId: socket.user.id,
        displayName: displayName?.trim() || socket.user.name,
        role: socket.user.role
      };

      roomState.participants.set(socket.id, participant);
      socketToRoom.set(socket.id, normalizedRoomCode);
      socketUsers.set(socket.id, participant);
      socket.join(normalizedRoomCode);

      const participants = serializeParticipants(roomState);

      for (const socketId of roomState.participants.keys()) {
        io.to(socketId).emit('user-joined', socket.id, participants);
      }

      for (const message of roomState.messages) {
        io.to(socket.id).emit(
          'chat-message',
          message.data,
          message.sender,
          message.socketIdSender
        );
      }
    });

    socket.on('signal', (toId, message) => {
      io.to(toId).emit('signal', socket.id, message);
    });

    socket.on('chat-message', (data, sender) => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) {
        return;
      }

      const roomState = rooms.get(roomCode);
      if (!roomState) {
        return;
      }

      const payload = {
        sender: sender || socket.user.name,
        data,
        socketIdSender: socket.id
      };

      roomState.messages.push(payload);

      for (const socketId of roomState.participants.keys()) {
        io.to(socketId).emit('chat-message', payload.data, payload.sender, payload.socketIdSender);
      }
    });

    socket.on('disconnect', () => {
      const roomCode = socketToRoom.get(socket.id);
      if (!roomCode) {
        return;
      }

      const roomState = rooms.get(roomCode);
      if (!roomState) {
        socketToRoom.delete(socket.id);
        socketUsers.delete(socket.id);
        return;
      }

      roomState.participants.delete(socket.id);
      socketToRoom.delete(socket.id);
      socketUsers.delete(socket.id);

      for (const socketId of roomState.participants.keys()) {
        io.to(socketId).emit('user-left', socket.id);
      }

      if (roomState.participants.size === 0) {
        rooms.delete(roomCode);
      }
    });
  });

  return io;
};
