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
  Users,
  Sparkles,
  ChevronRight,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useSocket } from "@/context/SocketContext";

const navigation = [
  {
    name: "Dashboard",
    href: "/employee-dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Assessment",
    href: "/employee-dashboard/assessment",
    icon: ClipboardList,
  },
  {
    name: "Results",
    href: "/employee-dashboard/results",
    icon: BarChart3,
  },
  {
    name: "Career Pathways",
    href: "/employee-dashboard/career-pathways",
    icon: TrendingUp,
  },
  {
    name: "Development",
    href: "/employee-dashboard/development",
    icon: BookOpen,
  },
  {
    name: "Profile",
    href: "/employee-dashboard/profile",
    icon: User,
  },
  {
    name: "Security",
    href: "/employee-dashboard/change-password",
    icon: Lock,
  },
  {
    name: "Genius AI",
    href: "/employee-dashboard/ai-chat",
    icon: Bot,
  },
  {
    name: "Community",
    href: "/employee-dashboard/community",
    icon: Users,
  },
  {
    name: "Pricing",
    href: "/pricing",
    icon: Sparkles,
  },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const location = usePathname();
  const { theme, setTheme } = useTheme();
  const { isConnected, notifications, clearNotifications } = useSocket();
  const { data: session } = useSession();

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={cn(
        "flex flex-col h-screen transition-all duration-300 sidebar-container relative border-r border-border",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>

      {/* Header */}
      <div className="sidebar-header flex items-center justify-between p-4 border-b border-border relative z-10">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="sidebar-logo-wrapper bg-[image:var(--purple-gradient)] p-2 rounded-lg border border-white/10 shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gradient-purple">
                GeniusFactor
              </h1>
              <p className="text-xs text-muted-foreground">Career Intelligence</p>
            </div>
          </div>
        ) : (
          <div className="sidebar-logo-wrapper mx-auto bg-[image:var(--purple-gradient)] p-2 rounded-lg border border-white/10 shadow-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto hover:bg-secondary border border-border"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-secondary-foreground" />
          ) : (
            <X className="w-5 h-5 text-secondary-foreground" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "sidebar-nav-item group flex items-center transition-all duration-200 rounded-lg",
                isActive
                  ? "btn-purple shadow-md"
                  : "hover:bg-secondary text-secondary-foreground hover:text-foreground",
                isCollapsed ? "p-3 justify-center" : "p-3 space-x-3"
              )}
            >
              <div
                className={cn(
                  "sidebar-nav-icon-wrapper p-2 rounded-md transition-colors duration-300",
                  isActive
                    ? "bg-primary-foreground/20"
                    : "bg-secondary group-hover:bg-secondary-foreground/10"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 transition-colors duration-300",
                    isActive
                      ? "text-primary-foreground"
                      : "text-secondary-foreground group-hover:text-foreground"
                  )}
                />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-medium text-sm transition-colors duration-300",
                      isActive
                        ? "text-primary-foreground"
                        : "text-secondary-foreground group-hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </div>
                </div>
              )}
              {!isCollapsed && isActive && (
                <ChevronRight className="w-3 h-3 text-primary-foreground/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Notifications */}
      <div className="relative z-10 p-4 border-t border-border">
        <div className={cn("space-y-2", isCollapsed ? "text-center" : "")}>
          {/* Notifications Trigger Button */}
          <div className="relative">
            <div
              className={cn(
                "sidebar-notification-wrapper flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-secondary transition-colors duration-200",
                isCollapsed ? "justify-center" : "justify-between"
              )}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="w-4 h-4 text-secondary-foreground" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[image:var(--purple-gradient)] rounded-full text-[10px] flex items-center justify-center text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-sm text-secondary-foreground">Notifications</span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      isConnected
                        ? "text-accent"
                        : "text-warning"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isConnected
                          ? "bg-[image:var(--purple-gradient)]"
                          : "bg-warning"
                      )}
                    />
                    {isConnected ? "Live" : "Connecting..."}
                  </div>
                  {showNotifications ? (
                    <ChevronUp className="w-3 h-3 text-secondary-foreground" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-secondary-foreground" />
                  )}
                </div>
              )}
            </div>

            {/* Notifications Popup */}
            {showNotifications && (
              <div
                className={cn(
                  "absolute z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-200",
                  isCollapsed
                    ? "left-full bottom-0 ml-2 w-64"
                    : "bottom-full left-0 right-0 mb-2"
                )}
              >
                {/* Popup Header */}
                <div className="p-3 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-primary/10">
                        <Bell className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        Notifications
                      </span>
                      {unreadNotifications > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium btn-purple text-primary-foreground rounded">
                          {unreadNotifications} New
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotifications();
                        }}
                        className="text-xs h-6 px-2 text-secondary-foreground hover:text-foreground hover:bg-secondary"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[280px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="p-1 space-y-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "group p-2 rounded-md transition-colors duration-200 border",
                            !notification.read
                              ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:from-primary/10 hover:to-primary/20"
                              : "border-transparent hover:bg-secondary"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={cn(
                                "mt-0.5 p-1 rounded-full",
                                !notification.read
                                  ? "bg-gradient-to-br from-primary/20 to-primary/30"
                                  : "bg-secondary"
                              )}
                            >
                              {notification.type === "success" ? (
                                <CheckCircle
                                  className={cn(
                                    "w-3 h-3",
                                    !notification.read
                                      ? "text-primary"
                                      : "text-secondary-foreground"
                                  )}
                                />
                              ) : (
                                <Bell
                                  className={cn(
                                    "w-3 h-3",
                                    !notification.read
                                      ? "text-primary"
                                      : "text-secondary-foreground"
                                  )}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-xs leading-snug",
                                  !notification.read
                                    ? "text-foreground font-medium"
                                    : "text-secondary-foreground"
                                )}
                              >
                                {notification.data?.message || notification.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                <span>
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] mt-1.5 shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                        <Bell className="w-4 h-4 text-secondary-foreground" />
                      </div>
                      <p className="text-sm font-medium text-secondary-foreground">
                        No notifications
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[140px]">
                        We'll notify you when something important happens.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 p-4 border-t border-border space-y-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={toggleTheme}
          className={cn(
            "w-full transition-all duration-300 hover:bg-secondary",
            isCollapsed
              ? "justify-center"
              : "justify-start"
          )}
        >
          {theme === "dark" ? (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10">
                <Sun className="w-3.5 h-3.5 text-accent" />
              </div>
              {!isCollapsed && (
                <span className="text-secondary-foreground">Light Mode</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-secondary">
                <Moon className="w-3.5 h-3.5 text-secondary-foreground" />
              </div>
              {!isCollapsed && <span className="text-secondary-foreground">Dark Mode</span>}
            </div>
          )}
        </Button>

        {/* Sign Out */}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={() => signOut()}
          className={cn(
            "w-full transition-all duration-300 hover:bg-destructive/10 text-destructive hover:text-destructive",
            isCollapsed
              ? "justify-center"
              : "justify-start"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-destructive/10">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            {!isCollapsed && <span>Sign Out</span>}
          </div>
        </Button>

        {/* User Status */}
        {!isCollapsed && (
          <div className="pt-3 mt-3 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="sidebar-user-avatar w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[image:var(--purple-gradient)] rounded-full border-2 border-background"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Welcome back!
                </p>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative element */}
      <div className="sidebar-decorative-bottom h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </div>
  );
}  