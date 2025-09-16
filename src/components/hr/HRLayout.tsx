"use client";

import { useState, useEffect } from "react";
import HRSidebar from "./HRSidebar";
import HRTopBar from "./HRTopBar";

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
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage and sync with document
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("hr-dark-mode") === "true";
    setDarkMode(savedDarkMode);
    updateDarkModeClass(savedDarkMode);
  }, []);

  // Function to update the dark class on document
  const updateDarkModeClass = (isDark: any) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Toggle dark mode and sync state with class
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("hr-dark-mode", newDarkMode.toString());
    updateDarkModeClass(newDarkMode);
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
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
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
