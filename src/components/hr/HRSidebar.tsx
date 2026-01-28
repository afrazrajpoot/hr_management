// components/hr/HRSidebar.tsx (updated version)
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
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
  HelpCircle,
  LogOut,
  Upload,
  Briefcase,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
  ClipboardList,
  Users as CommunityIcon, // Add Community icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSocket } from "@/context/SocketContext";
import { signOut, useSession } from "next-auth/react"; // Add useSession

const bottomNavigation = [
  {
    name: "Help Center",
    href: "/hr-dashboard/help",
    icon: HelpCircle,
  },
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
  const { dashboardData, totalEmployees, notifications, clearNotifications } =
    useSocket();
  const { data: session } = useSession(); // Get session data
  const [showNotifications, setShowNotifications] = useState(false);

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

  // Base navigation items
  const baseNavigation = [
    {
      name: "Dashboard",
      href: "/hr-dashboard",
      icon: LayoutDashboard,
      description: "Overview & Analytics",
    },
    {
      name: "Departments",
      href: "/hr-dashboard/departments",
      icon: Building2,
      badge: departmentCount > 0 ? departmentCount : undefined,
      description: "Department Management",
    },
    {
      name: "Employees",
      href: "/hr-dashboard/employees",
      icon: Users,
      badge: totalEmployees > 0 ? totalEmployees : undefined,
      description: "Employee Management",
    },
    {
      name: "Assessments",
      href: "/hr-dashboard/assessments",
      icon: ClipboardList,
      badge: completedAssessments > 0 ? completedAssessments : undefined,
      description: "Career Assessments",
    },
    {
      name: "Retention Risk",
      href: "/hr-dashboard/retention-risk",
      icon: AlertTriangle,
      description: "Risk Analysis",
    },
    {
      name: "Internal Mobility",
      href: "/hr-dashboard/internal-mobility",
      icon: TrendingUp,
      description: "Career Tracking",
    },
    {
      name: "Upload Employee",
      href: "/hr-dashboard/upload-employee",
      icon: Upload,
      description: "Import Data",
    },
    {
      name: "Upload Jobs",
      href: "/hr-dashboard/upload-jobs",
      icon: Briefcase,
      description: "Job Postings",
    },
    {
      name: "Jobs",
      href: "/hr-dashboard/jobs",
      icon: FileText,
      description: "Job Management",
    },
    {
      name: "Profile",
      href: "/hr-dashboard/profile",
      icon: User,
      description: "Account Settings",
    },
  ];

  // Add Community navigation item if user is not paid
  const communityNavigationItem = {
    name: "Community",
    href: "/hr-dashboard/community",
    icon: CommunityIcon,
    description: "Professional Network",
  };

  // Build final navigation array
  const navigation = [
    ...baseNavigation,
    // Add Community if user exists and paid is false
    ...(session?.user && !session.user.paid ? [communityNavigationItem] : []),
  ];

  const isActive = (path: string) => {
    if (path === "/hr-dashboard") return pathname === path;
    return pathname.startsWith(path);
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={cn(
        "sidebar-container flex flex-col h-screen transition-all duration-300 relative bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="sidebar-header p-6 border-b border-sidebar-border relative z-10">
        <div className="flex items-center justify-between gap-4">
          {!collapsed ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="sidebar-logo-wrapper">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">
                  GeniusFactor
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  HR Management Suite
                </p>
                {/* Show subscription status */}
                {/* {session?.user && (
                  <div className="mt-1">
                    <Badge
                      variant={session.user.paid ? "default" : "outline"}
                      className="text-xs"
                    >
                      {session.user.paid ? "Premium" : "Free"}
                    </Badge>
                  </div>
                )} */}
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <div className="sidebar-logo-wrapper">
                <Brain className="w-8 h-8 text-primary" />
              </div>
            </div>
          )}

          {/* Collapse toggle button (optional) */}
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all border border-white/20"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button> */}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "sidebar-nav-item group flex items-center rounded-lg transition-all duration-300 font-medium",
                active
                  ? "bg-gradient-purple text-white shadow-md"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed ? "p-3 justify-center" : "p-3 space-x-3"
              )}
            >
              <div
                className={cn(
                  "sidebar-nav-icon-wrapper flex-shrink-0 flex items-center justify-center rounded-md transition-colors",
                  active
                    ? "text-white"
                    : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    active ? "text-white" : "text-currentColor"
                  )}
                />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge
                        className={cn(
                          "ml-auto text-xs px-2 py-0.5 border-0",
                          active ? "bg-white/20 text-white" : "badge-brand"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {!collapsed && active && (
                <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0 ml-2" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer with user info */}
      {!collapsed && session?.user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background">
                <div
                  className={cn(
                    "w-full h-full rounded-full",
                    session.user.paid ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {session.user.name || "HR User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.user.paid ? "Premium Account" : "Free Account"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Decorative bottom gradient */}
      <div className="sidebar-decorative-bottom"></div>
    </div>
  );
}
