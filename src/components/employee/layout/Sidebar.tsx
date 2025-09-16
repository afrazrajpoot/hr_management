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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSocket } from "@/context/SocketContext";
import { NotificationPopover } from "@/components/NotificationPopover";
// import { NotificationPopover } from "./NotificationPopover"; // Import the new component

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
    href: "/employee-dashboard/career-Pathways",
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
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const location = usePathname();
  const { theme, setTheme } = useTheme();
  const { isConnected, notifications, clearNotifications } = useSocket();

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">GeniusFactor</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "sidebar-menu-item "
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-accent-foreground"
                )}
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{item.name}</div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Notification Section - Replace the old notification code with this */}
      <div className="p-4 border-t border-border">
        <NotificationPopover
          notifications={notifications}
          isConnected={isConnected}
          clearNotifications={clearNotifications}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={toggleTheme}
          className="w-full justify-start"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          {!isCollapsed && (
            <span className="ml-2">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          )}
        </Button>

        {/* Sign Out */}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={() => signOut()}
          className="w-full justify-start text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </div>
    </div>
  );
}
