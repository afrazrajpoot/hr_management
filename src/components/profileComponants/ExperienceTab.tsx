import React from "react";
import { useFieldArray, Controller } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import InfoField from "./InfoField";
import { Experience } from "../../../types/profileTypes";
import { experienceFields } from "@/config/profileData";
// import { experienceFields } from "./fieldConfigs";
// import { Experience } from "./types";

interface ExperienceTabProps {
  isEditing: boolean;
  control: any;
}

const ExperienceTab: React.FC<ExperienceTabProps> = ({
  isEditing,
  control,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });
  // console.log(fields, "fields");
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      }}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle>Work Experience</CardTitle>
          <CardDescription>Your professional work history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {fields.map((exp, index) => (
              <motion.div
                key={exp.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    {isEditing ? (
                      experienceFields.map((field) => (
                        <InfoField
                          key={`${field.field}-${index}`}
                          {...field}
                          field={`experience.${index}.${field.field}`}
                          isEditing={isEditing}
                          control={control}
                          defaultValue={
                            (exp as Experience)[field.field as keyof Experience]
                          }
                        />
                      ))
                    ) : (
                      <>
                        <h4 className="font-semibold text-lg">
                          {(exp as Experience).position}
                        </h4>
                        <p className="font-medium opacity-80">
                          {(exp as Experience).company}
                        </p>
                        <p className="opacity-60">
                          {(exp as Experience).duration}
                        </p>
                        <p className="opacity-90">
                          {(exp as Experience).description}
                        </p>
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        onClick={() => remove(index)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isEditing && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() =>
                  append({
                    id: Date.now(),
                    company: "",
                    position: "",
                    duration: "",
                    description: "",
                  })
                }
                variant="outline"
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                Add Experience
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExperienceTab;
