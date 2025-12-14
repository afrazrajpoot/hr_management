"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  TrendingDown,
  ArrowUpDown,
  User,
  Settings,
  Brain,
  Home,
  Briefcase,
  FileText,
  AlertTriangle,
  BarChart3,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mainNavItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Companies",
    url: "/dashboard/companies",
    icon: Building2,
  },
  {
    title: "Employees",
    url: "/dashboard/employees",
    icon: Users,
  },
  // {
  //   title: "Assessments",
  //   url: "/dashboard/assessments",
  //   icon: FileText,
  // },
  {
    title: "Risk Analysis",
    url: "/dashboard/risk-analysis",
    icon: AlertTriangle,
  },
  {
    title: "Mobility",
    url: "/dashboard/mobility",
    icon: ArrowUpDown,
  },
  {
    title: "User Management",
    url: "/dashboard/user-management",
    icon: Shield,
  },
];

export function HRSidebar() {
  const sidebarContext = useSidebar();
  const currentPath = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return cn(
      "sidebar-nav-item px-3 py-2.5 rounded-lg transition-all duration-200",
      isActive(path)
        ? "sidebar-nav-item-active bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-primary text-primary shadow-sm"
        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
    );
  };

  const getIconClassName = (path: string) => {
    return cn(
      "transition-colors duration-200",
      isActive(path)
        ? "text-primary"
        : "text-muted-foreground group-hover:text-foreground"
    );
  };

  return (
    <Sidebar
      className="w-64 transition-all duration-300 border-r border-border sidebar-container"
      collapsible="icon"
    >
      <SidebarContent className="gap-0 py-4">
        {/* Logo Section */}
        <div className="sidebar-header px-6 pb-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="sidebar-logo-wrapper">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white gradient-text-primary">
                Genius Factor
              </span>
              <span className="text-xs text-muted-foreground">
                HR Analytics Suite
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-6 py-2">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3 space-y-1">
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className={getNavClassName(item.url)}>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "sidebar-nav-icon-wrapper",
                            isActive(item.url)
                              ? "sidebar-nav-icon-wrapper-active"
                              : "sidebar-nav-icon-wrapper-inactive"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              getIconClassName(item.url)
                            )}
                          />
                        </div>
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Stats Section */}
        <div className="sidebar-notification-wrapper mx-4 mt-8 p-4">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-green-400">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Status */}
        <div className="px-6 mt-auto pt-6 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="sidebar-user-avatar h-10 w-10 flex items-center justify-center">
              <span className="text-sm font-bold text-white">AD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin Dashboard</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span className="text-xs text-green-400">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="sidebar-decorative-bottom"></div>
      </SidebarContent>
    </Sidebar>
  );
}
