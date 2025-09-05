"use client";

import { useRouter } from "next/navigation";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import { StatCard } from "@/components/admin/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  ClipboardList,
  TrendingDown,
  ArrowUp,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
// import { useSocket } from "@/context/socket-context";

interface DashboardMetrics {
  overallMetrics: {
    total_reports: number;
    total_hr_ids: number;
    total_departments: number;
    avg_retention_risk: number;
    avg_mobility_score: number;
    avg_genius_factor: number;
    assessment_completion_by_department: {
      [key: string]: {
        total_employees: number;
        completed_assessments: number;
        completion_rate: number;
      };
    };
    retention_risk_distribution: {
      [key: string]: number;
    };
    genius_factor_distribution: {
      [key: string]: number;
    };
    mobility_trends: {
      monthly: { [key: string]: number };
      quarterly: { [key: string]: number };
    };
  };
  hrMetrics: {
    [key: string]: any;
  };
  departmentMetrics: {
    [key: string]: {
      report_count: number;
      employee_count: number;
      avg_retention_risk: number;
      avg_mobility_score: number;
      avg_genius_factor: number;
    };
  };
  chartData: {
    [key: string]: any;
  };
}

export default function HROverview() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const {
    dashboardData,
    internalMobility,
    totalEmployees,
    isConnected,
    isAdmin,
  } = useSocket();
  const [loading, setLoading] = useState(true);

  console.log("Socket Data:", {
    dashboardData,
    internalMobility,
    totalEmployees,
    isConnected,
    isAdmin,
  });

  // Extract data from dashboardData or use empty defaults
  const metrics = (dashboardData as any)?.overallMetrics || {};
  const departmentMetrics = (dashboardData as any)?.departmentMetrics || {};
  const chartData = (dashboardData as any)?.chartData || {};

  // Calculate statistics
  const totalCompanies = metrics.total_hr_ids || 0;
  const totalAssessments = metrics.total_reports || 0;
  const averageRisk = metrics.avg_retention_risk || 0;
  const totalDepartments = metrics.total_departments || 0;
  const avgMobilityScore = metrics.avg_mobility_score || 0;
  const avgGeniusFactor = metrics.avg_genius_factor || 0;

  // Transform department data for charts
  const departmentData = Object.entries(departmentMetrics).map(
    ([name, metrics]: [string, any]) => ({
      name,
      employees: metrics.employee_count || 0,
      assessments: metrics.report_count || 0,
      risk: metrics.avg_retention_risk || 0,
      mobility: metrics.avg_mobility_score || 0,
      genius: metrics.avg_genius_factor || 0,
    })
  );

  // Transform risk distribution for pie chart
  const riskDistribution = metrics.retention_risk_distribution || {};
  const riskData = [
    {
      name: "Low Risk",
      value: riskDistribution["Low (0-30)"] || 0,
      color: "#059669",
    },
    {
      name: "Medium Risk",
      value: riskDistribution["Medium (31-60)"] || 0,
      color: "#d97706",
    },
    {
      name: "High Risk",
      value: riskDistribution["High (61-100)"] || 0,
      color: "#dc2626",
    },
  ];

  // Transform genius factor distribution
  const geniusDistribution = metrics.genius_factor_distribution || {};
  const geniusData = [
    {
      name: "Poor (0-20)",
      value: geniusDistribution["Poor (0-20)"] || 0,
      color: "#dc2626",
    },
    {
      name: "Fair (21-40)",
      value: geniusDistribution["Fair (21-40)"] || 0,
      color: "#d97706",
    },
    {
      name: "Good (41-60)",
      value: geniusDistribution["Good (41-60)"] || 0,
      color: "#2563eb",
    },
    {
      name: "Very Good (61-80)",
      value: geniusDistribution["Very Good (61-80)"] || 0,
      color: "#059669",
    },
    {
      name: "Excellent (81-100)",
      value: geniusDistribution["Excellent (81-100)"] || 0,
      color: "#7c3aed",
    },
  ];

  // Transform mobility trends
  const mobilityTrends = metrics.mobility_trends?.monthly || {};
  const mobilityChartData = Object.entries(mobilityTrends).map(
    ([month, count]) => ({
      month: month.substring(5), // Show only month part (e.g., "2024-01" -> "01")
      movements: count,
      fullMonth: month,
    })
  );

  useEffect(() => {
    if (dashboardData) {
      setLoading(false);
    }

    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);
    const handleChange = (e: any) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener("change", handleChange);
    return () => darkModeMediaQuery.removeEventListener("change", handleChange);
  }, [dashboardData]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const backgroundColor = isDarkMode ? "#1a1a1a" : "#ffffff";
      const borderColor = isDarkMode ? "#4b5563" : "#e5e7eb";
      const textColor = isDarkMode ? "#ffffff" : "#000000";

      return (
        <div
          className="p-2 rounded shadow-lg"
          style={{
            backgroundColor,
            border: `1px solid ${borderColor}`,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: textColor }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{ color: entry.color || textColor }}
            >
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <HRLayout
        title="Admin Dashboard Overview"
        subtitle="Loading dashboard data..."
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {isConnected
                ? "Connected, waiting for data..."
                : "Connecting to server..."}
            </p>
            {isAdmin && (
              <p className="text-sm text-green-600 mt-2">Admin Mode</p>
            )}
          </div>
        </div>
      </HRLayout>
    );
  }

  if (!dashboardData || Object.keys(metrics).length === 0) {
    return (
      <HRLayout title="Admin Dashboard Overview" subtitle="No data available">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No Dashboard Data
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isConnected
                ? "Waiting for data from server..."
                : "Please check your connection and try again."}
            </p>
            {isAdmin && (
              <p className="text-sm text-green-600 mt-2">Admin Mode</p>
            )}
          </div>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout
      title="Admin Dashboard Overview"
      subtitle="Comprehensive analytics across all HR managers and departments"
    >
      <div className="space-y-6">
        {isAdmin && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                Admin View: System-wide analytics
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total HR Managers"
            value={totalCompanies}
            description="Active HR accounts"
            icon={<Building2 className="h-4 w-4" />}
            trend={{ value: 12, label: "vs last month", isPositive: true }}
            className="shadow-card"
          />
          <StatCard
            title="Total Employees"
            value={totalEmployees.toLocaleString()}
            description="Across all departments"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 8, label: "vs last month", isPositive: true }}
            className="shadow-card"
          />
          <StatCard
            title="Assessments Completed"
            value={totalAssessments}
            description="Total reports generated"
            icon={<ClipboardList className="h-4 w-4" />}
            trend={{ value: 23, label: "vs last month", isPositive: true }}
            className="shadow-card"
          />
          <StatCard
            title="Average Risk Level"
            value={`${averageRisk}%`}
            description="Retention risk score"
            icon={<TrendingDown className="h-4 w-4 text-red-600" />}
            trend={{ value: 3, label: "vs last month", isPositive: false }}
            className="shadow-card"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* Department Performance Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Department Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={customTooltip} />
                  <Bar dataKey="employees" fill="#059669" name="Employees" />
                  <Bar
                    dataKey="assessments"
                    fill="#2563eb"
                    name="Assessments"
                  />
                  <Bar dataKey="risk" fill="#dc2626" name="Risk Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Retention Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {riskData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Genius Factor Distribution */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-green-600" />
                Genius Factor Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geniusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={customTooltip} />
                  <Bar dataKey="value" fill="#2563eb" name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mobility Trends */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-blue-600" />
                Monthly Mobility Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mobilityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mobilityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={customTooltip} />
                    <Line
                      type="monotone"
                      dataKey="movements"
                      stroke="#2563eb"
                      strokeWidth={2}
                      name="Movements"
                      dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#2563eb" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    No mobility data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Department Summary Cards */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departmentData.map((dept) => (
                <div key={dept.name} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">{dept.name}</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      Employees:{" "}
                      <span className="font-medium">{dept.employees}</span>
                    </p>
                    <p>
                      Assessments:{" "}
                      <span className="font-medium">{dept.assessments}</span>
                    </p>
                    <p>
                      Risk Score:{" "}
                      <span className="font-medium">{dept.risk}%</span>
                    </p>
                    <p>
                      Mobility Score:{" "}
                      <span className="font-medium">{dept.mobility}%</span>
                    </p>
                    <p>
                      Genius Factor:{" "}
                      <span className="font-medium">{dept.genius}%</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
