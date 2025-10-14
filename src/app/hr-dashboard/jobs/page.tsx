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
import { User, Briefcase, Calendar } from "lucide-react";
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

export default function HRJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<
    string | null
  >(null);
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

  const openRecommendationModal = (recommendation: string | null) => {
    if (recommendation) {
      setSelectedRecommendation(recommendation);
    }
  };

  const closeRecommendationModal = () => {
    setSelectedRecommendation(null);
  };

  if (status === "loading" || isLoading) {
    return (
      <HRLayout>
        <div className="p-6">
          <Loader />
        </div>
      </HRLayout>
    );
  }

  if (status === "unauthenticated" || error) {
    return (
      <HRLayout>
        <div className="p-6 text-center text-red-500">
          {error || "Please sign in to view your jobs and applications."}
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Jobs & Applications</h1>
            <p className="text-muted-foreground mt-1">
              Manage job postings and review applicant submissions.
            </p>
          </div>
          <Button onClick={fetchJobs} variant="outline">
            Refresh
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground">
                Create your first job posting to start receiving applications.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                        <span>{job.type.replace("_", " ")}</span>
                        {job.location && <span>• {job.location}</span>}
                        {job.salary && (
                          <span>• ${job.salary.toLocaleString()}</span>
                        )}
                        <span>
                          • {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={job.status === "OPEN" ? "default" : "secondary"}
                    >
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {job.description}
                  </p>
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Applications ({job.applications.length})</span>
                    </h4>
                    {job.applications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No applications yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {job.applications.map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-background" />
                                </div>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {app.user.firstName} {app.user.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {app.user.email} •{" "}
                                  {app.user.position[0] || "N/A"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Dept: {app.user.department[0] || "N/A"} •
                                  Applied:{" "}
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </p>
                                {app.scoreMatch && (
                                  <Badge variant="outline" className="mt-1">
                                    Match Score: {app.scoreMatch}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openRecommendationModal(app.aiRecommendation)
                                }
                              >
                                AI Recommendation
                              </Button>
                              <Button size="sm">Contact</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* AI Recommendation Modal */}
        <Dialog
          open={!!selectedRecommendation}
          onOpenChange={closeRecommendationModal}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Recommendation</DialogTitle>
              <DialogDescription>
                Generated analysis of the candidate's fit for the role.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md overflow-auto">
                {selectedRecommendation || "No recommendation available."}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </HRLayout>
  );
}
