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
import { Checkbox } from "@/components/ui/checkbox";
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
  Edit3,
  Save,
  XCircle,
  Award,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUpdateEmployeeMutation } from "@/redux/hr-api";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

interface FormData {
  department: string;
  position: string;
  salary: string;
  transfer: boolean;
  promotion: boolean;
}

export default function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
}: EmployeeDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();
  console.log("Employee Data:", employee);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm<FormData>();

  // Reset form with employee data when modal opens or employee changes
  useEffect(() => {
    if (employee) {
      reset({
        department: employee.department || "",
        position: employee.position || "",
        salary: employee.salary || "",
        transfer: employee.transfer || false,
        promotion: employee.promotion || false,
      });
    }
  }, [employee, reset, isOpen]);

  if (!employee) return null;

  const onSubmit = async (data: FormData) => {
    // Custom validation for transfer or promotion
    if (!data.transfer && !data.promotion) {
      setError("promotion", {
        type: "manual",
        message: "At least one of transfer or promotion must be selected",
      });
      return;
    }

    try {
      await updateEmployee({
        department: data.department,
        userId: employee.id,
        position: data.position,
        salary: data.salary,
        transfer: data.transfer,
        promotion: data.promotion,
      }).unwrap();
      toast.success("Employee data updated successfully");
      setIsEditing(false);
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to update employee data");
    }
  };

  const handleInputChange = () => {
    clearErrors(["promotion", "transfer"]);
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Reset form to original employee data when canceling edit
      reset({
        department: employee.department || "",
        position: employee.position || "",
        salary: employee.salary || "",
        transfer: employee.transfer || false,
        promotion: employee.promotion || false,
      });
    }
    setIsEditing(!isEditing);
  };

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
                <h2 className="text-2xl font-bold">Employee Profile</h2>
                <p className="text-sm">
                  {employee.firstName}{" "}
                  {employee.lastName !== "Not provide" ? employee.lastName : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleEdit}
                disabled={isLoading}
                variant={isEditing ? "outline" : "default"}
                className="transition-all duration-200"
              >
                {isEditing ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-8rem)] pr-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 p-1">
              {/* Basic Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4" />
                        <p className="text-sm font-medium">Email</p>
                      </div>
                      <p className="font-semibold px-3 py-2 rounded-lg">
                        {employee.email}
                      </p>
                    </div>

                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4" />
                        <p className="text-sm font-medium">Position</p>
                      </div>
                      {isEditing ? (
                        <Controller
                          name="position"
                          control={control}
                          rules={{ required: "Position is required" }}
                          render={({ field }) => (
                            <Input {...field} disabled={isLoading} />
                          )}
                        />
                      ) : (
                        <p className="font-semibold px-3 py-2 rounded-lg">
                          {employee.position}
                        </p>
                      )}
                      {errors.position && (
                        <p className="text-sm mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          {errors.position.message}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4" />
                        <p className="text-sm font-medium">Department</p>
                      </div>
                      {isEditing ? (
                        <Controller
                          name="department"
                          control={control}
                          rules={{ required: "Department is required" }}
                          render={({ field }) => (
                            <Input {...field} disabled={isLoading} />
                          )}
                        />
                      ) : (
                        <p className="font-semibold px-3 py-2 rounded-lg">
                          {employee.department}
                        </p>
                      )}
                      {errors.department && (
                        <p className="text-sm mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          {errors.department.message}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <p className="text-sm font-medium">Salary</p>
                      </div>
                      {isEditing ? (
                        <Controller
                          name="salary"
                          control={control}
                          rules={{ required: "Salary is required" }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              disabled={isLoading}
                            />
                          )}
                        />
                      ) : (
                        <p className="font-semibold px-3 py-2 rounded-lg">
                          ${employee.salary}
                        </p>
                      )}
                      {errors.salary && (
                        <p className="text-sm mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          {errors.salary.message}
                        </p>
                      )}
                    </div>

                    {/* <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4" />
                        <p className="text-sm font-medium">Employee ID</p>
                      </div>
                      <p className="font-semibold px-3 py-2 rounded-lg">
                        {employee.employee?.id || "N/A"}
                      </p>
                    </div> */}
                  </div>

                  {isEditing && (
                    <div className="mt-6 p-4 rounded-xl border">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Edit3 className="h-4 w-4" />
                        Action Required
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                          <Controller
                            name="transfer"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id="transfer"
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleInputChange();
                                }}
                                disabled={isLoading}
                              />
                            )}
                          />
                          <label
                            htmlFor="transfer"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Transfer Request
                          </label>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                          <Controller
                            name="promotion"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id="promotion"
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleInputChange();
                                }}
                                disabled={isLoading}
                              />
                            )}
                          />
                          <label
                            htmlFor="promotion"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Promotion Request
                          </label>
                        </div>
                      </div>
                      {errors.promotion && (
                        <p className="text-sm mt-3 flex items-center gap-1 p-2 rounded-lg">
                          <XCircle className="h-4 w-4" />
                          {errors.promotion.message}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {isEditing && (
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
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
                      {employee?.employee?.skills?.map(
                        (skill: { name: string; proficiency: number }, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1 text-sm font-medium"
                          >
                            {skill ? skill?.name : "N/A"}
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
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
