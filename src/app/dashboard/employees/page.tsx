"use client";

import { useState } from "react";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import { StatCard } from "@/components/admin/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  TrendingDown,
  ClipboardList,
  Search,
  Eye,
  Filter,
  Mail,
  Calendar,
  DollarSign,
  Building2,
} from "lucide-react";
import { mockEmployees, mockCompanies, Employee } from "@/lib/mock-data";

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const departments = [
    "all",
    ...new Set(mockEmployees.map((e) => e.department)),
  ];
  const riskLevels = ["all", "low", "medium", "high"];

  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter;
    const matchesRisk =
      riskFilter === "all" || employee.riskLevel === riskFilter;
    return matchesSearch && matchesDepartment && matchesRisk;
  });

  const totalEmployees = mockEmployees.length;
  const completedAssessments = mockEmployees.filter(
    (e) => e.assessmentStatus === "completed"
  ).length;
  const highRiskEmployees = mockEmployees.filter(
    (e) => e.riskLevel === "high"
  ).length;
  const averageSalary = Math.round(
    mockEmployees.reduce((sum, e) => sum + e.salary, 0) / mockEmployees.length
  );

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

  const getCompanyName = (companyId: string) => {
    return (
      mockCompanies.find((c) => c.id === companyId)?.name || "Unknown Company"
    );
  };

  return (
    <HRLayout
      title="Employee Management"
      subtitle="Comprehensive view of all employees across companies"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            description="Across all companies"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Assessments Completed"
            value={completedAssessments}
            description={`${Math.round(
              (completedAssessments / totalEmployees) * 100
            )}% completion rate`}
            icon={<ClipboardList className="h-4 w-4" />}
          />
          <StatCard
            title="High Risk Employees"
            value={highRiskEmployees}
            description="Require attention"
            icon={<TrendingDown className="h-4 w-4" />}
          />
          <StatCard
            title="Average Salary"
            value={`$${averageSalary.toLocaleString()}`}
            description="Across all positions"
            icon={<DollarSign className="h-4 w-4" />}
          />
        </div>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
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
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                {riskLevels.map((risk) => (
                  <option key={risk} value={risk}>
                    {risk === "all"
                      ? "All Risk Levels"
                      : `${risk.charAt(0).toUpperCase() + risk.slice(1)} Risk`}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Directory
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
                  <TableHead>Salary</TableHead>
                  <TableHead>Assessment Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {getCompanyName(employee.companyId)}
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>${employee.salary.toLocaleString()}</TableCell>
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
                      <Badge variant={getRiskBadgeVariant(employee.riskLevel)}>
                        {employee.riskLevel} risk
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No employees found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters to find employees.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedEmployee}
          onOpenChange={() => setSelectedEmployee(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Employee Profile</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify_center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedEmployee.position}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge
                        variant={getRiskBadgeVariant(
                          selectedEmployee.riskLevel
                        )}
                      >
                        {selectedEmployee.riskLevel} risk
                      </Badge>
                      <Badge
                        variant={getStatusBadgeVariant(
                          selectedEmployee.assessmentStatus
                        )}
                      >
                        {selectedEmployee.assessmentStatus.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedEmployee.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Joined {selectedEmployee.joinDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {getCompanyName(selectedEmployee.companyId)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Professional Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Department:
                        </span>
                        <p className="font-medium">
                          {selectedEmployee.department}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Salary:
                        </span>
                        <p className="font-medium">
                          ${selectedEmployee.salary.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Risk Level:
                        </span>
                        <p className="font-medium capitalize">
                          {selectedEmployee.riskLevel} Risk
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Assessment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={getStatusBadgeVariant(
                            selectedEmployee.assessmentStatus
                          )}
                        >
                          {selectedEmployee.assessmentStatus.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Assessment:
                        </span>
                        <span>January 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-medium">87/100</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      View Full Assessment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </HRLayout>
  );
}
