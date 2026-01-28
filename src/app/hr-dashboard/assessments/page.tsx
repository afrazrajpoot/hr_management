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
import SearchFilterBar from "@/components/hr/SearchFilterBar";

const AssessmentCard = ({ employee, onViewDetails }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 3;

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Completed":
        return "badge-success";
      case "In Progress":
        return "badge-warning";
      case "Not Started":
        return "bg-muted text-subtle dark:text-subtle-dark";
      default:
        return "bg-muted text-subtle dark:text-subtle-dark";
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
                  ? "btn-purple text-white"
                  : "cursor-pointer hover:bg-gray-100 dark:hover:bg-matte-gray-subtle border-matte dark:border-matte"
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
                ? "btn-purple text-white"
                : "cursor-pointer hover:bg-gray-100 dark:hover:bg-matte-gray-subtle border-matte dark:border-matte"
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
                  ? "btn-purple text-white"
                  : "cursor-pointer hover:bg-gray-100 dark:hover:bg-matte-gray-subtle border-matte dark:border-matte"
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
                  ? "btn-purple text-white"
                  : "cursor-pointer hover:bg-gray-100 dark:hover:bg-matte-gray-subtle border-matte dark:border-matte"
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
    <Card className="card-purple relative overflow-hidden group border-0 shadow-lg overflow-hidden h-[420px] flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600" />

      {/* Subtle bubble effect */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-purple-600/5 dark:from-purple-500/10 dark:to-purple-600/10 rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />

      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-brand group-hover:scale-110 transition-transform duration-300">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-300">
                {employee.avatar}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg text-on-matte dark:text-on-matte group-hover:text-purple-accent transition-colors">
                {employee.name}
              </CardTitle>
              <CardDescription className="text-subtle dark:text-subtle-dark">
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
            <div className="icon-info">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-on-matte dark:text-on-matte">
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
          <div className="bg-status-success rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="icon-success">
                  <Award className="h-4 w-4" />
                </div>
                <span className="text-sm text-subtle dark:text-subtle-dark">
                  Genius Score
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(overallScore)}
                </div>
                <span className="text-xs text-subtle dark:text-subtle-dark">/100</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 flex-shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-subtle dark:text-subtle-dark">
              Assessment Progress
            </span>
            <span className="text-sm font-medium text-on-matte dark:text-on-matte">
              {completionRate}%
            </span>
          </div>
          <Progress
            value={completionRate}
            className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-subtle dark:text-subtle-dark flex-shrink-0">
          <Calendar className="h-4 w-4" />
          <span>
            {status === "Completed"
              ? `Last: ${firstReport.createdAt
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
                  <button
                    key={report.id}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-500/5 to-purple-600/10 hover:from-purple-500/10 hover:to-purple-600/20 text-purple-accent dark:text-purple-300 hover:text-purple-600 dark:hover:text-purple-200 border border-purple-300/30 dark:border-purple-700/50 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all duration-200 group hover:scale-[1.02]"
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
                    <Eye className="w-4 h-4" />
                    View Report #
                    {(currentPage - 1) * reportsPerPage + index + 1}
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
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
                              ? "pointer-events-none opacity-50 border-matte dark:border-matte"
                              : "cursor-pointer hover:bg-gray-100 dark:hover:bg-matte-gray-subtle border-matte dark:border-matte"
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
                              ? "pointer-events-none opacity-50 border-matte dark:border-matte"
                              : "cursor-pointer hover:bg-gray-100 dark:hover:bg-matte-gray-subtle border-matte dark:border-matte"
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
                <FileText className="h-6 w-6 text-subtle dark:text-subtle-dark" />
              </div>
              <span className="text-sm text-subtle dark:text-subtle-dark">
                No assessments completed yet
              </span>
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
      name: `${employee.firstName} ${employee.lastName !== "Not provide" ? employee.lastName : ""
        }`.trim(),
      department: employee.department || "Unknown",
      position: employee.position || "Unknown",
      reports: employee.reports || [],
      avatar: `${employee.firstName[0]}${employee.lastName !== "Not provide" ? employee.lastName[0] : ""
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
        <div className="min-h-screen bg-layout-purple flex items-center justify-center">
          <Loader />
        </div>
      </HRLayout>
    );
  }

  if (isError) {
    return (
      <HRLayout>
        <div className="min-h-screen bg-layout-purple p-6">
          <Card className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-status-error flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-on-matte dark:text-on-matte mb-2">
                Error loading assessments
              </h3>
              <p className="text-subtle dark:text-subtle-dark">
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
      <div className="min-h-screen bg-layout-purple p-4 md:p-6 space-y-6">
        {/* Header with decorative elements */}
        <div
          id="assessments-header"
          className="relative overflow-hidden rounded-2xl bg-gradient-purple p-8 shadow-lg"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Career Assessments
                </h1>
                <p className="text-purple-100 mt-2">
                  Genius Factor career alignment and talent analysis (
                  {metrics.totalEmployees} employees)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with Bubble Effects */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Assessments */}
          <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-600/5 to-transparent dark:from-purple-600/10 dark:to-transparent rounded-full -translate-x-6 translate-y-8 group-hover:scale-110 transition-transform duration-500 delay-100" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-brand group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-subtle dark:text-subtle-dark">
                        Total Assessments
                      </p>
                      <div className="text-3xl font-bold gradient-text-primary">
                        {metrics.totalAssessments}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Completed */}
          <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-600/5 to-transparent dark:from-green-600/10 dark:to-transparent rounded-full -translate-x-6 translate-y-8 group-hover:scale-110 transition-transform duration-500 delay-100" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-success group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-subtle dark:text-subtle-dark">
                        Completed
                      </p>
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                        {metrics.completedCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Not Started */}
          <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-600/5 to-transparent dark:from-amber-600/10 dark:to-transparent rounded-full -translate-x-6 translate-y-8 group-hover:scale-110 transition-transform duration-500 delay-100" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-warning group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-subtle dark:text-subtle-dark">
                        Not Started
                      </p>
                      <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                        {metrics.notStartedCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Avg Genius Score */}
          <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-pink-600/5 dark:from-pink-500/20 dark:to-pink-600/10 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-600/5 to-transparent dark:from-pink-600/10 dark:to-transparent rounded-full -translate-x-6 translate-y-8 group-hover:scale-110 transition-transform duration-500 delay-100" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-brand group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-subtle dark:text-subtle-dark">
                        Avg Genius Score
                      </p>
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {metrics.avgScore}/100
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SearchFilterBar
            title="Find Assessments"
            description="Search and filter employee assessments"
            searchValue={searchValue}
            onSearchChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by employee name, department, or position..."
            filters={[
              {
                type: "select",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: "All Statuses", value: "all" },
                  { label: "Completed", value: "Completed" },
                  { label: "Not Started", value: "Not Started" },
                ],
                placeholder: "All Statuses",
                className: "w-full lg:w-[180px]",
              },
              {
                type: "select",
                value: departmentFilter,
                onChange: setDepartmentFilter,
                options: [
                  ...Array.from(
                    new Set(
                      dashboardOptions.Departments.map((dept) => dept.option)
                    )
                  ).map((deptName) => {
                    const dept = dashboardOptions.Departments.find(
                      (d) => d.option === deptName
                    );
                    return {
                      label: dept?.option || deptName,
                      value: dept?.value || deptName,
                    };
                  }),
                ],
                placeholder: "All Departments",
                className: "w-full lg:w-[200px]",
              },
            ]}
          />
        </div>

        {/* Employee Assessment Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-on-matte dark:text-on-matte">
              Employee Assessments
            </h2>
            <Badge className="badge-brand border-purple-accent">
              {filteredEmployees.length} Results
            </Badge>
          </div>

          {filteredEmployees.length === 0 ? (
            <Card className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
              <CardContent className="p-12 text-center">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-subtle dark:text-subtle-dark" />
                </div>
                <h3 className="text-lg font-semibold text-on-matte dark:text-on-matte mb-2">
                  No assessments found
                </h3>
                <p className="text-subtle dark:text-subtle-dark max-w-md mx-auto mb-6">
                  {statusFilter === "Not Started"
                    ? "All employees have completed assessments. Great job!"
                    : "Try adjusting your search criteria to find what you're looking for."}
                </p>
                <button
                  className="btn-purple-outline px-4 py-2 text-sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setDepartmentFilter("all");
                    setSearchValue("");
                  }}
                >
                  {statusFilter === "Not Started"
                    ? "View Completed"
                    : "Clear Filters"}
                </button>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-xl glass-effect-matte border border-matte dark:border-matte">
            <div className="text-sm text-subtle dark:text-subtle-dark">
              Showing{" "}
              <span className="font-bold text-on-matte dark:text-on-matte">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-on-matte dark:text-on-matte">
                {Math.min(currentPage * limit, data.pagination.totalEmployees)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-on-matte dark:text-on-matte">
                {data.pagination.totalEmployees}
              </span>{" "}
              employees
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, data.pagination.totalPages) },
                  (_, i) => {
                    const pageNum = i + 1;
                    if (data.pagination.totalPages <= 5) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                            ? "btn-purple text-white"
                            : "border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  }
                )}
                {data.pagination.totalPages > 5 && (
                  <>
                    <span className="px-2 text-subtle dark:text-subtle-dark">...</span>
                    <button
                      onClick={() => setCurrentPage(data.pagination.totalPages)}
                      className="min-w-8 h-8 rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors"
                    >
                      {data.pagination.totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, data.pagination.totalPages)
                  )
                }
                disabled={currentPage === data.pagination.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-subtle dark:text-subtle-dark pt-4 border-t border-matte dark:border-matte">
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