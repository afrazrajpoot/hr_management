import React from "react";
import { useFieldArray } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Education } from "../../../types/profileTypes";
// import { Education } from "./types";
interface EducationTabProps {
  isEditing: boolean;
  control: any;
}

const EducationTab: React.FC<EducationTabProps> = ({ isEditing, control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

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
          <CardTitle>Education</CardTitle>
          <CardDescription>Your educational background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {fields.map((edu, index) => (
              <motion.div
                key={edu.id}
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
                      <>
                        <Input
                          placeholder="Degree"
                          {...control.register(`education.${index}.degree`)}
                        />
                        <Input
                          placeholder="Institution"
                          {...control.register(
                            `education.${index}.institution`
                          )}
                        />
                        <Input
                          placeholder="Year"
                          {...control.register(`education.${index}.year`)}
                        />
                        <Input
                          placeholder="GPA"
                          {...control.register(`education.${index}.gpa`)}
                        />
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <GraduationCap size={20} />
                          {(edu as Education).degree}
                        </h4>
                        <p className="font-medium opacity-80">
                          {(edu as Education).institution}
                        </p>
                        <p className="opacity-60">
                          Graduated: {(edu as Education).year} | GPA:{" "}
                          {(edu as Education).gpa}
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
                    degree: "",
                    institution: "",
                    year: "",
                    gpa: "",
                  })
                }
                variant="outline"
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                Add Education
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EducationTab;
