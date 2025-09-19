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

interface InternalMobilityData {
  monthlyMobilityTrends: {
    ingoing: { [month: string]: number };
    outgoing: { [month: string]: number };
    promotions: { [month: string]: number };
  };
  departmentMovementFlow: {
    [department: string]: {
      incoming: number;
      outgoing: number;
      net_movement: number;
    };
  };
  metrics: {
    total_promotions: number;
    total_transfers: number;
    total_movements: number;
    retention_rate: number;
    avg_retention_risk?: number;
    overall_completion_rate?: number;
  };
  data_timeframe: {
    start_date: string;
    end_date: string;
  };
  users: any[];
}

interface MobilityAnalysisData {
  overview: {
    total_movements: number;
    promotions: number;
    transfers: number;
    lateral_moves: number;
    other_movements: number;
    avg_time_to_promotion: number;
    departments_analyzed: number;
  };
  chartData: {
    movement_types: Array<{ name: string; value: number; color: string }>;
    department_mobility: Array<{
      name: string;
      movements: number;
      color: string;
    }>;
    monthly_trends: Array<{ month: string; movements: number }>;
  };
  departmentBreakdown: { [department: string]: number };
  timeMetrics: {
    promotion_times: number[];
    analysis_period: { start: string; end: string };
  };
}

interface DepartmentData {
  department: string;
  createdAt: string;
  ingoing: number;
  outgoing: number;
  employeeCount: number;
}

