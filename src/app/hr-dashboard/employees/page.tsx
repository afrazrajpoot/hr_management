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
      return "badge-green";
    case "In Progress":
      return "badge-blue";
    case "Pending":
      return "badge-amber";
    case "Not Started":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getRiskColor = (risk: string | undefined) => {
  switch (risk) {
    case "Low":
      return "badge-green";
    case "Moderate":
      return "badge-amber";
    case "High":
      return "badge-red";
    default:
      return "bg-muted text-muted-foreground";
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
      <div className="min-h-screen gradient-bg-primary p-4 md:p-6 space-y-6">
        {/* Header with decorative elements */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="decorative-gradient-blur-blue -top-20 -right-20" />
          <div className="decorative-gradient-blur-purple -bottom-20 -left-20" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="sidebar-logo-wrapper">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-primary">
                    Employee Management
                  </h1>
                  <p className="text-muted-foreground mt-2">
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
                <button className="btn-gradient-primary flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium">
                  <Plus className="h-4 w-4" />
                  Add Employee
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="icon-wrapper-blue">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Employees
                    </p>
                  </div>
                  <div className="text-3xl ml-[3vw] font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {totalEmployees}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="icon-wrapper-green">
                      <Target className="h-6 w-6 text-success" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Assessment Rate
                    </p>
                  </div>
                  <div className="text-3xl font-bold ml-[3vw] bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">
                    {completionRate}%
                  </div>
                </div>
                {/* <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-success/10 to-green-600/10 flex items-center justify-center">
                  <Target className="h-7 w-7 text-success" />
                </div> */}
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="icon-wrapper-amber">
                      <Shield className="h-6 w-6 text-warning" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      High Risk
                    </p>
                  </div>
                  <div className="text-3xl ml-[3vw] font-bold bg-gradient-to-r from-warning to-amber-600 bg-clip-text text-transparent">
                    {highRiskEmployees}
                  </div>
                </div>
                {/* <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-warning/10 to-amber-600/10 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-warning" />
                </div> */}
              </div>
            </CardContent>
          </Card>

          <Card className="card-primary card-hover border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 ">
                    <div className="icon-wrapper-purple">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Filters
                    </p>
                  </div>
                  <div className="text-2xl ml-[3vw] font-bold text-foreground">
                    {
                      [selectedDepartment, selectedRisk, selectedStatus].filter(
                        (item) => !item.includes("All")
                      ).length
                    }
                  </div>
                </div>
                {/* <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 flex items-center justify-center">
                  <Filter className="h-7 w-7 text-purple-600" />
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters Section - FIXED HEIGHTS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Stats & Search */}
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
        <Card className="card-primary card-hover border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  Employee Directory
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {data?.pagination?.totalEmployees || 0} employees in system
                </CardDescription>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Page {currentPage} of {data?.pagination?.totalPages || 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No employees found
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Try adjusting your search or filter criteria to find what
                    you're looking for.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Employee
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Department
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Position
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Risk Level
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee: any) => (
                      <tr
                        key={employee.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-border group-hover:border-primary transition-colors">
                              <AvatarImage src="/api/placeholder/40/40" />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {`${employee.firstName[0]}${
                                  employee.lastName !== "Not provide"
                                    ? employee.lastName[0]
                                    : ""
                                }`.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{`${
                                employee.firstName
                              } ${
                                employee.lastName !== "Not provide"
                                  ? employee.lastName
                                  : ""
                              }`}</p>
                              <p className="text-sm text-muted-foreground">
                                {employee.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className="bg-muted/50 border-muted-foreground/30 text-foreground"
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
                            <span className="text-foreground">
                              {typeof employee.position === "string"
                                ? employee.position
                                : employee?.position?.[
                                    employee.position.length - 1
                                  ] ?? "N/A"}
                            </span>
                            <span className="text-sm text-muted-foreground">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleViewEmployee(employee)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
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
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
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
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-8 h-8 ${
                            currentPage === pageNum
                              ? "btn-gradient-primary"
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
                      onClick={() =>
                        handlePageChange(data.pagination.totalPages)
                      }
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage >= data.pagination.totalPages || isLoading
                }
                className="gap-1 border-border hover:border-primary"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
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
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
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
          {/* <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
          {/* Need Help? <ChevronRight className="h-3 w-3" />
          </button> */}
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
