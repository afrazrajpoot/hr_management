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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  Target,
  AlertTriangle,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { dashboardOptions } from "@/app/data";

const getDepartmentColor = (departmentName: string): string => {
  const departmentColors: { [key: string]: string } = {
    // Technology & Development - Premium tech gradients
    "IT": "#667EEA",           // Soft Purple Blue
    "AI": "#764BA2",           // Rich Purple
    "Development": "#5B73DB",  // Electric Blue
    "Security": "#FF6B6B",     // Coral Red

    // Business & Corporate - Luxury business tones
    "Corporate": "#2D3748",    // Charcoal
    "Finance": "#38A169",      // Success Green
    "Sales": "#E53E3E",        // Vibrant Red
    "Leadership": "#D69E2E",   // Gold
    "Strategy": "#4A5568",     // Steel Gray

    // Marketing & Communications - Creative & vibrant
    "Marketing": "#ED64A6",    // Pink
    "Media": "#FF8C42",        // Sunset Orange
    "Content": "#4FD1C7",      // Turquoise
    "Communications": "#4299E1", // Ocean Blue
    "Editorial": "#C05621",    // Warm Brown

    // Healthcare & Wellness - Calming natural tones
    "Healthcare": "#48BB78",   // Healing Green
    "Wellness": "#9AE6B4",     // Mint Green

    // Research & Analytics - Sophisticated purples
    "Research": "#805AD5",     // Amethyst
    "Analytics": "#6B46C1",    // Deep Violet

    // Policy & Sustainability - Earth & eco tones
    "Policy": "#718096",       // Warm Gray
    "Sustainability": "#38A169", // Eco Green

    // Default and fallback colors
    "No Data": "#A0AEC0",      // Soft Gray
    "Unknown": "#718096",      // Neutral Gray
  };

  return departmentColors[departmentName] || "#718096"; // Default neutral for unknown departments
};

// Professional color palette for score ranges
const getScoreRangeColor = (range: string): string => {
  const scoreRangeColors: { [key: string]: string } = {
    // Genius Factor Score Ranges (beautiful gradient progression)
    "0-20": "#FF6B6B",     // Soft Coral (less harsh than red)
    "21-40": "#FFB347",    // Peach Orange
    "41-60": "#FFD93D",    // Sunny Yellow
    "61-80": "#6BCF7F",    // Fresh Green
    "81-100": "#4ECDC4",   // Mint Teal (premium feel)

    // Retention Risk Ranges (sophisticated risk indicators)
    "Low (0-30)": "#51CF66",      // Vibrant Green
    "Medium (31-60)": "#FFD43B",  // Golden Yellow
    "High (61-100)": "#FF8787",   // Soft Red
    "Low": "#51CF66",             // Alternative format
    "Medium": "#FFD43B",          // Alternative format  
    "High": "#FF8787",            // Alternative format
  };

  return scoreRangeColors[range] || "#718096"; // Default neutral for unknown ranges
};

