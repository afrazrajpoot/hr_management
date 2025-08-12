"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import { StatCard } from "@/components/admin/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  ClipboardList,
  TrendingDown,
  Search,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { mockCompanies, mockEmployees, mockAssessments } from "@/lib/mock-data";

export default function CompanyDetailPage({
  params,
}: {
  params: { companyId: string };
}) {
  const router = useRouter();
  const { companyId } = params;

  const [activeTab, setActiveTab] = useState("employees");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const company = mockCompanies.find((c) => c.id === companyId);
  const companyEmployees = mockEmployees.filter(
    (e) => e.companyId === companyId
  );
  const companyAssessments = mockAssessments.filter(
    (a) => a.companyId === companyId
  );

  if (!company) {
    return (
      <HRLayout title="Company Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Company not found</h2>
          <Button onClick={() => router.push("/hr-dashboard/companies")}>
            Back to Companies
          </Button>
        </div>
      </HRLayout>
    );
  }

  const departments = [
    "all",
    ...new Set(companyEmployees.map((e) => e.department)),
  ];

  const filteredEmployees = companyEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default" as const;
      case "pending":
        return "secondary" as const;
      case "not-started":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <HRLayout
      title={company.name}
      subtitle={`${company.industry} • ${company.employeeCount} employees`}
    >
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/hr-dashboard/companies")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{company.name}</CardTitle>
                <p className="text-muted-foreground">{company.industry}</p>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    company.retentionRisk < 10
                      ? "default"
                      : company.retentionRisk < 20
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-sm"
                >
                  {company.retentionRisk}% Risk Level
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={company.employeeCount}
            description="Active employees"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Assessments Completed"
            value={company.assessmentsCompleted}
            description={`${Math.round(
              (company.assessmentsCompleted / company.employeeCount) * 100
            )}% completion rate`}
            icon={<ClipboardList className="h-4 w-4" />}
          />
          <StatCard
            title="Retention Risk"
            value={`${company.retentionRisk}%`}
            description="Employee retention risk"
            icon={<TrendingDown className="h-4 w-4" />}
          />
          <StatCard
            title="Departments"
            value={new Set(companyEmployees.map((e) => e.department)).size}
            description="Active departments"
            icon={<Building2 className="h-4 w-4" />}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="mobility">Mobility</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </option>
                    ))}
                  </select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Assessment Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.name}
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>
                          ${employee.salary.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(
                              employee.assessmentStatus
                            )}
                          >
                            {employee.assessmentStatus.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getRiskBadgeVariant(employee.riskLevel)}
                          >
                            {employee.riskLevel} risk
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Company Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {companyAssessments.map((assessment) => (
                    <Card key={assessment.id} className="border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          {assessment.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {assessment.employeeName}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Status:
                            </span>
                            <Badge
                              variant={
                                assessment.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {assessment.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Score:
                            </span>
                            <span className="font-medium">
                              {assessment.status === "completed"
                                ? `${assessment.score}/100`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Date:
                            </span>
                            <span className="text-sm">
                              {assessment.submissionDate}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-hr-risk-high" />
                  Retention Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                      <div className="text-2xl font-bold text-success">
                        {
                          companyEmployees.filter((e) => e.riskLevel === "low")
                            .length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Low Risk Employees
                      </div>
                    </div>
                    <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="text-2xl font-bold text-warning">
                        {
                          companyEmployees.filter(
                            (e) => e.riskLevel === "medium"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Medium Risk Employees
                      </div>
                    </div>
                    <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="text-2xl font-bold text-destructive">
                        {
                          companyEmployees.filter((e) => e.riskLevel === "high")
                            .length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        High Risk Employees
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">High Risk Employees</h4>
                    <div className="space-y-2">
                      {companyEmployees
                        .filter((e) => e.riskLevel === "high")
                        .map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {employee.position} • {employee.department}
                              </p>
                            </div>
                            <Badge variant="destructive">High Risk</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobility" className="space-y-4">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5" />
                  Internal Mobility Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Mobility tracking data will be displayed here when
                    available.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HRLayout>
  );
}
