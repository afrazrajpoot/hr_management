"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  DollarSign,
  MapPin,
  Bookmark,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import { useDebounce } from "@/custom-hooks/useDebounce";
import JobDetailsModal from "@/components/employee/JobDetailsModal";
import Loader from "@/components/Loader";
import { useCreateCareerPathwayRecommendationsMutation } from "@/redux/hr-python-api/intervation";
import { useSession } from "next-auth/react";

// Map API data to career recommendation structure
const mapApiToCareerData = (apiData: any) => {
  if (!apiData?.recommendations) return [];

  return apiData.recommendations.map((job: any) => ({
    id: job.id || `job-${Math.random()}`,
    title: job.title || "Untitled Job",
    industry: job.industry || inferIndustry(job.title || "", job.description || ""),
    matchScore: job.match_score || job.matchScore || 0,
    salaryRange: job.salary
      ? `$${job.salary.toLocaleString()}`
      : null,
    location: job.location || null,
    type: job.type || null,
    status: job.status || null,
    saved: false,
    description: job.description || "No description available",
    createdAt: job.created_at || job.createdAt || new Date().toISOString(), // Fallback for time filtering
    sourceUrl: job.source_url || job.sourceUrl || null,
    companies: job.recruiter
      ? [`${job.recruiter.firstName} ${job.recruiter.lastName}`]
      : [],
  }));
};

// Infer industry
const inferIndustry = (title: string, description: string) => {
  const lowerTitle = title.toLowerCase();
  const lowerDescription = description.toLowerCase();
  if (
    lowerTitle.includes("developer") ||
    lowerDescription.includes("react") ||
    lowerDescription.includes("api")
  )
    return "Technology";
  if (
    lowerTitle.includes("analyst") ||
    lowerDescription.includes("data") ||
    lowerDescription.includes("business")
  )
    return "Finance";
  if (
    lowerTitle.includes("ux") ||
    lowerTitle.includes("designer") ||
    lowerDescription.includes("user interface")
  )
    return "Design";
  return "General";
};

const sortOptions = [
  { value: "score-desc", label: "Match Score" },
  { value: "salary-desc", label: "Salary" },
];

