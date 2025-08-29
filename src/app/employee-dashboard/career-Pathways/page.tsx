"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  Filter,
  Bookmark,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import { useGetRecommendationsQuery } from "@/redux/employe-api";
import { useDebounce } from "@/custom-hooks/useDebounce";
import JobDetailsModal from "@/components/employee/JobDetailsModal";

// Map API data to match the expected career recommendation structure
const mapApiToCareerData = (apiData: any) => {
  if (!apiData?.recommendations) return [];

  return apiData.recommendations.map((job: any) => ({
    id: job.id,
    title: job.title || "Untitled Job",
    industry: inferIndustry(job.title, job.description),
    matchScore: job.match_score || 0, // Use the API's match_score field
    salaryRange: job.salary
      ? `$${job.salary.toLocaleString()}`
      : "Not specified",
    location: job.location || "Not specified",
    type: job.type || "Not specified",
    status: job.status || "Unknown",
    saved: false,
    description: job.description || "No description available",
    companies: [
      job.recruiter
        ? `${job.recruiter.firstName} ${job.recruiter.lastName}`
        : "Unknown Recruiter",
    ],
  }));
};

// Helper function to infer industry based on job title and description
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
  const [filters, setFilters] = useState<any>({
    search: "",
    industry: "All",
    type: "All",
    minScore: 0,
    maxScore: 100,
    sortBy: "score",
    sortOrder: "desc" as const,
  });

  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const limit = 6;

  // Debounce search term
  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch data with pagination
  const { data, isLoading, isError, isFetching } = useGetRecommendationsQuery({
    page,
    limit,
  });

  // Transform and cache all recommendations
  const allRecommendations = useMemo(() => {
    if (!data?.recommendations) return [];
    return mapApiToCareerData(data);
  }, [data?.recommendations]);

  // Client-side filtering and sorting
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

      // Industry filter
      if (filters.industry !== "All" && career.industry !== filters.industry) {
        return false;
      }

      // Type filter
      if (filters.type !== "All" && career.type !== filters.type) {
        return false;
      }

      // Score filters
      if (
        career.matchScore < filters.minScore ||
        career.matchScore > filters.maxScore
      ) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a: any, b: any) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "score":
          comparison = a.matchScore - b.matchScore;
          break;
        case "salary":
          // Handle cases where salary is "Not specified"
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

  // Load more function
  const loadMore = useCallback(() => {
    if (data?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [data?.hasMore, isFetching]);

  // Reset pagination when filters change
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

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        data?.hasMore &&
        !isFetching
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data?.hasMore, isFetching, loadMore]);

  const toggleSaved = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    setFilters((prev: any) => ({
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

  if (isLoading && page === 1) {
    return (
      <AppLayout>
        <div className="p-6 text-center flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          Loading recommendations...
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-red-500">
          Error loading recommendations. Please try again later.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Career Pathways</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered career recommendations based on your Genius Factor
              profile
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="card-elevated">
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
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={filters.industry}
                onValueChange={(value) => handleFilterChange("industry", value)}
              >
                <SelectTrigger className="w-full lg:w-48">
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
                <SelectTrigger className="w-full lg:w-48">
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

        {/* Results Summary */}
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
              <SelectTrigger className="w-32">
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

        {/* Career Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedRecommendations.map((career: any) => (
            <Card key={career.id} className="card-interactive group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-xl">{career.title}</CardTitle>
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
                      <div className="text-xs text-muted-foreground">Match</div>
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
                            : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {career.description}
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
                          variant="secondary"
                          className="text-xs"
                        >
                          {company}
                        </Badge>
                      ))}
                    {career.companies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{career.companies.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openJobDetails(career)}
                  >
                    View Details
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                  <Button size="sm" className="btn-gradient">
                    Explore Path
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Job Details Modal */}
        <JobDetailsModal job={selectedJob} onClose={closeJobDetails} />

        {/* Loading More Indicator */}
        {isFetching && (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        )}

        {/* No More Results */}
        {!data?.hasMore && filteredAndSortedRecommendations.length > 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No more recommendations to load
          </div>
        )}

        {/* No Results */}
        {filteredAndSortedRecommendations.length === 0 && !isFetching && (
          <div className="text-center py-12 text-muted-foreground">
            No recommendations found matching your filters
          </div>
        )}

        {/* Load More Button */}
        {data?.hasMore && !isFetching && (
          <div className="text-center">
            <Button onClick={loadMore} variant="outline" size="lg">
              Load More Recommendations
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
