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
      color: "from-primary to-accent",
    },
    {
      name: "Departments",
      href: "/hr-dashboard/departments",
      icon: Building2,
      badge: departmentCount > 0 ? departmentCount : undefined,
      description: "Department Management",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Employees",
      href: "/hr-dashboard/employees",
      icon: Users,
      badge: totalEmployees > 0 ? totalEmployees : undefined,
      description: "Employee Management",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      name: "Assessments",
      href: "/hr-dashboard/assessments",
      icon: ClipboardList,
      badge: completedAssessments > 0 ? completedAssessments : undefined,
      description: "Career Assessments",
      color: "from-amber-500 to-amber-600",
    },
    {
      name: "Retention Risk",
      href: "/hr-dashboard/retention-risk",
      icon: AlertTriangle,
      description: "Risk Analysis",
      color: "from-rose-500 to-rose-600",
    },
    {
      name: "Internal Mobility",
      href: "/hr-dashboard/internal-mobility",
      icon: TrendingUp,
      description: "Career Tracking",
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Upload Employee",
      href: "/hr-dashboard/upload-employee",
      icon: Upload,
      description: "Import Data",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      name: "Upload Jobs",
      href: "/hr-dashboard/upload-jobs",
      icon: Briefcase,
      description: "Job Postings",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      name: "Jobs",
      href: "/hr-dashboard/jobs",
      icon: FileText,
      description: "Job Management",
      color: "from-teal-500 to-teal-600",
    },
    {
      name: "Profile",
      href: "/hr-dashboard/profile",
      icon: User,
      description: "Account Settings",
      color: "from-violet-500 to-violet-600",
    },
  ];

  // Add Community navigation item if user is not paid
  const communityNavigationItem = {
    name: "Community",
    href: "/hr-dashboard/community",
    icon: CommunityIcon,
    description: "Professional Network",
    color: "from-cyan-500 to-indigo-600",
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
        "sidebar-container flex flex-col h-screen transition-all duration-300 relative bg-gradient-to-b from-background to-card",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Decorative gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="decorative-gradient-blur-blue top-0 left-0 opacity-20"></div>
        <div className="decorative-gradient-blur-purple bottom-0 right-0 opacity-20"></div>
      </div>

      {/* Header */}
      <div className="sidebar-header p-6 border-b border-border relative z-10">
        <div className="flex items-center justify-between gap-4">
          {!collapsed ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="sidebar-logo-wrapper">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  GeniusFactor
                </h1>
                <p className="text-xs text-white/70 truncate">
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
                <Brain className="w-6 h-6 text-white" />
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
      <nav className="relative z-10 flex-1 p-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "sidebar-nav-item group flex items-center rounded-lg transition-all duration-300",
                active && "sidebar-nav-item-active shadow-lg",
                !active && "hover:bg-secondary/50 hover:border-border",
                collapsed ? "p-3 justify-center" : "p-3 space-x-3"
              )}
              style={
                active
                  ? ({
                      background: `linear-gradient(135deg, ${item.color})`,
                    } as any)
                  : {}
              }
            >
              <div
                className={cn(
                  "sidebar-nav-icon-wrapper flex-shrink-0",
                  active
                    ? "sidebar-nav-icon-wrapper-active bg-white/20"
                    : "sidebar-nav-icon-wrapper-inactive bg-secondary"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    active
                      ? "text-white"
                      : "text-white/70 group-hover:text-white"
                  )}
                />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "font-medium transition-colors duration-300",
                        active
                          ? "text-white"
                          : "text-white group-hover:text-white/90"
                      )}
                    >
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge
                        className={cn(
                          "text-xs px-2 py-0.5",
                          active ? "badge-primary text-white" : "badge-blue"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-0.5 truncate transition-colors duration-300",
                      active ? "text-white/80" : "text-white/60"
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              )}
              {!collapsed && active && (
                <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer with user info */}
      {!collapsed && session?.user && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card">
                <div
                  className={cn(
                    "w-full h-full rounded-full",
                    session.user.paid ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user.name || "HR User"}
              </p>
              <p className="text-xs text-white/60">
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
