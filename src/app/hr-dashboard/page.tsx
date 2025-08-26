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
import { Progress } from "@/components/ui/progress";
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

// Fallback mock data for dashboard analytics
const mockDepartmentData = [
  { name: "Finance", completion: 85, color: "hsl(var(--hr-chart-1))" },
  { name: "Sales", completion: 92, color: "hsl(var(--hr-chart-2))" },
  { name: "Marketing", completion: 78, color: "hsl(var(--hr-chart-3))" },
  { name: "IT", completion: 95, color: "hsl(var(--hr-chart-4))" },
  { name: "Human Resources", completion: 88, color: "hsl(var(--hr-chart-5))" },
  { name: "Customer Support", completion: 82, color: "#8B5CF6" },
  { name: "Operations", completion: 90, color: "#06B6D4" },
  { name: "Design/Creative", completion: 94, color: "#F59E0B" },
];

// Mock data for other charts
const retentionRiskData = mockDepartmentData.map((dept) => ({
  department: dept.name,
  lowRisk: dept.completion >= 90 ? 20 : dept.completion >= 80 ? 15 : 10,
  mediumRisk: dept.completion >= 80 ? 5 : 10,
  highRisk: dept.completion < 80 ? 5 : 0,
  fill: dept.color,
}));

const mobilityTrendData = [
  {
    month: "Jan",
    Finance: 2,
    Sales: 3,
    Marketing: 1,
    IT: 2,
    "Human Resources": 1,
    "Customer Support": 2,
    Operations: 1,
    "Design/Creative": 1,
  },
  {
    month: "Feb",
    Finance: 1,
    Sales: 4,
    Marketing: 2,
    IT: 1,
    "Human Resources": 0,
    "Customer Support": 1,
    Operations: 2,
    "Design/Creative": 1,
  },
  {
    month: "Mar",
    Finance: 3,
    Sales: 5,
    Marketing: 1,
    IT: 3,
    "Human Resources": 2,
    "Customer Support": 3,
    Operations: 2,
    "Design/Creative": 2,
  },
  {
    month: "Apr",
    Finance: 2,
    Sales: 3,
    Marketing: 3,
    IT: 2,
    "Human Resources": 1,
    "Customer Support": 2,
    Operations: 1,
    "Design/Creative": 1,
  },
  {
    month: "May",
    Finance: 4,
    Sales: 6,
    Marketing: 2,
    IT: 4,
    "Human Resources": 1,
    "Customer Support": 3,
    Operations: 3,
    "Design/Creative": 2,
  },
  {
    month: "Jun",
    Finance: 3,
    Sales: 7,
    Marketing: 3,
    IT: 5,
    "Human Resources": 2,
    "Customer Support": 4,
    Operations: 2,
    "Design/Creative": 3,
  },
];

const engagementDistribution = [
  { range: "90-100%", count: 42, fill: "hsl(var(--hr-chart-2))" },
  { range: "80-89%", count: 68, fill: "hsl(var(--hr-chart-1))" },
  { range: "70-79%", count: 25, fill: "hsl(var(--hr-chart-3))" },
  { range: "60-69%", count: 4, fill: "hsl(var(--hr-chart-5))" },
];

