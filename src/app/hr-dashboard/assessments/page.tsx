"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Calendar,
  User,
  FileText,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import HRLayout from "@/components/hr/HRLayout";

// Mock assessment data
const assessmentData = [
  {
    id: 1,
    title: "Genius Factor Career Assessment",
    employee: "Sarah Johnson",
    department: "Finance",
    position: "Senior Analyst",
    dateCompleted: "2024-01-15",
    status: "Completed",
    geniusScore: 85,
    completionRate: 100,
    avatar: "SJ",
  },
  {
    id: 2,
    title: "Genius Factor Career Assessment",
    employee: "Michael Chen",
    department: "IT",
    position: "Software Engineer",
    dateCompleted: "2024-01-12",
    status: "Completed",
    geniusScore: 92,
    completionRate: 100,
    avatar: "MC",
  },
  {
    id: 3,
    title: "Genius Factor Career Assessment",
    employee: "Emily Rodriguez",
    department: "Marketing",
    position: "Marketing Manager",
    dateCompleted: "2024-01-10",
    status: "Completed",
    geniusScore: 78,
    completionRate: 100,
    avatar: "ER",
  },
  {
    id: 4,
    title: "Genius Factor Career Assessment",
    employee: "David Kim",
    department: "Sales",
    position: "Account Executive",
    dateCompleted: "In Progress",
    status: "In Progress",
    geniusScore: 0,
    completionRate: 45,
    avatar: "DK",
  },
  {
    id: 5,
    title: "Genius Factor Career Assessment",
    employee: "Lisa Wang",
    department: "Design/Creative",
    position: "UX Designer",
    dateCompleted: "2024-01-08",
    status: "Completed",
    geniusScore: 89,
    completionRate: 100,
    avatar: "LW",
  },
  {
    id: 6,
    title: "Genius Factor Career Assessment",
    employee: "James Wilson",
    department: "Operations",
    position: "Operations Manager",
    dateCompleted: "2024-01-05",
    status: "Completed",
    geniusScore: 83,
    completionRate: 100,
    avatar: "JW",
  },
];

const AssessmentCard = ({ assessment, onViewDetails }:any) => {
  const getStatusColor = (status:any) => {
    switch (status) {
      case "Completed":
        return "bg-success text-success-foreground";
      case "In Progress":
        return "bg-warning text-warning-foreground";
      case "Not Started":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score:any) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card
      className="hr-card hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails(assessment)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {assessment.avatar}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{assessment.employee}</CardTitle>
              <CardDescription>
                {assessment.position} • {assessment.department}
              </CardDescription>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{assessment.title}</span>
          </div>
          <Badge className={getStatusColor(assessment.status)}>
            {assessment.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Completion Rate
            </span>
            <span className="text-sm font-medium">
              {assessment.completionRate}%
            </span>
          </div>
          <Progress value={assessment.completionRate} className="h-2" />
        </div>

        {assessment.status === "Completed" && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Genius Factor Score
            </span>
            <span
              className={`text-lg font-bold ${getScoreColor(
                assessment.geniusScore
              )}`}
            >
              {assessment.geniusScore}/100
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {assessment.status === "Completed"
              ? `Completed: ${assessment.dateCompleted}`
              : "In Progress"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const AssessmentDetailsModal = ({ assessment, isOpen, onClose }:any) => {
  if (!assessment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {assessment.avatar}
              </span>
            </div>
            <div>
              <div className="text-xl">{assessment.employee}</div>
              <div className="text-sm text-muted-foreground">
                {assessment.position} • {assessment.department}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete assessment details and career recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Assessment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <p className="font-semibold">{assessment.status}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Completion Rate
                  </span>
                  <p className="font-semibold">{assessment.completionRate}%</p>
                </div>
                {assessment.status === "Completed" && (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Genius Factor Score
                      </span>
                      <p className="font-semibold text-primary text-lg">
                        {assessment.geniusScore}/100
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Date Completed
                      </span>
                      <p className="font-semibold">
                        {assessment.dateCompleted}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 68-Question Results */}
          {assessment.status === "Completed" && (
            <Card>
              <CardHeader>
                <CardTitle>68-Question Assessment Results</CardTitle>
                <CardDescription>
                  Detailed breakdown of assessment categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Analytical Thinking</span>
                      <span className="text-sm font-medium">92/100</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Creative Problem Solving</span>
                      <span className="text-sm font-medium">78/100</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Leadership Potential</span>
                      <span className="text-sm font-medium">85/100</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Communication Skills</span>
                      <span className="text-sm font-medium">89/100</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Career Recommendations */}
          {assessment.status === "Completed" && (
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Career Recommendations</CardTitle>
                <CardDescription>
                  Personalized career path suggestions based on assessment
                  results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">
                    Recommended Career Path
                  </h4>
                  <p className="text-sm">
                    Based on your high analytical thinking score and leadership
                    potential, consider transitioning to a Senior Financial
                    Analyst role with team leadership responsibilities.
                  </p>
                </div>
                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <h4 className="font-semibold text-accent mb-2">
                    Skill Development Areas
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Creative problem-solving workshops</li>
                    <li>• Advanced data visualization techniques</li>
                    <li>• Cross-functional collaboration training</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Assessments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredAssessments = assessmentData.filter((assessment) => {
    const matchesSearch =
      assessment.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || assessment.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || assessment.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleViewDetails = (assessment:any) => {
    setSelectedAssessment(assessment);
    setShowDetailsModal(true);
  };

  const departments = [...new Set(assessmentData.map((a) => a.department))];

  return (
    <HRLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            Manage and review all career assessments
          </p>
        </div>

        {/* Filters */}
        <Card className="hr-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hr-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Assessments
                  </p>
                  <p className="text-2xl font-bold">{assessmentData.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="hr-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {
                      assessmentData.filter((a) => a.status === "Completed")
                        .length
                    }
                  </p>
                </div>
                <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-success">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hr-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-warning">
                    {
                      assessmentData.filter((a) => a.status === "In Progress")
                        .length
                    }
                  </p>
                </div>
                <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-warning">⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hr-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Score
                  </p>
                  <p className="text-2xl font-bold text-primary">85.4</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">★</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* No results */}
        {filteredAssessments.length === 0 && (
          <Card className="hr-card">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No assessments found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Assessment Details Modal */}
        <AssessmentDetailsModal
          assessment={selectedAssessment}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      </div>
    </HRLayout>
  );
}
