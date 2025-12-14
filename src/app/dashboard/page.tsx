"use client";

import { useRouter } from "next/navigation";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import { StatCard } from "@/components/admin/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Building2,
  Users,
  ClipboardList,
  TrendingDown,
  ArrowUp,
  Loader2,
  ArrowUpDown,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  Globe,
  Shield,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Download,
  Filter,
  RefreshCw,
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
  Legend,
} from "recharts";
import { useEffect, useState, useMemo } from "react";
import { useSocket } from "@/context/SocketContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DashboardMetrics {
  overallMetrics: {
    total_reports: number;
    total_employees: number;
    total_hr_ids: number;
    total_departments: number;
    avg_retention_risk: number;
    avg_mobility_score: number;
    avg_genius_factor: number;
    retention_risk_distribution: {
      [key: string]: number;
    };
    genius_factor_distribution: {
      [key: string]: number;
    };
    mobility_trends: {
      monthly: { [key: string]: number };
    };
  };
  hrMetrics: {
    [key: string]: {
      report_count: number;
      employee_count: number;
      avg_retention_risk: number;
      avg_mobility_score: number;
      avg_genius_factor: number;
    };
  };
  chartData: {
    hr_department_chart_data: {
      [hrId: string]: {
        first_name: string;
        last_name: string;
        full_name: string;
        departments: {
          [dept: string]: {
            avg_retention_risk: number;
            avg_mobility_score: number;
            avg_genius_factor: number;
            risk_distribution: { [key: string]: number };
            genius_factor_distribution: { [key: string]: number };
          };
        };
        risk_distribution: { [key: string]: number };
        monthly_trend: { [key: string]: number };
      };
    };
    risk_analysis_by_hr: {
      [hrId: string]: {
        first_name: string;
        last_name: string;
        full_name: string;
        department_distribution: {
          [dept: string]: {
            count: number;
            employee_count: number;
            avg_retention_risk: number;
            avg_mobility_score: number;
            avg_genius_factor: number;
            risk_distribution: { [key: string]: number };
            genius_factor_distribution: { [key: string]: number };
          };
        };
        monthly_trend: { [key: string]: number };
        risk_distribution: { [key: string]: number };
        total_reports: number;
        total_employees: number;
        avg_retention_risk: number;
      };
    };
  };
}

