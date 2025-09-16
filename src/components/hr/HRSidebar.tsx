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
import { useSocket } from "@/context/SocketContext";

const bottomNavigation = [
  { name: "Profile", href: "/hr-dashboard/profile", icon: User },
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
  const { dashboardData, totalEmployees } = useSocket();

  // Calculate totals across all departments
  const completedAssessments =
    dashboardData && Array.isArray(dashboardData)
      ? dashboardData.reduce(
          (sum, dept) => sum + (dept.completed_assessments || 0),
          0
        )
      : 0;

  const departmentCount =
    dashboardData && Array.isArray(dashboardData) ? dashboardData.length : 0;

  // Warn if dashboardData is not in expected format
  if (!dashboardData || !Array.isArray(dashboardData)) {
    console.warn(
      "dashboardData is null, undefined, or not an array:",
      dashboardData
    );
  }

  const navigation = [
    { name: "Dashboard", href: "/hr-dashboard", icon: LayoutDashboard },
    {
      name: "Departments",
      href: "/hr-dashboard/departments",
      icon: Building2,
      badge: departmentCount > 0 ? departmentCount : undefined,
    },
    {
      name: "Employees",
      href: "/hr-dashboard/employees",
      icon: Users,
      badge: totalEmployees > 0 ? totalEmployees : undefined,
    },
    {
      name: "Assessments",
      href: "/hr-dashboard/assessments",
      icon: FileText,
      badge: completedAssessments > 0 ? completedAssessments : undefined,
    },
    {
      name: "Retention Risk",
      href: "/hr-dashboard/retention-risk",
      icon: AlertTriangle,
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
    {
      name: "Profile",
      href: "/hr-dashboard/profile",
      icon: User,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/hr-dashboard") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        darkMode ? "dark" : "light"
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <figure className="w-full rounded-[1vw]">
              <img
                src="/logo.png"
                alt="Genius Factor"
                className="w-full rounded-2xl h-[3.5vw]"
              />
            </figure>
            <span className="font-semibold text-sidebar-foreground">
              GeniusFactor
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
              "sidebar-menu-item",
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
            "w-full justify-start gap-3 text-sidebar-foreground hover:card",
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
              "sidebar-menu-item",
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