const StatCard = ({ title, value, change, icon: Icon, trend = "up" }: any) => (
  <Card className="card">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold">{value}</span>
            {change && (
              <Badge
                variant={trend === "up" ? "default" : "secondary"}
                className="gap-1"
              >
                <ArrowUpRight className="h-3 w-3" />
                {change}
              </Badge>
            )}
          </div>
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Custom Tooltip for all charts (works for BarChart, LineChart, etc.)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Detect dark mode by checking the 'dark' class on <html>
    const isDark =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");

    return (
      <div
        style={{
          background: isDark ? "#1f2937" : "#fff", // dark: gray-800, light: white
          color: isDark ? "#fff" : "#000",
          border: "1px solid",
          borderColor: isDark ? "#374151" : "#e5e7eb", // dark: gray-700, light: gray-200
          borderRadius: 8,
          padding: "12px 16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          minWidth: 180,
          zIndex: 1000,
        }}
      >
        {label && <div className="font-bold mb-2">{label}</div>}
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ color: entry.color, marginBottom: 4 }}>
            {entry.dataKey || entry.name}:{" "}
            <span className="font-bold">{entry.value}</span>
            {entry.payload && entry.payload.department && (
              <span className="ml-2 text-xs opacity-80">
                ({entry.payload.department})
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Fallback data structure
const fallbackDepartmentData = [
  {
    name: "No Data",
    completion: 0,
    color: "#8884d8",
    employee_count: 0,
    metrics: {
      avg_scores: {
        genius_factor_score: 0,
        retention_risk_score: 0,
        mobility_opportunity_score: 0,
        productivity_score: 0,
        engagement_score: 0,
        skills_alignment_score: 0,
      },
      genius_factor_distribution: {
        "0-20": 0,
        "21-40": 0,
        "41-60": 0,
        "61-80": 0,
        "81-100": 0,
      },
      retention_risk_distribution: {
        "0-20": 0,
        "21-40": 0,
        "41-60": 0,
        "61-80": 0,
        "81-100": 0,
      },
      mobility_trend: {},
    },
  },
];

export default function Dashboard() {
  const { socket, isConnected, dashboardData } = useSocket();

  const { data: session } = useSession();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Use fallback data if no dashboard data
  const hasData =
    dashboardData && Array.isArray(dashboardData) && dashboardData.length > 0;
  const departmentData: any[] = hasData
    ? dashboardData
    : fallbackDepartmentData;

  // Calculate overall metrics from the data structure
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

  // Prepare data for charts with department-specific colors
  const completionData = departmentData.map((dept: any) => ({
    name: dept.name,
    completion: dept.completion,
    color: getDepartmentColor(dept.name),
    employee_count: dept.employee_count,
  }));

  // Fix genius factor data mapping - aggregate by range across all departments
  const geniusFactorData: any[] = [];
  const geniusRangeAggregation: { [key: string]: number } = {};

  // Aggregate counts by range across all departments
  for (const dept of departmentData) {
    const distribution: any = dept.metrics?.genius_factor_distribution || {};
    for (const [range, count] of Object.entries(distribution)) {
      if (typeof count === 'number') {
        geniusRangeAggregation[range] = (geniusRangeAggregation[range] || 0) + count;
      }
    }
  }

  // Convert aggregated data to chart format
  for (const [range, count] of Object.entries(geniusRangeAggregation)) {
    if (count > 0 || !hasData) {
      geniusFactorData.push({
        range,
        count,
        color: getScoreRangeColor(range),
      });
    }
  }

  // If no data, add default ranges for demo
  if (!hasData && geniusFactorData.length === 0) {
    geniusFactorData.push(
      { range: "0-20", count: 1, color: getScoreRangeColor("0-20") },
      { range: "21-40", count: 2, color: getScoreRangeColor("21-40") },
      { range: "41-60", count: 3, color: getScoreRangeColor("41-60") },
      { range: "61-80", count: 2, color: getScoreRangeColor("61-80") },
      { range: "81-100", count: 1, color: getScoreRangeColor("81-100") }
    );
  }

  // Fix retention risk data mapping - aggregate by range across all departments
  const retentionRiskData: any[] = [];
  const riskRangeAggregation: { [key: string]: number } = {};

  // Aggregate counts by range across all departments
  for (const dept of departmentData) {
    const distribution = dept.metrics?.retention_risk_distribution || {};
    for (const [range, count] of Object.entries(distribution)) {
      if (typeof count === 'number') {
        riskRangeAggregation[range] = (riskRangeAggregation[range] || 0) + count;
      }
    }
  }

  // Convert aggregated data to chart format
  for (const [range, count] of Object.entries(riskRangeAggregation)) {
    if (count > 0 || !hasData) {
      retentionRiskData.push({
        range,
        count,
        color: getScoreRangeColor(range),
      });
    }
  }

  // If no data, add default ranges for demo
  if (!hasData && retentionRiskData.length === 0) {
    retentionRiskData.push(
      { range: "Low (0-30)", count: 1, color: getScoreRangeColor("Low (0-30)") },
      { range: "Medium (31-60)", count: 2, color: getScoreRangeColor("Medium (31-60)") },
      { range: "High (61-100)", count: 1, color: getScoreRangeColor("High (61-100)") }
    );
  }

  // Fix mobility trend data - restructure to show by department
  const mobilityTrendData: any[] = [];
  const allMonths = new Set<string>();

  // First, collect all months from all departments
  for (const dept of departmentData) {
    const trend = dept.metrics?.mobility_trend || {};
    for (const month of Object.keys(trend)) {
      allMonths.add(month);
    }
  }

  // If no mobility data, create a default entry
  if (allMonths.size === 0 && !hasData) {
    allMonths.add("Jan");
    allMonths.add("Feb");
    allMonths.add("Mar");
  }

  // Create data structure for each month with department counts
  for (const month of Array.from(allMonths).sort()) {
    const monthData: any = { month };

    for (const dept of departmentData) {
      const count = dept.metrics?.mobility_trend?.[month] || 0;
      monthData[dept.name] = count;
      monthData[`${dept.name}_department`] = dept.name; // Store department name for tooltip
    }

    mobilityTrendData.push(monthData);
  }

  // Fix department averages mapping
  const departmentAverages = departmentData.map((dept: any) => ({
    department: dept.name,
    genius_factor_score: dept.metrics?.avg_scores?.genius_factor_score || 0,
    retention_risk_score: dept.metrics?.avg_scores?.retention_risk_score || 0,
    mobility_opportunity_score:
      dept.metrics?.avg_scores?.mobility_opportunity_score || 0,
    productivity_score: dept.metrics?.avg_scores?.productivity_score || 0,
    engagement_score: dept.metrics?.avg_scores?.engagement_score || 0,
    skills_alignment_score:
      dept.metrics?.avg_scores?.skills_alignment_score || 0,
  }));

  // Define colors for each department using the professional color palette
  const departmentColors = departmentData.reduce((acc: any, dept: any) => {
    acc[dept.name] = getDepartmentColor(dept.name);
    return acc;
  }, {});

  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
            <p className="text-muted-foreground">
              Complete analytics breakdown across all departments
            </p>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {!hasData && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800"
              >
                Using Demo Data
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            icon={Users}
          />
          <StatCard
            title="Avg Genius Factor"
            value={avgGeniusFactor}
            icon={Award}
          />
          <StatCard
            title="Avg Retention Risk"
            value={avgRetentionRisk}
            icon={AlertTriangle}
            trend="down"
          />
          <StatCard
            title="Total Departments"
            value={hasData ? departmentData.length : 0}
            icon={Target}
          />
        </div>

        {/* Comprehensive Charts Grid */}
        <div className="grid gap-6">
          {/* Assessment Completion Rate */}
          <Card className="card">
            <CardHeader>
              <CardTitle>Assessment Completion by Department</CardTitle>
              <CardDescription>
                Number of completed assessments per department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer
                width="100%"
                height={350}
                style={{ background: "transparent" }}
              >
                <BarChart
                  data={completionData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 80,
                  }}
                  className="bg-transparent"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    strokeOpacity={0.5}
                  />

                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={{ stroke: "#d1d5db" }}
                  />

                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={{ stroke: "#d1d5db" }}
                  />

                  <Tooltip content={<CustomTooltip />} cursor={false} />

                  <Bar
                    dataKey="completion"
                    name="Completed Assessments"
                    radius={[6, 6, 0, 0]}
                    strokeWidth={1}
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
            </CardContent>
          </Card>

          {/* Row 2: Two charts side by side */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Genius Factor Distribution */}
            <Card className="card">
              <CardHeader>
                <CardTitle>Genius Factor Score Distribution</CardTitle>
                <CardDescription>
                  Distribution of genius factor scores across departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={geniusFactorData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar
                      dataKey="count"
                      name="Assessments"
                      strokeWidth={1}
                    >
                      {geniusFactorData.map((entry, index) => (
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

            {/* Retention Risk Distribution */}
            <Card className="card">
              <CardHeader>
                <CardTitle>Retention Risk Distribution</CardTitle>
                <CardDescription>
                  Employee retention risk levels by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={retentionRiskData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar
                      dataKey="count"
                      name="Assessments"
                      strokeWidth={1}
                    >
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
          </div>

          {/* Row 3: Two charts side by side */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Department Averages */}
            <Card className="card">
              <CardHeader>
                <CardTitle>Department Score Averages</CardTitle>
                <CardDescription>
                  Average scores across all departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentAverages}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="department"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar
                      dataKey="genius_factor_score"
                      fill="hsl(var(--hr-chart-1))"
                      name="Genius Factor"
                    />
                    <Bar
                      dataKey="retention_risk_score"
                      fill="hsl(var(--hr-chart-3))"
                      name="Retention Risk"
                    />
                    <Bar
                      dataKey="mobility_opportunity_score"
                      fill="hsl(var(--hr-chart-2))"
                      name="Mobility Opportunity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Internal Mobility Trend */}
            <Card className="card">
              <CardHeader>
                <CardTitle>Internal Mobility Trend</CardTitle>
                <CardDescription>
                  Monthly assessment completions by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mobilityTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Legend />
                    {departmentData.map((dept: any) => (
                      <Line
                        key={dept.name}
                        type="monotone"
                        dataKey={dept.name}
                        stroke={departmentColors[dept.name]}
                        strokeWidth={2}
                        name={dept.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
