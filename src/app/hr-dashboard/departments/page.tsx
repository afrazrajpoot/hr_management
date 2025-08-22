"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  Eye,
} from "lucide-react";
import HRLayout from "@/components/hr/HRLayout";

const departments = [
  "Finance",
  "Sales",
  "Marketing",
  "IT",
  "Design/Creative",
  "Customer Support",
  "Operations",
  "Human Resources",
  "Product R&D",
];

const departmentData: any = {
  Finance: {
    employeeCount: 24,
    completion: 85,
    geniusFactor: 78,
    productivity: 82,
    engagement: 80,
    skillsAlignment: 85,
    retentionRisk: "Low",
    mobilityScore: 72,
    radarData: [
      { subject: "Leadership", score: 78, fullMark: 100 },
      { subject: "Analytics", score: 92, fullMark: 100 },
      { subject: "Communication", score: 75, fullMark: 100 },
      { subject: "Innovation", score: 68, fullMark: 100 },
      { subject: "Collaboration", score: 80, fullMark: 100 },
      { subject: "Technical", score: 85, fullMark: 100 },
    ],
    employees: [
      {
        id: 1,
        name: "John Smith",
        position: "Financial Analyst",
        salary: "$75,000",
        status: "Completed",
        risk: "Low",
      },
      {
        id: 2,
        name: "Emily Davis",
        position: "Senior Accountant",
        salary: "$68,000",
        status: "Completed",
        risk: "Low",
      },
      {
        id: 3,
        name: "Michael Brown",
        position: "Finance Manager",
        salary: "$95,000",
        status: "Pending",
        risk: "Medium",
      },
    ],
  },
  Sales: {
    employeeCount: 35,
    completion: 92,
    geniusFactor: 85,
    productivity: 90,
    engagement: 88,
    skillsAlignment: 89,
    retentionRisk: "Low",
    mobilityScore: 85,
    radarData: [
      { subject: "Leadership", score: 85, fullMark: 100 },
      { subject: "Analytics", score: 78, fullMark: 100 },
      { subject: "Communication", score: 95, fullMark: 100 },
      { subject: "Innovation", score: 82, fullMark: 100 },
      { subject: "Collaboration", score: 88, fullMark: 100 },
      { subject: "Technical", score: 70, fullMark: 100 },
    ],
    employees: [
      {
        id: 4,
        name: "Sarah Wilson",
        position: "Sales Manager",
        salary: "$85,000",
        status: "Completed",
        risk: "Low",
      },
      {
        id: 5,
        name: "David Johnson",
        position: "Account Executive",
        salary: "$70,000",
        status: "Completed",
        risk: "Low",
      },
      {
        id: 6,
        name: "Lisa Garcia",
        position: "Sales Rep",
        salary: "$55,000",
        status: "Completed",
        risk: "Medium",
      },
    ],
  },
  IT: {
    employeeCount: 28,
    completion: 95,
    geniusFactor: 92,
    productivity: 94,
    engagement: 89,
    skillsAlignment: 96,
    retentionRisk: "Low",
    mobilityScore: 88,
    radarData: [
      { subject: "Leadership", score: 82, fullMark: 100 },
      { subject: "Analytics", score: 95, fullMark: 100 },
      { subject: "Communication", score: 78, fullMark: 100 },
      { subject: "Innovation", score: 98, fullMark: 100 },
      { subject: "Collaboration", score: 85, fullMark: 100 },
      { subject: "Technical", score: 98, fullMark: 100 },
    ],
    employees: [
      {
        id: 7,
        name: "Alex Chen",
        position: "Senior Developer",
        salary: "$95,000",
        status: "Completed",
        risk: "Low",
      },
      {
        id: 8,
        name: "Maria Rodriguez",
        position: "DevOps Engineer",
        salary: "$88,000",
        status: "Completed",
        risk: "Low",
      },
      {
        id: 9,
        name: "James Wilson",
        position: "Tech Lead",
        salary: "$110,000",
        status: "Completed",
        risk: "Low",
      },
    ],
  },
};

const MetricCard = ({ title, value, icon: Icon, color = "primary" }: any) => (
  <Card className="hr-card">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold text-${color}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 text-${color}`} />
      </div>
    </CardContent>
  </Card>
);

export default function Departments() {
  const [selectedDepartment, setSelectedDepartment] = useState("Finance");
  const deptData = departmentData[selectedDepartment];

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

  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Department Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Department Analytics</h2>
            <p className="text-muted-foreground">
              Select a department to view detailed insights
            </p>
          </div>
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Employees"
            value={deptData.employeeCount}
            icon={Users}
            color="primary"
          />
          <MetricCard
            title="Assessment Completion"
            value={`${deptData.completion}%`}
            icon={Award}
            color="hr-chart-2"
          />
          <MetricCard
            title="Genius Factor Score"
            value={deptData.geniusFactor}
            icon={TrendingUp}
            color="hr-chart-1"
          />
          <MetricCard
            title="Retention Risk"
            value={deptData.retentionRisk}
            icon={AlertTriangle}
            color={
              deptData.retentionRisk === "Low" ? "hr-chart-2" : "hr-chart-3"
            }
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Skills Radar Chart */}
          <Card className="hr-card">
            <CardHeader>
              <CardTitle>Department Skills Profile</CardTitle>
              <CardDescription>
                Core competency assessment for {selectedDepartment}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={deptData.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Skills"
                    dataKey="score"
                    stroke="hsl(var(--hr-chart-1))"
                    fill="hsl(var(--hr-chart-1))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="hr-card">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for {selectedDepartment}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Productivity Score
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {deptData.productivity}/100
                  </span>
                </div>
                <Progress value={deptData.productivity} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Engagement Score</span>
                  <span className="text-sm text-muted-foreground">
                    {deptData.engagement}/100
                  </span>
                </div>
                <Progress value={deptData.engagement} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Skills-Job Alignment
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {deptData.skillsAlignment}/100
                  </span>
                </div>
                <Progress value={deptData.skillsAlignment} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Internal Mobility Score
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {deptData.mobilityScore}/100
                  </span>
                </div>
                <Progress value={deptData.mobilityScore} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <Card className="hr-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedDepartment} Employees
            </CardTitle>
            <CardDescription>
              Employee details and assessment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Employee</th>
                    <th className="text-left p-3 font-medium">Position</th>
                    <th className="text-left p-3 font-medium">Salary</th>
                    <th className="text-left p-3 font-medium">
                      Assessment Status
                    </th>
                    <th className="text-left p-3 font-medium">Risk Level</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptData.employees.map((employee: any) => (
                    <tr
                      key={employee.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="p-3 font-medium">{employee.name}</td>
                      <td className="p-3 text-muted-foreground">
                        {employee.position}
                      </td>
                      <td className="p-3">{employee.salary}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            employee.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {employee.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={getRiskColor(employee.risk)}>
                          {employee.risk}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
