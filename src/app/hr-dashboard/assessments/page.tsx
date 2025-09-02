"use client";
import { JSX, useState } from "react";
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
import HRLayout from "@/components/hr/HRLayout";
import { useGetHrEmployeeQuery } from "@/redux/hr-api";
import AssessmentDetailsModal from "@/components/hr/AssessmentDetailsModal";

const AssessmentCard = ({ employee, onViewDetails }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 3;

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Completed":
        return "bg-success text-success-foreground";
      case "In Progress":
        return "bg-warning text-warning-foreground";
      case "Not Started":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Use the first report's status and score for display (if any)
  const firstReport = employee.reports[0] || {};

  const status = employee.reports.length > 0 ? "Completed" : "Not Started";
  const geniusScore =
    firstReport.currentAllignmentAnalysisJson?.alignment_score;
  const completionRate = employee.reports.length > 0 ? 100 : 0;

  // Pagination logic for reports
  const totalReportPages = Math.ceil(employee.reports.length / reportsPerPage);
  const paginatedReports = employee.reports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  const handleReportPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewReport = (assessment: any) => {
    onViewDetails(assessment);
    // Scroll to top of the page
    const header = document.getElementById("assessments-header");
    if (header) {
      header.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Generate pagination items with ellipsis
  const getPaginationItems = () => {
    const items: JSX.Element[] = [];
    const maxVisiblePages = 5; // Show up to 5 page numbers (adjustable)

    if (totalReportPages <= maxVisiblePages) {
      // Show all pages if total pages are less than or equal to maxVisiblePages
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
      // Show first page, last page, current page, and ellipses
      const startPages = Math.min(2, totalReportPages);
      const endPages = Math.max(totalReportPages - 1, startPages + 1);

      // Add first page
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

      // Add ellipsis after first page if needed
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Add pages around the current page
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

      // Add ellipsis before last page if needed
      if (currentPage < totalReportPages - 2) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Add last page
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
    <Card className="hr-card hover:shadow-lg transition-all duration-200">
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
                {employee.position} • {employee.department}
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

        {/* {status === "Completed" && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Genius Factor Score
            </span>
            <span className={`text-lg font-bold ${getScoreColor(geniusScore)}`}>
              {geniusScore}/100
            </span>
          </div>
        )} */}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {status === "Completed"
              ? `Completed: ${
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
            <div className="space-y-2">
              {paginatedReports.map((report: any, index: number) => (
                <Button
                  key={report.id}
                  variant="default"
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                  onClick={() =>
                    handleViewReport({
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
                      currentRoleAlignment:
                        report.currentRoleAlignmentAnalysisJson,
                      careerOpportunities:
                        report.internalCareerOpportunitiesJson,
                      retentionStrategies:
                        report.retentionAndMobilityStrategiesJson,
                      developmentPlan: report.developmentActionPlanJson,
                      personalizedResources: report.personalizedResourcesJson,
                      dataSources: report.dataSourcesAndMethodologyJson,
                    })
                  }
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
                      onClick={() =>
                        handleReportPageChange(Math.max(1, currentPage - 1))
                      }
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
                      onClick={() =>
                        handleReportPageChange(
                          Math.min(totalReportPages, currentPage + 1)
                        )
                      }
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { isLoading, isError, data } = useGetHrEmployeeQuery<any>();

  // Transform API data into employee format with grouped reports
  const employeeData =
    data?.employees?.map((employee: any) => ({
      id: employee.id,
      name: `${employee.firstName} ${
        employee.lastName !== "Not provide" ? employee.lastName : ""
      }`.trim(),
      department: employee.department || "Unknown",
      position: employee.position || "Unknown",
      reports: employee.reports || [],
      avatar: `${employee.firstName[0]}${
        employee.lastName !== "Not provide" ? employee.lastName[0] : ""
      }`,
    })) || [];

  const filteredEmployees = employeeData.filter((employee: any) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Completed" && employee.reports.length > 0) ||
      (statusFilter === "Not Started" && employee.reports.length === 0);

    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleViewDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowDetailsModal(true);
  };

  // Extract all departments from employee data
  const departments: any = [
    ...new Set(
      data?.employees?.map((emp: any) => emp.department).filter(Boolean)
    ),
    "all",
  ];

  // Calculate stats based on reports
  const assessmentCount = employeeData.reduce(
    (sum: number, emp: any) => sum + emp.reports.length,
    0
  );
  const completedCount = employeeData.reduce(
    (sum: number, emp: any) => sum + emp.reports.length,
    0
  );
  const inProgressCount = 0; // No in-progress reports in data
  const avgScore = completedCount
    ? Math.round(
        employeeData.reduce(
          (sum: number, emp: any) =>
            sum +
            emp.reports.reduce(
              (rSum: number, report: any) =>
                rSum +
                parseInt(
                  report.geniusFactorProfileJson.primary_genius_factor.match(
                    /\d+/
                  )?.[0] || "0"
                ),
              0
            ),
          0
        ) / completedCount
      )
    : 0;

  if (isLoading) {
    return (
      <HRLayout>
        <div className="p-6 text-center">
          <Card className="hr-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Loading assessments...
              </p>
            </CardContent>
          </Card>
        </div>
      </HRLayout>
    );
  }

  if (isError) {
    return (
      <HRLayout>
        <div className="p-6 text-center">
          <Card className="hr-card">
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading assessments</p>
            </CardContent>
          </Card>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div id="assessments-header">
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            Manage and review all career assessments
          </p>
        </div>

        {/* Filters */}
        <Card className="hr-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept: string) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hr-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Assessments
                  </p>
                  <p className="text-2xl font-bold">{assessmentCount}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="hr-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {completedCount}
                  </p>
                </div>
                <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-success">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hr-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-warning">
                    {inProgressCount}
                  </p>
                </div>
                <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-warning">⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hr-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Score
                  </p>
                  <p className="text-2xl font-bold text-primary">{avgScore}</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">★</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee: any) => (
            <AssessmentCard
              key={employee.id}
              employee={employee}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* No results */}
        {filteredEmployees.length === 0 && (
          <Card className="hr-card">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Assessment Details Modal */}
        <AssessmentDetailsModal
          assessment={selectedAssessment}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      </div>
    </HRLayout>
  );
}
