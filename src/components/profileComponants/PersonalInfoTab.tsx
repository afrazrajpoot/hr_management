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
import InfoField from "./InfoField";
import { Employee } from "../../../types/profileTypes";
import { personalInfoFields } from "@/config/profileData";
// import { personalInfoFields } from "./fieldConfigs";
// import { Employee } from "./types";

interface PersonalInfoTabProps {
  employee: Employee;
  isEditing: boolean;
  control: any;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
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
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Manage your personal details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personalInfoFields.slice(0, -1).map((field) => (
            <InfoField
              key={field.field}
              {...field}
              isEditing={isEditing}
              control={control}
              defaultValue={employee[field.field]}
            />
          ))}
        </div>
        <Separator />
        <InfoField
          {...personalInfoFields.find((f) => f.field === "bio")!}
          isEditing={isEditing}
          control={control}
          defaultValue={employee.bio}
        />
      </CardContent>
    </Card>
  </motion.div>
);

export default PersonalInfoTab;
