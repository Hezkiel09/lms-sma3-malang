import { io } from 'socket.io-client';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const socketUrl = new URL(apiBaseUrl, window.location.origin).origin;

export const connectForumSocket = (token) => io(socketUrl, {
  auth: { token },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
});