const StatCard = ({ title, value, change, icon: Icon, trend = "up" }: any) => (
  <Card className="hr-card">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold">{value}</span>
            <Badge
              variant={trend === "up" ? "default" : "secondary"}
              className="gap-1"
            >
              <ArrowUpRight className="h-3 w-3" />
              {change}
            </Badge>
          </div>
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DepartmentCard = ({ dept }: any) => {
  const getRiskColor = (risk: any) => {
    switch (risk) {
      case "Low":
        return "bg-success text-success-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "High":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Mock retention based on completion
  const retention =
    dept.completion >= 90 ? "Low" : dept.completion >= 80 ? "Medium" : "High";

  return (
    <Card className="hr-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{dept.name}</CardTitle>
          <Badge className={getRiskColor(retention)}>{retention} Risk</Badge>
        </div>
        <CardDescription>Employees not available</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Assessment Completion</span>
            <span className="font-medium">{dept.completion}%</span>
          </div>
          <Progress value={dept.completion} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const { socket, isConnected, dashboardData } = useSocket();
  const { data: session } = useSession();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Use dashboardData or fallback to mockDepartmentData
  const displayData = dashboardData || mockDepartmentData;

  // Calculate derived data for charts
  const derivedRetentionRiskData = displayData.map((dept) => ({
    department: dept.name,
    lowRisk: dept.completion >= 90 ? 20 : dept.completion >= 80 ? 15 : 10,
    mediumRisk: dept.completion >= 80 ? 5 : 10,
    highRisk: dept.completion < 80 ? 5 : 0,
    fill: dept.color,
  }));

  const derivedSkillsAlignmentData = displayData.map((dept) => ({
    department: dept.name,
    alignment: dept.completion,
    fill: dept.color,
  }));

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
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value="177"
            change="+5.2%"
            icon={Users}
          />
          <StatCard
            title="Assessment Completion"
            value={`${Math.round(
              displayData.reduce((sum, dept) => sum + dept.completion, 0) /
                Math.max(displayData.length, 1)
            )}%`}
            change="+12.3%"
            icon={Target}
          />
          <StatCard
            title="Avg Genius Factor"
            value="84.2"
            change="+3.1%"
            icon={Award}
          />
          <StatCard
            title="Retention Risk"
            value="24%"
            change="-8.4%"
            icon={AlertTriangle}
            trend="down"
          />
        </div>

        {/* Comprehensive Charts Grid */}
        <div className="grid gap-6">
          {/* Row 1: Assessment Completion Rate */}
          <Card className="hr-card">
            <CardHeader>
              <CardTitle>1. Assessment Completion Rate by Department</CardTitle>
              <CardDescription>
                Percentage of employees who completed their career assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={displayData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  key={lastUpdate?.getTime()}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Completion Rate"]}
                  />
                  <Bar
                    dataKey="completion"
                    fill="hsl(var(--hr-chart-1))"
                    name="Completion Rate"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Row 2: Two charts side by side */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Genius Factor Distribution */}
            <Card className="hr-card">
              <CardHeader>
                <CardTitle>2. Genius Factor Score Distribution</CardTitle>
                <CardDescription>
                  Using completion as placeholder for Genius Factor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart key={lastUpdate?.getTime()}>
                    <Pie
                      data={displayData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, completion }) => `${name}: ${completion}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="completion"
                    >
                      {displayData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}/100`, "Completion"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Productivity Distribution */}
            <Card className="hr-card">
              <CardHeader>
                <CardTitle>3. Productivity Score Distribution</CardTitle>
                <CardDescription>
                  Using completion as placeholder for Productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={displayData} key={lastUpdate?.getTime()}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) => [`${value}/100`, "Completion"]}
                    />
                    <Bar
                      dataKey="completion"
                      fill="hsl(var(--hr-chart-3))"
                      name="Completion"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Two charts side by side */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Engagement Distribution */}
            <Card className="hr-card">
              <CardHeader>
                <CardTitle>4. Engagement Score Distribution</CardTitle>
                <CardDescription>
                  Employee engagement levels (mock data)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={engagementDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, count }) => `${range}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {engagementDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skills-Job Alignment */}
            <Card className="hr-card">
              <CardHeader>
                <CardTitle>5. Skills-Job Alignment Score</CardTitle>
                <CardDescription>
                  Using completion as placeholder for Skills Alignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart key={lastUpdate?.getTime()}>
                    <Pie
                      data={derivedSkillsAlignmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ department, alignment }) =>
                        `${department}: ${alignment}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="alignment"
                    >
                      {derivedSkillsAlignmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}/100`, "Alignment"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Row 4: Two charts side by side */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Retention Risk Distribution */}
            <Card className="hr-card">
              <CardHeader>
                <CardTitle>6. Retention Risk Distribution</CardTitle>
                <CardDescription>
                  Employee retention risk (mock data)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={derivedRetentionRiskData}
                    key={lastUpdate?.getTime()}
                  >
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
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="lowRisk"
                      stackId="a"
                      fill="hsl(var(--hr-chart-2))"
                      name="Low Risk"
                    />
                    <Bar
                      dataKey="mediumRisk"
                      stackId="a"
                      fill="hsl(var(--hr-chart-3))"
                      name="Medium Risk"
                    />
                    <Bar
                      dataKey="highRisk"
                      stackId="a"
                      fill="hsl(var(--hr-chart-5))"
                      name="High Risk"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Internal Mobility Trend */}
            <Card className="hr-card">
              <CardHeader>
                <CardTitle>7. Internal Mobility Trend</CardTitle>
                <CardDescription>
                  Monthly internal movements (mock data)
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
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Finance"
                      stroke="hsl(var(--hr-chart-1))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Sales"
                      stroke="hsl(var(--hr-chart-2))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Marketing"
                      stroke="hsl(var(--hr-chart-3))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="IT"
                      stroke="hsl(var(--hr-chart-4))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Department Cards Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Department Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {displayData.map((dept, index) => (
              <DepartmentCard key={index} dept={dept} />
            ))}
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
