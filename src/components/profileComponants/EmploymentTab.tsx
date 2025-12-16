import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Target,
  Shield,
  Lock,
  Sparkles,
  TrendingUp,
  Award,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import InfoField from "./InfoField";
import { Employee } from "../../../types/profileTypes";
import { employmentFields } from "@/config/profileData";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EmploymentTabProps {
  employee: Employee;
  isEditing: boolean;
  control: any;
  userHrId?: string | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const EmploymentTab: React.FC<EmploymentTabProps> = ({
  employee,
  isEditing,
  control,
  userHrId,
  onEdit,
  onSave,
  onCancel,
}) => {
  // Get field display value
  const getFieldValue = (fieldName: string): any => {
    return employee?.[fieldName as keyof Employee] || "";
  };

  // Allow editing only if userHrId is null or undefined
  const canEditEmployment = !!userHrId;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format salary for display
  const formatSalary = (salary: string | number) => {
    if (!salary) return "Not disclosed";
    const num = typeof salary === "string" ? parseFloat(salary) : salary;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Calculate tenure in years/months
  const calculateTenure = () => {
    if (!employee.hireDate) return "Not available";
    const hireDate = new Date(employee.hireDate);
    const now = new Date();
    const years = now.getFullYear() - hireDate.getFullYear();
    const months = now.getMonth() - hireDate.getMonth();

    let tenure = "";
    if (years > 0) {
      tenure += `${years} year${years > 1 ? "s" : ""}`;
    }
    if (months > 0) {
      if (tenure) tenure += ", ";
      tenure += `${months} month${months > 1 ? "s" : ""}`;
    }
    if (!tenure) tenure = "Less than a month";

    return tenure;
  };

  // Get icon for field
  const getFieldIcon = (fieldName: string) => {
    const icons: Record<string, React.ReactNode> = {
      employeeId: <Target className="w-4 h-4 text-primary" />,
      hireDate: <Calendar className="w-4 h-4 text-warning" />,
      department: <Building2 className="w-4 h-4 text-accent" />,
      position: <Briefcase className="w-4 h-4 text-success" />,
      manager: <Users className="w-4 h-4 text-primary" />,
      salary: <DollarSign className="w-4 h-4 text-warning" />,
    };
    return icons[fieldName] || <Briefcase className="w-4 h-4 text-primary" />;
  };

  // Group fields
  const basicEmploymentFields = employmentFields.filter((f) =>
    ["employeeId", "hireDate", "department", "position"].includes(f.field)
  );
  const additionalFields = employmentFields.filter((f) =>
    ["manager", "salary"].includes(f.field)
  );

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut",
          },
        },
      }}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Card className="card-primary card-hover">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="icon-wrapper-green p-3">
                <Building2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold gradient-text-primary">
                  Employment Details
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  {canEditEmployment
                    ? "Your employment information and organizational details"
                    : "Your employment information (HR Managed)"}
                </CardDescription>
              </div>
            </div>

            {!canEditEmployment && (
              <div className="flex items-center gap-2">
                <div className="icon-wrapper-blue p-2">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <Badge className="badge-blue">
                  <Lock className="w-3 h-3 mr-1" />
                  HR Managed
                </Badge>
              </div>
            )}
            
            {canEditEmployment && (
              <div className="ml-auto flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={onSave}
                      className="btn-gradient-primary"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={onCancel}
                      variant="outline"
                      className="border-input"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={onEdit}
                    className="btn-gradient-primary"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Employment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <div className="text-center">
              <div className="icon-wrapper-blue mx-auto mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenure</p>
                <p className="text-xl font-bold">{calculateTenure()}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="icon-wrapper-green mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Role</p>
                <p className="text-xl font-bold">
                  {employee.position || "Not set"}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="icon-wrapper-amber mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Salary</p>
                <p className="text-xl font-bold">
                  {formatSalary(employee.salary)}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Basic Employment Information */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper-blue p-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    Basic Employment Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Core details about your employment
                  </p>
                </div>
              </div>
              {!canEditEmployment && (
                <Badge
                  variant="outline"
                  className="border-destructive/20 text-destructive"
                >
                  Read Only
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {basicEmploymentFields.map((field, index) => (
                <motion.div
                  key={field.field}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: index * 0.05,
                      duration: 0.3,
                    },
                  }}
                  className="group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        !canEditEmployment
                          ? "bg-muted/50"
                          : "icon-wrapper-blue opacity-80"
                      }`}
                    >
                      {getFieldIcon(field.field)}
                    </div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {field.label}
                      {field.field === "hireDate" && employee.hireDate && (
                        <span className="ml-2 text-xs text-primary">
                          ({formatDate(employee.hireDate)})
                        </span>
                      )}
                      {field.field === "salary" && employee.salary && (
                        <span className="ml-2 text-xs text-warning">
                          ({formatSalary(employee.salary)})
                        </span>
                      )}
                    </label>
                  </div>
                  <InfoField
                    {...field}
                    isEditing={isEditing && canEditEmployment}
                    control={control}
                    defaultValue={getFieldValue(field.field)}
                    disabled={!canEditEmployment}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Additional Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="icon-wrapper-purple p-2">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    Additional Details
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Additional employment information
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {additionalFields.map((field, index) => (
                <motion.div
                  key={field.field}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: index * 0.05,
                      duration: 0.3,
                    },
                  }}
                  className="group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        !canEditEmployment
                          ? "bg-muted/50"
                          : "icon-wrapper-purple opacity-80"
                      }`}
                    >
                      {getFieldIcon(field.field)}
                    </div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {field.label}
                      {field.field === "manager" && employee.manager && (
                        <Badge className="badge-green ml-2">Reporting</Badge>
                      )}
                    </label>
                  </div>
                  <InfoField
                    {...field}
                    isEditing={isEditing && canEditEmployment}
                    control={control}
                    defaultValue={getFieldValue(field.field)}
                    disabled={!canEditEmployment}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Note for HR Managed Fields */}
          {!canEditEmployment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-destructive/5 border border-destructive/20"
            >
              <div className="flex items-start gap-3">
                <div className="icon-wrapper-blue p-2 mt-1">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-destructive" />
                    HR Managed Fields
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your employment details are managed by the HR department.
                    Please contact your HR representative for any updates or
                    corrections to this information.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="border-primary/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Automated Updates
                    </Badge>
                    <Badge variant="outline" className="border-warning/20">
                      <Award className="w-3 h-3 mr-1" />
                      Secure Data
                    </Badge>
                    <Badge variant="outline" className="border-success/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Real-time Sync
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Career Insights (Optional) */}
      {employee.hireDate && employee.position && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-primary border-dashed border-2 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="icon-wrapper-green p-3 flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    Career Progress Insights
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Tenure:</span> You've been
                        with the organization for {calculateTenure()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-warning" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Role:</span> Currently
                        serving as {employee.position}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Department:</span> Part of
                        the {employee.department || "Unspecified"} team
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmploymentTab;
