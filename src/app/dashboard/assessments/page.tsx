"use client";

import { useState } from "react";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import { StatCard } from "@/components/admin/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Search,
  Eye,
  Filter,
  Calendar,
  Star,
  Brain,
  Target,
  Award,
  Users,
} from "lucide-react";
import { mockAssessments, mockCompanies, Assessment } from "@/lib/mock-data";

export default function Assessments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);

  const statuses = ["all", "completed", "in-progress", "pending"];

  const filteredAssessments = mockAssessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assessment.status === statusFilter;
    const matchesCompany =
      companyFilter === "all" || assessment.companyId === companyFilter;
    return matchesSearch && matchesStatus && matchesCompany;
  });

  const totalAssessments = mockAssessments.length;
  const completedAssessments = mockAssessments.filter(
    (a) => a.status === "completed"
  ).length;
  const averageScore = Math.round(
    mockAssessments
      .filter((a) => a.status === "completed")
      .reduce((sum, a) => sum + a.score, 0) /
      mockAssessments.filter((a) => a.status === "completed").length
  );
  const inProgressAssessments = mockAssessments.filter(
    (a) => a.status === "in-progress"
  ).length;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default" as const;
      case "in-progress":
        return "secondary" as const;
      case "pending":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-hr-primary";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getCompanyName = (companyId: string) => {
    return (
      mockCompanies.find((c) => c.id === companyId)?.name || "Unknown Company"
    );
  };

  return (
    <HRLayout
      title="Assessment Management"
      subtitle="Track and analyze all employee assessments across companies"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Assessments"
            value={totalAssessments}
            description="All time"
            icon={<ClipboardList className="h-4 w-4" />}
          />
          <StatCard
            title="Completed"
            value={completedAssessments}
            description={`${Math.round(
              (completedAssessments / totalAssessments) * 100
            )}% completion rate`}
            icon={<Award className="h-4 w-4" />}
          />
          <StatCard
            title="Average Score"
            value={averageScore}
            description="Out of 100"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="In Progress"
            value={inProgressAssessments}
            description="Currently being taken"
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all"
                      ? "All Statuses"
                      : status.replace("-", " ")}
                  </option>
                ))}
              </select>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Companies</option>
                {mockCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssessments.map((assessment) => (
            <Card
              key={assessment.id}
              className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedAssessment(assessment)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base group-hover:text-hr-primary transition-colors line-clamp-2">
                      {assessment.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assessment.employeeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getCompanyName(assessment.companyId)}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(assessment.status)}>
                    {assessment.status.replace("-", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{assessment.submissionDate}</span>
                </div>

                {assessment.status === "completed" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Score:
                      </span>
                      <span
                        className={`text-xl font-bold ${getScoreColor(
                          assessment.score
                        )}`}
                      >
                        {assessment.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${assessment.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {assessment.status === "in-progress" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-hr-secondary rounded-full animate-pulse" />
                    <span>Assessment in progress...</span>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full group-hover:bg-hr-primary group-hover:text-white transition-all"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAssessments.length === 0 && (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx_auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No assessments found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find assessments.
              </p>
            </CardContent>
          </Card>
        )}

        <Dialog
          open={!!selectedAssessment}
          onOpenChange={() => setSelectedAssessment(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assessment Details</DialogTitle>
            </DialogHeader>
            {selectedAssessment && (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">
                      {selectedAssessment.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedAssessment.employeeName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getCompanyName(selectedAssessment.companyId)}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge
                        variant={getStatusBadgeVariant(
                          selectedAssessment.status
                        )}
                      >
                        {selectedAssessment.status.replace("-", " ")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Submitted: {selectedAssessment.submissionDate}
                      </span>
                    </div>
                  </div>
                  {selectedAssessment.status === "completed" && (
                    <div className="text-right">
                      <div
                        className={`text-3xl font-bold ${getScoreColor(
                          selectedAssessment.score
                        )}`}
                      >
                        {selectedAssessment.score}
                      </div>
                      <div className="text-sm text-muted-foreground">/ 100</div>
                    </div>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Section Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Technical Skills", score: 85, maxScore: 100 },
                        {
                          name: "Leadership Potential",
                          score: 92,
                          maxScore: 100,
                        },
                        { name: "Communication", score: 88, maxScore: 100 },
                        { name: "Problem Solving", score: 90, maxScore: 100 },
                        { name: "Adaptability", score: 82, maxScore: 100 },
                      ].map((section, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{section.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {section.score}/{section.maxScore}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (section.score / section.maxScore) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Genius Factor Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Primary Type</h4>
                        <p className="text-lg font-bold text-hr-primary">
                          Strategic Thinker
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Secondary Type</h4>
                        <p className="text-lg font-bold text-hr-secondary">
                          Technical Expert
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Key Strengths</h4>
                        <div className="flex flex-wrap gap-2">
                          {["Analysis", "Innovation", "Problem-solving"].map(
                            (strength, index) => (
                              <Badge key={index} variant="default">
                                {strength}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Growth Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {["Delegation", "Public Speaking", "Networking"].map(
                            (area, index) => (
                              <Badge key={index} variant="outline">
                                {area}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Career Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {[
                        "Focus on advanced technical certifications",
                        "Consider leadership development programs",
                        "Enhance public speaking skills",
                        "Pursue cross-functional project opportunities",
                      ].map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 bg-hr-primary rounded-full mt-2 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {selectedAssessment?.status !== "completed" && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Assessment Not Completed
                      </h3>
                      <p className="text-muted-foreground">
                        Detailed results will be available once the assessment
                        is completed.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </HRLayout>
  );
}
