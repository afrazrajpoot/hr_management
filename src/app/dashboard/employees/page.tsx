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
import {
  Search,
  Calendar,
  FileText,
  Eye,
  Users,
  Filter,
  Download,
  Plus,
  TrendingUp,
  BarChart3,
  MoreHorizontal,
  ChevronRight,
  Activity,
  Target,
  Shield,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const AssessmentCard = ({ employee, onViewDetails, onViewEmployee }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 3;

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Completed":
        return "badge-green";
      case "Not Started":
        return "badge-blue";
      default:
        return "badge-blue";
    }
  };

  const firstReport = employee.reports[0] || {};
  const status = employee.reports.length > 0 ? "Completed" : "Not Started";
  const geniusScore =
    firstReport.currentAllignmentAnalysisJson?.alignment_score;
  const completionRate = employee.reports.length > 0 ? 100 : 0;

  const totalReportPages = Math.ceil(employee.reports.length / reportsPerPage);
  const sortedReports = employee.reports.slice().reverse();
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
              className={cn(
                "cursor-pointer",
                currentPage === page && "bg-primary text-primary-foreground"
              )}
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
            className={cn(
              "cursor-pointer",
              currentPage === 1 && "bg-primary text-primary-foreground"
            )}
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
              className={cn(
                "cursor-pointer",
                currentPage === page && "bg-primary text-primary-foreground"
              )}
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
              className={cn(
                "cursor-pointer",
                currentPage === totalReportPages &&
                  "bg-primary text-primary-foreground"
              )}
            >
              {totalReportPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  const lastDepartment = Array.isArray(employee.department)
    ? employee.department[employee.department.length - 1]
    : employee.department;
  const lastPosition = Array.isArray(employee.position)
    ? employee.position[employee.position.length - 1]
    : employee.position;

  return (
    <Card
      className="card-primary card-hover group"
      onClick={() => onViewEmployee(employee)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="sidebar-user-avatar h-12 w-12 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {employee.avatar}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                {employee.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs badge-blue">
                  <Target className="h-3 w-3 mr-1" />
                  {lastPosition || "N/A"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {lastDepartment || "N/A"}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <Badge className={cn(getStatusColor(status), "text-xs")}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper-purple p-2">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {employee.reports.length > 0
                ? "Genius Factor Career Assessment"
                : "No Assessments"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {employee.reports.length} report
            {employee.reports.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Assessment Progress
            </span>
            <span className="text-sm font-medium text-foreground">
              {completionRate}%
            </span>
          </div>
          <Progress
            value={completionRate}
            className="progress-bar-primary h-2"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="icon-wrapper-amber p-2">
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <span>
            {status === "Completed"
              ? `Last: ${
                  firstReport.createdAt
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
            <Separator />
            <div className="space-y-2">
              {paginatedReports.map((report: any, index: number) => (
                <Button
                  key={report.id}
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-primary hover:text-primary-foreground group/btn transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewReport({
                      report,
                      id: report.id,
                      title: "Genius Factor Career Assessment",
                      employee: employee.name,
                      department: report.departement,
                      position: lastPosition,
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
                  <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  View Report #{index + 1}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
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
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "pointer-events-none opacity-50"
                      )}
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
                      className={cn(
                        "cursor-pointer",
                        currentPage === totalReportPages &&
                          "pointer-events-none opacity-50"
                      )}
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

  const { isLoading, isError, data } = useGetHrEmployeeQuery<any>({
    page: currentPage,
    limit,
  });

  const employeeData = useMemo(
    () =>
      data?.employees?.map((employee: any) => {
        const firstName = employee.firstName || "";
        const lastName =
          employee.lastName && employee.lastName !== "Not provide"
            ? employee.lastName
            : "";
        const avatarFirst = firstName[0] || "?";
        const avatarSecond = lastName[0] || firstName[1] || firstName[0] || "?";

        return {
          id: employee.id,
          name: `${firstName} ${lastName}`.trim() || "Unknown",
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          department: Array.isArray(employee.department)
            ? employee.department
            : employee.department
            ? [employee.department]
            : ["Unknown"],
          position: Array.isArray(employee.position)
            ? employee.position
            : employee.position
            ? [employee.position]
            : ["Unknown"],
          reports: employee.reports || [],
          avatar: `${avatarFirst}${avatarSecond}`,
          ...employee.employee,
          salary: employee.salary,
          role: employee.role,
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt,
        };
      }) || [],
    [data]
  );

  const filteredEmployees = useMemo(() => {
    if (!employeeData.length) return [];

    const searchLower = searchTerm.toLowerCase();
    const isDepartmentAll = departmentFilter === "all";
    const hasSearchTerm = searchTerm.length > 0;

    if (isDepartmentAll && !hasSearchTerm) {
      return employeeData;
    }

    return employeeData.filter((employee: any) => {
      if (!isDepartmentAll) {
        const hasDepartment = employee.department?.some(
          (dept: string) =>
            dept.toLowerCase() === departmentFilter.toLowerCase()
        );
        if (!hasDepartment) return false;
      }

      if (hasSearchTerm) {
        const nameMatch = employee.name.toLowerCase().includes(searchLower);
        const positionMatch = employee.position?.some((pos: string) =>
          pos.toLowerCase().includes(searchLower)
        );
        const departmentMatch = employee.department?.some((dept: string) =>
          dept.toLowerCase().includes(searchLower)
        );

        if (!nameMatch && !positionMatch && !departmentMatch) {
          return false;
        }
      }

      return true;
    });
  }, [employeeData, departmentFilter, searchTerm]);

  const departments = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          employeeData.flatMap((emp: any) =>
            emp.department?.filter((dept: string) => dept && dept !== "Unknown")
          )
        )
      ),
    ],
    [employeeData]
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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

  // Calculate stats
  const stats = useMemo(() => {
    const totalEmployees = paginationInfo.totalEmployees || 0;
    const employeesWithReports = employeeData.filter(
      (emp: any) => emp.reports.length > 0
    ).length;
    const completionRate =
      totalEmployees > 0
        ? Math.round((employeesWithReports / totalEmployees) * 100)
        : 0;

    return {
      total: totalEmployees,
      assessed: employeesWithReports,
      completionRate,
      pending: totalEmployees - employeesWithReports,
    };
  }, [paginationInfo, employeeData]);

  if (isLoading) {
    return (
      <HRLayout
        title="Employee Management"
        subtitle="Track and analyze all employee assessments across companies"
      >
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </HRLayout>
    );
  }

  if (isError) {
    return (
      <HRLayout
        title="Employee Management"
        subtitle="Track and analyze all employee assessments across companies"
      >
        <div className="flex items-center justify-center h-64">
          <Card className="card-primary">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Error loading employees
              </h3>
              <p className="text-muted-foreground">Please try again later</p>
            </CardContent>
          </Card>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout
      title="Employee Management"
      subtitle="Track and analyze all employee assessments across companies"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and review all career assessments ({stats.total} employees)
            </p>
          </div>
          {/* <div className="flex items-center gap-3">
            <Button variant="outline" className="hover:bg-muted">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="btn-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div> */}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Employees
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                <Badge className="badge-blue mt-2">
                  <Users className="h-3 w-3 mr-1" />
                  All Companies
                </Badge>
              </div>
              <div className="icon-wrapper-blue">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Assessed
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.assessed}</h3>
                <Badge className="badge-green mt-2">
                  <FileText className="h-3 w-3 mr-1" />
                  Reports Generated
                </Badge>
              </div>
              <div className="icon-wrapper-green">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.completionRate}%
                </h3>
                <Badge className="badge-purple mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Overall Progress
                </Badge>
              </div>
              <div className="icon-wrapper-purple">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.pending}</h3>
                <Badge className="badge-amber mt-2">
                  <Activity className="h-3 w-3 mr-1" />
                  Need Assessment
                </Badge>
              </div>
              <div className="icon-wrapper-amber">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <Card className="card-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, position, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-muted/50 border-border"
                />
              </div>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <Shield className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept, index) => {
                    const departmentName = dept as string;
                    return (
                      <SelectItem
                        key={`${departmentName}-${index}`}
                        value={departmentName}
                      >
                        {departmentName === "all"
                          ? "All Departments"
                          : departmentName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Employees Grid */}
        <div
          id="assessments-header"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredEmployees.map((employee: any) => (
            <AssessmentCard
              key={employee.id}
              employee={employee}
              onViewDetails={handleViewDetails}
              onViewEmployee={handleViewEmployee}
            />
          ))}
        </div>

        {/* Pagination */}
        {paginationInfo.totalPages > 1 && (
          <Card className="card-primary">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(paginationInfo.currentPage - 1)
                    }
                    disabled={paginationInfo.currentPage === 1}
                    className="hover:bg-muted"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, paginationInfo.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (paginationInfo.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (paginationInfo.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (
                          paginationInfo.currentPage >=
                          paginationInfo.totalPages - 2
                        ) {
                          pageNum = paginationInfo.totalPages - 4 + i;
                        } else {
                          pageNum = paginationInfo.currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={
                              paginationInfo.currentPage === pageNum
                                ? "default"
                                : "ghost"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                              "min-w-8 h-8",
                              paginationInfo.currentPage === pageNum &&
                                "bg-primary text-primary-foreground"
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(paginationInfo.currentPage + 1)
                    }
                    disabled={
                      paginationInfo.currentPage === paginationInfo.totalPages
                    }
                    className="hover:bg-muted"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <Card className="card-primary">
            <CardContent className="p-12 text-center">
              <div className="icon-wrapper-purple p-4 mb-4 inline-block">
                <FileText className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No employees found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDepartmentFilter("all");
                }}
                className="hover:bg-muted"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
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
