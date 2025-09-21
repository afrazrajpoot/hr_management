"use client";
import { JSX, useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, FileText, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import AssessmentDetailsModal from "@/components/hr/AssessmentDetailsModal";
import EmployeeDetailModal from "@/components/adminCOmponents/AdminEmployeeDetail";
import Loader from "@/components/Loader";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import { useGetHrEmployeeQuery } from "@/redux/admin-api";

const AssessmentCard = ({ employee, onViewDetails, onViewEmployee }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 3;

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Completed":
        return "bg-success text-success-foreground";
      case "Not Started":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const firstReport = employee.reports[0] || {};
  const status = employee.reports.length > 0 ? "Completed" : "Not Started";
  const geniusScore =
    firstReport.currentAllignmentAnalysisJson?.alignment_score;
  const completionRate = employee.reports.length > 0 ? 100 : 0;

  const totalReportPages = Math.ceil(employee.reports.length / reportsPerPage);
  const sortedReports = employee.reports.slice().reverse(); // Sort newest first
  const paginatedReports = sortedReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  const handleReportPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewReport = (assessment: any) => {
    onViewDetails(assessment);
    const header = document.getElementById("assessments-header");
    if (header) {
      header.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPaginationItems = () => {
    const items: JSX.Element[] = [];
    const maxVisiblePages = 5;

    if (totalReportPages <= maxVisiblePages) {
      for (let page = 1; page <= totalReportPages; page++) {
        items.push(
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => handleReportPageChange(page)}
              isActive={currentPage === page}
              className={
                currentPage === page
                  ? "bg-primary text-primary-foreground"
                  : "cursor-pointer"
              }
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      const startPages = Math.min(2, totalReportPages);
      const endPages = Math.max(totalReportPages - 1, startPages + 1);

      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handleReportPageChange(1)}
            isActive={currentPage === 1}
            className={
              currentPage === 1
                ? "bg-primary text-primary-foreground"
                : "cursor-pointer"
            }
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalReportPages - 1, currentPage + 1);
      for (let page = start; page <= end; page++) {
        items.push(
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => handleReportPageChange(page)}
              isActive={currentPage === page}
              className={
                currentPage === page
                  ? "bg-primary text-primary-foreground"
                  : "cursor-pointer"
              }
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalReportPages - 2) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      if (totalReportPages > 1) {
        items.push(
          <PaginationItem key={totalReportPages}>
            <PaginationLink
              onClick={() => handleReportPageChange(totalReportPages)}
              isActive={currentPage === totalReportPages}
              className={
                currentPage === totalReportPages
                  ? "bg-primary text-primary-foreground"
                  : "cursor-pointer"
              }
            >
              {totalReportPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <Card
      className="card hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewEmployee(employee)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {employee.avatar}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{employee.name}</CardTitle>
              <CardDescription>
                {typeof employee.position === "string" ? employee.position : employee?.position[employee.position.length - 1]}
                <span> {" - "} </span>
                {typeof employee.department === "string" ? employee.department : Array.isArray(employee.department)
                  ? employee.department[employee.department.length - 1] : "N/A"
                }
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {employee.reports.length > 0
                ? "Genius Factor Career Assessment"
                : "No Assessments"}
            </span>
          </div>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Completion Rate
            </span>
            <span className="text-sm font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {status === "Completed"
              ? `Completed: ${firstReport.createdAt
                ? new Date(firstReport.createdAt)
                  .toISOString()
                  .split("T")[0]
                : "Unknown"
              }`
              : "Not Started"}
          </span>
        </div>

        {employee.reports.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              {/* sort , show in reverse */}
              {paginatedReports.map((report: any, index: number) => (
                <Button
                  key={report.id}
                  variant="default"
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewReport({
                      report,
                      id: report.id,
                      title: "Genius Factor Career Assessment",
                      employee: employee.name,
                      department: report.departement,
                      position: employee.position,
                      dateCompleted: report.createdAt
                        ? new Date(report.createdAt).toISOString().split("T")[0]
                        : "Unknown",
                      status: "Completed",
                      geniusScore: parseInt(
                        report.geniusFactorProfileJson.primary_genius_factor.match(
                          /\d+/
                        )?.[0] || "0"
                      ),
                      completionRate: 100,
                      avatar: employee.avatar,
                      executiveSummary: report.executiveSummary,
                      geniusFactorProfile: report.geniusFactorProfileJson,
                      genius_factor_score:
                        report?.risk_analysis?.scores?.genius_factor_score,
                      currentRoleAlignment:
                        report.currentRoleAlignmentAnalysisJson,
                      careerOpportunities:
                        report.internalCareerOpportunitiesJson,
                      retentionStrategies:
                        report.retentionAndMobilityStrategiesJson,
                      developmentPlan: report.developmentActionPlanJson,
                      personalizedResources: report.personalizedResourcesJson,
                      dataSources: report.dataSourcesAndMethodologyJson,
                    });
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Report #{(currentPage - 1) * reportsPerPage + index + 1}
                </Button>
              ))}
            </div>
            {totalReportPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportPageChange(Math.max(1, currentPage - 1));
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {getPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportPageChange(
                          Math.min(totalReportPages, currentPage + 1)
                        );
                      }}
                      className={
                        currentPage === totalReportPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function Assessments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Fetch employees with server-side pagination
  const { isLoading, isError, data } = useGetHrEmployeeQuery<any>({
    page: currentPage,
    limit,
  });

  // Map employee data
  const employeeData = useMemo(
    () =>
      data?.employees?.map((employee: any) => ({
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName !== "Not provide" ? employee.lastName : ""
          }`.trim(),
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        department: Array.isArray(employee.department)
          ? employee.department.join(", ")
          : employee.department || "Unknown",
        position: Array.isArray(employee.position)
          ? employee.position.join(", ")
          : employee.position || "Unknown",
        reports: employee.reports || [],
        avatar: `${employee.firstName[0]}${employee.lastName !== "Not provide" ? employee.lastName[0] : ""
          }`,
        ...employee.employee,
        salary: employee.salary,
        role: employee.role,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      })) || [],
    [data]
  );

  // Optimized client-side filtering
  const filteredEmployees = useMemo(() => {
    if (!employeeData.length) return [];

    const searchLower = searchTerm.toLowerCase();
    const isDepartmentAll = departmentFilter === "all";
    const hasSearchTerm = searchTerm.length > 0;

    // If no filters are applied, return all employees
    if (isDepartmentAll && !hasSearchTerm) {
      return employeeData;
    }

    return employeeData.filter((employee: any) => {
      // Department filter
      if (!isDepartmentAll && employee.department !== departmentFilter) {
        return false;
      }

      // Search filter (only if there's a search term)
      if (hasSearchTerm) {
        const nameMatch = employee.name.toLowerCase().includes(searchLower);
        const positionMatch =
          employee.position &&
          employee.position.toLowerCase().includes(searchLower);
        const departmentMatch =
          employee.department &&
          employee.department.toLowerCase().includes(searchLower);

        if (!nameMatch && !positionMatch && !departmentMatch) {
          return false;
        }
      }

      return true;
    });
  }, [employeeData, departmentFilter, searchTerm]);

  // Get unique departments from current page
  const departments = useMemo(
    () => [
      "all",
      ...new Set(
        employeeData
          .map((emp: any) => emp.department)
          .filter((dept: string) => dept && dept !== "Unknown")
      ),
    ],
    [employeeData]
  );

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Get pagination info from API response
  const paginationInfo = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalEmployees: 0,
    limit: 10,
  };

  const handleViewDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowDetailsModal(true);
  };

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  if (isLoading) {
    return (
      <HRLayout
        title="Employee Management"
        subtitle="Track and analyze all employee Employee across companies"
      >
        <div className="p-6 text-center">
          <Loader />
        </div>
      </HRLayout>
    );
  }

  if (isError) {
    return (
      <HRLayout
        title="Employee Management"
        subtitle="Track and analyze all employee Employee across companies"
      >
        <div className="p-6 text-center">
          <Card className="card">
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading assessments</p>
            </CardContent>
          </Card>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout
      title="Employee Management"
      subtitle="Track and analyze all employee Employee across companies"
    >
      <div className="space-y-6 p-6">
        <div id="assessments-header">
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage and review all career assessments (
            {paginationInfo.totalEmployees} employees)
          </p>
        </div>

        <Card className="card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, position, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept, index) => {
                    const departmentName = dept as string;
                    return (
                      <SelectItem key={`${departmentName}-${index}`} value={departmentName}>
                        {departmentName === "all" ? "All Departments" : departmentName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((employee: any) => (
                <AssessmentCard
                  key={employee.id}
                  employee={employee}
                  onViewDetails={handleViewDetails}
                  onViewEmployee={handleViewEmployee}
                />
              ))}
            </div>

            {paginationInfo.totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  {(paginationInfo.currentPage - 1) * paginationInfo.limit + 1}{" "}
                  to{" "}
                  {Math.min(
                    paginationInfo.currentPage * paginationInfo.limit,
                    paginationInfo.totalEmployees
                  )}{" "}
                  of {paginationInfo.totalEmployees} employees
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(paginationInfo.currentPage - 1)
                    }
                    disabled={paginationInfo.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {paginationInfo.currentPage} of{" "}
                    {paginationInfo.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(paginationInfo.currentPage + 1)
                    }
                    disabled={
                      paginationInfo.currentPage === paginationInfo.totalPages
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {filteredEmployees.length === 0 && (
              <Card className="card">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No employees found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <AssessmentDetailsModal
          assessment={selectedAssessment}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />

        <EmployeeDetailModal
          employee={selectedEmployee}
          isOpen={showEmployeeModal}
          onClose={() => setShowEmployeeModal(false)}
        />
      </div>
    </HRLayout>
  );
}
