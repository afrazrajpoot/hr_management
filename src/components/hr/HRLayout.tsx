"use client";

import { useState, useEffect } from "react";
import HRSidebar from "./HRSidebar";
import HRTopBar from "./HRTopBar";
import { useTheme } from "next-themes";

const pageConfig = {
  "/hr-dashboard": {
    title: "Dashboard Overview",
    subtitle: "Company-wide analytics and insights",
  },
  "/hr-dashboard/departments": {
    title: "Department Management",
    subtitle: "Department-specific analytics and insights",
  },
  "/hr-dashboard/employees": {
    title: "Employee Management",
    subtitle: "Manage and track all employees",
  },
  "/hr-dashboard/assessments": {
    title: "Assessment Center",
    subtitle: "Track and manage career assessments",
  },
  "/hr-dashboard/retention-risk": {
    title: "Retention Risk Analysis",
    subtitle: "Identify and address retention risks",
  },
  "/hr-dashboard/internal-mobility": {
    title: "Internal Mobility Tracking",
    subtitle: "Track career movements and opportunities",
  },
  "/hr-dashboard/profile": {
    title: "My Profile",
    subtitle: "Manage your account settings",
  },
  "/hr-dashboard/upload-jobs": {
    title: "Upload Jobs",
    subtitle: "System preferences and configurations",
  },
};

export default function HRLayout({ children, segment }: any) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner
  }

  // Toggle theme
  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Determine current path from segment
  const currentPath = "/" + (segment ? segment.join("/") : "hr-dashboard");
  const currentPage = pageConfig[currentPath] || pageConfig["/hr-dashboard"];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <HRSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        darkMode={theme === "dark"}
        onToggleDarkMode={toggleTheme}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <HRTopBar title={currentPage.title} subtitle={currentPage.subtitle} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
