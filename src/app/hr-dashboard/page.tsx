"use client";

import { useSocket } from "@/context/SocketContext";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import HRLayout from "@/components/hr/HRLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  Target,
  AlertTriangle,
  Award,
  ArrowUpRight,
  Clock,
  Zap,
  Brain,
  Shield,
  Sparkles,
  BarChart3,
  Activity,
  TargetIcon,
  LineChart as LineChartIcon,
  PieChart,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const getDepartmentColor = (departmentName: string): string => {
  const departmentColors: { [key: string]: string } = {
    IT: "hsl(var(--primary))",
    AI: "#9333ea",
    Development: "#3b82f6",
    Security: "hsl(var(--destructive))",
    Corporate: "hsl(var(--muted-foreground))",
    Finance: "hsl(var(--success))",
    Sales: "#ef4444",
    Leadership: "#f59e0b",
    Strategy: "#6b7280",
    Marketing: "#ec4899",
    Media: "#f97316",
    Content: "#06b6d4",
    Communications: "#0ea5e9",
    Editorial: "#92400e",
    Healthcare: "hsl(var(--success))",
    Wellness: "#10b981",
    Research: "#8b5cf6",
    Analytics: "#7c3aed",
    Policy: "#9ca3af",
    Sustainability: "#059669",
    "No Data": "hsl(var(--muted-foreground))",
    Unknown: "hsl(var(--muted-foreground))",
  };

  return departmentColors[departmentName] || "hsl(var(--primary))";
};

