"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  DollarSign,
  User,
  Briefcase,
  Building2,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  MapPin,
  Phone,
  Calendar,
  Users,
  BarChart3,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Brain,
  HandHeart,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface EmployeeDetailModalProps {
  isOpen: boolean;
  hrId: string;
  onClose: () => void;
  employee: any;
}

interface DepartmentStats {
  department: string;
  employee_count: number;
  employees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    employeeId?: string;
  }>;
  llm_recommendations?: {
    structured_recommendations: {
      team_composition_overview: {
        overview: string;
      };
      strengths_identified: {
        strengths: string[];
      };
      critical_gaps: {
        gaps: string[];
      };
      recommendations_for_balance: {
        recommendations: string[];
      };
      targeted_training_development: {
        training_recommendations: string[];
      };
      team_building_collaboration: {
        collaboration_recommendations: string[];
      };
      risk_mitigation: {
        risks: string[];
        mitigation_strategies: string[];
      };
    };
    summary: string;
    data_quality: {
      employees_with_data: number;
      total_employees: number;
      coverage_percentage: number;
    };
  };
}

export default function DepartmentModal({
  isOpen,
  hrId,
  onClose,
  employee,
}: EmployeeDetailModalProps) {
  const [departmentStats, setDepartmentStats] =
    useState<DepartmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee?.department) {
      // Reset departmentStats when dialog opens
      setDepartmentStats(null);
      fetchDepartmentStats();
    }
  }, [isOpen, employee?.department, hrId]);

  const fetchDepartmentStats = async () => {
    if (!employee?.department) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.geniusfactor.ai/departments/aggregate?department=${encodeURIComponent(
          employee.department
        )}&hrId=${hrId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch department stats");
      }

      const data = await response.json();

      if (data.success && data.data) {
        // If we get an array, find the specific department
        if (Array.isArray(data.data)) {
          const deptStats = data.data.find(
            (dept: DepartmentStats) => dept.department === employee.department
          );
          setDepartmentStats(deptStats || null);
        } else if (data.data.department) {
          // If we get a single department object
          setDepartmentStats(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching department stats:", error);
      toast.error("Failed to load department statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="relative pb-6 border-b">
          <div className="absolute inset-0 rounded-t-lg"></div>
          <DialogTitle className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Department Analysis</h2>
                <p className="text-sm">
                  {employee.firstName}{" "}
                  {employee.lastName !== "Not provide" ? employee.lastName : ""}
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-8rem)] pr-2">
          <div className="space-y-6 p-1">
            {/* Department Statistics */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <span>Department Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
                  </div>
                ) : departmentStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4" />
                          <p className="text-sm font-medium">Department</p>
                        </div>
                        <p className="text-2xl font-bold">
                          {departmentStats.department}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4" />
                          <p className="text-sm font-medium">Total Employees</p>
                        </div>
                        <p className="text-2xl font-bold">
                          {departmentStats.employee_count}
                        </p>
                      </div>
                    </div>

                    {departmentStats.employees.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Employees in this Department
                        </h4>
                        <div className="space-y-3">
                          {departmentStats.employees.map((emp) => (
                            <div
                              key={emp.id}
                              className={`p-3 rounded-lg border ${emp.id === employee.id
                                ? "border-primary bg-primary/10"
                                : "bg-muted/30"
                                }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold">
                                    {emp.firstName} {emp.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {emp.position}
                                  </p>
                                </div>
                                {emp.id === employee.id && (
                                  <Badge variant="default">Current</Badge>
                                )}
                              </div>
                              <p className="text-sm mt-1">{emp.email}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No department statistics available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LLM Recommendations */}
            {departmentStats?.llm_recommendations && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4" />
                    </div>
                    <span>AI Insights & Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Data Quality Overview */}
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">Data Coverage</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {
                          departmentStats.llm_recommendations.data_quality
                            .employees_with_data
                        }{" "}
                        of{" "}
                        {
                          departmentStats.llm_recommendations.data_quality
                            .total_employees
                        }{" "}
                        employees have assessment data (
                        {departmentStats.llm_recommendations.data_quality.coverage_percentage.toFixed(
                          1
                        )}
                        % coverage)
                      </p>
                      <p className="text-sm">
                        {departmentStats.llm_recommendations.summary}
                      </p>
                    </div>

                    {/* Team Composition Overview */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.team_composition_overview
                      .overview && (
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">Team Overview</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {
                              departmentStats.llm_recommendations
                                .structured_recommendations
                                .team_composition_overview.overview
                            }
                          </p>
                        </div>
                      )}

                    {/* Strengths */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.strengths_identified.strengths
                      .length > 0 && (
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">Team Strengths</h4>
                          </div>
                          <div className="space-y-2">
                            {departmentStats.llm_recommendations.structured_recommendations.strengths_identified.strengths.map(
                              (strength, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <p className="text-sm">{strength}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Critical Gaps */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.critical_gaps.gaps.length >
                      0 && (
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">
                              Areas for Improvement
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {departmentStats.llm_recommendations.structured_recommendations.critical_gaps.gaps.map(
                              (gap, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                                  <p className="text-sm">{gap}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Recommendations for Balance */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.recommendations_for_balance
                      .recommendations.length > 0 && (
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">
                              Balance Recommendations
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {departmentStats.llm_recommendations.structured_recommendations.recommendations_for_balance.recommendations.map(
                              (rec, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <p className="text-sm">{rec}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Training & Development */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.targeted_training_development
                      .training_recommendations.length > 0 && (
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">
                              Training & Development
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {departmentStats.llm_recommendations.structured_recommendations.targeted_training_development.training_recommendations.map(
                              (training, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <p className="text-sm">{training}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Collaboration Recommendations */}
                    {departmentStats.llm_recommendations
                      .structured_recommendations.team_building_collaboration
                      .collaboration_recommendations.length > 0 && (
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-2 mb-3">
                            <HandHeart className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">
                              Team Building & Collaboration
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {departmentStats.llm_recommendations.structured_recommendations.team_building_collaboration.collaboration_recommendations.map(
                              (collab, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <p className="text-sm">{collab}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Risk Mitigation */}
                    {(departmentStats.llm_recommendations
                      .structured_recommendations.risk_mitigation.risks.length >
                      0 ||
                      departmentStats.llm_recommendations
                        .structured_recommendations.risk_mitigation
                        .mitigation_strategies.length > 0) && (
                        <div className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">Risk Management</h4>
                          </div>
                          {departmentStats.llm_recommendations
                            .structured_recommendations.risk_mitigation.risks
                            .length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Identified Risks:
                                </p>
                                <div className="space-y-1">
                                  {departmentStats.llm_recommendations.structured_recommendations.risk_mitigation.risks.map(
                                    (risk, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start gap-3"
                                      >
                                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                                        <p className="text-sm">{risk}</p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          {departmentStats.llm_recommendations
                            .structured_recommendations.risk_mitigation
                            .mitigation_strategies.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Mitigation Strategies:
                                </p>
                                <div className="space-y-1">
                                  {departmentStats.llm_recommendations.structured_recommendations.risk_mitigation.mitigation_strategies.map(
                                    (strategy, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start gap-3"
                                      >
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <p className="text-sm">{strategy}</p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {employee.employee?.skills?.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span>Skills & Expertise</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-3">
                    {employee.employee.skills.map(
                      (skill: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1 text-sm font-medium"
                        >
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {employee.employee?.education?.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <span>Education</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {employee.employee.education.map(
                      (edu: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl border hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{edu.degree}</h4>
                            <Badge variant="outline">GPA: {edu.gpa}</Badge>
                          </div>
                          <p className="font-medium">{edu.institution}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <Calendar className="h-3 w-3" />
                            <span>Graduated: {edu.year}</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {employee.employee?.experience?.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span>Work Experience</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {employee.employee.experience.map(
                      (exp: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl border hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{exp.position}</h4>
                            <Badge variant="outline">{exp.duration}</Badge>
                          </div>
                          <p className="font-medium mb-2">{exp.company}</p>
                          <p className="text-sm leading-relaxed">
                            {exp.description}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
