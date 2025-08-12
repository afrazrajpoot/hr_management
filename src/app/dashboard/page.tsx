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
import {
  mockCompanies,
  mockEmployees,
  mockAssessments,
  companiesOverviewData,
  retentionRiskData,
  assessmentCompletionData,
  mobilityData,
} from "@/lib/mock-data";

export default function HROverview() {
  const router = useRouter();

  const totalCompanies = mockCompanies.length;
  const totalEmployees = mockCompanies.reduce(
    (sum, company) => sum + company.employeeCount,
    0
  );
  const totalAssessments = mockAssessments.length;
  const averageRisk = Math.round(
    mockCompanies.reduce((sum, company) => sum + company.retentionRisk, 0) /
      mockCompanies.length
  );

  return (
    <HRLayout
      title="HR Dashboard Overview"
      subtitle="Comprehensive analytics across all companies and employees"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Companies"
            value={totalCompanies}
            description="Connected organizations"
            icon={<Building2 className="h-4 w-4" />}
            trend={{ value: 12, label: "vs last month", isPositive: true }}
            onClick={() => router.push("/hr-dashboard/companies")}
          />
          <StatCard
            title="Total Employees"
            value={totalEmployees.toLocaleString()}
            description="Across all companies"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 8, label: "vs last month", isPositive: true }}
            onClick={() => router.push("/hr-dashboard/employees")}
          />
          <StatCard
            title="Assessments Completed"
            value={totalAssessments}
            description="This month"
            icon={<ClipboardList className="h-4 w-4" />}
            trend={{ value: 23, label: "vs last month", isPositive: true }}
            onClick={() => router.push("/hr-dashboard/assessments")}
          />
          <StatCard
            title="Average Risk Level"
            value={`${averageRisk}%`}
            description="Retention risk"
            icon={<TrendingDown className="h-4 w-4" />}
            trend={{ value: 3, label: "vs last month", isPositive: false }}
            onClick={() => router.push("/hr-dashboard/risk-analysis")}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-hr-primary" />
                Companies & Employee Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={companiesOverviewData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
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
                    dataKey="companies"
                    stroke="hsl(var(--hr-primary))"
                    strokeWidth={3}
                    name="Companies"
                  />
                  <Line
                    type="monotone"
                    dataKey="employees"
                    stroke="hsl(var(--hr-secondary))"
                    strokeWidth={3}
                    name="Employees"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-hr-risk-medium" />
                Retention Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={retentionRiskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {retentionRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => ["" + value + "%", "Employees"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {retentionRiskData.map((item, index) => (
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
                <ClipboardList className="h-5 w-5 text-hr-accent" />
                Assessment Completion Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assessmentCompletionData} layout="horizontal">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    dataKey="company"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    width={80}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      value as any,
                      name === "completed" ? "Completed" : "Total",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" />
                  <Bar
                    dataKey="completed"
                    fill="hsl(var(--hr-accent))"
                    name="Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-success" />
                Internal Mobility Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mobilityData}>
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
                    dataKey="promotions"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    name="Promotions"
                  />
                  <Line
                    type="monotone"
                    dataKey="transfers"
                    stroke="hsl(var(--hr-secondary))"
                    strokeWidth={2}
                    name="Transfers"
                  />
                  <Line
                    type="monotone"
                    dataKey="exits"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    name="Exits"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </HRLayout>
  );
}
