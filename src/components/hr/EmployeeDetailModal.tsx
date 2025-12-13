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
  Sparkles,
  TrendingUp,
  MoveRight,
  Crown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUpdateEmployeeMutation } from "@/redux/hr-api";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { dashboardOptions } from "@/app/data";

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm<FormData>();

  // Get the last position and department from arrays
  const getLastItem = (array: any[] | undefined) => {
    if (!array || array.length === 0) return "";
    return array[array.length - 1];
  };

  // Reset form with employee data when modal opens or employee changes
  useEffect(() => {
    if (employee) {
      reset({
        department: getLastItem(employee.department) || "",
        position: getLastItem(employee.position) || "",
        salary: employee.salary || "",
        transfer: employee.transfer || false,
        promotion: employee.promotion || false,
      });
    }
  }, [employee, reset, isOpen]);

  if (!employee) return null;

  const onSubmit = async (data: FormData) => {
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
      reset({
        department: getLastItem(employee.department) || "",
        position: getLastItem(employee.position) || "",
        salary: employee.salary || "",
        transfer: employee.transfer || false,
        promotion: employee.promotion || false,
      });
    }
    setIsEditing(!isEditing);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] card-primary rounded-2xl border-0 shadow-2xl p-0 flex flex-col overflow-hidden">
        <div className="decorative-gradient-blur-blue -top-32 -right-32 opacity-50 pointer-events-none" />
        <div className="decorative-gradient-blur-purple -bottom-32 -left-32 opacity-30 pointer-events-none" />

        <DialogHeader className="relative pb-6 border-b bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-2xl flex-shrink-0">
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-r from-primary/10 to-accent/10" />
          <DialogTitle className="flex items-center justify-between relative z-10 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-success border-2 border-card flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-success-foreground" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text-primary">
                  Employee Profile
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-semibold">
                    {employee.firstName}{" "}
                    {employee.lastName !== "Not provide"
                      ? employee.lastName
                      : ""}
                  </p>
                  {employee.employee?.id && (
                    <Badge variant="outline" className="badge-blue text-xs">
                      ID: {employee.employee.id}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleEdit}
                disabled={isLoading}
                variant={isEditing ? "outline" : "default"}
                className={`transition-all duration-200 ${
                  isEditing
                    ? "border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                    : "btn-gradient-primary shadow-lg hover:shadow-xl"
                } font-medium px-6`}
              >
                {isEditing ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto overflow-x-hidden flex-1 p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="card-primary border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="icon-wrapper-blue">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="icon-wrapper-purple p-2">
                          <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                      </div>
                      <p className="font-semibold px-3 py-2.5 rounded-lg bg-muted/50">
                        {employee.email}
                      </p>
                    </div>

                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="icon-wrapper-amber p-2">
                          <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Position
                        </p>
                      </div>
                      {isEditing ? (
                        <Controller
                          name="position"
                          control={control}
                          rules={{ required: "Position is required" }}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="w-full border-input focus:ring-ring">
                                <SelectValue placeholder="Select a position" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-input">
                                {dashboardOptions.Positions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="hover:bg-muted"
                                  >
                                    {option.option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      ) : (
                        <div className="font-semibold px-3 py-2.5 rounded-lg bg-muted/50 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-amber-600" />
                          {getLastItem(employee.position) || "N/A"}
                        </div>
                      )}
                      {errors.position && (
                        <p className="text-sm mt-2 flex items-center gap-1.5 text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
                          <XCircle className="h-3.5 w-3.5" />
                          {errors.position.message}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="icon-wrapper-green p-2">
                          <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Department
                        </p>
                      </div>
                      {isEditing ? (
                        <Controller
                          name="department"
                          control={control}
                          rules={{ required: "Department is required" }}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="w-full border-input focus:ring-ring">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-input">
                                {dashboardOptions.Departments.filter(
                                  (option) => option.value !== "all"
                                ).map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="hover:bg-muted"
                                  >
                                    {option.option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      ) : (
                        <div className="font-semibold px-3 py-2.5 rounded-lg bg-muted/50 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-green-600" />
                          {getLastItem(employee.department) || "N/A"}
                        </div>
                      )}
                      {errors.department && (
                        <p className="text-sm mt-2 flex items-center gap-1.5 text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
                          <XCircle className="h-3.5 w-3.5" />
                          {errors.department.message}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="icon-wrapper-blue p-2">
                          <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Salary
                        </p>
                      </div>
                      {isEditing ? (
                        <Controller
                          name="salary"
                          control={control}
                          rules={{ required: "Salary is required" }}
                          render={({ field }) => (
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input
                                {...field}
                                type="number"
                                disabled={isLoading}
                                className="pl-10 border-input focus:ring-ring"
                                placeholder="Enter salary"
                              />
                            </div>
                          )}
                        />
                      ) : (
                        <div className="font-semibold px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />$
                          {Number(employee.salary).toLocaleString()}
                        </div>
                      )}
                      {errors.salary && (
                        <p className="text-sm mt-2 flex items-center gap-1.5 text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
                          <XCircle className="h-3.5 w-3.5" />
                          {errors.salary.message}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="icon-wrapper-green p-2">
                          <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Status
                        </p>
                      </div>
                      <Badge className="badge-green px-3 py-1.5">Active</Badge>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-8 p-5 rounded-xl border border-input bg-gradient-to-br from-primary/5 to-accent/5">
                      <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Required Actions
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select at least one action to proceed with the update
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                            control._formValues.transfer
                              ? "border-primary bg-primary/5"
                              : "border-input hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          <div className="icon-wrapper-blue p-2">
                            <MoveRight className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <Controller
                              name="transfer"
                              control={control}
                              render={({ field }) => (
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id="transfer"
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleInputChange();
                                    }}
                                    disabled={isLoading}
                                    className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                  <label
                                    htmlFor="transfer"
                                    className="text-sm font-medium cursor-pointer flex-1"
                                  >
                                    Transfer Request
                                  </label>
                                </div>
                              )}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Move employee to another department
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                            control._formValues.promotion
                              ? "border-accent bg-accent/5"
                              : "border-input hover:border-accent/50 hover:bg-accent/5"
                          }`}
                        >
                          <div className="icon-wrapper-green p-2">
                            <Crown className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <Controller
                              name="promotion"
                              control={control}
                              render={({ field }) => (
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id="promotion"
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleInputChange();
                                    }}
                                    disabled={isLoading}
                                    className="h-5 w-5 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                  />
                                  <label
                                    htmlFor="promotion"
                                    className="text-sm font-medium cursor-pointer flex-1"
                                  >
                                    Promotion Request
                                  </label>
                                </div>
                              )}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Advance employee to higher position
                            </p>
                          </div>
                        </div>
                      </div>
                      {errors.promotion && (
                        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-sm flex items-center gap-2 text-destructive">
                            <XCircle className="h-4 w-4" />
                            {errors.promotion.message}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {isEditing && (
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={toggleEdit}
                    variant="outline"
                    className="px-6 py-2.5 border-input hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2.5 btn-gradient-primary shadow-lg hover:shadow-xl font-medium"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
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
                <Card className="card-primary border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="icon-wrapper-purple">
                        <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>Skills & Expertise</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-3">
                      {employee?.employee?.skills?.map(
                        (
                          skill: { name: string; proficiency: number },
                          index: number
                        ) => (
                          <div key={index} className="relative group">
                            <Badge
                              variant="secondary"
                              className="px-4 py-2 text-sm font-medium badge-purple group-hover:scale-105 transition-transform duration-200"
                            >
                              {skill ? skill?.name : "N/A"}
                              {skill?.proficiency && (
                                <span className="ml-2 text-xs opacity-75">
                                  ({skill.proficiency}/10)
                                </span>
                              )}
                            </Badge>
                            {skill?.proficiency && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="progress-bar-primary h-full"
                                  style={{
                                    width: `${skill.proficiency * 10}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {employee.employee?.education?.length > 0 && (
                <Card className="card-primary border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="icon-wrapper-blue">
                        <GraduationCap className="h-5 w-5 text-primary" />
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
                            className="assessment-item p-4 rounded-xl border border-input hover:border-primary/50 transition-all duration-200 group"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="icon-wrapper-blue p-2">
                                  <GraduationCap className="h-4 w-4 text-primary" />
                                </div>
                                <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                  {edu.degree}
                                </h4>
                              </div>
                              <Badge className="badge-green">
                                GPA: {edu.gpa}
                              </Badge>
                            </div>
                            <p className="font-medium text-muted-foreground mb-2">
                              {edu.institution}
                            </p>
                            <div className="flex items-center gap-3 mt-3 text-sm">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Graduated: {edu.year}</span>
                              </div>
                              {edu.field && (
                                <Badge variant="outline" className="px-3 py-1">
                                  {edu.field}
                                </Badge>
                              )}
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
                <Card className="card-primary border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="icon-wrapper-green">
                        <Clock className="h-5 w-5 text-accent" />
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
                            className="assessment-item p-4 rounded-xl border border-input hover:border-accent/50 transition-all duration-200 group"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="icon-wrapper-green p-2">
                                  <Briefcase className="h-4 w-4 text-accent" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg group-hover:text-accent transition-colors">
                                    {exp.position}
                                  </h4>
                                  <p className="font-medium text-muted-foreground">
                                    {exp.company}
                                  </p>
                                </div>
                              </div>
                              <Badge className="badge-blue">
                                {exp.duration}
                              </Badge>
                            </div>
                            <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg">
                              {exp.description}
                            </p>
                            {exp.technologies && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {exp.technologies.map(
                                  (tech: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="px-2 py-1 text-xs badge-amber"
                                    >
                                      {tech}
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
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
