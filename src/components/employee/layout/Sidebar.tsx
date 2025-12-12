"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  TrendingUp,
  BookOpen,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  User,
  Bot,
  Home,
  Target,
  Users,
  Sparkles,
  ChevronRight,
  Bell,
  CheckCircle,
  Zap,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSocket } from "@/context/SocketContext";

const navigation = [
  {
    name: "Dashboard",
    href: "/employee-dashboard",
    icon: LayoutDashboard,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Assessment",
    href: "/employee-dashboard/assessment",
    icon: ClipboardList,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    name: "Results",
    href: "/employee-dashboard/results",
    icon: BarChart3,
    color: "from-violet-500 to-violet-600",
  },
  {
    name: "Career Pathways",
    href: "/employee-dashboard/career-Pathways",
    icon: TrendingUp,
    color: "from-amber-500 to-amber-600",
  },
  {
    name: "Development",
    href: "/employee-dashboard/development",
    icon: BookOpen,
    color: "from-rose-500 to-rose-600",
  },
  {
    name: "Profile",
    href: "/employee-dashboard/profile",
    icon: User,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    name: "Genius AI",
    href: "/employee-dashboard/ai-chat",
    icon: Bot,
    color: "from-purple-500 to-purple-600",
  },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false); // ADD THIS STATE
  const location = usePathname();
  const { theme, setTheme } = useTheme();
  const { isConnected, notifications, clearNotifications } = useSocket();

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div
      className={cn(
        "flex flex-col h-screen transition-all duration-300 sidebar-container relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6bTAtNHYyaC0xMnYtMmgxMnpNMjQgMjJ2MmgxMnYtMkgyNHptMCAxNnYyaDEydi0ySDI0eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
      </div>

      {/* Header */}
      <div className="sidebar-header flex items-center justify-between p-4">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="sidebar-logo-wrapper">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl gradient-text-primary">
                GeniusFactor
              </h1>
              <p className="text-xs text-gray-400">Career Intelligence</p>
            </div>
          </div>
        ) : (
          <div className="sidebar-logo-wrapper mx-auto">
            <Brain className="w-6 h-6 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto hover:bg-gray-700/50 border border-gray-600/50"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-gray-300" />
          ) : (
            <X className="w-5 h-5 text-gray-300" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "sidebar-nav-item group flex items-center",
                isActive
                  ? "sidebar-nav-item-active"
                  : "",
                isCollapsed ? "p-3 justify-center" : "p-3 space-x-3"
              )}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                      "--tw-gradient-from": item.color.split(" ")[1],
                      "--tw-gradient-to": item.color.split(" ")[3],
                    } as any
                  : {}
              }
            >
              <div
                className={cn(
                  "sidebar-nav-icon-wrapper",
                  isActive
                    ? "sidebar-nav-icon-wrapper-active"
                    : "sidebar-nav-icon-wrapper-inactive"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-300"
                  )}
                />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-medium transition-colors duration-300",
                      isActive
                        ? "text-white"
                        : "text-gray-300 group-hover:text-white"
                    )}
                  >
                    {item.name}
                  </div>
                </div>
              )}
              {!isCollapsed && isActive && (
                <ChevronRight className="w-4 h-4 text-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Notifications - FIXED */}
      <div className="relative z-10 p-4 border-t border-gray-700/50">
        <div className={cn("space-y-2", isCollapsed ? "text-center" : "")}>
          {/* Notifications Trigger Button */}
          <div className="relative">
            <div
              className={cn(
                "sidebar-notification-wrapper flex items-center gap-2 p-3 cursor-pointer",
                isCollapsed ? "justify-center" : "justify-between"
              )}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-400" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-sm text-gray-300">Notifications</span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      isConnected ? "sidebar-status-online" : "sidebar-status-connecting"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isConnected ? "bg-emerald-400" : "bg-amber-400"
                      )}
                    />
                    {isConnected ? "Live" : "Connecting..."}
                  </div>
                  {showNotifications ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              )}
            </div>

            {/* Notifications Popup - Only show when expanded and showNotifications is true */}
            {showNotifications && !isCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50">
                {/* Popup Header */}
                <div className="p-3 bg-gray-900 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-300" />
                      <span className="text-sm font-medium text-gray-200">
                        Notifications
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotifications();
                      }}
                      className="text-xs h-6 px-2"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-64 overflow-y-auto p-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 rounded-lg mb-2 bg-gray-800/50 border border-gray-700/50"
                      >
                        <div className="flex items-start gap-2">
                          <div className="p-1 rounded bg-blue-500/20">
                            <CheckCircle className="w-3 h-3 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-200">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Existing inline notifications - Keep as fallback */}
          {!showNotifications && notifications.length > 0 && !isCollapsed && (
            <div className="mt-2 space-y-2">
              {notifications.slice(0, 2).map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50"
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-blue-500/20">
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-300 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length > 2 && !isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="w-full text-xs text-gray-400 hover:text-gray-300"
                >
                  Clear all ({notifications.length})
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 p-4 border-t border-gray-700/50 space-y-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={toggleTheme}
          className={cn(
            "w-full transition-all duration-300",
            isCollapsed
              ? "justify-center"
              : "justify-start hover:bg-gray-700/50"
          )}
        >
          {theme === "dark" ? (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              {!isCollapsed && (
                <span className="text-gray-300">Light Mode</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20">
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
              {!isCollapsed && <span className="text-gray-300">Dark Mode</span>}
            </div>
          )}
        </Button>

        {/* Sign Out */}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={() => signOut()}
          className={cn(
            "w-full transition-all duration-300",
            isCollapsed
              ? "justify-center"
              : "justify-start hover:bg-red-500/10 text-red-400 hover:text-red-300"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/20">
              <LogOut className="w-4 h-4" />
            </div>
            {!isCollapsed && <span>Sign Out</span>}
          </div>
        </Button>

        {/* User Status */}
        {!isCollapsed && (
          <div className="pt-4 mt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="sidebar-user-avatar w-10 h-10 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  Welcome back!
                </p>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative element */}
      <div className="sidebar-decorative-bottom"></div>
    </div>
  );
}