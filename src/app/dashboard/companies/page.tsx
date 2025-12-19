"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import { StatCard } from "@/components/admin/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  ClipboardList,
  TrendingDown,
  Search,
  Eye,
  Filter,
  Loader2,
  Plus,
  ChevronDown,
  Download,
  MoreHorizontal,
  Activity,
} from "lucide-react";
import { CompanyModal } from "@/components/adminCOmponents/CompanyModal";
import Loader from "@/components/Loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HRUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  jobs: Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    salary: number;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    recruiterId: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface Employee {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    role: string;
    position: string[];
    department: string[];
    hrId: string;
    salary: string;
    createdAt: string;
    updatedAt: string;
    report?: {
      id: number;
      createdAt: string;
      updatedAt: string;
      userId: string;
      executiveSummary: string;
      hrId: string;
      departement: string;
      geniusFactorScore: number;
      geniusFactorProfileJson: any;
      currentRoleAlignmentAnalysisJson: any;
      internalCareerOpportunitiesJson: any;
      retentionAndMobilityStrategiesJson: any;
      developmentActionPlanJson: any;
      personalizedResourcesJson: any;
      dataSourcesAndMethodologyJson: any;
      risk_analysis: {
        scores: {
          genius_factor_score: number;
          retention_risk_score: number;
          mobility_opportunity_score: number;
        };
        trends: any;
        company: string;
        genius_factors: string[];
        recommendations: string[];
        analysis_summary: string;
      };
    } | null;
  };
  report: any;
}

interface ApiResponse {
  data: Array<{
    hrUser: HRUser;
    company: any;
    employees: Employee[];
  }>;
}

interface CompanyDetail {
  name: string;
  email?: string;
  industry?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  foundedYear?: number;
  employeeCount?: number;
  role?: string;
}

interface Company {
  id: string;
  companyDetail: CompanyDetail;
  company?: {
    id: string;
    companyDetail: CompanyDetail;
    hrId: string[];
    createdAt: string;
    updatedAt: string;
  };
  hrUsers: HRUser[];
  employees?: Employee[];
  totalHRUsers: number;
  totalEmployees: number;
  totalIndividualReports: number;
  createdAt: string;
  updatedAt: string;
}

function CompaniesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSearchTerm, setFilteredSearchTerm] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompanyName, setSelectedCompanyName] = useState("all");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();

  // Initialize search from URL
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchTerm(search);
      setFilteredSearchTerm(search);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCompanies();
  }, [page, filteredSearchTerm]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search: filteredSearchTerm,
      });

      const response = await fetch(`/api/admin/get-admin-companies?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid data format: Expected an array in 'data'");
      }

      const transformedCompanies: Company[] = data.data
        .map((item, index) => {
          if (!item.hrUser) {
            return {
              id: `placeholder-${index}`,
              companyDetail: {
                name: "Unknown HR User",
                email: undefined,
                industry: "Unknown",
                phoneNumber: undefined,
                role: "Unknown",
              },
              hrUsers: [],
              totalHRUsers: 0,
              totalEmployees: 0,
              totalIndividualReports: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }

          const hrUser = item.hrUser;
          const employees = item.employees || [];
          const company = item.company;

          const numEmployees = employees.length;
          const numReports = employees.filter((e) => e.report).length;

          const companyDetail = company?.companyDetail || {
            name: `${hrUser.firstName} ${hrUser.lastName} (HR User)`,
            email: hrUser.email,
            industry:
              hrUser.jobs[0]?.description.split(" department.")[0] || "Unknown",
            phoneNumber: hrUser.phoneNumber,
            role: hrUser.role,
            phone: undefined,
            address: undefined,
            website: undefined,
            description: undefined,
            foundedYear: undefined,
            employeeCount: undefined,
          };

          return {
            id: company?.id || hrUser.id,
            companyDetail,
            company: company || undefined,
            hrUsers: [hrUser],
            employees,
            totalHRUsers: 1,
            totalEmployees: numEmployees,
            totalIndividualReports: numReports,
            createdAt:
              company?.createdAt ||
              hrUser.createdAt ||
              new Date().toISOString(),
            updatedAt:
              company?.updatedAt ||
              hrUser.updatedAt ||
              new Date().toISOString(),
          };
        })
        .filter((c) => c.id !== "placeholder");

      if (page === 1) {
        setCompanies(transformedCompanies);
      } else {
        setCompanies((prev) => [...prev, ...transformedCompanies]);
      }

      setHasMore(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Error fetching companies: ${errorMessage}`);
      console.error("Fetch error details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    setSearchTerm(value);

    if (value.length <= 2) {
      setFilteredSearchTerm(value);
      setPage(1);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      setFilteredSearchTerm(value);
      setPage(1);
    }, 150);
  }, []);

  const companyNames = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(companies.map((c) => c.companyDetail.name).filter(Boolean))
      ),
    ],
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.companyDetail.name
          ?.toLowerCase()
          .includes(filteredSearchTerm.toLowerCase()) ||
        company.companyDetail.email
          ?.toLowerCase()
          .includes(filteredSearchTerm.toLowerCase()) ||
        company.companyDetail.phoneNumber
          ?.toLowerCase()
          .includes(filteredSearchTerm.toLowerCase()) ||
        company.hrUsers.some((hr) =>
          hr.jobs.some(
            (job) =>
              job.title
                ?.toLowerCase()
                .includes(filteredSearchTerm.toLowerCase()) ||
              job.description
                ?.toLowerCase()
                .includes(filteredSearchTerm.toLowerCase())
          )
        );

      const matchesCompanyName =
        selectedCompanyName === "all" ||
        company.companyDetail.name === selectedCompanyName;

      return matchesSearch && matchesCompanyName;
    });
  }, [companies, filteredSearchTerm, selectedCompanyName]);

  const totalEmployees = useMemo(
    () => companies.reduce((sum, company) => sum + company.totalEmployees, 0),
    [companies]
  );

  const totalAssessments = useMemo(
    () =>
      companies.reduce(
        (sum, company) => sum + company.totalIndividualReports,
        0
      ),
    [companies]
  );

  const calculateRetentionRisk = useCallback(
    (company: Company): number | null => {
      if (!company.employees || company.employees.length === 0) {
        return null;
      }

      const employeesWithReports = company.employees.filter(
        (emp) => emp.report
      );

      if (employeesWithReports.length === 0) {
        return null;
      }

      let totalRisk = 0;
      let validReportsCount = 0;

      employeesWithReports.forEach((emp) => {
        const report = emp.report || emp.employee?.report;

        if (report && report.risk_analysis && report.risk_analysis.scores) {
          const riskScore = report.risk_analysis.scores.retention_risk_score;
          if (
            riskScore !== undefined &&
            riskScore !== null &&
            !isNaN(riskScore)
          ) {
            totalRisk += riskScore;
            validReportsCount++;
          }
        }
      });

      if (validReportsCount > 0) {
        return Math.round(totalRisk / validReportsCount);
      }

      return null;
    },
    []
  );

  const calculateAverageRisk = useCallback((): number | null => {
    const companiesWithRiskData = companies.filter((company) => {
      const risk = calculateRetentionRisk(company);
      return risk !== null;
    });

    if (companiesWithRiskData.length === 0) {
      return null;
    }

    const totalRisk = companiesWithRiskData.reduce((sum, company) => {
      const risk = calculateRetentionRisk(company);
      return risk !== null ? sum + risk : sum;
    }, 0);

    return Math.round(totalRisk / companiesWithRiskData.length);
  }, [companies, calculateRetentionRisk]);

  const averageRisk = useMemo(
    () => calculateAverageRisk(),
    [calculateAverageRisk]
  );

  const getRiskBadgeVariant = useCallback(
    (risk: number | null): "default" | "secondary" | "destructive" => {
      if (risk === null) return "secondary";
      if (risk < 10) return "default";
      if (risk < 20) return "secondary";
      return "destructive";
    },
    []
  );

  const getRiskLevel = useCallback((risk: number | null): string => {
    if (risk === null) return "No Data";
    if (risk < 10) return "Low Risk";
    if (risk < 20) return "Medium Risk";
    return "High Risk";
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  const handleViewDetails = useCallback(
    (company: Company, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedCompany(company);
      setIsModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  }, []);

  if (loading && companies.length === 0) {
    return (
      <HRLayout
        title="Organizations Management"
        subtitle="Overview and management of all connected organizations"
      >
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </HRLayout>
    );
  }

  if (error && companies.length === 0) {
    return (
      <HRLayout
        title="Organizations Management"
        subtitle="Overview and management of all connected organizations"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchCompanies}>Try Again</Button>
          </div>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout
      title="Organizations Management"
      subtitle="Overview and management of all connected organizations"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Organizations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and monitor all connected HR organizations
            </p>
          </div>
          {/* <div className="flex items-center gap-3">
            <Button className="btn-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Refresh Data</DropdownMenuItem>
                <DropdownMenuItem>Manage Categories</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Analytics</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Organizations
                </p>
                <h3 className="text-2xl font-bold mt-1">{companies.length}</h3>
                <Badge className="badge-blue mt-2">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="icon-wrapper-blue">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Employees
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {totalEmployees.toLocaleString()}
                </h3>
                <Badge className="badge-green mt-2">
                  <Users className="h-3 w-3 mr-1" />
                  Across all organizations
                </Badge>
              </div>
              <div className="icon-wrapper-green">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Assessments
                </p>
                <h3 className="text-2xl font-bold mt-1">{totalAssessments}</h3>
                <Badge className="badge-purple mt-2">
                  <ClipboardList className="h-3 w-3 mr-1" />
                  Total reports
                </Badge>
              </div>
              <div className="icon-wrapper-purple">
                <ClipboardList className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Retention Risk
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {averageRisk !== null ? `${averageRisk}%` : "N/A"}
                </h3>
                <Badge className="badge-amber mt-2">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Retention risk
                </Badge>
              </div>
              <div className="icon-wrapper-amber">
                <TrendingDown className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="card-primary card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search organizations, HR users, or jobs..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9 bg-muted/50 border-border"
                />
              </div>
              <Select
                value={selectedCompanyName}
                onValueChange={setSelectedCompanyName}
              >
                <SelectTrigger className="w-[200px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companyNames.slice(1).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => {
            const retentionRisk = calculateRetentionRisk(company);
            const completionRate =
              company.totalEmployees > 0
                ? Math.round(
                    (company.totalIndividualReports / company.totalEmployees) *
                      100
                  )
                : 0;

            return (
              <Card key={company.id} className="card-primary card-hover group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="sidebar-user-avatar h-12 w-12 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {company.companyDetail.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{company.companyDetail.role}</span>
                          <span className="text-xs">•</span>
                          <span>{company.companyDetail.industry}</span>
                        </p>
                        {company.companyDetail.email && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {company.companyDetail.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        retentionRisk === null
                          ? "badge-blue"
                          : retentionRisk < 10
                          ? "badge-green"
                          : retentionRisk < 20
                          ? "badge-amber"
                          : "badge-blue"
                      )}
                    >
                      {getRiskLevel(retentionRisk)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="assessment-item text-center p-3">
                      <div className="text-2xl font-bold text-foreground">
                        {company.totalEmployees}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Employees
                      </div>
                    </div>
                    <div className="assessment-item text-center p-3">
                      <div className="text-2xl font-bold text-foreground">
                        {company.totalIndividualReports}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Assessments
                      </div>
                    </div>
                  </div>

                  {/* Assessment Completion */}
                  {company.totalEmployees > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Assessment Completion
                        </span>
                        <span className="font-medium">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="progress-bar-primary h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(completionRate, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Retention Risk */}
                  {retentionRisk !== null ? (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Retention Risk
                        </span>
                        <span className="font-medium">{retentionRisk}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${retentionRisk}%`,
                            background:
                              retentionRisk < 10
                                ? "var(--success)"
                                : retentionRisk < 20
                                ? "var(--warning)"
                                : "var(--destructive)",
                          }}
                        />
                      </div>
                    </div>
                  ) : company.totalEmployees > 0 ? (
                    <div className="assessment-item text-center p-3">
                      <p className="text-xs text-muted-foreground">
                        No assessment data available
                      </p>
                    </div>
                  ) : null}

                  <Button
                    variant="outline"
                    className="w-full mt-4 hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={(e) => handleViewDetails(company, e)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Organizations"
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredCompanies.length === 0 && !loading && (
          <Card className="card-primary">
            <CardContent className="text-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No organizations found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find organizations
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilteredSearchTerm("");
                  setSelectedCompanyName("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Company Modal */}
      <CompanyModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </HRLayout>
  );
}

export default function Companies() {
  return (
    <Suspense fallback={<Loader />}>
      <CompaniesContent />
    </Suspense>
  );
}

// Add missing cn import
import { cn } from "@/lib/utils";
