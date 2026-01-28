// components/hr/HRLayout.tsx
"use client";

import { useState, useEffect } from "react";
import HRSidebar from "./HRSidebar";
import HRTopBar from "./HRTopBar";
import { useTheme } from "next-themes";

const pageConfig = {
  "/hr-dashboard": {
    title: "Dashboard Overview",
    subtitle: "Company-wide analytics and insights",
    icon: "📊",
  },
  "/hr-dashboard/departments": {
    title: "Department Management",
    subtitle: "Department-specific analytics and insights",
    icon: "🏢",
  },
  "/hr-dashboard/employees": {
    title: "Employee Management",
    subtitle: "Manage and track all employees",
    icon: "👥",
  },
  "/hr-dashboard/assessments": {
    title: "Assessment Center",
    subtitle: "Track and manage career assessments",
    icon: "📋",
  },
  "/hr-dashboard/retention-risk": {
    title: "Retention Risk Analysis",
    subtitle: "Identify and address retention risks",
    icon: "⚠️",
  },
  "/hr-dashboard/internal-mobility": {
    title: "Internal Mobility Tracking",
    subtitle: "Track career movements and opportunities",
    icon: "📈",
  },
  "/hr-dashboard/profile": {
    title: "My Profile",
    subtitle: "Manage your account settings",
    icon: "👤",
  },
  "/hr-dashboard/upload-employee": {
    title: "Upload Employee Data",
    subtitle: "Import employee information",
    icon: "📤",
  },
  "/hr-dashboard/upload-jobs": {
    title: "Upload Jobs",
    subtitle: "Create and manage job postings",
    icon: "💼",
  },
  "/hr-dashboard/jobs": {
    title: "Job Management",
    subtitle: "View and manage job applications",
    icon: "📝",
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
    return null;
  }

  // Toggle theme
  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Determine current path from segment
  const currentPath = "/" + (segment ? segment.join("/") : "hr-dashboard");
  const currentPage = pageConfig[currentPath] || pageConfig["/hr-dashboard"];

  return (
    <div className="flex h-screen overflow-hidden  bg-layout-purple">
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
        <HRTopBar
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          icon={currentPage.icon}
        />



        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 ">
          <div className="p-6 mx-auto ">{children}</div>
        </main>
      </div>
    </div>
  );
}
