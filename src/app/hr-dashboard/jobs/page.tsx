// app/hr/jobs/page.tsx (updated)
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Briefcase,
  Calendar,
  RefreshCw,
  Mail,
  FileText,
  ChevronRight,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Sparkles,
} from "lucide-react";
import HRLayout from "@/components/hr/HRLayout";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";

interface Application {
  id: string;
  createdAt: string;
  aiRecommendation?: string | null;
  scoreMatch?: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    position: string[];
    department: string[];
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  salary?: number | null;
  type: string;
  status: string;
  createdAt: string;
  applications: Application[];
}

interface SelectedRecommendation {
  recommendation: string | null;
  applicationId: string;
  userId: string;
  jobId: string;
}

export default function HRJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<SelectedRecommendation | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchJobs();
    }
  }, [status]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/get-hr-jobs");
      if (response.ok) {
        const { jobs } = await response.json();
        setJobs(jobs);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (err) {
      setError("Error loading data");
    } finally {
      setIsLoading(false);
    }
  };

  const openRecommendationModal = (
    recommendation: string | null,
    applicationId: string,
    userId: string,
    jobId: string
  ) => {
    if (recommendation) {
      setSelectedRecommendation({
        recommendation,
        applicationId,
        userId,
        jobId,
      });
    }
  };

  const closeRecommendationModal = () => {
    setSelectedRecommendation(null);
  };

  const openJobDescriptionModal = (job: Job) => {
    setSelectedJob(job);
  };

  const closeJobDescriptionModal = () => {
    setSelectedJob(null);
  };

  const refreshRecommendation = async () => {
    if (!selectedRecommendation) return;
    setIsRefreshing(true);
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
            userId: selectedRecommendation.userId,
            jobId: selectedRecommendation.jobId,
            application_id: selectedRecommendation.applicationId,
            hrId: session?.user?.id,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedRecommendation({
          ...selectedRecommendation,
          recommendation: data.application.aiRecommendation,
        });
        await fetchJobs();
      } else {
        console.error("Failed to refresh recommendation");
      }
    } catch (err) {
      console.error("Error refreshing recommendation:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function to clean markdown from text
  const cleanMarkdown = (text: string | null): string => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^- /gm, "• ")
      .replace(/^\* /gm, "• ")
      .replace(/🟢|✅|⚙️|📊|🎯|⭐|❌|✨|📈|🔍|💡|📝|📍|💼|🌟/g, "")
      .replace(/\n\n+/g, "\n\n")
      .trim();
  };

  // Helper function to format short description
  const formatShortDescription = (text: string | null): string => {
    if (!text) return "";
    const cleaned = cleanMarkdown(text);
    const lines = cleaned.split("\n");
    return lines.slice(0, 2).join("\n");
  };

  // Helper function to clean and render AI recommendation text
  const cleanAndRenderText = (text: string | null) => {
    if (!text) {
      return (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-subtle dark:text-subtle-dark mx-auto mb-4 opacity-50" />
          <p className="text-subtle dark:text-subtle-dark">No recommendation available.</p>
        </div>
      );
    }

    try {
      let cleanedText = text
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/^- /gm, "• ")
        .replace(/🟢|✅|⚙️|📊|🎯|⭐|❌|✨|📈|🔍|💡|📝/g, "")
        .replace(/\n\n+/g, "\n\n");

      const lines = cleanedText.split("\n").filter((line) => line.trim());

      return (
        <div className="space-y-6">
          {lines.map((line, idx) => {
            const trimmedLine = line.trim();

            if (
              trimmedLine.match(
                /^(Summary|Strengths|Improvements|Weaknesses|Overall|Recommendation|Match Analysis|Key Points)/i
              )
            ) {
              return (
                <div key={idx} className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                  <h3 className="font-semibold text-lg text-on-matte dark:text-on-matte mb-3 mt-4 pl-4">
                    {trimmedLine}
                  </h3>
                </div>
              );
            }

            if (trimmedLine.startsWith("•")) {
              const text = trimmedLine.substring(1).trim();
              return (
                <div key={idx} className="flex gap-4 pl-4">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                  <p className="text-on-matte/80 dark:text-on-matte/80 leading-relaxed">{text}</p>
                </div>
              );
            }

            return (
              <p key={idx} className="text-on-matte/80 dark:text-on-matte/80 leading-relaxed pl-4">
                {trimmedLine}
              </p>
            );
          })}
        </div>
      );
    } catch (err) {
      console.error("Error rendering text:", err);
      return (
        <pre className="whitespace-pre-wrap text-sm bg-card p-6 rounded-lg border border-matte dark:border-matte overflow-auto">
          {text}
        </pre>
      );
    }
  };

  // Helper function to format job description professionally
  const formatDescription = (text: string | null) => {
    if (!text) {
      return (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-subtle dark:text-subtle-dark mx-auto mb-4 opacity-50" />
          <p className="text-subtle dark:text-subtle-dark">No description available.</p>
        </div>
      );
    }

    try {
      let cleanedText = cleanMarkdown(text);
      const lines = cleanedText.split("\n").filter((line) => line.trim());

      return (
        <div className="space-y-8">
          {lines.map((line, idx) => {
            const trimmedLine = line.trim();

            if (
              trimmedLine.match(
                /^(Job Summary|About the Role|Key Responsibilities|Qualifications|What We Offer|Our Commitment|How to Apply)/i
              )
            ) {
              return (
                <div key={idx} className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                  <h3 className="font-semibold text-xl text-on-matte dark:text-on-matte mb-4 pl-4">
                    {trimmedLine}
                  </h3>
                </div>
              );
            }

            if (trimmedLine.match(/^(•|-|\*)\s/)) {
              let bulletLines: string[] = [trimmedLine];
              let nextIdx = idx + 1;
              while (
                nextIdx < lines.length &&
                lines[nextIdx].trim().match(/^(•|-|\*)\s/)
              ) {
                bulletLines.push(lines[nextIdx].trim());
                nextIdx++;
              }
              idx = nextIdx - 1;

              return (
                <ul key={idx} className="space-y-3 pl-8">
                  {bulletLines.map((bullet, bulletIdx) => {
                    const bulletText = bullet
                      .replace(/^(•|-|\*)\s*/, "")
                      .trim();
                    if (!bulletText) return null;
                    return (
                      <li key={bulletIdx} className="flex gap-3">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                        <span className="text-on-matte/80 dark:text-on-matte/80">{bulletText}</span>
                      </li>
                    );
                  })}
                </ul>
              );
            }

            if (trimmedLine.match(/^\d+\.\s/)) {
              let numLines: string[] = [trimmedLine];
              let nextIdx = idx + 1;
              while (
                nextIdx < lines.length &&
                lines[nextIdx].trim().match(/^\d+\.\s/)
              ) {
                numLines.push(lines[nextIdx].trim());
                nextIdx++;
              }
              idx = nextIdx - 1;

              return (
                <ol key={idx} className="space-y-3 pl-8">
                  {numLines.map((numItem, numIdx) => {
                    const numText = numItem.replace(/^\d+\.\s*/, "").trim();
                    if (!numText) return null;
                    return (
                      <li key={numIdx} className="flex gap-3">
                        <span className="flex-shrink-0 font-semibold text-purple-600 dark:text-purple-400">
                          {numIdx + 1}.
                        </span>
                        <span className="text-on-matte/80 dark:text-on-matte/80">{numText}</span>
                      </li>
                    );
                  })}
                </ol>
              );
            }

            if (trimmedLine) {
              return (
                <p key={idx} className="text-on-matte/80 dark:text-on-matte/80 leading-relaxed">
                  {trimmedLine}
                </p>
              );
            }

            return null;
          })}
        </div>
      );
    } catch (err) {
      console.error("Error formatting description:", err);
      return (
        <pre className="whitespace-pre-wrap text-sm bg-card p-6 rounded-lg border border-matte dark:border-matte overflow-auto">
          {text}
        </pre>
      );
    }
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "badge-success";
      case "CLOSED":
        return "badge-warning";
      case "DRAFT":
        return "badge-brand";
      default:
        return "badge-info";
    }
  };

  // Get match score badge style
  const getMatchScoreBadge = (score: string) => {
    const scoreNum = parseInt(score);
    if (scoreNum >= 80) return "badge-success";
    if (scoreNum >= 60) return "badge-info";
    if (scoreNum >= 40) return "badge-warning";
    return "badge-brand";
  };

  if (status === "loading" || isLoading) {
    return (
      <HRLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-subtle dark:text-subtle-dark">Loading jobs...</p>
          </div>
        </div>
      </HRLayout>
    );
  }

  if (status === "unauthenticated" || error) {
    return (
      <HRLayout>
        <div className="p-8 text-center">
          <div className="card-purple max-w-md mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
            <div className="icon-warning mx-auto w-16 h-16 mb-4 flex items-center justify-center">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-on-matte dark:text-on-matte">Access Required</h3>
            <p className="text-subtle dark:text-subtle-dark mb-4">
              {error || "Please sign in to view your jobs and applications."}
            </p>
          </div>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="bg-layout-purple min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchJobs}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Total Jobs Card */}
              <div className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 rounded-full -translate-y-8 translate-x-4 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center gap-4 p-4 relative z-10">
                  <div className="icon-info group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-subtle dark:text-subtle-dark">Total Jobs</p>
                    <p className="text-2xl font-bold gradient-text-primary">{jobs.length}</p>
                  </div>
                </div>
              </div>

              {/* Total Applications Card */}
              <div className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 rounded-full -translate-y-8 translate-x-4 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center gap-4 p-4 relative z-10">
                  <div className="icon-success group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-subtle dark:text-subtle-dark">Total Applications</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                      {jobs.reduce((acc, job) => acc + job.applications.length, 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pending Reviews Card */}
              <div className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 rounded-full -translate-y-8 translate-x-4 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center gap-4 p-4 relative z-10">
                  <div className="icon-brand group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-subtle dark:text-subtle-dark">Pending Reviews</p>
                    <p className="text-2xl font-bold gradient-text-primary">
                      {jobs.reduce(
                        (acc, job) =>
                          acc +
                          job.applications.filter(
                            (app) => !app.aiRecommendation
                          ).length,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Positions Card */}
              <div className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10 rounded-full -translate-y-8 translate-x-4 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center gap-4 p-4 relative z-10">
                  <div className="icon-warning group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-subtle dark:text-subtle-dark">Active Positions</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                      {jobs.filter((job) => job.status === "OPEN").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          {jobs.length === 0 ? (
            <div className="card-purple text-center py-16 bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
              <div className="icon-info w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Briefcase className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-on-matte dark:text-on-matte">
                No jobs posted yet
              </h3>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => {
                const firstTwoLines = formatShortDescription(job.description);
                const hasMoreLines = job.description.split("\n").length > 2;
                const statusBadgeClass = getStatusBadge(job.status);

                return (
                  <div key={job.id} className="card-purple card-hover border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                    <div className="p-6">
                      {/* Job Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-on-matte dark:text-on-matte">
                              {job.title}
                            </h2>
                            <Badge className={`${statusBadgeClass} px-3 py-1`}>
                              {job.status}
                            </Badge>
                          </div>

                          {/* Job Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-subtle dark:text-subtle-dark mb-4">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              <span>{job.type.replace("_", " ")}</span>
                            </div>
                            {job.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            {job.salary && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>${job.salary.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Posted{" "}
                                {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Job Description Preview */}
                          <div className="mb-6">
                            <p className="text-on-matte/70 dark:text-on-matte/70 whitespace-pre-line mb-2">
                              {firstTwoLines}
                            </p>
                            {hasMoreLines && (
                              <button
                                onClick={() => openJobDescriptionModal(job)}
                                className="flex items-center gap-1 pl-0 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-sm"
                              >
                                Read full description
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Applications Section */}
                      <div className="border-t border-matte dark:border-matte pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <h3 className="text-lg font-semibold text-on-matte dark:text-on-matte">
                              Applications ({job.applications.length})
                            </h3>
                          </div>
                          <Badge variant="outline" className="bg-gray-100/50 dark:bg-matte-gray-subtle/50">
                            {job.applications.length} candidate
                            {job.applications.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>

                        {job.applications.length === 0 ? (
                          <div className="text-center py-8 border border-matte dark:border-matte rounded-lg bg-gray-50/50 dark:bg-matte-gray-subtle/20">
                            <Users className="w-12 h-12 text-subtle dark:text-subtle-dark mx-auto mb-3 opacity-50" />
                            <p className="text-subtle dark:text-subtle-dark">No applications yet</p>
                            <p className="text-sm text-subtle dark:text-subtle-dark mt-1">
                              Applications will appear here once candidates apply
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {job.applications.map((app) => {
                              const matchScoreBadgeClass = app.scoreMatch
                                ? getMatchScoreBadge(app.scoreMatch)
                                : "";

                              return (
                                <div
                                  key={app.id}
                                  className="group p-4 rounded-lg border border-matte dark:border-matte hover:border-purple-accent hover:bg-gray-50/50 dark:hover:bg-matte-gray-subtle/30 transition-all duration-300"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                      {/* Applicant Avatar */}
                                      <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-purple rounded-full flex items-center justify-center">
                                          <User className="w-6 h-6 text-white" />
                                        </div>
                                        {app.scoreMatch && (
                                          <div
                                            className={`absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-medium ${matchScoreBadgeClass}`}
                                          >
                                            {app.scoreMatch}%
                                          </div>
                                        )}
                                      </div>

                                      {/* Applicant Info */}
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-semibold text-on-matte dark:text-on-matte">
                                            {app.user.firstName}{" "}
                                            {app.user.lastName}
                                          </h4>
                                          <Badge
                                            variant="outline"
                                            className="text-xs border-matte dark:border-matte"
                                          >
                                            {app.user.position[0] ||
                                              "Position not specified"}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-subtle dark:text-subtle-dark mb-2">
                                          {app.user.email}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-subtle dark:text-subtle-dark">
                                          <span>
                                            Dept:{" "}
                                            {app.user.department[0] || "N/A"}
                                          </span>
                                          <span>•</span>
                                          <span>
                                            Applied:{" "}
                                            {new Date(
                                              app.createdAt
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          openRecommendationModal(
                                            app.aiRecommendation,
                                            app.id,
                                            app.user.id,
                                            job.id
                                          )
                                        }
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg btn-purple-outline hover:scale-105 transition-all duration-200"
                                      >
                                        <Sparkles className="w-4 h-4" />
                                        AI Analysis
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Job Description Modal */}
        <Dialog open={!!selectedJob} onOpenChange={closeJobDescriptionModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light border-0 shadow-2xl">
            <div className="relative">
              {/* Decorative gradient */}
              <div className="decorative-gradient-blur-blue -top-20 -right-20 opacity-30"></div>
              <div className="decorative-gradient-blur-purple -bottom-20 -left-20 opacity-30"></div>

              {/* Purple gradient top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-purple" />

              <DialogHeader className="p-8 pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-3xl font-bold mb-2 text-on-matte dark:text-on-matte">
                      {selectedJob?.title}
                    </DialogTitle>
                    <div className="flex items-center gap-3">
                      <Badge className="badge-info">
                        {selectedJob?.type.replace("_", " ")}
                      </Badge>
                      {selectedJob?.location && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 border-matte dark:border-matte"
                        >
                          <MapPin className="w-3 h-3" />
                          {selectedJob.location}
                        </Badge>
                      )}
                      {selectedJob?.salary && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 border-matte dark:border-matte"
                        >
                          <DollarSign className="w-3 h-3" />$
                          {selectedJob.salary.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DialogDescription className="mt-4 text-lg text-subtle dark:text-subtle-dark">
                  Full job description and requirements
                </DialogDescription>
              </DialogHeader>

              <div className="p-8">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {formatDescription(selectedJob?.description)}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Recommendation Modal */}
        <Dialog
          open={!!selectedRecommendation}
          onOpenChange={closeRecommendationModal}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light border-0 shadow-2xl">
            <div className="card-purple relative">
              {/* Decorative gradient */}
              <div className="decorative-gradient-blur-blue -top-20 -right-20 opacity-40"></div>
              <div className="decorative-gradient-blur-purple -bottom-20 -left-20 opacity-40"></div>

              {/* Purple gradient top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-purple" />

              <DialogHeader className="relative z-10">
                <div className="flex items-center justify-between mb-6 p-6">
                  <div className="flex items-center gap-4">
                    <div className="icon-brand p-3 rounded-lg">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-on-matte dark:text-on-matte">
                        AI Candidate Analysis
                      </DialogTitle>
                      <DialogDescription className="text-subtle dark:text-subtle-dark">
                        Detailed assessment of candidate suitability
                      </DialogDescription>
                    </div>
                  </div>
                  <button
                    onClick={refreshRecommendation}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg btn-purple-outline hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""
                        }`}
                    />
                    {isRefreshing ? "Regenerating..." : "Refresh Analysis"}
                  </button>
                </div>
              </DialogHeader>

              <div className="relative z-10 mt-6 p-6">
                {cleanAndRenderText(selectedRecommendation?.recommendation)}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </HRLayout>
  );
}