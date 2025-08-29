"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Mail,
  DollarSign,
  User,
  Briefcase,
  Building2,
  BookOpen,
  GraduationCap,
  Clock,
} from "lucide-react";

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

export default function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
}: EmployeeDetailModalProps) {
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Employee Details</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">
                  {employee.firstName}{" "}
                  {employee.lastName !== "Not provide" ? employee.lastName : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {employee.position}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {employee.department}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salary</p>
                <p className="font-medium flex items-center gap-1">
                  {employee.salary}
                  <DollarSign className="h-4 w-4" />
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{employee.employee?.id || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {employee.employee?.skills?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employee.employee.skills.map(
                    (skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.employee.education.map((edu: any, index: number) => (
                  <div
                    key={index}
                    className="border-b pb-4 last:border-0 last:pb-0"
                  >
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}
                    </p>
                    <div className="flex justify-between mt-1 text-sm">
                      <span>Graduated: {edu.year}</span>
                      <span>GPA: {edu.gpa}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {employee.employee?.experience?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.employee.experience.map((exp: any, index: number) => (
                  <div
                    key={index}
                    className="border-b pb-4 last:border-0 last:pb-0"
                  >
                    <p className="font-medium">
                      {exp.position} at {exp.company}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exp.duration}
                    </p>
                    <p className="text-sm mt-2">{exp.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
