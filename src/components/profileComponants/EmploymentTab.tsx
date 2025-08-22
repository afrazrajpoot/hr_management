import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import InfoField from "./InfoField";
import { Employee } from "../../../types/profileTypes";
import { employmentFields } from "@/config/profileData";
// import { employmentFields } from "./fieldConfigs";
// import { Employee } from "./types";

interface EmploymentTabProps {
  employee: Employee;
  isEditing: boolean;
  control: any;
}

const EmploymentTab: React.FC<EmploymentTabProps> = ({
  employee,
  isEditing,
  control,
}: any) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    }}
    initial="hidden"
    animate="visible"
  >
    <Card>
      <CardHeader>
        <CardTitle>Employment Details</CardTitle>
        <CardDescription>Your current employment information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employmentFields.map((field) => (
            <InfoField
              key={field.field}
              {...field}
              isEditing={isEditing}
              control={control}
              defaultValue={employee[field.field]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default EmploymentTab;
