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
    industry: inferIndustry(job.title || "", job.description || ""),
    matchScore: job.match_score || job.matchScore || 0,
    salaryRange: job.salary
      ? `$${job.salary.toLocaleString()}`
      : "Not specified",
    location: job.location || "Not specified",
    type: job.type || "Not specified",
    status: job.status || "Unknown",
    saved: false,
    description: job.description || "No description available",
    sourceUrl: job.source_url || job.sourceUrl || null,
    companies: [
      job.recruiter
        ? `${job.recruiter.firstName} ${job.recruiter.lastName}`
        : "Unknown Recruiter",
    ],
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

const industries = ["All", "Technology", "Finance", "Design", "General"];
const jobTypes = ["All", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];
const sortOptions = [
  { value: "score-desc", label: "Match Score" },
  { value: "salary-desc", label: "Salary" },
];

export default function CareerPathways() {
  const [filters, setFilters] = useState({
    search: "",
    industry: "All",
    type: "All",
    minScore: 0,
    maxScore: 100,
    sortBy: "score",
    sortOrder: "desc",
  });

  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applyingJobIds, setApplyingJobIds] = useState(new Set<string>());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const limit = 6;
  const { data: session, status } = useSession<any>();
  const debouncedSearch = useDebounce(filters.search, 500);
  const hasFetchedRef = useRef(false);

  const [getRecommendations, { data, isLoading, isError, error, isSuccess }] =
    useCreateCareerPathwayRecommendationsMutation();

  // Truncate description for card preview
  const truncateDescription = (
    description: string,
    maxLength: number = 120
  ) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + "...";
  };

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

  // Debug session and mutation
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.id &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      // Use existing HR ID or generate a random one
      const hrId = session.user.hrId || `hr-${Math.random().toString(36).substring(7)}`;
      
      getRecommendations({
        recruiter_id: hrId,
        employee_id: session.user.id,
      });
    } else if (
      status !== "authenticated" ||
      !session?.user?.id
    ) {
      console.warn(
        "Cannot fetch recommendations: Session not ready or missing data"
      );
      hasFetchedRef.current = false;
    }
  }, [getRecommendations, status, session?.user?.hrId, session?.user?.id]);

  const allRecommendations = useMemo(() => {
    if (!data?.recommendations) return [];
    return mapApiToCareerData(data);
  }, [data]);

  const filteredAndSortedRecommendations = useMemo(() => {
    if (!allRecommendations.length) return [];

    let filtered = allRecommendations.filter((career: any) => {
      if (
        debouncedSearch &&
        !career.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !career.industry
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) &&
        !career.location.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false;
      }
      if (filters.industry !== "All" && career.industry !== filters.industry) {
        return false;
      }
      if (filters.type !== "All" && career.type !== filters.type) {
        return false;
      }
      if (
        career.matchScore < filters.minScore ||
        career.matchScore > filters.maxScore
      ) {
        return false;
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
            a.salaryRange === "Not specified"
              ? 0
              : parseFloat(a.salaryRange.replace("$", "").replace(",", ""));
          const salaryB =
            b.salaryRange === "Not specified"
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
  }, [allRecommendations, filters, debouncedSearch]);

  const loadMore = useCallback(() => {
    if (data?.hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [data?.hasMore, isLoading]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filters.industry,
    filters.type,
    filters.minScore,
    filters.maxScore,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        data?.hasMore &&
        !isLoading
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data?.hasMore, isLoading, loadMore]);

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
        <div className="min-h-screen gradient-bg-primary p-6">
          <div className="text-center text-destructive">
            Error loading recommendations: {JSON.stringify(error)}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen gradient-bg-primary p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text-primary">
                Career Pathways Assistant
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered career recommendations based on your Genius Factor
                profile
              </p>
            </div>
          </div>

          <Card className="card-primary">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search career titles, industries, or locations..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="pl-10 border-input"
                    />
                  </div>
                </div>
                <Select
                  value={filters.industry}
                  onValueChange={(value) =>
                    handleFilterChange("industry", value)
                  }
                >
                  <SelectTrigger className="w-full lg:w-48 border-input">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
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
                  <SelectTrigger className="w-full lg:w-48 border-input">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredAndSortedRecommendations.length} career matches
              {data?.total && ` of ${data.total}`}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-32 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedRecommendations.map((career: any) => (
              <Card key={career.id} className="card-primary card-hover group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-xl">
                          {career.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{career.industry}</span>
                        <span>•</span>
                        <span>{career.type.replace("_", " ")}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {career.matchScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
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
                          className={`w-4 h-4 ${
                            savedJobs.includes(career.id)
                              ? "fill-current text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {truncateDescription(career.description)}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{career.salaryRange}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{career.location}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Recruiter:</div>
                    <div className="flex flex-wrap gap-2">
                      {career.companies
                        .slice(0, 3)
                        .map((company: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs border-primary/20"
                          >
                            {company}
                          </Badge>
                        ))}
                      {career.companies.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs border-muted text-muted-foreground"
                        >
                          +{career.companies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openJobDetails(career)}
                      className="border-input"
                    >
                      View Details
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
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
                      className="btn-gradient-primary"
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
            <DialogContent className="card-primary">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Application Submitted!</span>
                </DialogTitle>
                <DialogDescription className="text-center">
                  Your application for the position has been successfully
                  submitted. You'll hear back from the recruiter soon.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center">
                <Button onClick={() => setShowSuccessModal(false)}>
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

          {!data?.hasMore && filteredAndSortedRecommendations.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No more recommendations to load
            </div>
          )}

          {filteredAndSortedRecommendations.length === 0 && !isLoading && (
            <Card className="card-primary">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="icon-wrapper-blue mx-auto mb-4 p-3">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold gradient-text-primary mb-2">
                  No recommendations found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          )}

          {data?.hasMore && !isLoading && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                variant="outline"
                size="lg"
                className="border-input"
              >
                Load More Recommendations
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
