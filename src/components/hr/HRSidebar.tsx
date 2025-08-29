"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  User,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/hr-dashboard", icon: LayoutDashboard },
  {
    name: "Departments",
    href: "/hr-dashboard/departments",
    icon: Building2,
    badge: "6",
  },
  {
    name: "Employees",
    href: "/hr-dashboard/employees",
    icon: Users,
    badge: "139",
  },
  {
    name: "Assessments",
    href: "/hr-dashboard/assessments",
    icon: FileText,
    badge: "24",
  },
  {
    name: "Retention Risk",
    href: "/hr-dashboard/retention-risk",
    icon: AlertTriangle,
    badge: "31",
  },
  {
    name: "Internal Mobility",
    href: "/hr-dashboard/internal-mobility",
    icon: TrendingUp,
  },
  {
    name: "Upload Employee",
    href: "/hr-dashboard/upload-employee",
    icon: FileText,
  },
  {
    name: "Upload Jobs",
    href: "/hr-dashboard/upload-jobs",
    icon: FileText,
  },
];

const bottomNavigation = [
  { name: "Profile", href: "/hr-dashboard/profile", icon: User },
  { name: "Settings", href: "/hr-dashboard/settings", icon: Settings },
];

interface HRSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function HRSidebar({
  collapsed,
  onToggleCollapse,
  darkMode,
  onToggleDarkMode,
}: HRSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/hr-dashboard") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-hr-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                GF
              </span>
            </div>
            <span className="font-semibold text-sidebar-foreground">
              Genius Factor
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-hr-sidebar-hover"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              "text-sidebar-foreground hover:bg-hr-sidebar-hover",
              isActive(item.href) && "bg-hr-sidebar-active text-white"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDarkMode}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-hr-sidebar-hover",
            collapsed && "justify-center"
          )}
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </Button>

        {/* Bottom Navigation */}
        {bottomNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              "text-sidebar-foreground hover:bg-hr-sidebar-hover",
              isActive(item.href) && "bg-hr-sidebar-active text-white"
            )}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
