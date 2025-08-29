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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
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
import { useGetHrEmployeeQuery } from "@/redux/hr-api";
import EmployeeDetailModal from "@/components/hr/EmployeeDetailModal";

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
  const { isLoading, isError, data } = useGetHrEmployeeQuery<any>();
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Process API data to extract departments
  const departments = Array.from(
    new Set(data?.employees?.map((emp: any) => emp.department).filter(Boolean))
  ).concat("All"); // Add "All" option for department selector

  const getAllEmployeesData = () => {
    const employeesWithReports =
      data?.employees?.filter((emp: any) => emp.reports?.length > 0) || [];

    const employeeCount = data?.employees?.length || 0;
    const completedAssessments = employeesWithReports.length;
    const completion = employeeCount
      ? Math.round((completedAssessments / employeeCount) * 100)
      : 0;

    // Aggregate genius factor scores across all reports
    const geniusFactorScores = employeesWithReports
      .flatMap((emp: any) =>
        emp.reports.map((report: any) =>
          parseFloat(
            report?.geniusFactorProfileJson?.primary_genius_factor?.match(
              /(\d+)%/
            )?.[1] || "0"
          )
        )
      )
      .filter((score: number) => score > 0);
    const geniusFactor = geniusFactorScores.length
      ? Math.round(
          geniusFactorScores.reduce(
            (sum: number, score: number) => sum + score,
            0
          ) / geniusFactorScores.length
        )
      : 0;

    // Aggregate alignment scores across all reports
    const alignmentScores = employeesWithReports
      .flatMap((emp: any) =>
        emp.reports.map((report: any) =>
          parseFloat(
            report?.currentRoleAlignmentAnalysisJson?.alignment_score?.split(
              "/"
            )[0] || "0"
          )
        )
      )
      .filter((score: number) => score > 0);
    const skillsAlignment = alignmentScores.length
      ? Math.round(
          alignmentScores.reduce(
            (sum: number, score: number) => sum + score,
            0
          ) / alignmentScores.length
        )
      : 0;

    // Determine retention risk (highest risk level across all reports)
    const retentionRisks = employeesWithReports.flatMap((emp: any) =>
      emp.reports.map(
        (report: any) =>
          report?.currentRoleAlignmentAnalysisJson?.retention_risk_level
      )
    );
    const retentionRisk = retentionRisks.includes("High")
      ? "High"
      : retentionRisks.includes("Moderate")
      ? "Moderate"
      : "Low";

    // Radar data for all employees with reports
    const radarData = [
      { subject: "Empathy", score: geniusFactor, fullMark: 100 },
      { subject: "Leadership", score: skillsAlignment, fullMark: 100 },
      {
        subject: "Communication",
        score: Math.min(geniusFactor + 10, 100),
        fullMark: 100,
      },
      {
        subject: "Purpose-Driven",
        score: Math.min(geniusFactor + 5, 100),
        fullMark: 100,
      },
    ];

    return {
      employeeCount,
      completion,
      geniusFactor,
      productivity: Math.round((geniusFactor + skillsAlignment) / 2),
      engagement: Math.round((geniusFactor + skillsAlignment) / 2 + 5),
      skillsAlignment,
      retentionRisk,
      mobilityScore: Math.round(skillsAlignment * 0.9),
      radarData,
      employees: data?.employees?.map((emp: any) => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        salary: emp.salary,
        employee: emp.employee,
        reports: emp.reports,
        name: `${emp.firstName} ${
          emp.lastName === "Not provide" ? "" : emp.lastName
        }`,
        position: emp.employee?.position || emp.position || "N/A",
        department: emp.employee?.department || emp.department || "N/A",
        salaryFormatted: emp.salary ? `$${emp.salary.toLocaleString()}` : "N/A",
        status: emp.reports?.length ? "Completed" : "Pending",
        risk:
          emp.reports?.[0]?.currentRoleAlignmentAnalysisJson
            ?.retention_risk_level || "Unknown",
      })),
    };
  };

  const getDepartmentData = (dept: string) => {
    const deptEmployees =
      data?.employees?.filter((emp: any) => emp.department === dept) || [];

    const employeeCount = deptEmployees.length;
    const employeesWithReports = deptEmployees.filter(
      (emp: any) => emp.reports?.length > 0
    );
    const completedAssessments = employeesWithReports.length;
    const completion = employeeCount
      ? Math.round((completedAssessments / employeeCount) * 100)
      : 0;

    const geniusFactorScores = employeesWithReports
      .flatMap((emp: any) =>
        emp.reports.map((report: any) =>
          parseFloat(
            report?.geniusFactorProfileJson?.primary_genius_factor?.match(
              /(\d+)%/
            )?.[1] || "0"
          )
        )
      )
      .filter((score: number) => score > 0);
    const geniusFactor = geniusFactorScores.length
      ? Math.round(
          geniusFactorScores.reduce(
            (sum: number, score: number) => sum + score,
            0
          ) / geniusFactorScores.length
        )
      : 0;

    const alignmentScores = employeesWithReports
      .flatMap((emp: any) =>
        emp.reports.map((report: any) =>
          parseFloat(
            report?.currentRoleAlignmentAnalysisJson?.alignment_score?.split(
              "/"
            )[0] || "0"
          )
        )
      )
      .filter((score: number) => score > 0);
    const skillsAlignment = alignmentScores.length
      ? Math.round(
          alignmentScores.reduce(
            (sum: number, score: number) => sum + score,
            0
          ) / alignmentScores.length
        )
      : 0;

    const retentionRisks = employeesWithReports.flatMap((emp: any) =>
      emp.reports.map(
        (report: any) =>
          report?.currentRoleAlignmentAnalysisJson?.retention_risk_level
      )
    );
    const retentionRisk = retentionRisks.includes("High")
      ? "High"
      : retentionRisks.includes("Moderate")
      ? "Moderate"
      : "Low";

    const radarData = [
      { subject: "Empathy", score: geniusFactor, fullMark: 100 },
      { subject: "Leadership", score: skillsAlignment, fullMark: 100 },
      {
        subject: "Communication",
        score: Math.min(geniusFactor + 10, 100),
        fullMark: 100,
      },
      {
        subject: "Purpose-Driven",
        score: Math.min(geniusFactor + 5, 100),
        fullMark: 100,
      },
    ];

    return {
      employeeCount,
      completion,
      geniusFactor,
      productivity: Math.round((geniusFactor + skillsAlignment) / 2),
      engagement: Math.round((geniusFactor + skillsAlignment) / 2 + 5),
      skillsAlignment,
      retentionRisk,
      mobilityScore: Math.round(skillsAlignment * 0.9),
      radarData,
      employees: deptEmployees.map((emp: any) => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        salary: emp.salary,
        employee: emp.employee,
        reports: emp.reports,
        name: `${emp.firstName} ${
          emp.lastName === "Not provide" ? "" : emp.lastName
        }`,
        position: emp.employee?.position || emp.position || "N/A",
        department: emp.employee?.department || emp.department || "N/A",
        salaryFormatted: emp.salary ? `$${emp.salary.toLocaleString()}` : "N/A",
        status: emp.reports?.length ? "Completed" : "Pending",
        risk:
          emp.reports?.[0]?.currentRoleAlignmentAnalysisJson
            ?.retention_risk_level || "Unknown",
      })),
    };
  };

  const deptData: any =
    selectedDepartment === "All"
      ? getAllEmployeesData()
      : getDepartmentData(selectedDepartment);

  const getRiskColor = (risk: any) => {
    switch (risk) {
      case "Low":
        return "bg-success text-success-foreground";
      case "Moderate":
        return "bg-warning text-warning-foreground";
      case "High":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleViewDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  if (isLoading) return <HRLayout>Loading...</HRLayout>;
  if (isError) return <HRLayout>Error loading data</HRLayout>;

  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Department Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Department Analytics</h2>
            <p className="text-muted-foreground">
              Select a department to view detailed insights or "All" for
              company-wide metrics
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
              {departments.map((dept: any) => (
                <SelectItem key={dept.toString()} value={dept.toString()}>
                  {dept.toString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Employees"
            value={deptData.employeeCount || 0}
            icon={Users}
            color="primary"
          />
          <MetricCard
            title="Assessment Completion"
            value={`${deptData.completion || 0}%`}
            icon={Award}
            color="hr-chart-2"
          />
          <MetricCard
            title="Genius Factor Score"
            value={deptData.geniusFactor || 0}
            icon={TrendingUp}
            color="hr-chart-1"
          />
          <MetricCard
            title="Retention Risk"
            value={deptData.retentionRisk || "Unknown"}
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
              <CardTitle>Skills Profile</CardTitle>
              <CardDescription>
                Core competency assessment for{" "}
                {selectedDepartment === "All"
                  ? "all employees"
                  : selectedDepartment}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={deptData.radarData || []}>
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
                Key performance indicators for{" "}
                {selectedDepartment === "All"
                  ? "all employees"
                  : selectedDepartment}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Productivity Score
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {deptData.productivity || 0}/100
                  </span>
                </div>
                <Progress value={deptData.productivity || 0} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Engagement Score</span>
                  <span className="text-sm text-muted-foreground">
                    {deptData.engagement || 0}/100
                  </span>
                </div>
                <Progress value={deptData.engagement || 0} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Skills-Job Alignment
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {deptData.skillsAlignment || 0}/100
                  </span>
                </div>
                <Progress
                  value={deptData.skillsAlignment || 0}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Internal Mobility Score
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {deptData.mobilityScore || 0}/100
                  </span>
                </div>
                <Progress value={deptData.mobilityScore || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <Card className="hr-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedDepartment === "All"
                ? "All Employees"
                : `${selectedDepartment} Employees`}
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
                  {deptData.employees?.map((employee: any) => (
                    <tr
                      key={employee.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="p-3 font-medium">{employee.name}</td>
                      <td className="p-3 text-muted-foreground">
                        {employee.position}
                      </td>
                      <td className="p-3">{employee.salaryFormatted}</td>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleViewDetails(employee)}
                        >
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

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
      />
    </HRLayout>
  );
}
