"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Mail,
  MailOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useSocket } from "@/context/SocketContext";

// Add custom CSS to control hover effects and text visibility
const styles = `
  .no-scale-hover:hover {
    background-color: #1e293b; /* Tailwind's slate-800 for dark mode */
    transform: none !important; /* Prevent scaling */
  }
  .no-scale-hover {
    overflow: hidden; /* Prevent overflow within button */
    max-width: 100%; /* Ensure button doesn't exceed container */
  }
  @media (min-width: 768px) {
    .user-info-container {
      max-width: 200px; /* Constrain width of username/role container */
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .dark .dropdown-item-hover:hover {
    background-color: #1e293b; /* slate-800 */
    color: #f3f4f6 !important; /* Tailwind's gray-100 for high contrast */
  }
`;

interface HRTopBarProps {
  title: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  message: string;
  hrId: string;
  employeeName?: string;
  employeeEmail?: string;
  employeeId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  type?: string;
  data?: any;
}

interface SocketNotification {
  type: string;
  user_id: string;
  hr_id: string;
  data: {
    message: string;
    employeeName: string;
    employeeEmail: string;
    progress: number;
    status: string;
    [key: string]: any;
  };
  timestamp: string;
}

export default function HRTopBar({ title, subtitle }: HRTopBarProps) {
  const { isConnected, hrNotifications, clearNotifications } = useSocket();
  const { data: session } = useSession();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingNotifications, setUpdatingNotifications] = useState<
    Set<string>
  >(new Set());

  const hrId = session?.user?.id || "";

  // Memoize fetchNotifications to prevent recreation
  const fetchNotifications = useCallback(async () => {
    if (!hrId) return;
    try {
      setLoading(true);
      const response = await fetch("/api/hr-api/hr-notification");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
        }
      } else {
        console.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [hrId]);

  // Memoize convertSocketNotification
  const convertSocketNotification = useCallback(
    (socketNotif: SocketNotification): Notification => {
      return {
        id: `socket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: socketNotif.data.message,
        hrId: socketNotif.hr_id,
        employeeName: socketNotif.data.employeeName,
        employeeEmail: socketNotif.data.employeeEmail,
        status: socketNotif.data.status || "unread",
        createdAt: socketNotif.timestamp,
        updatedAt: socketNotif.timestamp,
        type: socketNotif.type,
        data: socketNotif.data,
      };
    },
    []
  );

  // Memoize updateNotificationStatus
  const updateNotificationStatus = useCallback(
    async (notificationId: string, status: string) => {
      try {
        setUpdatingNotifications((prev) => new Set(prev).add(notificationId));

        if (!notificationId.startsWith("socket-")) {
          const response = await fetch(
            `/api/hr-api/hr-notification?id=${notificationId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setNotifications((prev) =>
                prev.map((notification) =>
                  notification.id === notificationId
                    ? { ...notification, status }
                    : notification
                )
              );
              return;
            }
          } else {
            console.error("Failed to update notification");
          }
        }

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, status }
              : notification
          )
        );
      } catch (error) {
        console.error("Error updating notification:", error);
      } finally {
        setUpdatingNotifications((prev) => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    },
    []
  );

  // Memoize markAllAsRead
  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      const updatePromises = notifications
        .filter((n) => n.status === "unread")
        .map((n) => updateNotificationStatus(n.id, "read"));
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  }, [notifications, updateNotificationStatus]);

  // Handle incoming socket notifications
  useEffect(() => {
    if (hrNotifications.length > 0) {
      const newSocketNotifications = hrNotifications.map(
        convertSocketNotification
      );
      setNotifications((prev) => [
        ...newSocketNotifications,
        ...prev.filter((notif) => !notif.id.startsWith("socket-")),
      ]);
      clearNotifications();
    }
  }, [hrNotifications, clearNotifications, convertSocketNotification]);

  // Handle initial fetch and socket subscription
  useEffect(() => {
    if (!hrId || !isConnected) return;

    fetchNotifications();

    const socket = (window as any).socket;
    if (socket) {
      socket.emit("subscribe_hr_notifications", { hr_id: hrId });

      socket.on("hr_subscription_confirmed", (data: any) => { });

      return () => {
        socket.emit("unsubscribe_hr_notifications", { hr_id: hrId });
      };
    }
  }, [hrId, isConnected, fetchNotifications]);

  // Get unread notifications count
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  // Generate employee initials
  const getEmployeeInitials = (name?: string) => {
    if (!name) return "EM";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Inject custom styles */}
      <style>{styles}</style>
      <div className="border-b border-border px-6 py-4  overflow-x-hidden">
        <div className="flex items-center justify-between overflow-x-hidden">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees, assessments..."
                className="w-80 pl-10 card"
              />
            </div> */}
            <DropdownMenu
              open={isNotificationOpen}
              onOpenChange={setIsNotificationOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative sidebar-menu-item "
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 card  max-h-96">
                <div className="flex items-center justify-between p-3">
                  <DropdownMenuLabel className="text-base">
                    Notifications ({notifications.length})
                  </DropdownMenuLabel>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      disabled={loading || unreadCount === 0}
                      className="text-xs h-7 px-2 sidebar-menu-item "
                    >
                      {loading ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator className="dark:bg-slate-700" />
                {loading && notifications.length === 0 ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center">
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No new notifications
                    </p>
                  </div>
                ) : (
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "calc(24rem - 80px)" }}
                  >
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-muted/50 sidebar-menu-item  border-l-4 ${notification.status === "unread"
                            ? "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20"
                            : "border-l-transparent"
                          } ${notification.id.startsWith("socket-")
                            ? "bg-amber-50/30 dark:bg-amber-950/20"
                            : ""
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar className="h-10 w-10 flex-shrink-0 ">
                              <AvatarImage src="/api/placeholder/40/40" />
                              <AvatarFallback className="text-xs card">
                                {getEmployeeInitials(notification.employeeName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div>
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {notification.employeeName || "Employee"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {notification.employeeEmail ||
                                      "No email provided"}
                                  </p>
                                </div>
                                {notification.status === "unread" && (
                                  <Badge
                                    variant="default"
                                    className="ml-2 bg-blue-500 text-white h-4 px-1 text-xs"
                                  >
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-foreground mb-2">
                                {notification.message}
                              </p>
                              {notification.data?.progress !== undefined && (
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-muted-foreground">
                                      Progress
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {notification.data.progress}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted dark:bg-slate-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all"
                                      style={{
                                        width: `${notification.data.progress}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.createdAt)}
                                {notification.id.startsWith("socket-") &&
                                  " (Live)"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateNotificationStatus(
                                notification.id,
                                notification.status === "read"
                                  ? "unread"
                                  : "read"
                              )
                            }
                            disabled={updatingNotifications.has(
                              notification.id
                            )}
                            className="flex-shrink-0 h-8 w-8 p-0 sidebar-menu-item "
                            title={
                              notification.status === "read"
                                ? "Mark as unread"
                                : "Mark as read"
                            }
                          >
                            {updatingNotifications.has(notification.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : notification.status === "read" ? (
                              <MailOpen className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="sidebar-menu-item ">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 no-scale-hover"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session?.user?.image || "/api/placeholder/32/32"}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback className="card">
                      {session?.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left user-info-container">
                    <p className="text-sm font-medium truncate">
                      {session?.user?.name || "HR User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      HR Manager
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 card">
                <DropdownMenuLabel className="text-base">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="card" />
                <DropdownMenuItem className="dropdown-item-hover card sidebar-menu-item">
                  <User className="mr-2 h-4 w-4" />
                  <Link href="/hr-dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem className="dropdown-item-hover card">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator className="card" />
                <DropdownMenuItem
                  className="sidebar-menu-item  text-destructive cursor-pointer sidebar-menu-item "
                  onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}
