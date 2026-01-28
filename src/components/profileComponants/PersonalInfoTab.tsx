import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  UserCircle,
  ContactIcon,
  MapPin,
  User,
  FileText,
  Mail,
  Phone,
  Lock,
  Calendar,
  Globe,
  Heart,
  Sparkles,
  Shield,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import InfoField from "./InfoField";
import { Employee } from "../../../types/profileTypes";
import { personalInfoFields } from "@/config/profileData";

interface PersonalInfoTabProps {
  employee: Employee;
  isEditing: boolean;
  control: any;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  employee,
  isEditing,
  control,
  onEdit,
  onSave,
  onCancel,
}: any) => {
  // Get field display value
  const getFieldValue = (fieldName: string) => {
    if (fieldName === "password" && !isEditing) {
      return employee?.password ? "********" : ""; // Mask password in view mode
    }
    return employee?.[fieldName] || "";
  };

  // Group fields for better organization
  const basicInfoFields = personalInfoFields.filter((f) =>
    ["firstName", "lastName", "email", "phone"].includes(f.field)
  );

  const addressFields = personalInfoFields.filter((f) =>
    ["address", "city", "state", "country", "zipCode"].includes(f.field)
  );

  const additionalFields = personalInfoFields.filter((f) =>
    ["dateOfBirth", "nationality", "maritalStatus"].includes(f.field)
  );

  const bioField = personalInfoFields.find((f) => f.field === "bio");

  // Calculate completeness for each section
  const calculateSectionCompleteness = (fields: any[]) => {
    const filledFields = fields.filter((f) =>
      getFieldValue(f.field)?.trim()
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const basicInfoComplete = calculateSectionCompleteness(basicInfoFields);
  const addressComplete = calculateSectionCompleteness(addressFields);
  const additionalComplete = calculateSectionCompleteness(additionalFields);

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
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              onClick={onSave}
              className="btn-purple"
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
            className="btn-purple"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {/* Basic Information Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper-blue p-2">
                <ContactIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Basic Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your core personal details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-muted rounded-full h-2">
                <div
                  className={`progress-bar-primary rounded-full h-2 transition-all duration-500 ${basicInfoComplete >= 80
                    ? "bg-success"
                    : basicInfoComplete >= 50
                      ? "bg-warning"
                      : "bg-destructive"
                    }`}
                  style={{ width: `${basicInfoComplete}%` }}
                />
              </div>
              <span className="text-sm font-medium min-w-[40px]">
                {basicInfoComplete}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {basicInfoFields.map((field, index) => (
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
                <InfoField
                  {...field}
                  isEditing={isEditing}
                  control={control}
                  defaultValue={getFieldValue(field.field)}
                  disabled={!isEditing}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Address Information */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper-green p-2">
                <MapPin className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Address Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your location and contact address
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-muted rounded-full h-2">
                <div
                  className={`progress-bar-primary rounded-full h-2 transition-all duration-500 ${addressComplete >= 80
                    ? "bg-success"
                    : addressComplete >= 50
                      ? "bg-warning"
                      : "bg-destructive"
                    }`}
                  style={{ width: `${addressComplete}%` }}
                />
              </div>
              <span className="text-sm font-medium min-w-[40px]">
                {addressComplete}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addressFields.map((field, index) => (
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
                className={`group ${field.field === "address" ? "md:col-span-2" : ""
                  }`}
              >
                <InfoField
                  {...field}
                  isEditing={isEditing}
                  control={control}
                  defaultValue={getFieldValue(field.field)}
                  disabled={!isEditing}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Additional Details */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper-amber p-2">
                <User className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Additional Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Personal demographic information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-muted rounded-full h-2">
                <div
                  className={`progress-bar-primary rounded-full h-2 transition-all duration-500 ${additionalComplete >= 80
                    ? "bg-success"
                    : additionalComplete >= 50
                      ? "bg-warning"
                      : "bg-destructive"
                    }`}
                  style={{ width: `${additionalComplete}%` }}
                />
              </div>
              <span className="text-sm font-medium min-w-[40px]">
                {additionalComplete}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                <InfoField
                  {...field}
                  isEditing={isEditing}
                  control={control}
                  defaultValue={getFieldValue(field.field)}
                  disabled={!isEditing}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bio Section */}
        {bioField && (
          <>
            <Separator className="bg-border/50" />
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="icon-wrapper-purple p-2">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      Professional Bio
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tell us about yourself professionally
                    </p>
                  </div>
                </div>
                {getFieldValue(bioField.field) && (
                  <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Bio Added
                  </Badge>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group"
              >
                <InfoField
                  {...bioField}
                  isEditing={isEditing}
                  control={control}
                  defaultValue={getFieldValue(bioField.field)}
                  disabled={!isEditing}
                />
                {!getFieldValue(bioField.field) && !isEditing && (
                  <div className="mt-3 p-4 rounded-lg bg-muted/20 border border-dashed border-border">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary/60" />
                      <p className="text-sm text-muted-foreground">
                        Add a professional bio to enhance your profile
                        visibility
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </motion.div>

      {/* Tips Section */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-primary border-dashed border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="icon-wrapper-blue p-3 flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    Profile Completion Tips
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${basicInfoComplete >= 100 ? "bg-success" : "bg-warning"
                          }`}
                      />
                      <p className="text-sm text-muted-foreground">
                        Complete all basic information fields for better profile
                        strength
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${addressComplete >= 100 ? "bg-success" : "bg-warning"
                          }`}
                      />
                      <p className="text-sm text-muted-foreground">
                        Add your complete address for location-based
                        opportunities
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${getFieldValue(bioField?.field || "")
                          ? "bg-success"
                          : "bg-warning"
                          }`}
                      />
                      <p className="text-sm text-muted-foreground">
                        A professional bio increases your profile completeness
                        by 15%
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

import { Badge } from "@/components/ui/badge";

export default PersonalInfoTab;