export default function HROverview() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedHR, setSelectedHR] = useState<string | null>(null);
  const {
    dashboardData,
    mobilityAnalysis,
    totalEmployees,
    isConnected,
    isAdmin,
  } = useSocket();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last_30_days");

  // Extract data from dashboardData or use empty defaults
  const metrics = dashboardData?.overallMetrics || {};
  console.log(metrics);
  const hrMetrics = dashboardData?.hrMetrics || {};
  const chartData = dashboardData?.chartData || {};

  // Extract mobility analysis data
  const hrMobilityStats = mobilityAnalysis?.hr_stats || {};
  const overallMobilityTrends = mobilityAnalysis?.overall_monthly_trends || [];
  const analysisPeriod = mobilityAnalysis?.analysis_period;

  // Create HR list with full names
  const hrList = useMemo(() => {
    if (!chartData.risk_analysis_by_hr) return [];

    return Object.entries(chartData.risk_analysis_by_hr).map(
      ([hrId, hrData]: [string, any]) => ({
        id: hrId,
        fullName:
          hrData.full_name ||
          `${hrData.first_name} ${hrData.last_name}` ||
          hrId,
      })
    );
  }, [chartData.risk_analysis_by_hr]);

  // Get selected HR name for display
  const selectedHRName = useMemo(() => {
    if (!selectedHR) return "All HRs";

    const hrData = chartData.risk_analysis_by_hr?.[selectedHR];
    if (hrData) {
      return (
        hrData.full_name ||
        `${hrData.first_name} ${hrData.last_name}` ||
        selectedHR
      );
    }
    return selectedHR;
  }, [selectedHR, chartData.risk_analysis_by_hr]);

  // Calculate statistics
  const totalCompanies = metrics.total_hr_ids || 0;
  const totalAssessments = metrics.total_reports || 0;
  const totalDepartments = metrics.total_departments || 0;
  const avgRetentionRisk = useMemo(() => {
    const hrIds = Object.keys(hrMetrics);
    return hrIds.length > 0
      ? Math.round(
          hrIds.reduce(
            (sum, hrId) => sum + (hrMetrics[hrId]?.avg_retention_risk || 0),
            0
          ) / hrIds.length
        )
      : 0;
  }, [hrMetrics]);
  const avgMobilityScore = useMemo(() => {
    const hrIds = Object.keys(hrMetrics);
    return hrIds.length > 0
      ? Math.round(
          hrIds.reduce(
            (sum, hrId) => sum + (hrMetrics[hrId]?.avg_mobility_score || 0),
            0
          ) / hrIds.length
        )
      : 0;
  }, [hrMetrics]);
  const avgGeniusFactor = useMemo(() => {
    const hrIds = Object.keys(hrMetrics);
    return hrIds.length > 0
      ? Math.round(
          hrIds.reduce(
            (sum, hrId) => sum + (hrMetrics[hrId]?.avg_genius_factor || 0),
            0
          ) / hrIds.length
        )
      : 0;
  }, [hrMetrics]);

  // Auto-select first HR after data loads
  useEffect(() => {
    if (
      dashboardData &&
      chartData.risk_analysis_by_hr &&
      Object.keys(chartData.risk_analysis_by_hr).length > 0 &&
      hrList.length > 0
    ) {
      const firstHrId = hrList[0].id;
      if (selectedHR === null) {
        setSelectedHR(firstHrId);
      }
    }
  }, [dashboardData, chartData.risk_analysis_by_hr, selectedHR, hrList]);

  // Transform HR department data for charts
  const hrDepartmentChartData = useMemo(() => {
    if (
      selectedHR &&
      chartData.risk_analysis_by_hr?.[selectedHR]?.department_distribution
    ) {
      const hrData =
        chartData.risk_analysis_by_hr[selectedHR].department_distribution || {};
      return Object.entries(hrData).map(([dept, metrics]: any) => ({
        name: dept,
        retentionRisk: metrics.avg_retention_risk || 0,
        mobilityScore: metrics.avg_mobility_score || 0,
        geniusFactor: metrics.avg_genius_factor || 0,
      }));
    } else if (!selectedHR && chartData.risk_analysis_by_hr) {
      const uniqueDepartments = Array.from(
        new Set(
          Object.values(chartData.risk_analysis_by_hr).flatMap((hr: any) =>
            Object.keys(hr.department_distribution || {})
          )
        )
      );
      const result = uniqueDepartments.map((dept) => {
        const deptData: any = { name: dept };
        Object.keys(chartData.risk_analysis_by_hr).forEach((hrId) => {
          const hrDept =
            chartData.risk_analysis_by_hr[hrId]?.department_distribution?.[
              dept
            ];
          deptData[hrId] = hrDept ? hrDept.avg_retention_risk : 0;
        });
        return deptData;
      });
      return result;
    }
    return [];
  }, [chartData.risk_analysis_by_hr, selectedHR]);

  // Transform risk distribution for selected HR or overall
  const riskData = useMemo(() => {
    const riskDistribution =
      selectedHR && chartData.risk_analysis_by_hr?.[selectedHR]
        ? chartData.risk_analysis_by_hr[selectedHR].risk_distribution || {}
        : metrics.retention_risk_distribution || {};
    return [
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
  }, [
    chartData.risk_analysis_by_hr,
    metrics.retention_risk_distribution,
    selectedHR,
  ]);

  // Transform internal mobility trends for selected HR or overall
  const internalMobilityChartData = useMemo(() => {
    if (selectedHR && hrMobilityStats[selectedHR]?.monthly_trends) {
      // Filter out months with no data for better visualization
      return hrMobilityStats[selectedHR].monthly_trends.filter(
        (month: any) => month.incoming > 0 || month.outgoing > 0
      );
    } else if (!selectedHR && overallMobilityTrends.length > 0) {
      // Filter out months with no data for better visualization
      return overallMobilityTrends.filter(
        (month: any) => month.incoming > 0 || month.outgoing > 0
      );
    }
    return [];
  }, [hrMobilityStats, overallMobilityTrends, selectedHR]);

  // Calculate internal mobility totals
  const internalMobilityTotals: any = useMemo(() => {
    if (selectedHR && hrMobilityStats[selectedHR]) {
      const hrData = hrMobilityStats[selectedHR];
      return {
        totalMovements: hrData.total_movements || 0,
        totalPromotions: hrData.promotions || 0,
        totalTransfers: hrData.transfers || 0,
      };
    } else if (!selectedHR) {
      // Calculate totals across all HRs
      const totals = Object.values(hrMobilityStats).reduce(
        (acc: any, hrData: any) => ({
          totalMovements: acc.totalMovements + (hrData.total_movements || 0),
          totalPromotions: acc.totalPromotions + (hrData.promotions || 0),
          totalTransfers: acc.totalTransfers + (hrData.transfers || 0),
        }),
        { totalMovements: 0, totalPromotions: 0, totalTransfers: 0 }
      );
      return totals;
    }
    return { totalMovements: 0, totalPromotions: 0, totalTransfers: 0 };
  }, [hrMobilityStats, selectedHR]);

  // Transform department data for summary cards with HR breakdown
  const departmentData = useMemo(() => {
    if (!chartData.risk_analysis_by_hr) return [];
    const uniqueDepartments = Array.from(
      new Set(
        Object.values(chartData.risk_analysis_by_hr).flatMap((hr: any) =>
          Object.keys(hr.department_distribution || {})
        )
      )
    );
    const result = uniqueDepartments.map((dept) => {
      const hrDetails = Object.entries(chartData.risk_analysis_by_hr).reduce(
        (acc, [hrId, hrData]: [string, any]) => {
          const deptData = hrData.department_distribution?.[dept] || {};
          const hrName =
            hrData.full_name ||
            `${hrData.first_name} ${hrData.last_name}` ||
            hrId;
          return {
            ...acc,
            [hrId]: {
              name: hrName,
              employees: deptData.employee_count || 0,
              assessments: deptData.count || 0,
              retentionRisk: deptData.avg_retention_risk || 0,
              mobilityScore: deptData.avg_mobility_score || 0,
              geniusFactor: deptData.avg_genius_factor || 0,
            },
          };
        },
        {}
      );
      return { name: dept, hrDetails };
    });
    return result;
  }, [chartData.risk_analysis_by_hr]);

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
        <Loader />
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
      subtitle="Comprehensive analytics across all HR managers and their departments"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive analytics across all HR managers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Last 7 days</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="last_90_days">Last 90 days</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button className="btn-gradient-primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Admin Banner */}
        {isAdmin && (
          <div className="card-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="icon-wrapper-blue mr-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Admin View: System-wide HR Analytics
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Viewing data for{" "}
                    {selectedHR ? selectedHRName : "all HR managers"}
                  </p>
                </div>
              </div>
              <Select
                value={selectedHR || "all"}
                onValueChange={(value) =>
                  setSelectedHR(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-64">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select HR Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      All HR Managers
                    </div>
                  </SelectItem>
                  {hrList.map((hr) => (
                    <SelectItem key={hr.id} value={hr.id}>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {hr.fullName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total HR Managers
                </p>
                <h3 className="text-2xl font-bold mt-1">{totalCompanies}</h3>
                <div className="flex items-center mt-2">
                  <Badge className="badge-green">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +12%
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="icon-wrapper-blue">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Employees
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {totalEmployees.toLocaleString()}
                </h3>
                <div className="flex items-center mt-2">
                  <Badge className="badge-blue">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +8%
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="icon-wrapper-green">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Assessments Completed
                </p>
                <h3 className="text-2xl font-bold mt-1">{totalAssessments}</h3>
                <div className="flex items-center mt-2">
                  <Badge className="badge-purple">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +23%
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="icon-wrapper-purple">
                <ClipboardList className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Retention Risk
                </p>
                <h3 className="text-2xl font-bold mt-1">{avgRetentionRisk}%</h3>
                <div className="mt-2">
                  <Progress
                    value={avgRetentionRisk}
                    className="progress-bar-primary h-2"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Higher risk requires attention
                  </span>
                </div>
              </div>
              <div className="icon-wrapper-amber">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats - Mobility */}
        {Object.keys(hrMobilityStats).length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-primary card-hover bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Internal Movements
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {internalMobilityTotals.totalMovements}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last 6 months • Real-time data
                  </p>
                </div>
                <div className="icon-wrapper-blue">
                  <ArrowUpDown className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card-primary card-hover bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Promotions
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {internalMobilityTotals.totalPromotions}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Career growth • Real-time data
                  </p>
                </div>
                <div className="icon-wrapper-green">
                  <ArrowUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card-primary card-hover bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Transfers
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {internalMobilityTotals.totalTransfers}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Department moves • Real-time data
                  </p>
                </div>
                <div className="icon-wrapper-purple">
                  <ArrowUpDown className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* HR Department Metrics Chart */}
          <Card className="card-primary card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="icon-wrapper-blue">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {selectedHR
                    ? "Retention Risk by Department"
                    : "Retention Risk by Department per HR"}
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {hrDepartmentChartData.length > 0 ? (
                <ResponsiveContainer key={selectedHR} width="100%" height={300}>
                  <BarChart data={hrDepartmentChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                      fontSize={12}
                    />
                    <Tooltip content={customTooltip} cursor={false} />
                    <Legend />
                    <Bar
                      dataKey="retentionRisk"
                      fill="#dc2626"
                      name="Retention Risk"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="mobilityScore"
                      fill="#2563eb"
                      name="Mobility Score"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="geniusFactor"
                      fill="#059669"
                      name="Genius Factor"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No department data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Retention Risk Distribution */}
          <Card className="card-primary card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="icon-wrapper-amber">
                  <PieChartIcon className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {selectedHR
                    ? "Retention Risk Distribution"
                    : "Retention Risk Distribution Across HRs"}
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {riskData.some((item) => item.value > 0) ? (
                <ResponsiveContainer key={selectedHR} width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} employees`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <PieChartIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No retention risk data available
                  </p>
                </div>
              )}
              <div className="flex justify-center gap-4 mt-6 flex-wrap">
                {riskData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Internal Mobility Trends Chart */}
          <Card className="card-primary card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="icon-wrapper-green">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {selectedHR
                    ? "Internal Mobility Trends"
                    : "Internal Mobility Trends (6 Months)"}
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {internalMobilityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={internalMobilityChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="month"
                      stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                      fontSize={12}
                    />
                    <Tooltip content={customTooltip} cursor={false} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="incoming"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Incoming"
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#10b981" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="outgoing"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Outgoing"
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Total"
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No mobility data available
                  </p>
                </div>
              )}
              {analysisPeriod && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  Analysis period: {analysisPeriod.start} to{" "}
                  {analysisPeriod.end}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Analysis Distribution */}
          <Card className="card-primary card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="icon-wrapper-blue">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {selectedHR
                    ? "Risk Analysis Distribution"
                    : "Risk Analysis Distribution Across HRs"}
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {riskData.some((item) => item.value > 0) ? (
                <ResponsiveContainer key={selectedHR} width="100%" height={300}>
                  <BarChart data={riskData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                      fontSize={12}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} employees`, "Count"]}
                      cursor={false}
                    />
                    <Bar
                      dataKey="value"
                      fill="#dc2626"
                      name="Employees"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <Target className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No risk analysis data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics Section */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="card-primary card-hover">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Average Mobility Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text-primary">
                  {avgMobilityScore}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Across all departments
                </p>
                <Progress
                  value={avgMobilityScore}
                  className="progress-bar-primary mt-4"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Genius Factor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {avgGeniusFactor}%
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  High-potential employees
                </p>
                <Progress
                  value={avgGeniusFactor}
                  className="progress-bar-primary mt-4"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-500" />
                Departments Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  {totalDepartments}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Unique departments tracked
                </p>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    View All Departments
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Status */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            <span>{isConnected ? "Connected to server" : "Connecting..."}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            {isAdmin && (
              <Badge className="badge-green">
                <Shield className="h-3 w-3 mr-1" />
                Admin Mode
              </Badge>
            )}
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
