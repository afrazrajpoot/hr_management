"use client";
import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
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
import {
  Search,
  Filter,
  Eye,
  Users,
  Target,
  Shield,
  Zap,
  ChevronRight,
  Download,
  Plus,
  MoreVertical,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import HRLayout from "@/components/hr/HRLayout";
import { useGetHrEmployeeQuery } from "@/redux/hr-api";
import EmployeeDetailModal from "@/components/hr/EmployeeDetailModal";
import { useSession } from "next-auth/react";
import { dashboardOptions } from "@/app/data";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SearchFilterBar, { FilterConfig } from "@/components/hr/SearchFilterBar";

const assessmentStatuses = ["All Statuses", "Completed", "Not Started"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "badge-success";
    case "In Progress":
      return "badge-info";
    case "Pending":
      return "badge-warning";
    case "Not Started":
      return "bg-muted text-subtle dark:text-subtle-dark";
    default:
      return "bg-muted text-subtle dark:text-subtle-dark";
  }
};

const getRiskColor = (risk: string | undefined) => {
  switch (risk) {
    case "Low":
      return "badge-success";
    case "Moderate":
      return "badge-warning";
    case "High":
      return "badge-error";
    default:
      return "bg-muted text-subtle dark:text-subtle-dark";
  }
};

function EmployeesContent() {
  // Separate states: immediate input vs debounced API value
  const [searchInput, setSearchInput] = useState(""); // Immediate UI value
  const [debouncedSearch, setDebouncedSearch] = useState(""); // API value
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedRisk, setSelectedRisk] = useState("All Risk Levels");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const searchParams = useSearchParams();

  // Initialize search from URL
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchInput(search);
      setDebouncedSearch(search);
    }
  }, [searchParams]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Query parameters object - use debounced search
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      search: debouncedSearch, // ✅ Use debounced value for API
      department:
        selectedDepartment === "All Departments" ? "" : selectedDepartment,
      risk: selectedRisk === "All Risk Levels" ? "" : selectedRisk,
      status: selectedStatus === "All Statuses" ? "" : selectedStatus,
    }),
    [
      currentPage,
      debouncedSearch,
      selectedDepartment,
      selectedRisk,
      selectedStatus,
    ]
  );

  const { isLoading, isError, data } = useGetHrEmployeeQuery<any>(queryParams);

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

  const filteredEmployees = data?.employees || [];

  // Calculate stats
  const totalEmployees = data?.pagination?.totalEmployees || 0;
  const completedAssessments = filteredEmployees.filter(
    (emp: any) => emp.reports?.length > 0
  ).length;
  const completionRate =
    totalEmployees > 0
      ? Math.round((completedAssessments / totalEmployees) * 100)
      : 0;

  const highRiskEmployees = filteredEmployees.filter(
    (emp: any) =>
      emp.reports?.[0]?.currentRoleAlignmentAnalysisJson
        ?.retention_risk_level === "High"
  ).length;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedDepartment, selectedRisk, selectedStatus]);

  // Handle search input change - IMMEDIATE UI update
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value); // ✅ Immediate update - no delay!
    },
    []
  );

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <HRLayout>
        <Loader />
      </HRLayout>
    );
  }

  if (isError) {
    console.error("Query error:", isError);
    return <div>Error loading employees</div>;
  }

  return (
    <HRLayout>
      <div className="min-h-screen bg-layout-purple p-4 md:p-6 space-y-6">
        {/* Header with decorative elements */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-purple p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                    Employee Management
                  </h1>
                  <p className="text-purple-100 mt-2">
                    Comprehensive workforce analytics and insights
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-card-foreground border border-border hover:border-primary transition-all">
                <Download className="h-4 w-4" />
                Export Report
              </button> */}
              <Link href="/hr-dashboard/upload-employee">
                <button className="!bg-white !text-purple-600 dark:!bg-white dark:!text-purple-600 flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium hover:!bg-purple-50 dark:hover:!bg-purple-50 hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4" />
                  Add Employee
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards with Bubble Effects */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Employees */}
          <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
            {/* Bubble Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-600/5 to-transparent dark:from-purple-600/10 dark:to-transparent rounded-full -translate-x-6 translate-y-8 group-hover:scale-110 transition-transform duration-500 delay-100" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="icon-brand group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-subtle dark:text-subtle-dark">
                      Total Employees
                    </p>
                  </div>
                  <div className="text-3xl ml-[3vw] font-bold gradient-text-primary">
                    {totalEmployees}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Assessment Rate */}
          <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
            {/* Bubble Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-600/5 to-transparent dark:from-green-600/10 dark:to-transparent rounded-full -translate-x-6 translate-y-8 group-hover:scale-110 transition-transform duration-500 delay-100" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="icon-success group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-subtle dark:text-subtle-dark">
                      Assessment Rate
                    </p>
                  </div>
                  <div className="text-3xl font-bold ml-[3vw] bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                    {completionRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: High Risk */}
          <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
            {/* Bubble Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-600/5 to-transparent dark:from-amber-600/10 dark:to-transparent rounded-full -translate-x-6 translate-y-8 group-hover:scale-110 transition-transform duration-500 delay-100" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="icon-warning group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-subtle dark:text-subtle-dark">
                      High Risk
                    </p>
                  </div>
                  <div className="text-3xl ml-[3vw] font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                    {highRiskEmployees}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Active Filters */}
          <Card className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
            {/* Bubble Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 rounded-full -translate-y-16 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-600/5 to-transparent dark:from-blue-600/10 dark:to-transparent rounded-full -translate-x-6 translate-y-8 group-hover:scale-110 transition-transform duration-500 delay-100" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="icon-info group-hover:scale-110 transition-transform duration-300">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-subtle dark:text-subtle-dark">
                      Active Filters
                    </p>
                  </div>
                  <div className="text-2xl ml-[3vw] font-bold text-on-matte dark:text-on-matte-subtle">
                    {
                      [selectedDepartment, selectedRisk, selectedStatus].filter(
                        (item) => !item.includes("All")
                      ).length
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Stats & Search */}
          <SearchFilterBar
            title="Employee Search"
            description="Find employees by name, department, or risk level"
            searchValue={searchInput}
            onSearchChange={handleSearchChange}
            placeholder="Search by name, email, or position..."
            filters={[
              {
                type: "select",
                value: selectedDepartment,
                onChange: (value) => {
                  setSelectedDepartment(value);
                  setCurrentPage(1);
                },
                options: uniqueDepartments.map((dept) => ({
                  label: dept.option,
                  value: dept.value,
                })),
                placeholder: "All Departments",
                className: "min-w-[160px]",
              },
              {
                type: "select",
                value: selectedRisk,
                onChange: (value) => {
                  setSelectedRisk(value);
                  setCurrentPage(1);
                },
                options: uniqueRiskLevels.map((risk: any) => ({
                  label: risk.option,
                  value: risk.value,
                })),
                placeholder: "All Risk Levels",
                className: "min-w-[150px]",
              },
              {
                type: "select",
                value: selectedStatus,
                onChange: (value) => {
                  setSelectedStatus(value);
                  setCurrentPage(1);
                },
                options: assessmentStatuses.map((status) => ({
                  label: status,
                  value: status,
                })),
                placeholder: "All Statuses",
                className: "min-w-[140px]",
              },
            ]}
          />
        </div>

        {/* Employee Table */}
        <Card className="card-purple relative overflow-hidden group border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />

          <CardHeader className="bg-gradient-to-r from-purple-600/10 to-transparent border-b border-matte dark:border-matte">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-on-matte dark:text-on-matte">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Employee Directory
                </CardTitle>
                <CardDescription className="text-subtle dark:text-subtle-dark">
                  {data?.pagination?.totalEmployees || 0} employees in system
                </CardDescription>
              </div>
              <Badge className="badge-brand border-purple-accent">
                Page {currentPage} of {data?.pagination?.totalPages || 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative z-10">
            <div className="overflow-x-auto">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8 text-subtle dark:text-subtle-dark" />
                  </div>
                  <h3 className="text-lg font-medium text-on-matte dark:text-on-matte mb-2">
                    No employees found
                  </h3>
                  <p className="text-subtle dark:text-subtle-dark max-w-md mx-auto">
                    Try adjusting your search or filter criteria to find what
                    you're looking for.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-matte dark:border-matte">
                      <th className="text-left p-4 font-medium text-subtle dark:text-subtle-dark">
                        Employee
                      </th>
                      <th className="text-left p-4 font-medium text-subtle dark:text-subtle-dark">
                        Department
                      </th>
                      <th className="text-left p-4 font-medium text-subtle dark:text-subtle-dark">
                        Position
                      </th>
                      <th className="text-left p-4 font-medium text-subtle dark:text-subtle-dark">
                        Status
                      </th>
                      <th className="text-left p-4 font-medium text-subtle dark:text-subtle-dark">
                        Risk Level
                      </th>
                      <th className="text-left p-4 font-medium text-subtle dark:text-subtle-dark">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee: any) => (
                      <tr
                        key={employee.id}
                        className="border-b border-matte/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-matte-gray-subtle/30 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-matte dark:border-matte group-hover:border-purple-accent transition-colors">
                              <AvatarImage src="/api/placeholder/40/40" />
                              <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-medium">
                                {`${employee.firstName[0]}${employee.lastName !== "Not provide"
                                  ? employee.lastName[0]
                                  : ""
                                  }`.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-on-matte dark:text-on-matte">{`${employee.firstName
                                } ${employee.lastName !== "Not provide"
                                  ? employee.lastName
                                  : ""
                                }`}</p>
                              <p className="text-sm text-subtle dark:text-subtle-dark">
                                {employee.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className="bg-gray-100/50 dark:bg-matte-gray-subtle border-gray-300 dark:border-matte text-on-matte dark:text-on-matte-subtle"
                          >
                            {typeof employee.department === "string"
                              ? employee.department
                              : Array.isArray(employee.department)
                                ? employee.department[
                                employee.department.length - 1
                                ]
                                : "N/A"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-on-matte dark:text-on-matte">
                              {typeof employee.position === "string"
                                ? employee.position
                                : employee?.position?.[
                                employee.position.length - 1
                                ] ?? "N/A"}
                            </span>
                            <span className="text-sm text-subtle dark:text-subtle-dark">
                              ${employee.salary?.toLocaleString() || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={getStatusColor(
                              employee.reports?.length > 0
                                ? "Completed"
                                : "Not Started"
                            )}
                          >
                            <div className="flex items-center gap-1">
                              {employee.reports?.length > 0 ? (
                                <Target className="h-3 w-3" />
                              ) : (
                                <Shield className="h-3 w-3" />
                              )}
                              {employee.reports?.length > 0
                                ? "Completed"
                                : "Not Started"}
                            </div>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`${getRiskColor(
                              employee.reports?.[0]
                                ?.currentRoleAlignmentAnalysisJson
                                ?.retention_risk_level
                            )} gap-1`}
                          >
                            {employee.reports?.[0]
                              ?.currentRoleAlignmentAnalysisJson
                              ?.retention_risk_level || "N/A"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <button
                            className="btn-purple-outline flex items-center gap-2 px-3 py-1.5 text-sm hover:scale-105 transition-all duration-200"
                            onClick={() => handleViewEmployee(employee)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalEmployees > 0 && (
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
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
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
                          onClick={() => handlePageChange(pageNum)}
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
                      onClick={() =>
                        handlePageChange(data.pagination.totalPages)
                      }
                      className="min-w-8 h-8 rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors"
                    >
                      {data.pagination.totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage >= data.pagination.totalPages || isLoading
                }
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Employee Modal */}
        <EmployeeDetailModal
          employee={selectedEmployee}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-subtle dark:text-subtle-dark pt-4 border-t border-matte dark:border-matte">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Real-time data</span>
            </div>
            <span>•</span>
            <span>{filteredEmployees.length} employees displayed</span>
            <span>•</span>
            <span>Last updated: Just now</span>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}

export default function Employees() {
  return (
    <Suspense fallback={<Loader />}>
      <EmployeesContent />
    </Suspense>
  );
}