interface DepartmentCardData {
  totalEmployees: number;
  totalIngoing: number;
  totalOutgoing: number;
  totalDepartments: number;
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
  dashboardData: any;
  roomsData: any;
  totalEmployees: number;
  internalMobility: InternalMobilityData | null;
  mobilityAnalysis: any | null;
  isAdmin: boolean;
  departmentData: DepartmentData[] | null;
  departmentCardData: DepartmentCardData | null;
  hrNotifications: any[];
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
  internalMobility: null,
  mobilityAnalysis: null,
  isAdmin: false,
  departmentData: null,
  departmentCardData: null,
  hrNotifications: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [internalMobility, setInternalMobility] =
    useState<InternalMobilityData | null>(null);
  const [mobilityAnalysis, setMobilityAnalysis] = useState<any | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData[] | null>(
    null
  );
  const [departmentCardData, setDepartmentCardData] =
    useState<DepartmentCardData | null>(null);
  const [lastNotification, setLastNotification] = useState<Notification | null>(
    null
  );
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<string>("disconnected");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [roomsData, setRoomsData] = useState<any>(null);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hrNotifications, setHrNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.role) {
      const userRole = session.user.role;
      setIsAdmin(
        userRole === "admin" || userRole === "Admin" || userRole === "ADMIN"
      );
    }
  }, [session]);

  // Debug useEffect to track state changes
  // useEffect(() => {
  //   console.log("📊 dashboardData state:", dashboardData);
  //   console.log("👤 isAdmin:", isAdmin);
  //   console.log("🔗 isConnected:", isConnected);
  //   console.log("🚶 mobilityAnalysis:", mobilityAnalysis);
  //   console.log("🏢 departmentData:", departmentData);
  //   console.log("📊 departmentCardData:", departmentCardData);
  // }, [
  //   dashboardData,
  //   isAdmin,
  //   isConnected,
  //   mobilityAnalysis,
  //   departmentData,
  //   departmentCardData,
  // ]);

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
        .then(() => {})
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
        // console.log("📨 Emitting subscribe_notifications:", data);
        socket.emit("subscribe_notifications", data);
        setSubscriptionStatus("subscribing");
      } else {
        console.error("❌ Cannot subscribe - socket not connected");
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

  // Function to emit appropriate dashboard events based on user role
  const emitDashboardEvents = useCallback(
    (socketInstance: Socket) => {
      if (session?.user?.id) {
        if (isAdmin) {
          // Emit admin_dashboard event for admin users

          socketInstance.emit("admin_dashboard", { adminId: session.user.id });

          // Emit internal_mobility_analysis for admin users

          socketInstance.emit("admin_internal_mobility_analysis", {
            adminId: session.user.id,
          });
        } else {
          socketInstance.emit("hr_dashboard", { hrId: session.user.id });

          // Emit internal_mobility event for HR users

          socketInstance.emit("internal_mobility", { hrId: session.user.id });

          // Emit department_analysis for HR users

          socketInstance.emit("department_analysis", { hrId: session.user.id });
        }
      }
    },
    [session, isAdmin]
  );

  useEffect(() => {
    // console.log("🔌 Initializing Socket.IO connection...");

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
      path: "/socket.io/",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.on("connect_error", (err: any) => {
      console.error("Connection Error:", err.message);
      console.error("Description:", err.description);
      console.error("Context:", err.context);
    });

    socketInstance.on("disconnect", (reason, details) => {});

    socketInstance.on("connect", () => {
      setIsConnected(true);
      setSubscriptionStatus("connected");

      if (session?.user?.id) {
        socketInstance.emit("subscribe_notifications", {
          user_id: session.user.id,
        });
        setSubscriptionStatus("subscribing");

        // Emit appropriate dashboard events based on user role
        emitDashboardEvents(socketInstance);
      }
    });

    socketInstance.on("disconnect", (reason) => {
      setIsConnected(false);
      setSubscriptionStatus("disconnected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔌 Connection error:", error.message);
      setSubscriptionStatus("connection_error");
    });

    socketInstance.on("reconnect", (attempt) => {
      setSubscriptionStatus("reconnected");
      if (session?.user?.id) {
        socketInstance.emit("subscribe_notifications", {
          user_id: session.user.id,
        });
        setSubscriptionStatus("subscribing");

        // Re-emit dashboard events on reconnect
        emitDashboardEvents(socketInstance);
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
      setSubscriptionStatus("subscribed");
    });

    socketInstance.on("notification", (notification: any) => {
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

    // Listen for dashboard data updates (both hr_dashboard and admin_dashboard use 'reports_info')
    socketInstance.on("reports_info", (data) => {
      // Handle both admin and HR dashboard data structures
      if (data.overallMetrics) {
        if (isAdmin) {
          // Admin dashboard data handling

          // For admin data, store the complete data structure
          setDashboardData(data);

          // Calculate total employees from department metrics
          const totalEmps = data.departmentMetrics
            ? Object.values(data.departmentMetrics).reduce(
                (sum: number, metrics: any) =>
                  sum + (metrics.employee_count || 0),
                0
              )
            : 0;

          setTotalEmployees(
            totalEmps ||
              data.overallMetrics?.total_employee_users ||
              data.overallMetrics?.total_reports ||
              0
          );
        } else {
          // HR dashboard data handling

          if (data.dashboardData && Array.isArray(data.dashboardData)) {
            setDashboardData(data.dashboardData);
            setTotalEmployees(data.overallMetrics?.total_employees || 0);
          } else {
            // Fallback: if dashboardData is not an array, try to use departmentMetrics
            const transformedData = data.departmentMetrics
              ? Object.entries(data.departmentMetrics).map(
                  ([name, metrics]: [string, any]) => ({
                    name,
                    completion: metrics.avg_retention_risk || 0,
                    color: "#2563eb",
                    completed_assessments: metrics.total_reports || 0,
                    total_employees: metrics.employee_count || 0,
                  })
                )
              : [];

            setDashboardData(transformedData);
            setTotalEmployees(data.overallMetrics?.total_employees || 0);
          }
        }
      } else if (data.error) {
        // console.error("❌ Dashboard error:", data.error);
        // Set empty data to avoid infinite loading
        setDashboardData({});
      } else {
        console.warn("⚠️ Unknown data structure received:", data);
        // Set empty data to avoid infinite loading
        setDashboardData({});
      }

      if (data.rooms) {
        setRoomsData(data.rooms);
      }
    });

    // Listen for internal mobility data updates (for HR users)
    socketInstance.on("mobility_info", (data) => {
      if (isAdmin) {
        return;
      }

      if (
        data.monthlyMobilityTrends &&
        data.departmentMovementFlow &&
        data.metrics
      ) {
        setInternalMobility({
          monthlyMobilityTrends: data.monthlyMobilityTrends,
          departmentMovementFlow: data.departmentMovementFlow,
          metrics: data.metrics,
          data_timeframe: data.data_timeframe,
          users: data.users,
        });
      } else if (data.error) {
        console.error("❌ Internal mobility error:", data.error);
      }
    });

    // Listen for internal mobility analysis data (for admin users)
    socketInstance.on("mobility_analysis", (data) => {
      if (!isAdmin) {
        return;
      }

      if (data) {
        setMobilityAnalysis(data);
      } else if (data.error) {
        console.error("❌ Mobility analysis error:", data.error);
      }
    });

    // Listen for department_info data (for HR users)
    socketInstance.on("department_info", (data) => {
      if (isAdmin) {
        return;
      }

      if (data.error) {
        console.error("❌ Department info error:", data.error);
        return;
      }

      // Handle department data for HR users
      if (data.departments && Array.isArray(data.departments)) {
        setDepartmentData(data.departments);
      }

      if (data.cardData) {
        setDepartmentCardData(data.cardData);
      }
    });

    // Listen for hr_notification event and save data in state
    socketInstance.on("hr_notification", (data) => {
      setHrNotifications((prev) => [...prev, data]);
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(socketInstance);

    return () => {
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
      }
      socketInstance.disconnect();
    };
  }, [session, triggerBellRing, isAdmin, emitDashboardEvents]);

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
        internalMobility,
        mobilityAnalysis,
        isAdmin,
        departmentData,
        departmentCardData,
        hrNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
