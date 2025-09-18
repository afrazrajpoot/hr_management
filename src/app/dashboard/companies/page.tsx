"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
} from "lucide-react";
import { CompanyModal } from "@/components/adminCOmponents/CompanyModal";
import Loader from "@/components/Loader";

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

export default function Companies() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(""); // Immediate UI feedback
  const [filteredSearchTerm, setFilteredSearchTerm] = useState(""); // Debounced for API
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompanyName, setSelectedCompanyName] = useState("all");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch companies when page or filtered search term changes
  useEffect(() => {
    fetchCompanies();
  }, [page, filteredSearchTerm]);

  // Cleanup timeout on unmount
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
      console.log("Fetching companies with params:", params.toString());

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
      console.log("API Response:", data);

      // Check if data exists and is an array
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid data format: Expected an array in 'data'");
      }

      // Transform API data to match Company interface
      const transformedCompanies: Company[] = data.data
        .map((item, index) => {
          if (!item.hrUser) {
            console.warn("Incomplete item data (no hrUser):", item);
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

          // Calculate statistics
          const numEmployees = employees.length;
          const numReports = employees.filter((e) => e.report).length;

          // Use company data if available, otherwise fallback to HR user data
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

  // Optimized search handler with immediate feedback and debounced API calls
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Update UI immediately for better typing experience
    setSearchTerm(value);

    // Handle immediate search for short terms (1-2 characters)
    if (value.length <= 2) {
      setFilteredSearchTerm(value);
      setPage(1);
      return;
    }

    // Debounced search for longer terms (150ms for responsive feel)
    searchTimeout.current = setTimeout(() => {
      setFilteredSearchTerm(value);
      setPage(1);
    }, 150);
  }, []);

  // Extract unique company names
  const companyNames = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(companies.map((c) => c.companyDetail.name).filter(Boolean))
      ),
    ],
    [companies]
  );

  // Memoize filtered companies to prevent unnecessary re-renders
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

  // Memoize calculations to prevent recalculation on every render
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

  const handleCompanyFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCompanyName(e.target.value);
      setPage(1); // Reset to first page when filter changes
    },
    []
  );

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
        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Organizations"
            value={companies.length}
            description="Connected HR organizations"
            icon={<Building2 className="h-4 w-4" />}
          />
          <StatCard
            title="Total Employees"
            value={totalEmployees.toLocaleString()}
            description="Across all organizations"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Assessments Completed"
            value={totalAssessments}
            description="Total employee reports"
            icon={<ClipboardList className="h-4 w-4" />}
          />
          <StatCard
            title="Average Risk"
            value={averageRisk !== null ? `${averageRisk}%` : "N/A"}
            description="Retention risk"
            icon={<TrendingDown className="h-4 w-4" />}
            variant={averageRisk !== null ? "default" : "secondary"}
          />
        </div>

        {/* Filter Section */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search organizations, HR users, or jobs..."
                  value={searchTerm} // Immediate visual feedback
                  onChange={handleSearch}
                  className="pl-9"
                />
              </div>
              <select
                value={selectedCompanyName}
                onChange={handleCompanyFilterChange}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground min-w-[150px]"
              >
                {companyNames.map((name) => (
                  <option key={name} value={name}>
                    {name === "all" ? "All Companies" : name}
                  </option>
                ))}
              </select>
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
              <Card
                key={company.id}
                className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group"
                // onClick={() =>
                //   router.push(`/hr-dashboard/organizations/${company.id}`)
                // }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-hr-primary transition-colors">
                          {company.companyDetail.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{company.companyDetail.role}</span>
                          <span className="text-xs">•</span>
                          <span>{company.companyDetail.industry}</span>
                          {company.companyDetail.phoneNumber && (
                            <>
                              <span className="text-xs">•</span>
                              <span className="text-xs">
                                {company.companyDetail.phoneNumber}
                              </span>
                            </>
                          )}
                        </p>
                        {company.companyDetail.email && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {company.companyDetail.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={getRiskBadgeVariant(retentionRisk)}>
                      {getRiskLevel(retentionRisk)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">
                        {company.totalEmployees}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Employees
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">
                        {company.totalIndividualReports}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Assessments
                      </div>
                    </div>
                  </div>

                  {/* Assessment Completion - Only show if employees exist */}
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
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(completionRate, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Retention Risk - Only show if we have actual data */}
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
                          className={`h-2 rounded-full transition-all duration-500 ${
                            retentionRisk < 10
                              ? "bg-success"
                              : retentionRisk < 20
                              ? "bg-warning"
                              : "bg-destructive"
                          }`}
                          style={{ width: `${retentionRisk}%` }}
                        />
                      </div>
                    </div>
                  ) : company.totalEmployees > 0 ? (
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">
                        No assessment data available
                      </p>
                    </div>
                  ) : null}

                  <Button
                    variant="outline"
                    className="w-full mt-4 group-hover:bg-hr-primary group-hover:text-white transition-all"
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

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <Button onClick={loadMore} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader />
                </>
              ) : (
                "Load More Organizations"
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredCompanies.length === 0 && !loading && (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No organizations found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find organizations
                or HR users.
              </p>
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
