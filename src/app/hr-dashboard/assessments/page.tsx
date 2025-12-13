"use client";
import { useState, useMemo, useEffect, useCallback, JSX } from "react";
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
  Target,
  Users,
  BarChart3,
  TrendingUp,
  ChevronRight,
  Download,
  Filter,
  Sparkles,
  Award,
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
import HRLayout from "@/components/hr/HRLayout";
import { useGetHrEmployeeQuery } from "@/redux/hr-api";
import AssessmentDetailsModal from "@/components/hr/AssessmentDetailsModal";
import Loader from "@/components/Loader";
import { dashboardOptions } from "@/app/data";

const AssessmentCard = ({ employee, onViewDetails }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 3;

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Completed":
        return "badge-green";
      case "In Progress":
        return "badge-amber";
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
    firstReport?.genius_factor_score ||
    firstReport?.currentAllignmentAnalysisJson?.alignment_score;
  const completionRate = employee.reports.length > 0 ? 100 : 0;

  // Calculate overall score
  const overallScore =
    geniusScore || firstReport?.risk_analysis?.scores?.genius_factor_score || 0;

  // Pagination logic for reports - reverse to show newest first
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
    // Scroll to top of the page
    const header = document.getElementById("assessments-header");
    if (header) {
      header.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Generate pagination items with ellipsis
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
                  ? "btn-gradient-primary text-white"
                  : "cursor-pointer hover:bg-muted border-border"
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
                ? "btn-gradient-primary text-white"
                : "cursor-pointer hover:bg-muted border-border"
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
                  ? "btn-gradient-primary text-white"
                  : "cursor-pointer hover:bg-muted border-border"
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
                  ? "btn-gradient-primary text-white"
                  : "cursor-pointer hover:bg-muted border-border"
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
    <Card className="card-primary card-hover group border-0 shadow-lg overflow-hidden h-[420px] flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600" />

      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-lg font-bold text-primary">
                {employee.avatar}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                {employee.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {typeof employee.position === "string"
                  ? employee.position
                  : employee?.position[employee.position.length - 1]}
                <span className="mx-1">•</span>
                {typeof employee.department === "string"
                  ? employee.department
                  : Array.isArray(employee.department)
                  ? employee.department[employee.department.length - 1]
                  : "N/A"}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="icon-wrapper-blue">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {employee.reports.length > 0
                ? "Genius Factor Career Assessment"
                : "No Assessments"}
            </span>
          </div>
          <Badge className={`${getStatusColor(status)} gap-1`}>
            {status === "Completed" ? (
              <Sparkles className="h-3 w-3" />
            ) : (
              <Target className="h-3 w-3" />
            )}
            {status}
          </Badge>
        </div>

        {/* Score Display */}
        {status === "Completed" && overallScore > 0 && (
          <div className="bg-gradient-to-r from-success/5 to-transparent rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="icon-wrapper-green">
                  <Award className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Genius Score
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-success">
                  {Math.round(overallScore)}
                </div>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 flex-shrink-0">
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
            className="h-2 progress-bar-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
          <Calendar className="h-4 w-4" />
          <span>
            {status === "Completed"
              ? `Last: ${
                  firstReport.createdAt
                    ? new Date(firstReport.createdAt).toLocaleDateString()
                    : "Unknown"
                }`
              : "Awaiting Assessment"}
          </span>
        </div>

        {/* Reports Section with Scrollable Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {employee.reports.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {paginatedReports.map((report: any, index: number) => (
                  <Button
                    key={report.id}
                    variant="ghost"
                    size="sm"
                    className="w-full bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 text-primary hover:text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200 group"
                    onClick={() =>
                      handleViewReport({
                        report,
                        id: report.id,
                        title: "Genius Factor Career Assessment",
                        employee: employee.name,
                        department: report.departement,
                        position: employee.position,
                        dateCompleted: report.createdAt
                          ? new Date(report.createdAt)
                              .toISOString()
                              .split("T")[0]
                          : "Unknown",
                        status: "Completed",
                        geniusScore: parseInt(
                          report.geniusFactorProfileJson?.primary_genius_factor?.match(
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
                      })
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Report #
                    {(currentPage - 1) * reportsPerPage + index + 1}
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                ))}
              </div>
              {totalReportPages > 1 && (
                <div className="mt-4 flex-shrink-0">
                  <Pagination className="w-full">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handleReportPageChange(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50 border-border"
                              : "cursor-pointer hover:bg-muted border-border"
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
                              ? "pointer-events-none opacity-50 border-border"
                              : "cursor-pointer hover:bg-muted border-border"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                No assessments completed yet
              </span>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-primary text-primary hover:bg-primary/10"
              >
                Schedule Assessment
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Assessments() {
  // Separate states for smooth typing
  const [searchValue, setSearchValue] = useState(""); // Immediate UI value
  const [debouncedSearch, setDebouncedSearch] = useState(""); // API value
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9; // Changed to 9 for 3x3 grid

  // Query parameters with all filters
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      search: debouncedSearch,
      department: departmentFilter === "all" ? "" : departmentFilter,
      status: statusFilter === "all" ? "" : statusFilter,
    }),
    [currentPage, debouncedSearch, departmentFilter, statusFilter]
  );

  const { isLoading, isError, data } = useGetHrEmployeeQuery<any>(queryParams);

  // Debounce search with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, departmentFilter, statusFilter]);

  // Transform API data
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
      }`.toUpperCase(),
      salary: employee.salary,
      email: employee.email,
    })) || [];

  // UI-side filtering for "Not Started"
  const filteredEmployees = useMemo(() => {
    if (statusFilter === "Not Started") {
      return employeeData.filter(
        (employee: any) => employee.reports.length === 0
      );
    }
    return employeeData;
  }, [employeeData, statusFilter]);

  const handleViewDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowDetailsModal(true);
  };

  // Calculate metrics from filtered data
  const metrics = useMemo(() => {
    const totalAssessments = employeeData.reduce(
      (sum: number, emp: any) => sum + emp.reports.length,
      0
    );
    const completedCount = employeeData.filter(
      (emp: any) => emp.reports.length > 0
    ).length;
    const notStartedCount = employeeData.filter(
      (emp: any) => emp.reports.length === 0
    ).length;

    // Calculate average score from reports
    let totalScore = 0;
    let scoreCount = 0;

    employeeData.forEach((emp: any) => {
      emp.reports.forEach((report: any) => {
        const score =
          report?.genius_factor_score ||
          report?.risk_analysis?.scores?.genius_factor_score ||
          report.geniusFactorProfileJson?.primary_genius_factor?.match(
            /\d+/
          )?.[0] ||
          0;
        totalScore += parseInt(score);
        scoreCount++;
      });
    });

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return {
      totalAssessments,
      completedCount,
      notStartedCount,
      avgScore,
      totalEmployees: employeeData.length,
    };
  }, [employeeData]);

  if (isLoading) {
    return (
      <HRLayout>
        <div className="min-h-screen gradient-bg-primary flex items-center justify-center">
          <Loader />
        </div>
      </HRLayout>
    );
  }

  if (isError) {
    return (
      <HRLayout>
        <div className="min-h-screen gradient-bg-primary p-6">
          <Card className="card-primary border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Error loading assessments
              </h3>
              <p className="text-muted-foreground">
                Unable to load assessment data. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="min-h-screen gradient-bg-primary p-4 md:p-6 space-y-6">
        {/* Header with decorative elements */}
        <div
          id="assessments-header"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6"
        >
          <div className="decorative-gradient-blur-blue -top-20 -right-20" />
          <div className="decorative-gradient-blur-purple -bottom-20 -left-20" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="sidebar-logo-wrapper">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-primary">
                  Career Assessments
                </h1>
                <p className="text-muted-foreground mt-2">
                  Genius Factor career alignment and talent analysis (
                  {metrics.totalEmployees} employees)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="icon-wrapper-blue">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Assessments
                    </p>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {metrics.totalAssessments}
                  </div>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="icon-wrapper-green">
                      <Sparkles className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed
                    </p>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">
                    {metrics.completedCount}
                  </div>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-success/10 to-green-600/10 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="icon-wrapper-amber">
                      <Target className="h-4 w-4 text-warning" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Not Started
                    </p>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-warning to-amber-600 bg-clip-text text-transparent">
                    {metrics.notStartedCount}
                  </div>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-warning/10 to-amber-600/10 flex items-center justify-center">
                  <Target className="h-7 w-7 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="icon-wrapper-purple">
                      <Award className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Avg Genius Score
                    </p>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {metrics.avgScore}/100
                  </div>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 flex items-center justify-center">
                  <Award className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-primary card-hover border-0 shadow-xl lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Search className="h-5 w-5 text-primary" />
                Find Assessments
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Search and filter employee assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee name, department, or position..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10 h-12 border-border/50 focus:border-primary"
                  />
                </div>
                <button className="btn-gradient-primary px-6 h-12 rounded-lg text-white font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    Status Filter
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-border/50">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Department Filter
                  </label>
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="border-border/50">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {dashboardOptions.Departments.map(
                        (dept: { option: string; value: string }) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.option}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {/* <Card className="quick-actions-card border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Assessment Tools</CardTitle>
              <CardDescription className="text-white/70">
                Quick actions and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  icon: Download,
                  label: "Export All Reports",
                  color: "from-primary to-purple-600",
                },
                {
                  icon: BarChart3,
                  label: "Analytics Dashboard",
                  color: "from-success to-green-500",
                },
                {
                  icon: TrendingUp,
                  label: "Track Progress",
                  color: "from-warning to-amber-500",
                },
                {
                  icon: Target,
                  label: "Schedule Batch",
                  color: "from-blue-500 to-cyan-500",
                },
              ].map((action, index) => (
                <button
                  key={index}
                  className="quick-action-item w-full text-left flex items-center justify-between p-3 hover:scale-[1.02] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-medium">
                      {action.label}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </CardContent>
          </Card> */}
        </div>

        {/* Employee Assessment Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">
              Employee Assessments
            </h2>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {filteredEmployees.length} Results
            </Badge>
          </div>

          {filteredEmployees.length === 0 ? (
            <Card className="card-primary border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No assessments found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {statusFilter === "Not Started"
                    ? "All employees have completed assessments. Great job!"
                    : "Try adjusting your search criteria to find what you're looking for."}
                </p>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  {statusFilter === "Not Started"
                    ? "View Completed"
                    : "Clear Filters"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((employee: any) => (
                <AssessmentCard
                  key={employee.id}
                  employee={employee}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && filteredEmployees.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-bold text-foreground">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-foreground">
                {Math.min(currentPage * limit, data.pagination.totalEmployees)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-foreground">
                {data.pagination.totalEmployees}
              </span>{" "}
              employees
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-1 border-border hover:border-primary"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, data.pagination.totalPages) },
                  (_, i) => {
                    const pageNum = i + 1;
                    if (data.pagination.totalPages <= 5) {
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-8 h-8 ${
                            currentPage === pageNum
                              ? "btn-gradient-primary text-white"
                              : "border-border"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  }
                )}
                {data.pagination.totalPages > 5 && (
                  <>
                    <span className="px-2 text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(data.pagination.totalPages)}
                      className="min-w-8 h-8 border-border"
                    >
                      {data.pagination.totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, data.pagination.totalPages)
                  )
                }
                disabled={currentPage === data.pagination.totalPages}
                className="gap-1 border-border hover:border-primary"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Live assessment data</span>
            </div>
            <span>•</span>
            <span>{metrics.totalAssessments} assessments completed</span>
            <span>•</span>
            <span>Avg score: {metrics.avgScore}/100</span>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            Assessment Guide <ChevronRight className="h-3 w-3" />
          </button>
        </div>

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
