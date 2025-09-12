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

  // Extract data from dashboardData or use empty defaults
  const metrics = dashboardData?.overallMetrics || {};
  const hrMetrics = dashboardData?.hrMetrics || {};
  const chartData = dashboardData?.chartData || {};

  // Extract mobility analysis data
  const hrMobilityStats = mobilityAnalysis?.hr_stats || {};
  const overallMobilityTrends = mobilityAnalysis?.overall_monthly_trends || [];
  const analysisPeriod = mobilityAnalysis?.analysis_period;

  // Debugging logs
  useEffect(() => {
    console.log("Dashboard Data:", dashboardData);
    console.log("Mobility Analysis:", mobilityAnalysis);
    console.log("Selected HR:", selectedHR);
    console.log("HR Metrics:", hrMetrics);
    console.log("Chart Data:", chartData);
  }, [dashboardData, mobilityAnalysis, selectedHR, hrMetrics, chartData]);

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

  // HR list for selector
  const hrList = Object.keys(chartData.risk_analysis_by_hr || {});

  // Auto-select first HR after data loads
  useEffect(() => {
    if (
      dashboardData &&
      chartData.risk_analysis_by_hr &&
      Object.keys(chartData.risk_analysis_by_hr).length > 0
    ) {
      const firstHrId = Object.keys(chartData.risk_analysis_by_hr)[0];
      if (selectedHR === null) {
        setSelectedHR(firstHrId);
      }
    }
  }, [dashboardData, chartData.risk_analysis_by_hr, selectedHR]);

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
          return {
            ...acc,
            [hrId]: {
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
        {isAdmin && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  Admin View: System-wide HR analytics
                </span>
              </div>
              <Select
                value={selectedHR || "all"}
                onValueChange={(value) =>
                  setSelectedHR(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select HR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All HRs</SelectItem>
                  {hrList.map((hrId) => (
                    <SelectItem key={hrId} value={hrId}>
                      {hrId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            description="Across all HRs"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 8, label: "vs last month", isPositive: true }}
            className="shadow-card"
          />
          <StatCard
            title="Assessments Completed"
            value={totalAssessments}
            description="Total reports across HRs"
            icon={<ClipboardList className="h-4 w-4" />}
            trend={{ value: 23, label: "vs last month", isPositive: true }}
            className="shadow-card"
          />
          <StatCard
            title="Average Retention Risk"
            value={`${avgRetentionRisk}%`}
            description="Average across HRs"
            icon={<TrendingDown className="h-4 w-4 text-red-600" />}
            trend={{ value: 3, label: "vs last month", isPositive: false }}
            className="shadow-card"
          />
        </div>

        {/* Internal Mobility Stats */}
        {Object.keys(hrMobilityStats).length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Internal Movements"
              value={internalMobilityTotals.totalMovements.toString()}
              description="Last 6 months"
              icon={<ArrowUpDown className="h-4 w-4" />}
              trend={{ value: 0, label: "Real-time data", isPositive: true }}
              className="shadow-card bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
            />
            <StatCard
              title="Promotions"
              value={internalMobilityTotals.totalPromotions.toString()}
              description="Career growth"
              icon={<ArrowUp className="h-4 w-4 text-green-600" />}
              trend={{ value: 0, label: "Real-time data", isPositive: true }}
              className="shadow-card bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
            />
            <StatCard
              title="Transfers"
              value={internalMobilityTotals.totalTransfers.toString()}
              description="Department moves"
              icon={<ArrowUpDown className="h-4 w-4 text-blue-600" />}
              trend={{ value: 0, label: "Real-time data", isPositive: true }}
              className="shadow-card bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
            />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* HR Department Metrics Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {selectedHR
                  ? `Retention Risk by Department for ${selectedHR}`
                  : "Retention Risk by Department per HR"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hrDepartmentChartData.length > 0 ? (
                <ResponsiveContainer key={selectedHR} width="100%" height={300}>
                  <BarChart data={hrDepartmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={customTooltip} />
                    <Bar
                      dataKey="retentionRisk"
                      fill="#dc2626"
                      name="Retention Risk"
                    />
                    <Bar
                      dataKey="mobilityScore"
                      fill="#2563eb"
                      name="Mobility Score"
                    />
                    <Bar
                      dataKey="geniusFactor"
                      fill="#059669"
                      name="Genius Factor"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    No department data available for {selectedHR || "All HRs"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Retention Risk Distribution */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                {selectedHR
                  ? `Retention Risk Distribution for ${selectedHR}`
                  : "Retention Risk Distribution Across HRs"}
              </CardTitle>
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
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={customTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    No retention risk data available for{" "}
                    {selectedHR || "All HRs"}
                  </p>
                </div>
              )}
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

          {/* Internal Mobility Trends Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-blue-600" />
                {selectedHR
                  ? `Internal Mobility Trends for ${selectedHR}`
                  : "Internal Mobility Trends (6 Months)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {internalMobilityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={internalMobilityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={customTooltip} />
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
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    No mobility data available for {selectedHR || "All HRs"}
                  </p>
                </div>
              )}
              {analysisPeriod && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Analysis period: {analysisPeriod.start} to{" "}
                  {analysisPeriod.end}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Analysis Distribution */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                {selectedHR
                  ? `Risk Analysis Distribution for ${selectedHR}`
                  : "Risk Analysis Distribution Across HRs"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskData.some((item) => item.value > 0) ? (
                <ResponsiveContainer key={selectedHR} width="100%" height={300}>
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={customTooltip} />
                    <Bar dataKey="value" fill="#dc2626" name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    No risk analysis data available for{" "}
                    {selectedHR || "All HRs"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Department Summary Cards with HR Breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Details by HR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departmentData.map((dept) => (
                <div key={dept.name} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">{dept.name}</h4>
                  <div className="space-y-4">
                    {Object.entries(dept.hrDetails)
                      .filter(
                        ([_, metrics]: [string, any]) => metrics.employees > 0
                      )
                      .map(([hrId, metrics]: [string, any]) => (
                        <div key={hrId} className="space-y-2 text-sm">
                          <h5 className="font-medium">{hrId}</h5>
                          <p>
                            Employees:{" "}
                            <span className="font-medium">
                              {metrics.employees}
                            </span>
                          </p>
                          <p>
                            Assessments:{" "}
                            <span className="font-medium">
                              {metrics.assessments}
                            </span>
                          </p>
                          <p>
                            Retention Risk:{" "}
                            <span className="font-medium">
                              {metrics.retentionRisk}%
                            </span>
                          </p>
                          <p>
                            Mobility Score:{" "}
                            <span className="font-medium">
                              {metrics.mobilityScore}%
                            </span>
                          </p>
                          <p>
                            Genius Factor:{" "}
                            <span className="font-medium">
                              {metrics.geniusFactor}%
                            </span>
                          </p>
                        </div>
                      ))}
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
