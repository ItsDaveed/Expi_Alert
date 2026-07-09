import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { business } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!business) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join business room
    newSocket.emit('join_business', business._id);

    newSocket.on('new_alert', (alert) => {
      setUnreadCount(prev => prev + 1);
      toast.error(`🔔 ${alert.message}`, { duration: 5000 });
    });

    return () => newSocket.disconnect();
  }, [business]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
