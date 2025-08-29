"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export interface Notification {
  type: "user_notification" | "channel_notification" | "broadcast";
  user_id?: string;
  channel?: string;
  data: {
    message: string;
    progress?: number;
    status: "processing" | "completed" | "error";
    stage?: string;
    error?: string;
    report_id?: string;
    nextjs_response?: any;
    details?: any;
    suggestion?: string;
    timestamp?: string;
  };
  timestamp: string;
  id?: string;
}

interface DashboardData {
  name: string;
  completion: number;
  color: string;
  completed_assessments: number;
  total_employees: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  subscribeToNotifications: (data: {
    user_id?: string;
    channel?: string;
  }) => void;
  clearNotifications: () => void;
  lastNotification: Notification | null;
  subscriptionStatus: string;
  unreadCount: number;
  markAsRead: (notificationId?: string) => void;
  isRinging: boolean;
  dashboardData: DashboardData[] | null;
  roomsData: any;
  totalEmployees: number;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  subscribeToNotifications: () => {},
  clearNotifications: () => {},
  lastNotification: null,
  subscriptionStatus: "disconnected",
  unreadCount: 0,
  markAsRead: () => {},
  isRinging: false,
  dashboardData: null,
  roomsData: null,
  totalEmployees: 0,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotification, setLastNotification] = useState<Notification | null>(
    null
  );
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<string>("disconnected");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData[] | null>(
    null
  );
  const [roomsData, setRoomsData] = useState<any>(null);
  const { data: session } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [totalEmployees, setTotalmployee] = useState(0);
  // Initialize audio with your custom sound file
  useEffect(() => {
    audioRef.current = new Audio("/mixkit-cartoon-door-melodic-bell-110.wav");
    if (audioRef.current) {
      audioRef.current.preload = "auto";
      audioRef.current.volume = 0.3;
      audioRef.current.onerror = (e) => {
        console.error("Error loading notification sound:", e);
      };
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      audioRef.current
        .play()
        .then(() => {
          console.log("🔊 Notification sound played successfully");
        })
        .catch((error) => {
          console.error("🔇 Error playing notification sound:", error);
        });
    }
  }, []);

  const triggerBellRing = useCallback(() => {
    setIsRinging(true);
    playNotificationSound();
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
    }
    ringTimeoutRef.current = setTimeout(() => {
      setIsRinging(false);
    }, 1000);
  }, [playNotificationSound]);

  const subscribeToNotifications = useCallback(
    (data: { user_id?: string; channel?: string }) => {
      if (socket && isConnected) {
        console.log("📨 Emitting subscribe_notifications:", data);
        socket.emit("subscribe_notifications", data);
        setSubscriptionStatus("subscribing");
      } else {
        console.log("❌ Cannot subscribe - socket not connected");
      }
    },
    [socket, isConnected]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLastNotification(null);
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback((notificationId?: string) => {
    if (notificationId) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    console.log("🔌 Initializing Socket.IO connection...");

    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000",
      {
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      }
    );

    socketInstance.on("connect", () => {
      console.log("✅ Connected to server with ID:", socketInstance.id);
      setIsConnected(true);
      setSubscriptionStatus("connected");

      if (session?.user?.id) {
        console.log(
          "📨 Auto-subscribing to notifications for user:",
          session.user.id
        );
        socketInstance.emit("subscribe_notifications", {
          user_id: session.user.id,
        });
        setSubscriptionStatus("subscribing");

        // Emit hr_dashboard event for dashboard data
        console.log("📊 Emitting hr_dashboard for hrId:", session.user.id);
        socketInstance.emit("hr_dashboard", { hrId: session.user.id });
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      setIsConnected(false);
      setSubscriptionStatus("disconnected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔌 Connection error:", error.message);
      setSubscriptionStatus("connection_error");
    });

    socketInstance.on("reconnect", (attempt) => {
      console.log(`♻️ Reconnected after ${attempt} attempts`);
      setSubscriptionStatus("reconnected");
      if (session?.user?.id) {
        socketInstance.emit("subscribe_notifications", {
          user_id: session.user.id,
        });
        setSubscriptionStatus("subscribing");

        // Re-emit hr_dashboard on reconnect
        console.log("📊 Re-emitting hr_dashboard for hrId:", session.user.id);
        socketInstance.emit("hr_dashboard", { hrId: session.user.id });
      }
    });

    socketInstance.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
      setSubscriptionStatus("reconnection_error");
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("Failed to reconnect");
      setSubscriptionStatus("reconnection_failed");
    });

    socketInstance.on("subscription_confirmed", (data) => {
      console.log("✅ Subscription confirmed:", data);
      setSubscriptionStatus("subscribed");
    });

    socketInstance.on("notification", (notification: any) => {
      console.log("📨 FULL Notification received:", notification);
      if (notification && notification.data) {
        const fullNotification: Notification = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: notification.type || "user_notification",
          user_id: notification.user_id,
          channel: notification.channel,
          data: {
            message: notification.data.message || "",
            progress: notification.data.progress,
            status: notification.data.status || "processing",
            stage: notification.data.stage,
            error: notification.data.error,
            report_id: notification.data.report_id,
            nextjs_response: notification.data.nextjs_response,
            details: notification.data.details,
            suggestion: notification.data.suggestion,
            timestamp: notification.data.timestamp,
          },
          timestamp: notification.timestamp || new Date().toISOString(),
        };

        console.log("📝 Processed notification:", fullNotification);
        setNotifications((prev) => {
          const newNotifications = [...prev, fullNotification];
          return newNotifications.slice(-50);
        });
        setLastNotification(fullNotification);
        setUnreadCount((prev) => prev + 1);
        triggerBellRing();
      } else {
        console.error("❌ Invalid notification format:", notification);
      }
    });

    // Listen for dashboard data updates
    socketInstance.on("reports_info", (data) => {
      console.log("📊 Dashboard data received:", data);
      if (data.dashboardData && Array.isArray(data.dashboardData)) {
        setDashboardData(data.dashboardData);
        setTotalmployee(data.total_employees);
      } else if (data.error) {
        console.error("❌ HR Dashboard error:", data.error);
      }
      if (data.rooms) {
        setRoomsData(data.rooms);
      }
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(socketInstance);

    return () => {
      console.log("🧹 Cleaning up Socket.IO connection");
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
      }
      socketInstance.disconnect();
    };
  }, [session, triggerBellRing]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        lastNotification,
        subscribeToNotifications,
        clearNotifications,
        subscriptionStatus,
        unreadCount,
        markAsRead,
        isRinging,
        dashboardData,
        roomsData,
        totalEmployees,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
