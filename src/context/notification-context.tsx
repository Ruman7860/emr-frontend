'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSocket } from '@/context/socket-context';
import { toast } from 'sonner';

export interface Notification {
  visitId: string;
  patientName: string;
  visitDate: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
}

const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleQueueAdd = (payload: any) => {
      console.log("📥 QUEUE_ADD received", payload);

      setNotifications((prev) => [
        {
          visitId: payload.visitId,
          patientName: payload.patientName,
          visitDate: payload.visitDate,
        },
        ...prev,
      ]);

      setUnreadCount((c) => c + 1);
    };

    socket.on("queue.add", handleQueueAdd);

    return () => {
      socket.off("queue.add", handleQueueAdd);
    };
  }, [socket]);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used inside NotificationProvider'
    );
  }
  return ctx;
}