const getScoreRangeColor = (range: string): string => {
  const scoreRangeColors: { [key: string]: string } = {
    "0-20": "hsl(var(--destructive))",
    "21-40": "#f59e0b",
    "41-60": "#eab308",
    "61-80": "hsl(var(--success))",
    "81-100": "#06b6d4",
    "Low (0-30)": "hsl(var(--success))",
    "Medium (31-60)": "hsl(var(--warning))",
    "High (61-100)": "hsl(var(--destructive))",
    Low: "hsl(var(--success))",
    Medium: "hsl(var(--warning))",
    High: "hsl(var(--destructive))",
  };

  return scoreRangeColors[range] || "hsl(var(--primary))";
};

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "up",
  description,
}: any) => (
  <Card className="card-primary card-hover group relative overflow-hidden border-0 shadow-lg">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <CardContent className="p-6 relative z-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper-blue">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {value}
            </span>
            {change && (
              <Badge
                variant={trend === "up" ? "default" : "secondary"}
                className={`gap-1 px-2 py-1 rounded-full ${
                  trend === "up" ? "badge-green" : "badge-amber"
                }`}
              >
                <ArrowUpRight className="h-3 w-3" />
                {change}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-3">{description}</p>
          )}
        </div>
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground border border-border/50 rounded-xl p-4 shadow-xl backdrop-blur-sm min-w-[200px]">
        {label && (
          <div className="font-bold mb-2 text-foreground flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            {label}
          </div>
        )}
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm mb-2 last:mb-0"
            style={{ color: entry.color }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.dataKey || entry.name}</span>
            </div>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const fallbackDepartmentData = [
  {
    name: "Development",
    completion: 85,
    color: "hsl(var(--primary))",
    employee_count: 42,
    metrics: {
      avg_scores: {
        genius_factor_score: 78,
        retention_risk_score: 32,
        mobility_opportunity_score: 65,
        productivity_score: 88,
        engagement_score: 76,
        skills_alignment_score: 82,
      },
      genius_factor_distribution: {
        "0-20": 2,
        "21-40": 5,
        "41-60": 12,
        "61-80": 15,
        "81-100": 8,
      },
      retention_risk_distribution: {
        "Low (0-30)": 25,
        "Medium (31-60)": 12,
        "High (61-100)": 5,
      },
      mobility_trend: {
        Jan: 12,
        Feb: 15,
        Mar: 18,
        Apr: 22,
      },
    },
  },
  {
    name: "Marketing",
    completion: 72,
    color: "#ec4899",
    employee_count: 28,
    metrics: {
      avg_scores: {
        genius_factor_score: 65,
        retention_risk_score: 45,
        mobility_opportunity_score: 58,
        productivity_score: 82,
        engagement_score: 71,
        skills_alignment_score: 68,
      },
      genius_factor_distribution: {
        "0-20": 3,
        "21-40": 6,
        "41-60": 10,
        "61-80": 7,
        "81-100": 2,
      },
      retention_risk_distribution: {
        "Low (0-30)": 18,
        "Medium (31-60)": 7,
        "High (61-100)": 3,
      },
      mobility_trend: {
        Jan: 8,
        Feb: 10,
        Mar: 14,
        Apr: 16,
      },
    },
  },
  {
    name: "Sales",
    completion: 91,
    color: "#ef4444",
    employee_count: 35,
    metrics: {
      avg_scores: {
        genius_factor_score: 82,
        retention_risk_score: 28,
        mobility_opportunity_score: 71,
        productivity_score: 91,
        engagement_score: 84,
        skills_alignment_score: 79,
      },
      genius_factor_distribution: {
        "0-20": 1,
        "21-40": 3,
        "41-60": 8,
        "61-80": 18,
        "81-100": 5,
      },
      retention_risk_distribution: {
        "Low (0-30)": 28,
        "Medium (31-60)": 6,
        "High (61-100)": 1,
      },
      mobility_trend: {
        Jan: 15,
        Feb: 18,
        Mar: 20,
        Apr: 24,
      },
    },
  },
  {
    name: "Finance",
    completion: 68,
    color: "hsl(var(--success))",
    employee_count: 22,
    metrics: {
      avg_scores: {
        genius_factor_score: 71,
        retention_risk_score: 38,
        mobility_opportunity_score: 52,
        productivity_score: 85,
        engagement_score: 69,
        skills_alignment_score: 74,
      },
      genius_factor_distribution: {
        "0-20": 2,
        "21-40": 4,
        "41-60": 9,
        "61-80": 6,
        "81-100": 1,
      },
      retention_risk_distribution: {
        "Low (0-30)": 16,
        "Medium (31-60)": 5,
        "High (61-100)": 1,
      },
      mobility_trend: {
        Jan: 5,
        Feb: 7,
        Mar: 9,
        Apr: 11,
      },
    },
  },
];

export default function Dashboard() {
  const { socket, isConnected, dashboardData } = useSocket();
  const { data: session } = useSession();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasData =
    dashboardData && Array.isArray(dashboardData) && dashboardData.length > 0;
  const departmentData: any[] = hasData
    ? dashboardData
    : fallbackDepartmentData;

  const totalEmployees = departmentData.reduce(
    (sum: number, dept: any) => sum + (dept.employee_count || 0),
    0
  );
  const avgGeniusFactor =
    departmentData.length > 0
      ? Math.round(
          departmentData
            .map(
              (dept: any) => dept.metrics?.avg_scores?.genius_factor_score || 0
            )
            .reduce((sum: number, score: number) => sum + score, 0) /
            departmentData.length
        )
      : 0;
  const avgRetentionRisk =
    departmentData.length > 0
      ? Math.round(
          departmentData.reduce(
            (sum: number, dept: any) =>
              sum + (dept.metrics?.avg_scores?.retention_risk_score || 0),
            0
          ) / departmentData.length
        )
      : 0;

  const totalCompletion =
    departmentData.length > 0
      ? Math.round(
          departmentData.reduce(
            (sum: number, dept: any) => sum + (dept.completion || 0),
            0
          ) / departmentData.length
        )
      : 0;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  // Prepare chart data
  const completionData = departmentData.map((dept: any) => ({
    name: dept.name,
    completion: dept.completion,
    color: getDepartmentColor(dept.name),
    employee_count: dept.employee_count,
  }));

  const geniusFactorData: any[] = [];
  const geniusRangeAggregation: { [key: string]: number } = {};

  for (const dept of departmentData) {
    const distribution: any = dept.metrics?.genius_factor_distribution || {};
    for (const [range, count] of Object.entries(distribution)) {
      if (typeof count === "number") {
        geniusRangeAggregation[range] =
          (geniusRangeAggregation[range] || 0) + count;
      }
    }
  }

  for (const [range, count] of Object.entries(geniusRangeAggregation)) {
    if (count > 0 || !hasData) {
      geniusFactorData.push({
        range,
        count,
        color: getScoreRangeColor(range),
      });
    }
  }

  const retentionRiskData: any[] = [];
  const riskRangeAggregation: { [key: string]: number } = {};

  for (const dept of departmentData) {
    const distribution = dept.metrics?.retention_risk_distribution || {};
    for (const [range, count] of Object.entries(distribution)) {
      if (typeof count === "number") {
        riskRangeAggregation[range] =
          (riskRangeAggregation[range] || 0) + count;
      }
    }
  }

  for (const [range, count] of Object.entries(riskRangeAggregation)) {
    if (count > 0 || !hasData) {
      retentionRiskData.push({
        range,
        count,
        color: getScoreRangeColor(range),
      });
    }
  }

  const mobilityTrendData: any[] = [];
  const allMonths = new Set<string>();

  for (const dept of departmentData) {
    const trend = dept.metrics?.mobility_trend || {};
    for (const month of Object.keys(trend)) {
      allMonths.add(month);
    }
  }

  for (const month of Array.from(allMonths).sort()) {
    const monthData: any = { month };
    for (const dept of departmentData) {
      const count = dept.metrics?.mobility_trend?.[month] || 0;
      monthData[dept.name] = count;
    }
    mobilityTrendData.push(monthData);
  }

  const departmentAverages = departmentData.map((dept: any) => ({
    department: dept.name,
    genius_factor_score: dept.metrics?.avg_scores?.genius_factor_score || 0,
    retention_risk_score: dept.metrics?.avg_scores?.retention_risk_score || 0,
    mobility_opportunity_score:
      dept.metrics?.avg_scores?.mobility_opportunity_score || 0,
    productivity_score: dept.metrics?.avg_scores?.productivity_score || 0,
    engagement_score: dept.metrics?.avg_scores?.engagement_score || 0,
  }));

  const departmentColors = departmentData.reduce((acc: any, dept: any) => {
    acc[dept.name] = getDepartmentColor(dept.name);
    return acc;
  }, {});

  // Top performers data
  const topPerformers = departmentData
    .sort((a, b) => (b.completion || 0) - (a.completion || 0))
    .slice(0, 3);

  return (
    <HRLayout>
      <div className="min-h-screen gradient-bg-primary p-4 md:p-6 space-y-6">
        {/* Header with decorative elements */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="decorative-gradient-blur-blue -top-20 -right-20" />
          <div className="decorative-gradient-blur-purple -bottom-20 -left-20" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="sidebar-logo-wrapper">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-primary">
                    HR Analytics Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Real-time insights and workforce intelligence
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isConnected
                        ? "bg-green-500 animate-pulse"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {isConnected ? "Live Data Streaming" : "Demo Mode"}
                  </span>
                </div>
                {lastUpdate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Updated{" "}
                    {lastUpdate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-card-foreground border border-border hover:border-primary transition-all ${
                  isRefreshing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </button>
              <Badge
                className={`px-3 py-1.5 rounded-full font-medium ${
                  isConnected ? "badge-green" : "badge-amber"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                  {isConnected ? "Connected" : "Demo Mode"}
                </div>
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Workforce"
            value={totalEmployees}
            icon={Users}
            change="+12%"
            description="Across all departments"
          />
          <StatCard
            title="Avg Genius Factor"
            value={`${avgGeniusFactor}/100`}
            icon={Brain}
            change="+8%"
            description="Employee potential score"
          />
          <StatCard
            title="Retention Risk"
            value={`${avgRetentionRisk}%`}
            icon={Shield}
            trend="down"
            change="-5%"
            description="Lower is better"
          />
          <StatCard
            title="Completion Rate"
            value={`${totalCompletion}%`}
            icon={TargetIcon}
            change="+15%"
            description="Assessments completed"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Assessment Completion Chart */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Department Performance
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Assessment completion rates by department
                  </CardDescription>
                </div>
                <Badge className="badge-blue">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18% Growth
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={completionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="completion"
                    name="Completion Rate"
                    radius={[8, 8, 0, 0]}
                  >
                    {completionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {completionData.length} departments
                </div>
                <button className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  View Details <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Genius Factor Distribution */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600/5 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Genius Factor Distribution
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Talent score ranges across organization
                  </CardDescription>
                </div>
                <Badge className="badge-purple">
                  <Award className="h-3 w-3 mr-1" />
                  Talent Metrics
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={geniusFactorData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient
                      id="colorGenius"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#9333ea"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="range"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#9333ea"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGenius)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">
                    {Math.max(...geniusFactorData.map((d) => d.count))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Peak in 61-80 range
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-600/5 to-transparent rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {geniusFactorData.reduce((a, b) => a + b.count, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total assessments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retention Risk & Mobility Trend */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-success/5 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="h-5 w-5 text-success" />
                    Retention Risk Overview
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Risk distribution across departments
                  </CardDescription>
                </div>
                <Badge className="badge-green">
                  <Shield className="h-3 w-3 mr-1" />
                  Low Risk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={retentionRiskData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="range"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Employees" radius={[6, 6, 0, 0]}>
                    {retentionRiskData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Internal Mobility Trend */}
          <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-warning/5 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <LineChartIcon className="h-5 w-5 text-warning" />
                    Internal Mobility Trend
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Monthly movement across departments
                  </CardDescription>
                </div>
                <Badge className="badge-amber">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Growing
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mobilityTrendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {departmentData.slice(0, 3).map((dept: any) => (
                    <Line
                      key={dept.name}
                      type="monotone"
                      dataKey={dept.name}
                      stroke={departmentColors[dept.name]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Department Analytics & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Department Score Averages */}
          <Card className="card-primary card-hover border-0 shadow-xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">
                Department Score Analytics
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Comprehensive metrics across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                        Department
                      </th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                        Genius Factor
                      </th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                        Retention Risk
                      </th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                        Productivity
                      </th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                        Engagement
                      </th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentAverages.map((dept, index) => (
                      <tr
                        key={index}
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: getDepartmentColor(
                                  dept.department
                                ),
                              }}
                            />
                            {dept.department}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-600"
                                style={{
                                  width: `${dept.genius_factor_score}%`,
                                }}
                              />
                            </div>
                            <span className="font-bold">
                              {dept.genius_factor_score}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`${
                              dept.retention_risk_score <= 30
                                ? "badge-green"
                                : dept.retention_risk_score <= 60
                                ? "badge-amber"
                                : "badge-red"
                            }`}
                          >
                            {dept.retention_risk_score}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-success to-green-400"
                                style={{ width: `${dept.productivity_score}%` }}
                              />
                            </div>
                            <span className="font-bold">
                              {dept.productivity_score}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-warning to-amber-400"
                                style={{ width: `${dept.engagement_score}%` }}
                              />
                            </div>
                            <span className="font-bold">
                              {dept.engagement_score}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {dept.genius_factor_score >= 75 ? (
                            <Badge className="badge-green">
                              High Potential
                            </Badge>
                          ) : dept.genius_factor_score >= 50 ? (
                            <Badge className="badge-blue">Developing</Badge>
                          ) : (
                            <Badge className="badge-amber">Needs Support</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Top Departments */}
          <Card className="quick-actions-card border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-white/70">
                Frequently used HR tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  icon: Users,
                  label: "Employee",
                  color: "bg-blue-500/20",
                  link: "/hr-dashboard/employees",
                },
                {
                  icon: Award,
                  label: "Assessments",
                  color: "bg-purple-500/20",
                  link: "/hr-dashboard/assessments",
                },
                {
                  icon: AlertTriangle,
                  label: "Retention Risk",
                  color: "bg-amber-500/20",
                  link: "/hr-dashboard/retention-risk",
                },
                {
                  icon: Target,
                  label: "Internal Mobility",
                  color: "bg-green-500/20",
                  link: "/hr-dashboard/internal-mobility",
                },
                {
                  icon: Zap,
                  label: "Department Insights",
                  color: "bg-primary/20",
                  link: "/hr-dashboard/departments",
                },
              ].map((action, index) => (
                <Link
                  key={index}
                  href={action.link}
                  className="quick-action-item w-full text-left flex items-center gap-3 p-3 hover:scale-[1.02] transition-transform"
                >
                  <div
                    className={`${action.color} h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-medium">{action.label}</span>
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-white/20">
                <h4 className="text-white font-medium mb-3">
                  Top Performing Departments
                </h4>
                <div className="space-y-2">
                  {topPerformers.map((dept, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20"
                              : "bg-white/10"
                          }`}
                        >
                          <span className="text-white font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-white text-sm">{dept.name}</span>
                      </div>
                      <Badge className="bg-white/20 text-white border-0">
                        {dept.completion}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Status */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Data is {isConnected ? "live" : "demo"}</span>
            </div>
            <span>•</span>
            <span>{departmentData.length} departments analyzed</span>
            <span>•</span>
            <span>{totalEmployees} employees in system</span>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            Export Report <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </HRLayout>
  );
}
