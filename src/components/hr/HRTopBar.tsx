// components/hr/HRTopBar.tsx (updated with CSS variables)
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
  Sparkles,
  Settings,
  HelpCircle,
  Briefcase,
  FileText,
  TrendingUp,
  Moon,
  Sun,
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
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { useTheme } from "next-themes";

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
  const { theme, setTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingNotifications, setUpdatingNotifications] = useState<
    Set<string>
  >(new Set());
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const hrId = session?.user?.id || "";

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

  useEffect(() => {
    if (!hrId || !isConnected) return;

    fetchNotifications();

    const socket = (window as any).socket;
    if (socket) {
      socket.emit("subscribe_hr_notifications", { hr_id: hrId });

      socket.on("hr_subscription_confirmed", (data: any) => {});

      return () => {
        socket.emit("unsubscribe_hr_notifications", { hr_id: hrId });
      };
    }
  }, [hrId, isConnected, fetchNotifications]);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const getEmployeeInitials = (name?: string) => {
    if (!name) return "EM";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

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

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "assessment_complete":
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case "assessment_progress":
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case "new_application":
        return <Briefcase className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSuggestionClick = (suggestion: any) => {
    setSearchQuery(`${suggestion.firstName} ${suggestion.lastName}`);
    setShowSuggestions(false);
    router.push(`/hr-dashboard/employees?search=${encodeURIComponent(suggestion.firstName + " " + suggestion.lastName)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/hr-dashboard/employees?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      {/* Unified gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"></div>

      {/* Content overlay */}
      <div className="relative z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* Decorative element */}
                <div className="absolute -left-2 -top-2 w-12 h-12 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-full blur-xl"></div>

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                      <Badge className="bg-primary/10 text-primary border border-primary/20">
                        HR Dashboard
                      </Badge>
                    </div>
                    {subtitle && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions Section */}
            <div className="flex items-center gap-3">
              {/* Search Input - Updated with CSS variables */}
              <div className="relative hidden lg:block">
                <form onSubmit={handleSearchSubmit}>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    className="w-64 pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-lg shadow-xl z-[60] overflow-hidden">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                      </div>
                    ) : (
                      <div className="py-2">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors flex flex-col"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {suggestion.firstName} {suggestion.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {suggestion.email}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="relative text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
                  title={
                    theme === "dark"
                      ? "Switch to light mode"
                      : "Switch to dark mode"
                  }
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

                {/* Notifications Dropdown */}
                <DropdownMenu
                  open={isNotificationOpen}
                  onOpenChange={setIsNotificationOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs border-2 border-background shadow-lg"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-96 max-h-[480px] overflow-hidden bg-card border border-border shadow-xl"
                  >
                    {/* Notification Header */}
                    <div className="p-4 border-b border-border bg-gradient-to-r from-secondary to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <DropdownMenuLabel className="text-base font-bold p-0 text-foreground">
                              Notifications
                            </DropdownMenuLabel>
                            <p className="text-xs text-muted-foreground">
                              {notifications.length} total • {unreadCount}{" "}
                              unread
                            </p>
                          </div>
                        </div>
                        {notifications.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={loading || unreadCount === 0}
                            className="text-xs h-8 px-3 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                          >
                            {loading ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            Mark all read
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="p-0">
                      {loading && notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Loading notifications...
                          </p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/30 flex items-center justify-center">
                            <Bell className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            All caught up! No new notifications
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-y-auto max-h-[320px]">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-border last:border-b-0 transition-all hover:bg-secondary/50 ${
                                notification.status === "unread"
                                  ? "bg-primary/5 border-l-4 border-l-primary"
                                  : "border-l-4 border-l-transparent"
                              } ${
                                notification.id.startsWith("socket-")
                                  ? "bg-warning/5"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Notification Icon */}
                                <div className="flex-shrink-0 mt-1">
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      notification.status === "unread"
                                        ? "bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/30"
                                        : "bg-secondary border border-border"
                                    }`}
                                  >
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                </div>

                                {/* Notification Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-medium text-primary-foreground">
                                        {getEmployeeInitials(
                                          notification.employeeName
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-foreground truncate">
                                          {notification.employeeName ||
                                            "Employee"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {notification.employeeEmail ||
                                            "No email provided"}
                                        </p>
                                      </div>
                                    </div>
                                    {notification.status === "unread" && (
                                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs">
                                        New
                                      </Badge>
                                    )}
                                  </div>

                                  <p className="text-sm text-foreground/90 mb-3">
                                    {notification.message}
                                  </p>

                                  {notification.data?.progress !==
                                    undefined && (
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-muted-foreground">
                                          Progress
                                        </span>
                                        <span className="text-xs font-medium text-primary">
                                          {notification.data.progress}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-secondary rounded-full h-2">
                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-primary to-purple-600 transition-all"
                                          style={{
                                            width: `${notification.data.progress}%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimestamp(notification.createdAt)}
                                      {notification.id.startsWith("socket-") &&
                                        " • Live"}
                                    </span>
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
                                      className="h-7 px-2 text-xs hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                    >
                                      {updatingNotifications.has(
                                        notification.id
                                      ) ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : notification.status === "read" ? (
                                        <>
                                          <MailOpen className="h-3 w-3 mr-1" />
                                          Unread
                                        </>
                                      ) : (
                                        <>
                                          <Mail className="h-3 w-3 mr-1 text-primary" />
                                          Mark read
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 px-3 py-2 hover:bg-secondary transition-all group border border-border"
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center ring-2 ring-primary/30 ring-offset-2 ring-offset-background group-hover:ring-primary/50 transition-all">
                          <User className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                      </div>
                      <div className="hidden lg:block text-left max-w-[160px]">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {session?.user?.name || "HR Manager"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session?.user?.email || "admin@geniusfactor.com"}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-card border border-border shadow-xl"
                  >
                    {/* Profile Header */}
                    <div className="p-4 bg-gradient-to-r from-secondary to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center ring-2 ring-primary/30">
                          <User className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <DropdownMenuLabel className="text-base font-bold p-0 text-foreground">
                            {session?.user?.name || "HR Manager"}
                          </DropdownMenuLabel>
                          <p className="text-xs text-muted-foreground">
                            HR Department
                          </p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuSeparator className="my-2 bg-border" />

                    {/* Menu Items */}
                    <div className="p-1">
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary cursor-pointer mb-1 text-foreground/80 hover:text-foreground transition-colors">
                        <User className="h-4 w-4" />
                        <Link href="/hr-dashboard/profile" className="flex-1">
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary cursor-pointer mb-1 text-foreground/80 hover:text-foreground transition-colors">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary cursor-pointer text-foreground/80 hover:text-foreground transition-colors">
                        <HelpCircle className="h-4 w-4" />
                        <span>Help & Support</span>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-2 bg-border" />

                    {/* Sign Out */}
                    <div className="p-1">
                      <DropdownMenuItem
                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive cursor-pointer text-destructive transition-colors"
                        onClick={() =>
                          signOut({ callbackUrl: "/auth/sign-in" })
                        }
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="font-medium">Sign out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}