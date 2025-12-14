"use client";

import { HRLayout } from "@/components/admin/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingDown,
  AlertTriangle,
  Shield,
  Users,
  Building2,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  Filter,
  Download,
  MoreHorizontal,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";
import { useSocket } from "@/context/SocketContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function RiskAnalysis() {
  const { dashboardData, isAdmin } = useSocket();

  const [selectedHR, setSelectedHR] = useState<string | null>(null);

  // Extract data from dashboardData
  const overallMetrics = dashboardData?.overallMetrics || {};
  const riskAnalysisByHr = dashboardData?.chartData?.risk_analysis_by_hr || {};
  const hrDepartmentChartData =
    dashboardData?.chartData?.hr_department_chart_data || {};
  const employeeRiskDetails = dashboardData?.employeeRiskDetails || [];
  const departmentMetrics = dashboardData?.departmentMetrics || {};
  const hrMetrics = dashboardData?.hrMetrics || {};

  // Create HR list with full names
  const hrList = useMemo(() => {
    if (!riskAnalysisByHr) return [];

    return Object.entries(riskAnalysisByHr).map(
      ([hrId, hrData]: [string, any]) => ({
        id: hrId,
        fullName:
          hrData.full_name ||
          `${hrData.first_name} ${hrData.last_name}` ||
          hrId,
      })
    );
  }, [riskAnalysisByHr]);

  // Get selected HR name for display
  const selectedHRName = useMemo(() => {
    if (!selectedHR) return "All HRs";

    const hrData = riskAnalysisByHr?.[selectedHR];
    if (hrData) {
      return (
        hrData.full_name ||
        `${hrData.first_name} ${hrData.last_name}` ||
        selectedHR
      );
    }
    return selectedHR;
  }, [selectedHR, riskAnalysisByHr]);

  // Create a map of HR ID to full name for quick lookup
  const hrNameMap = useMemo(() => {
    const map: { [key: string]: string } = {};
    Object.entries(riskAnalysisByHr).forEach(
      ([hrId, hrData]: [string, any]) => {
        map[hrId] =
          hrData.full_name ||
          `${hrData.first_name} ${hrData.last_name}` ||
          hrId;
      }
    );
    return map;
  }, [riskAnalysisByHr]);

  // Risk distribution based on selected HR
  const riskDistribution =
    selectedHR && riskAnalysisByHr?.[selectedHR]
      ? riskAnalysisByHr[selectedHR].risk_distribution || {
          "Low (0-30)": 0,
          "Medium (31-60)": 0,
          "High (61-100)": 0,
        }
      : overallMetrics.retention_risk_distribution || {
          "Low (0-30)": 0,
          "Medium (31-60)": 0,
          "High (61-100)": 0,
        };

  // Calculate risk counts
  const highRiskEmployeesCount = riskDistribution["High (61-100)"] || 0;
  const mediumRiskEmployeesCount = riskDistribution["Medium (31-60)"] || 0;
  const lowRiskEmployeesCount = riskDistribution["Low (0-30)"] || 0;
  const totalEmployees =
    highRiskEmployeesCount + mediumRiskEmployeesCount + lowRiskEmployeesCount;

  // Filter employees by risk level
  const highRiskEmployees = employeeRiskDetails.filter(
    (e: any) => e.risk_category === "High"
  );
  const mediumRiskEmployees = employeeRiskDetails.filter(
    (e: any) => e.risk_category === "Medium"
  );
  const lowRiskEmployees = employeeRiskDetails.filter(
    (e: any) => e.risk_category === "Low"
  );

  // Prepare data for Risk Distribution PieChart
  const riskDistributionData = [
    { name: "Low Risk", value: lowRiskEmployeesCount, color: "#10b981" },
    { name: "Medium Risk", value: mediumRiskEmployeesCount, color: "#f59e0b" },
    { name: "High Risk", value: highRiskEmployeesCount, color: "#ef4444" },
  ];

  // Prepare data for Risk by Department BarChart
  const departmentRiskData = useMemo(() => {
    if (selectedHR && hrDepartmentChartData?.[selectedHR]?.departments) {
      return Object.entries(hrDepartmentChartData[selectedHR].departments).map(
        ([dept, metrics]: [string, any]) => ({
          name: dept,
          riskPercentage: metrics.avg_retention_risk || 0,
          employeeCount: metrics.employee_count || 0,
        })
      );
    } else if (!selectedHR && departmentMetrics) {
      return Object.entries(departmentMetrics).map(
        ([dept, metrics]: [string, any]) => ({
          name: dept,
          riskPercentage: metrics.avg_retention_risk || 0,
          employeeCount: metrics.employee_count || 0,
        })
      );
    }
    return [];
  }, [selectedHR, hrDepartmentChartData, departmentMetrics]);

  // Prepare data for Assessment Trends LineChart
  const trendData = useMemo(() => {
    const data: any[] = [];
    Object.values(riskAnalysisByHr).forEach((hrData: any) => {
      if (hrData.monthly_trend) {
        Object.entries(hrData.monthly_trend).forEach(
          ([month, count]: [string, any]) => {
            const existingMonth = data.find((item) => item.month === month);
            if (existingMonth) {
              existingMonth.reports += count;
            } else {
              data.push({ month, reports: count });
            }
          }
        );
      }
    });
    return data.sort((a, b) => {
      const [aYear, aMonth] = a.month.split("-").map(Number);
      const [bYear, bMonth] = b.month.split("-").map(Number);
      return aYear - bYear || aMonth - bMonth;
    });
  }, [riskAnalysisByHr]);

  // Auto-select first HR after data loads
  useMemo(() => {
    if (
      dashboardData &&
      riskAnalysisByHr &&
      Object.keys(riskAnalysisByHr).length > 0 &&
      hrList.length > 0
    ) {
      const firstHrId = hrList[0].id;
      if (selectedHR === null) {
        setSelectedHR(firstHrId);
      }
    }
  }, [dashboardData, riskAnalysisByHr, selectedHR, hrList]);

  const getRiskBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "badge-green";
      case "medium":
        return "badge-amber";
      case "high":
        return "badge-blue";
      default:
        return "badge-blue";
    }
  };

  // Helper function to get HR full name
  const getHRFullName = (hrId: string) => {
    return hrNameMap[hrId] || hrId;
  };

  // Helper function to get employee full name with ID
  const getEmployeeDisplayName = (employee: any) => {
    const fullName = employee.employee_full_name || "Unknown Employee";
    const employeeId = employee.employee_id || "";
    return employeeId ? `${fullName} (ID: ${employeeId})` : fullName;
  };

  const highRiskPercentage =
    totalEmployees > 0
      ? Math.round((highRiskEmployeesCount / totalEmployees) * 100)
      : 0;

  return (
    <HRLayout
      title="Retention Risk Analysis"
      subtitle="Identify and manage employee retention risks across all companies"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Risk Analysis
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor and mitigate retention risks across all organizations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hover:bg-muted">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="btn-gradient-primary">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Admin Filter */}
        {isAdmin && (
          <Card className="card-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-blue p-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      Admin View: Risk Analysis
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Viewing data for {selectedHRName}
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
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select HR Manager" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All HR Managers</SelectItem>
                    {hrList.map((hr) => (
                      <SelectItem key={hr.id} value={hr.id}>
                        {hr.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  High Risk
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {highRiskEmployeesCount}
                </h3>
                <div className="mt-2">
                  <Progress
                    value={highRiskPercentage}
                    className="progress-bar-primary h-2"
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {highRiskPercentage}% of total
                  </span>
                </div>
              </div>
              <div className="icon-wrapper-blue">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Medium Risk
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {mediumRiskEmployeesCount}
                </h3>
                <Badge className="badge-amber mt-2">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Monitor closely
                </Badge>
              </div>
              <div className="icon-wrapper-amber">
                <TrendingDown className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Low Risk
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {lowRiskEmployeesCount}
                </h3>
                <Badge className="badge-green mt-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Stable retention
                </Badge>
              </div>
              <div className="icon-wrapper-green">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Risk
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {overallMetrics.avg_retention_risk || 0}%
                </h3>
                <Badge className="badge-purple mt-2">
                  <Users className="h-3 w-3 mr-1" />
                  {selectedHR ? selectedHRName : "All companies"}
                </Badge>
              </div>
              <div className="icon-wrapper-purple">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Risk Distribution Pie Chart */}
          <Card className="card-primary card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="icon-wrapper-purple p-2">
                  <PieChartIcon className="h-4 w-4" />
                </div>
                Risk Distribution
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} employees`, ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-6 flex-wrap">
                {riskDistributionData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Trends Line Chart */}
          <Card className="card-primary card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="icon-wrapper-green p-2">
                  <TrendingUp className="h-4 w-4" />
                </div>
                Assessment Trends
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value) => [`${value} reports`, ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Reports"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Risk Chart */}
        <Card className="card-primary card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="icon-wrapper-blue p-2">
                <BarChart3 className="h-4 w-4" />
              </div>
              Risk by Department
            </CardTitle>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </CardHeader>
          <CardContent>
            {departmentRiskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentRiskData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Risk Level"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    cursor={false}
                  />
                  <Bar
                    dataKey="riskPercentage"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  No department risk data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* High Risk Employees Table */}
        <Card className="card-primary card-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="icon-wrapper-blue p-2">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                High Risk Employees
                <Badge className="badge-blue ml-2">
                  {highRiskEmployees.length}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="hover:bg-muted">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>HR Manager</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRiskEmployees.slice(0, 5).map((employee: any) => (
                  <TableRow
                    key={employee.report_id || employee.employee_id}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="sidebar-user-avatar h-8 w-8 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {employee.employee_full_name?.charAt(0) || "E"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {getEmployeeDisplayName(employee)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {employee.created_at}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {employee.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getHRFullName(
                        employee.hr_id || employee.hr_manager_id || ""
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-destructive">
                          {employee.risk_score}%
                        </span>
                        <Progress
                          value={employee.risk_score}
                          className="w-20 h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getRiskBadgeVariant(employee.risk_category)}
                      >
                        {employee.risk_category} risk
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {highRiskEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-8 w-8 text-green-600" />
                        <div className="text-muted-foreground">
                          No high-risk employees found
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Risk Factors & Interventions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Common Risk Factors */}
          <Card className="card-primary card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="icon-wrapper-amber p-2">
                  <Zap className="h-4 w-4" />
                </div>
                Common Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    factor: "Low Assessment Score",
                    weight: "High",
                    impact: 92,
                    color: "blue",
                  },
                  {
                    factor: "Skill-Role Mismatch",
                    weight: "High",
                    impact: 88,
                    color: "blue",
                  },
                  {
                    factor: "Limited Growth Opportunities",
                    weight: "Medium",
                    impact: 75,
                    color: "amber",
                  },
                  {
                    factor: "Below Market Compensation",
                    weight: "High",
                    impact: 85,
                    color: "blue",
                  },
                  {
                    factor: "Low Engagement",
                    weight: "Medium",
                    impact: 68,
                    color: "amber",
                  },
                ].map((factor, index) => (
                  <div
                    key={index}
                    className="assessment-item p-3 group hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {factor.factor}
                      </h4>
                      <Badge
                        className={cn(
                          factor.weight === "High"
                            ? "badge-blue"
                            : "badge-amber",
                          "text-xs"
                        )}
                      >
                        {factor.weight} Impact
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Affected: {factor.impact}%
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Interventions */}
          <Card className="card-primary card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="icon-wrapper-green p-2">
                  <Target className="h-4 w-4" />
                </div>
                Recommended Interventions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-600 mb-2">
                    Immediate Actions
                  </h4>
                  <ul className="text-sm space-y-1 text-foreground">
                    <li>• Schedule 1-on-1 meetings with high-risk employees</li>
                    <li>• Review compensation packages</li>
                    <li>• Assess role fit and satisfaction</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg">
                  <h4 className="font-medium text-amber-600 mb-2">
                    Short-term (1-3 months)
                  </h4>
                  <ul className="text-sm space-y-1 text-foreground">
                    <li>• Implement skill development programs</li>
                    <li>• Create advancement pathways</li>
                    <li>• Increase recognition programs</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg">
                  <h4 className="font-medium text-green-600 mb-2">
                    Long-term (3+ months)
                  </h4>
                  <ul className="text-sm space-y-1 text-foreground">
                    <li>• Establish mentorship programs</li>
                    <li>• Regular career planning sessions</li>
                    <li>• Enhanced benefits packages</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HRLayout>
  );
}
