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
import { UserCircle, ContactIcon, MapPin, User, FileText } from "lucide-react";
import InfoField from "./InfoField";
import { Employee } from "../../../types/profileTypes";
import { personalInfoFields } from "@/config/profileData";

interface PersonalInfoTabProps {
  employee: Employee;
  isEditing: boolean;
  control: any;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  employee,
  isEditing,
  control,
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
    ["firstName", "lastName", "email", "password", "phone"].includes(f.field)
  );

  const addressFields = personalInfoFields.filter((f) =>
    ["address", "city", "state", "country", "zipCode"].includes(f.field)
  );

  const additionalFields = personalInfoFields.filter((f) =>
    ["dateOfBirth", "nationality", "maritalStatus"].includes(f.field)
  );

  const bioField = personalInfoFields.find((f) => f.field === "bio");

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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Personal Information
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {isEditing
                  ? "Edit your personal details and contact information"
                  : "View your personal details and contact information"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ContactIcon className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  >
                    <InfoField
                      {...field}
                      isEditing={isEditing}
                      control={control}
                      defaultValue={getFieldValue(field.field)}
                      disabled={!isEditing} // Disable inputs when not editing
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Address</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className={field.field === "address" ? "md:col-span-2" : ""}
                  >
                    <InfoField
                      {...field}
                      isEditing={isEditing}
                      control={control}
                      defaultValue={getFieldValue(field.field)}
                      disabled={!isEditing} // Disable inputs when not editing
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Additional Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Additional Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  >
                    <InfoField
                      {...field}
                      isEditing={isEditing}
                      control={control}
                      defaultValue={getFieldValue(field.field)}
                      disabled={!isEditing} // Disable inputs when not editing
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Bio Section */}
            {bioField && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">About</h3>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <InfoField
                    {...bioField}
                    isEditing={isEditing}
                    control={control}
                    defaultValue={getFieldValue(bioField.field)}
                    disabled={!isEditing} // Disable inputs when not editing
                  />
                </motion.div>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PersonalInfoTab;
