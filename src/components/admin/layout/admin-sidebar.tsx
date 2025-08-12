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
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Companies", url: "/dashboard/companies", icon: Building2 },
  { title: "Employees", url: "/dashboard/employees", icon: Users },
  {
    title: "Assessments",
    url: "/hr-dashboard/assessments",
    icon: ClipboardList,
  },
  {
    title: "Risk Analysis",
    url: "/hr-dashboard/risk-analysis",
    icon: TrendingDown,
  },
  { title: "Mobility", url: "/hr-dashboard/mobility", icon: ArrowUpDown },
];

const accountItems = [
  { title: "Profile", url: "/hr-dashboard/profile", icon: User },
  { title: "Settings", url: "/hr-dashboard/settings", icon: Settings },
];

export function HRSidebar() {
  const sidebarContext = useSidebar();
  const currentPath = usePathname();

  const isActive = (path: string) => {
    if (path === "/hr-dashboard") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return cn(
      "transition-all duration-200",
      isActive(path)
        ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-interactive"
        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
    );
  };

  return (
    <Sidebar className="w-60 transition-all duration-300" collapsible="icon">
      <SidebarContent className="gap-0">
        {/* Logo Section */}
        <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sidebar-foreground font-semibold text-sm">
              Genius Factor
            </span>
            <span className="text-sidebar-foreground/60 text-xs">
              HR Analytics
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium px-6 py-3">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account Section */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium px-6 py-3">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
