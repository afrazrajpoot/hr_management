"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Mail,
  MailOpen,
  Eye,
  EyeOff,
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
  // Optional fields that might come from socket notifications
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

  // Get hrId from session
  const hrId = session?.user?.id || "";

  // Convert socket notification to app notification format
  const convertSocketNotification = (
    socketNotif: SocketNotification
  ): Notification => {
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
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
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
  };

  // Update notification status
  const updateNotificationStatus = async (
    notificationId: string,
    status: string
  ) => {
    try {
      setUpdatingNotifications((prev) => new Set(prev).add(notificationId));

      // Only update via API if it's a real notification (not a socket temp one)
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
            // Update local state
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

      // For socket notifications or if API fails, just update local state
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
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setLoading(true);

      // Update all notifications in parallel
      const updatePromises = notifications
        .filter((n) => n.status === "unread")
        .map((n) => updateNotificationStatus(n.id, "read"));

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle incoming socket notifications
  useEffect(() => {
    if (hrNotifications.length > 0) {
      // Convert socket notifications to our format and add to beginning of list
      const newSocketNotifications = hrNotifications.map(
        convertSocketNotification
      );

      setNotifications((prev) => [
        ...newSocketNotifications,
        ...prev.filter((notif) => !notif.id.startsWith("socket-")),
      ]);

      // Clear the socket notifications after processing
      clearNotifications();
    }
  }, [hrNotifications, clearNotifications]);

  useEffect(() => {
    // Fetch notifications when component mounts
    fetchNotifications();

    console.log("Socket hr:", isConnected);
    console.log("HR ID:", hrId);

    // Subscribe to HR notifications if socket is connected and hrId exists
    if (isConnected && hrId) {
      const socket = (window as any).socket;
      if (socket) {
        socket.emit("subscribe_hr_notifications", { hr_id: hrId });
        console.log(`HR joined room: hr_${hrId}`);

        // Handle subscription confirmation
        socket.on("hr_subscription_confirmed", (data: any) => {
          console.log("HR subscription confirmed:", data);
        });

        // Handle incoming notifications - this is now handled by the SocketContext
        socket.on("notification", (data: SocketNotification) => {
          console.log("Received HR notification via socket:", data);
        });
      }

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.off("hr_subscription_confirmed");
          socket.off("notification");
        }
      };
    }
  }, [isConnected, hrId]);

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
    <div className="border-b border-border px-6 py-4 dark:bg-[#081229] bg-white">
      <div className="flex items-center justify-between overflow-y-hidden">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees, assessments..."
              className="w-80 pl-10 dark:bg-slate-800 dark:border-slate-700"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu
            open={isNotificationOpen}
            onOpenChange={setIsNotificationOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative dark:hover:bg-slate-800"
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
            <DropdownMenuContent
              align="end"
              className="w-96 dark:bg-slate-900 dark:border-slate-700 max-h-96"
            >
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
                    className="text-xs h-7 px-2 dark:hover:bg-slate-800"
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
                      className={`p-3 hover:bg-muted/50 dark:hover:bg-slate-800 border-l-4 ${
                        notification.status === "unread"
                          ? "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20"
                          : "border-l-transparent"
                      } ${
                        notification.id.startsWith("socket-")
                          ? "bg-amber-50/30 dark:bg-amber-950/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Employee Avatar and Info */}
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src="/api/placeholder/40/40" />
                            <AvatarFallback className="text-xs dark:bg-slate-700">
                              {getEmployeeInitials(notification.employeeName)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            {/* Employee Name and Email */}
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
                              {/* Unread indicator badge */}
                              {notification.status === "unread" && (
                                <Badge
                                  variant="default"
                                  className="ml-2 bg-blue-500 text-white h-4 px-1 text-xs"
                                >
                                  New
                                </Badge>
                              )}
                            </div>

                            {/* Notification Message */}
                            <p className="text-sm text-foreground mb-2">
                              {notification.message}
                            </p>

                            {/* Progress indicator for socket notifications */}
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

                            {/* Timestamp */}
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.createdAt)}
                              {notification.id.startsWith("socket-") &&
                                " (Live)"}
                            </p>
                          </div>
                        </div>

                        {/* Read/Unread Toggle Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateNotificationStatus(
                              notification.id,
                              notification.status === "read" ? "unread" : "read"
                            )
                          }
                          disabled={updatingNotifications.has(notification.id)}
                          className="flex-shrink-0 h-8 w-8 p-0 dark:hover:bg-slate-700"
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

              {notifications.length > 0 && (
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t dark:border-slate-700 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearNotifications();
                      setIsNotificationOpen(false);
                    }}
                    className="w-full text-blue-500 hover:text-blue-600 dark:hover:bg-slate-800"
                  >
                    Clear All Notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-muted dark:hover:bg-slate-800"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session?.user?.image || "/api/placeholder/32/32"}
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback className="dark:bg-slate-700">
                    {session?.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">
                    {session?.user?.name || "HR User"}
                  </p>
                  <p className="text-xs text-muted-foreground">HR Manager</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 dark:bg-slate-900 dark:border-slate-700"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:bg-slate-700" />
              <DropdownMenuItem className="dark:hover:bg-slate-800">
                <User className="mr-2 h-4 w-4" />
                <Link href="/hr-dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="dark:hover:bg-slate-800">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-slate-700" />
              <DropdownMenuItem
                className="text-destructive cursor-pointer dark:hover:bg-slate-800"
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
  );
}
