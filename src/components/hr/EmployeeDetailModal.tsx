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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  transfer: string; // Changed from boolean to string ("ingoing", "outgoing", or "")
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
    watch,
  } = useForm<FormData>({
    defaultValues: {
      department: employee?.department || "",
      position: employee?.position || "",
      salary: employee?.salary || "",
      transfer: "", // Empty string for no selection
      promotion: false,
    },
  });

  const transferValue = watch("transfer"); // Watch transfer field for validation

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

    // Validate transfer type if transfer is selected
    if (data.transfer && !["ingoing", "outgoing"].includes(data.transfer)) {
      setError("transfer", {
        type: "manual",
        message: "Please select a valid transfer type (ingoing or outgoing)",
      });
      return;
    }

    try {
      await updateEmployee({
        department: data.department,
        userId: employee.id,
        position: data.position,
        salary: data.salary,
        transfer: data.transfer || null, // Send null if no transfer type is selected
        promotion: data.promotion,
      }).unwrap();
      toast.success("Employee data updated successfully");
      setIsEditing(false);
      onClose(); // Close modal after successful update
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to update employee data");
    }
  };

  const handleInputChange = () => {
    // Clear the transfer/promotion error when either field is changed
    clearErrors(["promotion", "transfer"]);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Reset form data to original values when cancelling edit
    if (isEditing) {
      reset({
        department: employee.department,
        position: employee.position,
        salary: employee.salary,
        transfer: "",
        promotion: false,
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

        <form onSubmit={handleSubmit(onSubmit)}>
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
                    {employee.lastName !== "Not provide"
                      ? employee.lastName
                      : ""}
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
                    <Controller
                      name="position"
                      control={control}
                      rules={{ required: "Position is required" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="mt-1"
                          disabled={isLoading}
                        />
                      )}
                    />
                  ) : (
                    <p className="font-medium flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {employee.position}
                    </p>
                  )}
                  {errors.position && (
                    <p className="text-sm text-red-500">
                      {errors.position.message}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  {isEditing ? (
                    <Controller
                      name="department"
                      control={control}
                      rules={{ required: "Department is required" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="mt-1"
                          disabled={isLoading}
                        />
                      )}
                    />
                  ) : (
                    <p className="font-medium flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {employee.department}
                    </p>
                  )}
                  {errors.department && (
                    <p className="text-sm text-red-500">
                      {errors.department.message}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salary</p>
                  {isEditing ? (
                    <Controller
                      name="salary"
                      control={control}
                      rules={{ required: "Salary is required" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          className="mt-1"
                          disabled={isLoading}
                        />
                      )}
                    />
                  ) : (
                    <p className="font-medium flex items-center gap-1">
                      {employee.salary}
                      <DollarSign className="h-4 w-4" />
                    </p>
                  )}
                  {errors.salary && (
                    <p className="text-sm text-red-500">
                      {errors.salary.message}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">
                    {employee.employee?.id || "N/A"}
                  </p>
                </div>
                {isEditing && (
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Controller
                        name="transfer"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleInputChange();
                            }}
                            value={field.value}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select transfer type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ingoing">Ingoing</SelectItem>
                              <SelectItem value="outgoing">Outgoing</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <label className="text-sm">Transfer Type</label>
                    </div>
                    {errors.transfer && (
                      <p className="text-sm text-red-500">
                        {errors.transfer.message}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
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
                      <label htmlFor="promotion" className="text-sm">
                        Promotion
                      </label>
                    </div>
                    {errors.promotion && (
                      <p className="text-sm text-red-500">
                        {errors.promotion.message}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
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
                  {employee.employee.education.map(
                    (edu: any, index: number) => (
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
                    )
                  )}
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
                  {employee.employee.experience.map(
                    (exp: any, index: number) => (
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
                    )
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
