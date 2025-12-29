import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.geniusfactor.ai";

interface Notification {
  id: number;
  type: "success" | "error";
  title: string;
  message: string;
  reportId?: string;
  userId?: string;
  timestamp: string;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Initialize Socket.IO client
    const socketIo = io(SOCKET_SERVER_URL, {
      path: "/socket.io/",
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(socketIo);

    // Listen for notification events
    // Limit array size to prevent memory leak (keep last 50 notifications)
    const notificationHandler = (notification: Notification) => {
      setNotifications((prev) => {
        const newNotifications = [
          ...prev,
          {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            reportId: notification.reportId,
            userId: notification.userId,
            timestamp: notification.timestamp,
          },
        ];
        return newNotifications.slice(-50); // Keep only last 50 notifications
      });
    };

    socketIo.on("notification", notificationHandler);

    // Trigger the Socket.IO server initialization
    fetch("/api/socket").catch((err) =>
      console.error("Failed to initialize Socket.IO server:", err)
    );

    // Clean up on component unmount
    return () => {
      // Remove event listener to prevent memory leak
      socketIo.off("notification", notificationHandler);
      // Disconnect socket
      socketIo.disconnect();
    };
  }, []);

  return { socket, notifications };
};
