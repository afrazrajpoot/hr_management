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
import { Input } from "@/components/ui/input";
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
import { useState } from "react";
import { useUpdateEmployeeMutation } from "@/redux/hr-api";
import { toast } from "sonner";

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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    department: employee?.department || "",
    position: employee?.position || "",
    salary: employee?.salary || "",
  });
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();

  if (!employee) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmployee({
        department: formData.department,
        userId: employee.id,
        position: formData.position,
        salary: formData.salary,
      }).unwrap();
      toast.success("Employee data updated successfully");
      setIsEditing(false);
      onClose(); // Close modal after successful update
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to update employee data");
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Reset form data to original values when cancelling edit
    if (isEditing) {
      setFormData({
        department: employee.department,
        position: employee.position,
        salary: employee.salary,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Employee Details</span>
            <Button onClick={toggleEdit} disabled={isLoading}>
              {isEditing ? "Cancel" : "Update"}
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
                {isEditing ? (
                  <Input
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="mt-1"
                    disabled={isLoading}
                  />
                ) : (
                  <p className="font-medium flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {employee.position}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                {isEditing ? (
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="mt-1"
                    disabled={isLoading}
                  />
                ) : (
                  <p className="font-medium flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {employee.department}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salary</p>
                {isEditing ? (
                  <Input
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="mt-1"
                    disabled={isLoading}
                  />
                ) : (
                  <p className="font-medium flex items-center gap-1">
                    {employee.salary}
                    <DollarSign className="h-4 w-4" />
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{employee.employee?.id || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Updating..." : "Submit Changes"}
              </Button>
            </div>
          )}

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
