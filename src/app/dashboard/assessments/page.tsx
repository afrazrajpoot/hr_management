"use client";

import { HRLayout } from "@/components/admin/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  TrendingUp,
  Download,
  Plus,
  BarChart3,
  Activity,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Zap,
  AlertTriangle,
  CheckCircle,
  Building2,
  Settings,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Assessments() {
  return (
    <HRLayout
      title="Assessment Management"
      subtitle="Track and analyze all employee assessments across companies"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assessments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and analyze employee performance and potential
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hover:bg-muted">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="btn-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Assessments
                </p>
                <h3 className="text-2xl font-bold mt-1">24</h3>
                <Badge className="badge-blue mt-2">
                  <ClipboardList className="h-3 w-3 mr-1" />
                  All time
                </Badge>
              </div>
              <div className="icon-wrapper-blue">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <h3 className="text-2xl font-bold mt-1">18</h3>
                <Badge className="badge-green mt-2">
                  <Award className="h-3 w-3 mr-1" />
                  75% completion
                </Badge>
              </div>
              <div className="icon-wrapper-green">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Score
                </p>
                <h3 className="text-2xl font-bold mt-1">85</h3>
                <Badge className="badge-purple mt-2">
                  <Target className="h-3 w-3 mr-1" />
                  Out of 100
                </Badge>
              </div>
              <div className="icon-wrapper-purple">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Progress
                </p>
                <h3 className="text-2xl font-bold mt-1">4</h3>
                <Badge className="badge-amber mt-2">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="icon-wrapper-amber">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <Card className="card-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assessments, employees, or companies..."
                  className="pl-9 bg-muted/50 border-border"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Company" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="techcorp">TechCorp Inc</SelectItem>
                  <SelectItem value="innovate">Innovate Solutions</SelectItem>
                  <SelectItem value="globalbiz">Global Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assessments Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Assessment Card 1 */}
          <Card className="card-primary card-hover group cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="sidebar-user-avatar h-10 w-10 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">JS</span>
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        Genius Factor Career Assessment
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        John Smith
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    TechCorp Inc
                  </Badge>
                </div>
                <Badge className="badge-green text-xs">Completed</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="icon-wrapper-amber p-2">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                <span>2024-01-15</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Genius Factor Score
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    92
                    <span className="text-sm text-muted-foreground">/100</span>
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="progress-bar-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: "92%" }}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full hover:bg-primary hover:text-primary-foreground transition-all group/btn"
              >
                <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                View Details
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>

          {/* Assessment Card 2 */}
          <Card className="card-primary card-hover group cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="sidebar-user-avatar h-10 w-10 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">SD</span>
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        Leadership Potential Review
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        Sarah Davis
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    Innovate Solutions
                  </Badge>
                </div>
                <Badge className="badge-blue text-xs">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="icon-wrapper-amber p-2">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                <span>In Progress</span>
              </div>

              <div className="assessment-item p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>65% completed</span>
                </div>
                <Progress value={65} className="progress-bar-primary mt-2" />
              </div>

              <Button
                variant="outline"
                className="w-full hover:bg-primary hover:text-primary-foreground transition-all group/btn"
              >
                <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                View Details
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>

          {/* Assessment Card 3 */}
          <Card className="card-primary card-hover group cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="sidebar-user-avatar h-10 w-10 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">MJ</span>
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        Technical Skills Assessment
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        Michael Johnson
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    Global Business
                  </Badge>
                </div>
                <Badge className="badge-amber text-xs">Pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="icon-wrapper-amber p-2">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                <span>Scheduled: 2024-01-20</span>
              </div>

              <div className="assessment-item p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Not Started</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full hover:bg-primary hover:text-primary-foreground transition-all group/btn"
              >
                <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                View Details
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Empty State (Commented out, for reference) */}
        {false && (
          <Card className="card-primary">
            <CardContent className="text-center py-16">
              <div className="icon-wrapper-purple p-4 mb-4 inline-block">
                <FileText className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No assessments found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find assessments.
              </p>
              <Button variant="outline" className="hover:bg-muted">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Assessment Details Dialog (Sample) */}
        <Dialog open={false}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="sidebar-user-avatar h-16 w-16 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      Genius Factor Career Assessment
                    </DialogTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className="badge-green text-sm">Completed</Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        John Smith
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        TechCorp Inc
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Score Summary */}
              <Card className="card-primary card-hover">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardTitle className="flex items-center gap-2">
                    <div className="icon-wrapper-purple p-2">
                      <Target className="h-4 w-4" />
                    </div>
                    Score Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-600 mb-2">
                        92
                      </div>
                      <div className="text-lg text-muted-foreground">
                        Out of 100
                      </div>
                      <Badge className="badge-green mt-3">Excellent</Badge>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Overall Genius Factor
                          </span>
                          <span className="font-medium">92%</span>
                        </div>
                        <Progress
                          value={92}
                          className="progress-bar-primary h-3"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="assessment-item p-3 text-center">
                          <div className="text-2xl font-bold text-primary">
                            85%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Technical Skills
                          </div>
                        </div>
                        <div className="assessment-item p-3 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            92%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Leadership
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section Scores */}
              <Card className="card-primary card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="icon-wrapper-blue p-2">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    Detailed Section Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Technical Skills", score: 85, color: "primary" },
                      {
                        name: "Leadership Potential",
                        score: 92,
                        color: "green",
                      },
                      {
                        name: "Communication Skills",
                        score: 88,
                        color: "blue",
                      },
                      { name: "Problem Solving", score: 90, color: "purple" },
                      { name: "Adaptability", score: 82, color: "amber" },
                    ].map((section, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "icon-wrapper p-2",
                                section.color === "primary" &&
                                  "icon-wrapper-blue",
                                section.color === "green" &&
                                  "icon-wrapper-green",
                                section.color === "blue" && "icon-wrapper-blue",
                                section.color === "purple" &&
                                  "icon-wrapper-purple",
                                section.color === "amber" &&
                                  "icon-wrapper-amber"
                              )}
                            >
                              <TrendingUp className="h-3 w-3" />
                            </div>
                            <span className="font-medium text-foreground">
                              {section.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              {section.score}/100
                            </span>
                            <Badge className="badge-green">Excellent</Badge>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${section.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Genius Factor Profile */}
              <Card className="card-primary card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="icon-wrapper-green p-2">
                      <Brain className="h-4 w-4" />
                    </div>
                    Genius Factor Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="assessment-item p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="icon-wrapper-blue p-2">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">
                              Primary Type
                            </h4>
                            <p className="text-lg font-bold text-primary">
                              Strategic Thinker
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Excel at analyzing complex problems and developing
                          innovative solutions.
                        </p>
                      </div>
                      <div className="assessment-item p-4">
                        <h4 className="font-medium text-foreground mb-3">
                          Key Strengths
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Analysis",
                            "Innovation",
                            "Problem-solving",
                            "Critical Thinking",
                          ].map((strength, index) => (
                            <Badge key={index} className="badge-green">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="assessment-item p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="icon-wrapper-purple p-2">
                            <Target className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">
                              Secondary Type
                            </h4>
                            <p className="text-lg font-bold text-purple-600">
                              Technical Expert
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Deep technical knowledge and expertise. Excellent at
                          implementing solutions.
                        </p>
                      </div>
                      <div className="assessment-item p-4">
                        <h4 className="font-medium text-foreground mb-3">
                          Growth Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Delegation",
                            "Public Speaking",
                            "Networking",
                            "Risk-taking",
                          ].map((area, index) => (
                            <Badge key={index} className="badge-amber">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="card-primary card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="icon-wrapper-amber p-2">
                      <Star className="h-4 w-4" />
                    </div>
                    Career Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "Focus on advanced technical certifications (AWS, Kubernetes)",
                      "Enroll in leadership development programs",
                      "Enhance public speaking through Toastmasters",
                      "Pursue cross-functional project opportunities",
                    ].map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors group"
                      >
                        <div className="icon-wrapper-green p-1 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm flex-1 group-hover:text-primary transition-colors">
                          {recommendation}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" className="hover:bg-muted">
                Close
              </Button>
              <Button className="btn-gradient-primary">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </HRLayout>
  );
}

// Missing icon component
const X = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
