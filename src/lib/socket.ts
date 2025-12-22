// Socket logic has been moved to src/context/socket-context.tsx
// This file is kept to avoid import errors during refactoring but should be removed.

export const connectSocket = (token: string) => {
  console.warn("connectSocket is deprecated. Use useSocket hook from SocketContext.");
  return null as any;
};

export const disconnectSocket = () => {
  console.warn("disconnectSocket is deprecated. Socket lifecycle is managed by SocketProvider.");
};
