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
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No recommendation available.</p>
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
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                  <h3 className="font-semibold text-lg text-foreground mb-3 mt-4 pl-4">
                    {trimmedLine}
                  </h3>
                </div>
              );
            }

            if (trimmedLine.startsWith("•")) {
              const text = trimmedLine.substring(1).trim();
              return (
                <div key={idx} className="flex gap-4 pl-4">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                  <p className="text-foreground/80 leading-relaxed">{text}</p>
                </div>
              );
            }

            return (
              <p key={idx} className="text-foreground/80 leading-relaxed pl-4">
                {trimmedLine}
              </p>
            );
          })}
        </div>
      );
    } catch (err) {
      console.error("Error rendering text:", err);
      return (
        <pre className="whitespace-pre-wrap text-sm bg-card p-6 rounded-lg border overflow-auto">
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
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No description available.</p>
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
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                  <h3 className="font-semibold text-xl text-foreground mb-4 pl-4">
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
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                        <span className="text-foreground/80">{bulletText}</span>
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
                        <span className="flex-shrink-0 font-semibold text-primary">
                          {numIdx + 1}.
                        </span>
                        <span className="text-foreground/80">{numText}</span>
                      </li>
                    );
                  })}
                </ol>
              );
            }

            if (trimmedLine) {
              return (
                <p key={idx} className="text-foreground/80 leading-relaxed">
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
        <pre className="whitespace-pre-wrap text-sm bg-card p-6 rounded-lg border overflow-auto">
          {text}
        </pre>
      );
    }
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "badge-green";
      case "CLOSED":
        return "badge-amber";
      case "DRAFT":
        return "badge-purple";
      default:
        return "badge-blue";
    }
  };

  // Get match score badge style
  const getMatchScoreBadge = (score: string) => {
    const scoreNum = parseInt(score);
    if (scoreNum >= 80) return "badge-green";
    if (scoreNum >= 60) return "badge-blue";
    if (scoreNum >= 40) return "badge-amber";
    return "badge-purple";
  };

  if (status === "loading" || isLoading) {
    return (
      <HRLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-muted-foreground">Loading jobs...</p>
          </div>
        </div>
      </HRLayout>
    );
  }

  if (status === "unauthenticated" || error) {
    return (
      <HRLayout>
        <div className="p-8 text-center">
          <div className="card-primary max-w-md mx-auto">
            <div className="icon-wrapper-amber mx-auto w-16 h-16 mb-4 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Access Required</h3>
            <p className="text-muted-foreground mb-4">
              {error || "Please sign in to view your jobs and applications."}
            </p>
          </div>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="gradient-bg-primary min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Your Job Postings
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage job listings and review applicant submissions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={fetchJobs} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
                <Button className="btn-gradient-primary gap-2">
                  <Briefcase className="w-4 h-4" />
                  Post New Job
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="card-primary card-hover">
                <div className="flex items-center gap-4">
                  <div className="icon-wrapper-blue">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{jobs.length}</p>
                  </div>
                </div>
              </div>
              <div className="card-primary card-hover">
                <div className="flex items-center gap-4">
                  <div className="icon-wrapper-green">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Applications
                    </p>
                    <p className="text-2xl font-bold">
                      {jobs.reduce(
                        (acc, job) => acc + job.applications.length,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-primary card-hover">
                <div className="flex items-center gap-4">
                  <div className="icon-wrapper-purple">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Reviews
                    </p>
                    <p className="text-2xl font-bold">
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
              <div className="card-primary card-hover">
                <div className="flex items-center gap-4">
                  <div className="icon-wrapper-amber">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Positions
                    </p>
                    <p className="text-2xl font-bold">
                      {jobs.filter((job) => job.status === "OPEN").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          {jobs.length === 0 ? (
            <div className="card-primary text-center py-16">
              <div className="icon-wrapper-blue w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                No jobs posted yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first job posting to start receiving applications
                from qualified candidates.
              </p>
              <Button className="btn-gradient-primary gap-2">
                <Briefcase className="w-4 h-4" />
                Create Your First Job Posting
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => {
                const firstTwoLines = formatShortDescription(job.description);
                const hasMoreLines = job.description.split("\n").length > 2;
                const statusBadgeClass = getStatusBadge(job.status);

                return (
                  <div key={job.id} className="card-primary card-hover">
                    <div className="p-6">
                      {/* Job Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-foreground">
                              {job.title}
                            </h2>
                            <Badge className={`${statusBadgeClass} px-3 py-1`}>
                              {job.status}
                            </Badge>
                          </div>

                          {/* Job Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
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
                            <p className="text-foreground/70 whitespace-pre-line mb-2">
                              {firstTwoLines}
                            </p>
                            {hasMoreLines && (
                              <Button
                                size="sm"
                                variant="link"
                                onClick={() => openJobDescriptionModal(job)}
                                className="gap-1 pl-0"
                              >
                                Read full description
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Users className="w-4 h-4" />
                            Manage
                          </Button>
                          <Button
                            size="sm"
                            className="btn-gradient-primary gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View All Applicants
                          </Button>
                        </div>
                      </div>

                      {/* Applications Section */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <h3 className="text-lg font-semibold">
                              Applications ({job.applications.length})
                            </h3>
                          </div>
                          <Badge variant="outline" className="bg-secondary/50">
                            {job.applications.length} candidate
                            {job.applications.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>

                        {job.applications.length === 0 ? (
                          <div className="text-center py-8 border rounded-lg bg-secondary/20">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground">
                              No applications yet
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Applications will appear here once candidates
                              apply
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
                                  className="assessment-item group"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                      {/* Applicant Avatar */}
                                      <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
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
                                          <h4 className="font-semibold">
                                            {app.user.firstName}{" "}
                                            {app.user.lastName}
                                          </h4>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {app.user.position[0] ||
                                              "Position not specified"}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                          {app.user.email}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() =>
                                          openRecommendationModal(
                                            app.aiRecommendation,
                                            app.id,
                                            app.user.id,
                                            job.id
                                          )
                                        }
                                      >
                                        <Sparkles className="w-4 h-4" />
                                        AI Analysis
                                      </Button>
                                      <Button size="sm" className="gap-2">
                                        <Mail className="w-4 h-4" />
                                        Contact
                                      </Button>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <div className="relative">
              {/* Decorative gradient */}
              <div className="decorative-gradient-blur-blue -top-20 -right-20 opacity-30"></div>
              <div className="decorative-gradient-blur-purple -bottom-20 -left-20 opacity-30"></div>

              <DialogHeader className="p-8 pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-3xl font-bold mb-2">
                      {selectedJob?.title}
                    </DialogTitle>
                    <div className="flex items-center gap-3">
                      <Badge className="badge-blue">
                        {selectedJob?.type.replace("_", " ")}
                      </Badge>
                      {selectedJob?.location && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          {selectedJob.location}
                        </Badge>
                      )}
                      {selectedJob?.salary && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" />$
                          {selectedJob.salary.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DialogDescription className="mt-4 text-lg">
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            <div className="ai-recommendation-card">
              {/* Decorative gradient */}
              <div className="decorative-gradient-blur-blue -top-20 -right-20 opacity-40"></div>
              <div className="decorative-gradient-blur-purple -bottom-20 -left-20 opacity-40"></div>

              <DialogHeader className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="ai-recommendation-icon-wrapper">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold">
                        AI Candidate Analysis
                      </DialogTitle>
                      <DialogDescription>
                        Detailed assessment of candidate suitability
                      </DialogDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={refreshRecommendation}
                    disabled={isRefreshing}
                    className="gap-2"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    {isRefreshing ? "Regenerating..." : "Refresh Analysis"}
                  </Button>
                </div>
              </DialogHeader>

              <div className="relative z-10 mt-6">
                {cleanAndRenderText(selectedRecommendation?.recommendation)}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </HRLayout>
  );
}
