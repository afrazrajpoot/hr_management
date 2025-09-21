"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, Loader2 } from "lucide-react";
import HRLayout from "@/components/hr/HRLayout";
import { useGetHrEmployeeQuery } from "@/redux/hr-api";
import EmployeeModal from "@/components/hr/EmployeeModal";
import EmployeeDetailModal from "@/components/hr/EmployeeDetailModal";
import { useSession } from "next-auth/react";
import { dashboardOptions } from "@/app/data";
import Loader from "@/components/Loader";
// import EmployeeModal from "./EmployeeModal";

const assessmentStatuses = [
  "All Statuses",
  "Completed",
  "Not Started",
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-success text-success-foreground";
    case "In Progress":
      return "bg-primary text-primary-foreground";
    case "Pending":
      return "bg-warning text-warning-foreground";
    case "Not Started":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getRiskColor = (risk: string | undefined) => {
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

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedRisk, setSelectedRisk] = useState("All Risk Levels");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const { isLoading, isError, data } = useGetHrEmployeeQuery<any>({
    page: currentPage,
    limit,
    search: searchTerm,
    department: selectedDepartment,
  });
  const { data: sessionData } = useSession();
  const uniqueDepartments = useMemo(() => {
    return [
      { option: "All Departments", value: "All Departments" },
      ...dashboardOptions.Departments,
    ];
  }, []);

  const uniqueRiskLevels = [
    { option: "All Risk Levels", value: "All Risk Levels" },
    { option: "Low", value: "Low" },
    { option: "Moderate", value: "Moderate" },
    { option: "High", value: "High" },
  ];

  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return [];

    return data.employees.filter((employee: any) => {
      const risk =
        employee.reports[0]?.currentRoleAlignmentAnalysisJson
          .retention_risk_level;
      const matchesRisk =
        selectedRisk === "All Risk Levels" || risk === selectedRisk;
      const status = employee.reports[0] ? "Completed" : "Not Started";
      const matchesStatus =
        selectedStatus === "All Statuses" || status === selectedStatus;

      return matchesRisk && matchesStatus;
    });
  }, [data, selectedRisk, selectedStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedRisk, selectedStatus]);
  // console.log(filteredEmployees[0].department[0], "filtered employees");
  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <HRLayout>
        <Loader />
      </HRLayout>
    );
  }
  if (isError) return <div>Error loading employees</div>;

  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Header & Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Employee Management</h2>
            <p className="text-muted-foreground">
              {data?.pagination?.totalEmployees || 0} employees found
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 pl-10"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uniqueRiskLevels.map((risk: any) => (
                    <SelectItem key={risk.option} value={risk.value}>
                      {risk.option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assessmentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card className="card">
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>
              Manage and track all company employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Employee</th>
                    <th className="text-left p-3 font-medium">Position</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-left p-3 font-medium">Salary</th>
                    <th className="text-left p-3 font-medium">Assessment</th>
                    <th className="text-left p-3 font-medium">Risk Level</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee: any) => (
                    <tr
                      key={employee.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/api/placeholder/40/40" />
                            <AvatarFallback>
                              {`${employee.firstName[0]}${employee.lastName !== "Not provide"
                                ? employee.lastName[0]
                                : ""
                                }`}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{`${employee.firstName
                              } ${employee.lastName !== "Not provide"
                                ? employee.lastName
                                : ""
                              }`}</p>
                            <p className="text-sm text-muted-foreground">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {typeof employee.position === "string" ? employee.position : employee?.position[employee.position.length - 1]}
                      </td>
                      <td className="p-3">
                        {typeof employee.department === "string" ? employee.department : Array.isArray(employee.department)
                          ? employee.department[employee.department.length - 1] : "N/A"
                        }
                      </td>
                      <td className="p-3 font-medium">
                        ${employee.salary?.toLocaleString() || "N/A"}
                      </td>
                      <td className="p-3">
                        <Badge
                          className={getStatusColor(
                            employee.reports[0] ? "Completed" : "Not Started"
                          )}
                        >
                          {employee.reports[0] ? "Completed" : "Not Started"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          className={getRiskColor(
                            employee.reports[0]
                              ?.currentRoleAlignmentAnalysisJson
                              .retention_risk_level
                          )}
                        >
                          {employee.reports[0]?.currentRoleAlignmentAnalysisJson
                            .retention_risk_level || "N/A"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleViewEmployee(employee)}
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

        {/* Employee Modal */}
        <EmployeeDetailModal
          employee={selectedEmployee}
          isOpen={isModalOpen}
          // hrId={sessionData?.user?.id || ""}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Pagination */}
        {data?.pagination && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * limit + 1} to{" "}
              {Math.min(currentPage * limit, data.pagination.totalEmployees)} of{" "}
              {data.pagination.totalEmployees} employees
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, data.pagination.totalPages)
                  )
                }
                disabled={currentPage === data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </HRLayout>
  );
}