export default function CareerPathways() {
  const [filters, setFilters] = useState({
    search: "",
    industry: "All",
    type: "All",
    time: "All Time",
    minScore: 0,
    maxScore: 100,
    sortBy: "score",
    sortOrder: "desc",
  });

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applyingJobIds, setApplyingJobIds] = useState(new Set<string>());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const limit = 6;
  const { data: session, status } = useSession<any>();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 500);
  const hasFetchedRef = useRef(false);

  // Sync local search when filters.search changes externally
  useEffect(() => {
    if (filters.search !== localSearch) {
      setLocalSearch(filters.search);
    }
  }, [filters.search]);

  // Update global filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  const [getRecommendations, { data, isLoading, isError, error, isSuccess }] =
    useCreateCareerPathwayRecommendationsMutation();

  const fetchRecommendations = useCallback((pageNum: number) => {
    const hrId = session?.user?.hrId || `hr-${Math.random().toString(36).substring(7)}`;
    getRecommendations({
      recruiter_id: hrId,
      employee_id: session.user.id,
      page: pageNum,
      limit,
    });
  }, [getRecommendations, session?.user?.hrId, session?.user?.id, limit]);

  // Truncate description for card preview
  const truncateDescription = (
    description: string,
    maxLength: number = 120
  ) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + "...";
  };

  // Accumulate recommendations on success
  useEffect(() => {
    if (isSuccess && data) {
      const newRecs = mapApiToCareerData(data);
      setRecommendations((prev) =>
        page === 1 ? newRecs : [...prev, ...newRecs]
      );
      setHasMore(data.hasMore || false);
      setTotal(data.total || 0);
    }
  }, [isSuccess, data, page]);

  // Fetch applied jobs on component mount
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          setIsLoadingApplications(true);
          const response = await fetch("/api/apply-job");
          if (response.ok) {
            const { applications } = await response.json();
            const appliedJobIds = applications.map((app: any) => app.jobId);
            setAppliedJobs(appliedJobIds);
          } else {
            console.error("Failed to fetch applied jobs");
          }
        } catch (err) {
          console.error("Error fetching applied jobs:", err);
        } finally {
          setIsLoadingApplications(false);
        }
      }
    };

    fetchAppliedJobs();
  }, [status, session?.user?.id]);

  // Initial fetch
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.id &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      fetchRecommendations(1);
    } else if (
      status !== "authenticated" ||
      !session?.user?.id
    ) {
      console.warn(
        "Cannot fetch recommendations: Session not ready or missing data"
      );
      hasFetchedRef.current = false;
    }
  }, [fetchRecommendations, status, session?.user?.id]);

  // Dynamically compute industry and job type filters from available data
  const dynamicIndustries = useMemo(() => {
    const uniqueIndustries = new Map<string, string>(); // lowercase -> original
    recommendations.forEach((rec) => {
      if (rec.industry) {
        const lower = rec.industry.toLowerCase();
        if (!uniqueIndustries.has(lower)) {
          uniqueIndustries.set(lower, rec.industry);
        }
      }
    });
    return ["All", ...Array.from(uniqueIndustries.values())].sort();
  }, [recommendations]);

  const dynamicJobTypes = useMemo(() => {
    const uniqueTypes = new Map<string, string>(); // lowercase -> original
    recommendations.forEach((rec) => {
      if (rec.type) {
        const lower = rec.type.toLowerCase();
        if (!uniqueTypes.has(lower)) {
          uniqueTypes.set(lower, rec.type);
        }
      }
    });
    return ["All", ...Array.from(uniqueTypes.values())].sort();
  }, [recommendations]);

  // Utility to normalize strings for comparison (removes spaces, dashes, underscores and lowercases)
  const normalize = (str: string) => str.toLowerCase().replace(/[\s\-_]/g, "");

  const filteredAndSortedRecommendations = useMemo(() => {
    if (!recommendations.length) return [];

    let filtered = recommendations.filter((career: any) => {
      // 1. Search Filter (Flexible matching)
      if (debouncedSearch) {
        const search = debouncedSearch.toLowerCase();
        const matchesSearch =
          career.title.toLowerCase().includes(search) ||
          career.industry.toLowerCase().includes(search) ||
          (career.location && career.location.toLowerCase().includes(search)) ||
          career.description.toLowerCase().includes(search) ||
          (career.type && career.type.toLowerCase().includes(search)) ||
          career.companies.some((c: string) => c.toLowerCase().includes(search));

        if (!matchesSearch) return false;
      }

      // 2. Industry Filter (Case & Space insensitive)
      if (filters.industry !== "All" && normalize(career.industry) !== normalize(filters.industry)) {
        return false;
      }

      // 3. Job Type Filter (Resilient to FULL_TIME vs Full-time vs Full Time)
      if (filters.type !== "All" && normalize(career.type || "") !== normalize(filters.type)) {
        return false;
      }

      // 4. Match Score Filter
      if (career.matchScore < filters.minScore || career.matchScore > filters.maxScore) {
        return false;
      }

      // 5. Time Filter
      if (filters.time !== "All Time") {
        const jobDate = new Date(career.createdAt).getTime();
        const now = new Date().getTime();
        const daysDiff = (now - jobDate) / (1000 * 60 * 60 * 24);

        if (filters.time === "Last 24 Hours" && daysDiff > 1) return false;
        if (filters.time === "Last 7 Days" && daysDiff > 7) return false;
        if (filters.time === "Last 30 Days" && daysDiff > 30) return false;
      }

      return true;
    });

    filtered.sort((a: any, b: any) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "score":
          comparison = a.matchScore - b.matchScore;
          break;
        case "salary":
          const salaryA =
            !a.salaryRange
              ? 0
              : parseFloat(a.salaryRange.replace("$", "").replace(",", ""));
          const salaryB =
            !b.salaryRange
              ? 0
              : parseFloat(b.salaryRange.replace("$", "").replace(",", ""));
          comparison = salaryA - salaryB;
          break;
        default:
          comparison = a.matchScore - b.matchScore;
      }
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [recommendations, filters, debouncedSearch]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecommendations(nextPage);
  }, [fetchRecommendations, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
        hasMore &&
        !isLoading
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoading, loadMore]);

  const toggleSaved = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Handle apply for a job
  const handleApply = async (
    jobId: string,
    jobTitle: string,
    matchScore: number,
    sourceUrl?: string
  ) => {
    if (sourceUrl) {
      window.open(sourceUrl, "_blank");
      return;
    }

    if (appliedJobs.includes(jobId)) {
      alert("You have already applied for this job.");
      return;
    }

    setApplyingJobIds((prev) => new Set([...prev, jobId]));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_URL}/api/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.fastApiToken || ""}`,
          },
          body: JSON.stringify({
            job_id: jobId,
            hr_id: session?.user?.hrId || `hr-${Math.random().toString(36).substring(7)}`,
            user_id: session?.user?.id,
            score: matchScore,
          }),
        }
      );

      if (response.ok) {
        setAppliedJobs((prev) => [...prev, jobId]);
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to apply"}`);
      }
    } catch (err) {
      alert("Failed to apply. Please try again.");
    } finally {
      setApplyingJobIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    }));
  };

  const openJobDetails = (job: any) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  if ((isLoading && page === 1) || isLoadingApplications) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-layout-purple p-6">
          <div className="text-center text-destructive">
            Error loading recommendations: {JSON.stringify(error)}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-layout-purple p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient-purple">
                Career Pathways Assistant
              </h1>
              <p className="text-on-matte-subtle mt-1">
                AI-powered career recommendations based on your Genius Factor profile
              </p>
            </div>
          </div>

          <Card className="surface-matte-elevated border-matte/40 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500/50 via-purple-300/50 to-purple-500/50" />
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Search Bar Row */}
                <div className="p-6 border-b border-matte/30">
                  <div className="relative group max-w-3xl mx-auto">
                    <Input
                      placeholder="Find your next career move by title, skill, or location..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      className="pl-6 pr-14 h-14 text-lg input-purple border-matte/60 focus:ring-2 focus:ring-purple-accent/30 rounded-full transition-all duration-300 placeholder:text-on-matte-subtle/50"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      {localSearch && (
                        <button
                          onClick={() => setLocalSearch("")}
                          className="text-on-matte-subtle hover:text-white transition-colors p-1"
                        >
                          <span className="text-xl">×</span>
                        </button>
                      )}
                      <Search className="text-on-matte-subtle w-5 h-5 group-focus-within:text-purple-accent transition-colors duration-300" />
                    </div>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="px-6 py-4 bg-matte/20 flex flex-wrap items-center gap-6">
                  <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-on-matte-subtle/70">Filters:</span>
                      <Select
                        value={filters.industry}
                        onValueChange={(value) => handleFilterChange("industry", value)}
                      >
                        <SelectTrigger className="w-[160px] h-9 bg-matte/40 border-matte/40 text-sm rounded-lg hover:border-purple-accent/40 transition-colors focus:ring-1 focus:ring-purple-accent/30">
                          <SelectValue placeholder="Industry" />
                        </SelectTrigger>
                        <SelectContent className="surface-matte-elevated border-matte shadow-2xl">
                          {dynamicIndustries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.type}
                        onValueChange={(value) => handleFilterChange("type", value)}
                      >
                        <SelectTrigger className="w-[160px] h-9 bg-matte/40 border-matte/40 text-sm rounded-lg hover:border-purple-accent/40 transition-colors focus:ring-1 focus:ring-purple-accent/30">
                          <SelectValue placeholder="Job Type" />
                        </SelectTrigger>
                        <SelectContent className="surface-matte-elevated border-matte shadow-2xl">
                          {dynamicJobTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type === "All" ? "All Types" : type.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.time}
                        onValueChange={(value) => handleFilterChange("time", value)}
                      >
                        <SelectTrigger className="w-[160px] h-9 bg-matte/40 border-matte/40 text-sm rounded-lg hover:border-purple-accent/40 transition-colors focus:ring-1 focus:ring-purple-accent/30">
                          <SelectValue placeholder="Posted" />
                        </SelectTrigger>
                        <SelectContent className="surface-matte-elevated border-matte shadow-2xl">
                          <SelectItem value="All Time">All Time</SelectItem>
                          <SelectItem value="Last 24 Hours">Last 24 Hours</SelectItem>
                          <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                          <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilterChange("type", filters.type === "FULL_TIME" ? "All" : "FULL_TIME")}
                        className={`h-9 px-4 rounded-lg border-matte/40 transition-all ${filters.type === "FULL_TIME"
                          ? "bg-purple-accent text-white border-purple-accent"
                          : "bg-matte/40 text-on-matte-subtle hover:text-white hover:border-purple-accent/40"
                          }`}
                      >
                        Full-time
                      </Button>
                    </div>

                    {(filters.search || filters.industry !== "All" || filters.type !== "All" || filters.time !== "All Time") && (
                      <div className="flex flex-wrap gap-2 items-center pl-4 border-l border-matte/40">
                        {filters.industry !== "All" && (
                          <Badge variant="outline" className="h-7 bg-purple-accent/5 border-purple-accent/30 text-purple-accent px-2 py-0 font-medium">
                            {filters.industry}
                            <button onClick={() => handleFilterChange("industry", "All")} className="ml-1.5 hover:text-white rotate-45 text-lg leading-none">+</button>
                          </Badge>
                        )}
                        {filters.type !== "All" && (
                          <Badge variant="outline" className="h-7 bg-purple-accent/5 border-purple-accent/30 text-purple-accent px-2 py-0 font-medium">
                            {filters.type.replace("_", " ")}
                            <button onClick={() => handleFilterChange("type", "All")} className="ml-1.5 hover:text-white rotate-45 text-lg leading-none">+</button>
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLocalSearch("");
                            setFilters({
                              ...filters,
                              search: "",
                              industry: "All",
                              type: "All",
                              time: "All Time"
                            });
                          }}
                          className="h-7 text-xs font-semibold text-on-matte-subtle hover:text-purple-accent hover:bg-transparent transition-colors px-2"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 pl-4 border-l border-matte/40">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-matte-subtle/50">Sort:</span>
                    <Select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onValueChange={handleSortChange}
                    >
                      <SelectTrigger className="w-[130px] h-8 bg-transparent border-none text-xs font-bold text-on-matte hover:text-purple-accent transition-colors focus:ring-0 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="surface-matte-elevated border-matte shadow-2xl">
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-xs">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-on-matte-subtle text-sm font-medium">
              Showing <span className="text-purple-accent">{filteredAndSortedRecommendations.length}</span> matches
              {total ? <span className="opacity-60"> of {total}</span> : ''}
            </p>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedRecommendations.map((career: any) => (
              <Card key={career.id} className="surface-matte-elevated group hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-xl text-on-matte">
                          {career.title}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-on-matte-subtle">
                        {career.industry && <span>{career.industry}</span>}
                        {career.industry && career.type && <span>•</span>}
                        {career.type && <span>{career.type.replace("_", " ")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-accent">
                          {career.matchScore}%
                        </div>
                        <div className="text-xs text-on-matte-subtle">
                          Match
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSaved(career.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${savedJobs.includes(career.id)
                            ? "fill-current text-purple-accent"
                            : "text-on-matte-subtle"
                            }`}
                        />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-on-matte-subtle line-clamp-3">
                    {truncateDescription(career.description)}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {career.salaryRange && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-purple-accent" />
                        <span className="text-on-matte">{career.salaryRange}</span>
                      </div>
                    )}
                    {career.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-purple-accent" />
                        <span className="text-on-matte">{career.location}</span>
                      </div>
                    )}
                  </div>
                  {career.companies && career.companies.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-on-matte">Recruiter:</div>
                      <div className="flex flex-wrap gap-2">
                        {career.companies
                          .slice(0, 3)
                          .map((company: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="badge-brand text-xs"
                            >
                              {company}
                            </Badge>
                          ))}
                        {career.companies.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-matte text-on-matte-subtle"
                          >
                            +{career.companies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-matte space-x-2">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openJobDetails(career)}
                      className="cursor-pointer group/link flex items-center text-sm font-medium text-purple-accent hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <span className="group-hover/link:underline">View Details</span>
                      <ExternalLink className="w-3 h-3 ml-1 group-hover/link:translate-x-0.5 transition-transform" />
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleApply(
                          career.id,
                          career.title,
                          career.matchScore,
                          career.sourceUrl
                        )
                      }
                      disabled={
                        appliedJobs.includes(career.id) ||
                        applyingJobIds.has(career.id)
                      }
                      className="btn-purple"
                    >
                      {applyingJobIds.has(career.id) ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Applying...</span>
                        </div>
                      ) : appliedJobs.includes(career.id) ? (
                        "Applied"
                      ) : (
                        "Apply Now"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <JobDetailsModal
            job={selectedJob}
            onClose={closeJobDetails}
            onApply={handleApply}
            appliedJobs={appliedJobs}
            applyingJobIds={applyingJobIds}
          />

          {/* Success Modal */}
          <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <DialogContent className="surface-matte-elevated">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-on-matte">Application Submitted!</span>
                </DialogTitle>
                <DialogDescription className="text-center text-on-matte-subtle">
                  Your application for the position has been successfully
                  submitted. You'll hear back from the recruiter soon.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  className="btn-purple"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {isLoading && (
            <div className="text-center py-4">
              <Loader />
            </div>
          )}

          {filteredAndSortedRecommendations.length === 0 && !isLoading && (
            <Card className="surface-matte-elevated">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="icon-brand mx-auto mb-4 p-3">
                  <Search className="w-8 h-8 text-purple-accent" />
                </div>
                <h3 className="text-xl font-bold text-gradient-purple mb-2">
                  No recommendations found
                </h3>
                <p className="text-on-matte-subtle">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Button
              onClick={loadMore}
              variant="outline"
              size="lg"
              className="btn-purple-outline"
            >
              Load More Recommendations
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}