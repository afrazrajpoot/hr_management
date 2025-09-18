"use client";

import { HRLayout } from "@/components/admin/layout/admin-layout";
import { StatCard } from "@/components/admin/ui/stat-card";
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
        return "default" as const;
      case "medium":
        return "secondary" as const;
      case "high":
        return "destructive" as const;
      default:
        return "default" as const;
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

  return (
    <HRLayout
      title="Retention Risk Analysis"
      subtitle="Identify and manage employee retention risks across all companies"
    >
      <div className="space-y-6">
        {isAdmin && (
          <div className="card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Admin View: Risk Analysis
                </span>
              </div>
              <Select
                value={selectedHR || "all"}
                onValueChange={(value) =>
                  setSelectedHR(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select HR Manager" />
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
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="High Risk Employees"
            value={highRiskEmployeesCount}
            description="Require immediate attention"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <StatCard
            title="Medium Risk Employees"
            value={mediumRiskEmployeesCount}
            description="Monitor closely"
            icon={<TrendingDown className="h-4 w-4" />}
          />
          <StatCard
            title="Low Risk Employees"
            value={lowRiskEmployeesCount}
            description="Stable retention"
            icon={<Shield className="h-4 w-4" />}
          />
          <StatCard
            title="Average Risk"
            value={`${overallMetrics.avg_retention_risk || 0}%`}
            description={
              selectedHR ? `For ${selectedHRName}` : "Across all companies"
            }
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-hr-risk-medium" />
                {selectedHR
                  ? "Risk Distribution"
                  : "Risk Distribution Across All HRs"}
              </CardTitle>
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
              <div className="flex justify-center gap-4 mt-4">
                {riskDistributionData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-hr-primary" />
                Assessment Trends Over Time
              </CardTitle>
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

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-hr-secondary" />
              {selectedHR
                ? "Risk by Department"
                : "Risk by Department Across All HRs"}
            </CardTitle>
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
                <p className="text-gray-500 dark:text-gray-400">
                  No department risk data available for {selectedHRName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-hr-risk-high" />
              High Risk Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>{" "}
                  {/* UNCOMMENTED - Now showing employee name */}
                  <TableHead>Department</TableHead>
                  <TableHead>HR Manager</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Risk Factors</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRiskEmployees.slice(0, 10).map((employee: any) => (
                  <TableRow key={employee.report_id || employee.employee_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {/* UPDATED: Now shows employee full name with ID */}
                          {getEmployeeDisplayName(employee)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: {employee.created_at}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="font-medium">
                      {getHRFullName(
                        employee.hr_id || employee.hr_manager_id || ""
                      )}
                    </TableCell>
                    <TableCell>{employee.risk_score}%</TableCell>
                    <TableCell>
                      <Badge
                        variant={getRiskBadgeVariant(employee.risk_category)}
                      >
                        {employee.risk_category} risk
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {employee.risk_factors
                          ?.slice(0, 3)
                          .map((factor: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {factor}
                            </Badge>
                          ))}
                        {employee.risk_factors?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{employee.risk_factors.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {highRiskEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="text-muted-foreground">
                        No high-risk employees found. All employees are stable.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-hr-accent" />
              Common Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  factor: "Low Assessment Score",
                  weight: "High",
                  description: "Employees with scores below 70",
                },
                {
                  factor: "Skill-Role Mismatch",
                  weight: "High",
                  description: "Skills not aligned with current role",
                },
                {
                  factor: "Limited Growth Opportunities",
                  weight: "Medium",
                  description: "Few advancement paths available",
                },
                {
                  factor: "Below Market Compensation",
                  weight: "High",
                  description: "Salary below industry average",
                },
                {
                  factor: "Low Engagement",
                  weight: "Medium",
                  description: "Poor participation in company initiatives",
                },
              ].map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{factor.factor}</h4>
                    <p className="text-sm text-muted-foreground">
                      {factor.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        factor.weight === "High" ? "destructive" : "secondary"
                      }
                    >
                      {factor.weight} Impact
                    </Badge>
                    <Button variant="outline" size="sm">
                      Analyze
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-hr-primary" />
              Recommended Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 bg-hr-risk-high/10 border border-hr-risk-high/20 rounded-lg">
                <h4 className="font-medium text-hr-risk-high mb-2">
                  Immediate Actions
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Schedule 1-on-1 meetings with high-risk employees</li>
                  <li>• Review compensation packages</li>
                  <li>• Assess role fit and satisfaction</li>
                </ul>
              </div>
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <h4 className="font-medium text-warning mb-2">
                  Short-term (1-3 months)
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Implement skill development programs</li>
                  <li>• Create advancement pathways</li>
                  <li>• Increase recognition programs</li>
                </ul>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <h4 className="font-medium text-success mb-2">
                  Long-term (3+ months)
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Establish mentorship programs</li>
                  <li>• Regular career planning sessions</li>
                  <li>• Enhanced benefits packages</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
