import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import InfoField from "./InfoField";
import { Employee } from "../../../types/profileTypes";
import { employmentFields } from "@/config/profileData";

interface EmploymentTabProps {
  employee: Employee;
  isEditing: boolean;
  control: any;
}

const EmploymentTab: React.FC<EmploymentTabProps> = ({
  employee,
  isEditing,
  control,
}: any) => {
  // Get field display value
  const getFieldValue = (fieldName: string) => {
    return employee?.[fieldName] || "";
  };

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
      <Card className="card">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Employment Details
              </CardTitle>
              <CardDescription className="text-base mt-1">
                View your employment and workplace information
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {employmentFields.map((field, index) => (
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
                    disabled={true} // Always disabled, regardless of isEditing
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmploymentTab;
