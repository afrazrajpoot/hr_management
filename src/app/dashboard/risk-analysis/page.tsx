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
import { mockEmployees, mockCompanies } from "@/lib/mock-data";

export default function RiskAnalysis() {
  const highRiskEmployees = mockEmployees.filter((e) => e.riskLevel === "high");
  const mediumRiskEmployees = mockEmployees.filter(
    (e) => e.riskLevel === "medium"
  );
  const lowRiskEmployees = mockEmployees.filter((e) => e.riskLevel === "low");

  const riskDistributionData = [
    { name: "Low Risk", value: lowRiskEmployees.length, color: "#10b981" },
    {
      name: "Medium Risk",
      value: mediumRiskEmployees.length,
      color: "#f59e0b",
    },
    { name: "High Risk", value: highRiskEmployees.length, color: "#ef4444" },
  ];

  const companyRiskData = mockCompanies.map((company) => ({
    name: company.name,
    riskPercentage: company.retentionRisk,
    employeeCount: company.employeeCount,
  }));

  const riskTrendData = [
    { month: "Jan", high: 8, medium: 15, low: 77 },
    { month: "Feb", high: 12, medium: 18, low: 70 },
    { month: "Mar", high: 10, medium: 22, low: 68 },
    { month: "Apr", high: 15, medium: 20, low: 65 },
    { month: "May", high: 18, medium: 25, low: 57 },
  ];

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
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

  const getCompanyName = (companyId: string) => {
    return (
      mockCompanies.find((c) => c.id === companyId)?.name || "Unknown Company"
    );
  };

  return (
    <HRLayout
      title="Retention Risk Analysis"
      subtitle="Identify and manage employee retention risks across all companies"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="High Risk Employees"
            value={highRiskEmployees.length}
            description="Require immediate attention"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <StatCard
            title="Medium Risk Employees"
            value={mediumRiskEmployees.length}
            description="Monitor closely"
            icon={<TrendingDown className="h-4 w-4" />}
          />
          <StatCard
            title="Low Risk Employees"
            value={lowRiskEmployees.length}
            description="Stable retention"
            icon={<Shield className="h-4 w-4" />}
          />
          <StatCard
            title="Average Risk"
            value={`${Math.round(
              mockCompanies.reduce((sum, c) => sum + c.retentionRisk, 0) /
                mockCompanies.length
            )}%`}
            description="Across all companies"
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-hr-risk-medium" />
                Risk Distribution
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
                    formatter={(value) => ["" + value, "Employees"]}
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
                      {item.name}
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
                Risk Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={riskTrendData}>
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
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="High Risk"
                  />
                  <Line
                    type="monotone"
                    dataKey="medium"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Medium Risk"
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Low Risk"
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
              Risk by Company
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyRiskData}>
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
                  formatter={(value) => ["" + value + "%", "Risk Level"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="riskPercentage"
                  fill="#ef4444" // 🔴 red-500 from Tailwind
                  stroke="#b91c1c" // 🔴 darker red for border (optional)
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
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
                  <TableHead>Employee</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Primary Risk Factors</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRiskEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCompanyName(employee.companyId)}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(employee.riskLevel)}>
                        {employee.riskLevel} risk
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          Low Assessment
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          No Promotion
                        </Badge>
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
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-hr-accent" />
              Key Risk Factors
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
                  factor: "Long Tenure Without Promotion",
                  weight: "Medium",
                  description: "3+ years in same position",
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
