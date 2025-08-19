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
import { useEffect, useState } from "react";

export default function HROverview() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);
    const handleChange = (e: any) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener("change", handleChange);
    return () => darkModeMediaQuery.removeEventListener("change", handleChange);
  }, []);

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
          <p className="text-sm" style={{ color: textColor }}>
            {label && `${label}:`}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{
                color: entry.color || textColor,
                margin: "2px 0",
              }}
            >
              {`${entry.name}: ${entry.value}${entry.unit || ""}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            icon={
              <Building2 className="h-4 w-4 dark:text-[#e5e7eb] text-[#1f2937]" />
            }
            trend={{ value: 12, label: "vs last month", isPositive: true }}
            onClick={() => router.push("/hr-dashboard/companies")}
            className=" text-[#1f2937] dark:text-[#e5e7eb] shadow-card"
          />
          <StatCard
            title="Total Employees"
            value={totalEmployees.toLocaleString()}
            description="Across all companies"
            icon={
              <Users className="h-4 w-4 dark:text-[#e5e7eb] text-[#1f2937]" />
            }
            trend={{ value: 8, label: "vs last month", isPositive: true }}
            onClick={() => router.push("/hr-dashboard/employees")}
            className=" text-[#1f2937] dark:text-[#e5e7eb] shadow-card"
          />
          <StatCard
            title="Assessments Completed"
            value={totalAssessments}
            description="This month"
            icon={
              <ClipboardList className="h-4 w-4 dark:text-[#e5e7eb] text-[#1f2937]" />
            }
            trend={{ value: 23, label: "vs last month", isPositive: true }}
            onClick={() => router.push("/hr-dashboard/assessments")}
            className=" text-[#1f2937] dark:text-[#e5e7eb] shadow-card"
          />
          <StatCard
            title="Average Risk Level"
            value={`${averageRisk}%`}
            description="Retention risk"
            icon={
              <TrendingDown className="h-4 w-4 dark:text-[#dc2626] text-[#dc2626]" />
            }
            trend={{ value: 3, label: "vs last month", isPositive: false }}
            onClick={() => router.push("/hr-dashboard/risk-analysis")}
            className=" text-[#1f2937] dark:text-[#e5e7eb] shadow-card"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className=" shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-[#2563eb] text-[#2563eb]">
                <Building2 className="h-5 w-5 dark:text-[#e5e7eb] text-[#1f2937]" />
                Companies & Employee Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={companiesOverviewData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={isDarkMode ? "#ffffff" : "#000000"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#ffffff" : "#000000" }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#ffffff" : "#000000"}
                    fontSize={12}
                    tick={{ fill: isDarkMode ? "#ffffff" : "#000000" }}
                  />
                  <Tooltip content={customTooltip} />
                  <Line
                    type="monotone"
                    dataKey="companies"
                    stroke="#2563eb"
                    strokeWidth={3}
                    name="Companies"
                    dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#2563eb" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="employees"
                    stroke="#059669"
                    strokeWidth={3}
                    name="Employees"
                    dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#059669" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className=" shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-[#dc2626] text-[#dc2626]">
                <TrendingDown className="h-5 w-5 dark:text-[#e5e7eb] text-[#1f2937]" />
                Retention Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Low Risk", value: 45, color: "#059669" },
                      { name: "Medium Risk", value: 35, color: "#d97706" },
                      { name: "High Risk", value: 20, color: "#dc2626" },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                  >
                    <Cell fill="#059669" />
                    <Cell fill="#d97706" />
                    <Cell fill="#dc2626" />
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full dark:bg-[#059669] bg-[#059669]" />
                  <span className="text-sm dark:text-[#e5e7eb] text-[#1f2937]">
                    Low Risk
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full dark:bg-[#d97706] bg-[#d97706]" />
                  <span className="text-sm dark:text-[#e5e7eb] text-[#1f2937]">
                    Medium Risk
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full dark:bg-[#dc2626] bg-[#dc2626]" />
                  <span className="text-sm dark:text-[#e5e7eb] text-[#1f2937]">
                    High Risk
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=" shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-[#2563eb] text-[#2563eb]">
                <ClipboardList className="h-5 w-5 dark:text-[#e5e7eb] text-[#1f2937]" />
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
                  <XAxis
                    type="number"
                    stroke={isDarkMode ? "#ffffff" : "#000000"}
                  />
                  <YAxis
                    dataKey="company"
                    type="category"
                    stroke={isDarkMode ? "#ffffff" : "#000000"}
                    width={80}
                  />
                  <Tooltip content={customTooltip} />
                  <Bar
                    dataKey="total"
                    fill="dark:#4b5563 #9ca3af"
                    name="Total"
                  />
                  <Bar dataKey="completed" fill="#2563eb" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className=" shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-[#059669] text-[#059669]">
                <ArrowUp className="h-5 w-5 dark:text-[#e5e7eb] text-[#1f2937]" />
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
                    stroke={isDarkMode ? "#ffffff" : "#000000"}
                  />
                  <YAxis stroke={isDarkMode ? "#ffffff" : "#000000"} />
                  <Tooltip content={customTooltip} />
                  <Line
                    type="monotone"
                    dataKey="promotions"
                    stroke="#059669"
                    strokeWidth={2}
                    name="Promotions"
                  />
                  <Line
                    type="monotone"
                    dataKey="transfers"
                    stroke="#d97706"
                    strokeWidth={2}
                    name="Transfers"
                  />
                  <Line
                    type="monotone"
                    dataKey="exits"
                    stroke="#dc2626"
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
