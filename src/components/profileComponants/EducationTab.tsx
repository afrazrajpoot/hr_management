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
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  GraduationCap,
  School,
  Calendar,
  Award,
  BookOpen,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Education } from "../../../types/profileTypes";

interface EducationTabProps {
  isEditing: boolean;
  control: any;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const EducationTab: React.FC<EducationTabProps> = ({ isEditing, control, onEdit, onSave, onCancel }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

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
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Education
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Your academic achievements and qualifications
              </CardDescription>
            </div>
          </div>
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
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="popLayout">
            {fields.length === 0 && !isEditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No education records added yet
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Click edit to add your educational background
                </p>
              </motion.div>
            )}

            {fields.map((edu, index) => (
              <motion.div
                key={edu.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    duration: 0.3,
                    delay: index * 0.05,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: -20,
                  transition: { duration: 0.2 },
                }}
                whileHover={!isEditing ? { scale: 1.01 } : {}}
                className="group relative"
              >
                <Card className="border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md dark:hover:shadow-xl transition-all duration-300 hover:border-border overflow-hidden">
                  {!isEditing && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  <CardContent className="p-6 relative">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-4 flex-1">
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Degree
                              </label>
                              <Input
                                placeholder="e.g., Bachelor of Science in Computer Science"
                                {...control.register(
                                  `education.${index}.degree`
                                )}
                                className="border-border/50 focus:border-primary transition-colors"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <School className="h-4 w-4" />
                                Institution
                              </label>
                              <Input
                                placeholder="e.g., University of Technology"
                                {...control.register(
                                  `education.${index}.institution`
                                )}
                                className="border-border/50 focus:border-primary transition-colors"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Year
                                </label>
                                <Input
                                  placeholder="e.g., 2023"
                                  {...control.register(
                                    `education.${index}.year`
                                  )}
                                  className="border-border/50 focus:border-primary transition-colors"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                  <Award className="h-4 w-4" />
                                  GPA
                                </label>
                                <Input
                                  placeholder="e.g., 3.8/4.0"
                                  {...control.register(
                                    `education.${index}.gpa`
                                  )}
                                  className="border-border/50 focus:border-primary transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 mt-0.5">
                                <GraduationCap className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-200">
                                  {(edu as Education).degree}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <School className="h-4 w-4 text-muted-foreground" />
                                  <p className="font-semibold text-foreground/90">
                                    {(edu as Education).institution}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 ml-9">
                              {(edu as Education).year && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-medium"
                                  >
                                    Graduated {(edu as Education).year}
                                  </Badge>
                                </div>
                              )}

                              {(edu as Education).gpa && (
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-muted-foreground" />
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-medium border-primary/30 text-primary"
                                  >
                                    GPA: {(edu as Education).gpa}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-shrink-0"
                        >
                          <Button
                            onClick={() => remove(index)}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive border-destructive/20 hover:border-destructive transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
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
                className="w-full h-14 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 text-primary font-medium transition-all duration-300 group"
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="mr-2"
                >
                  <Plus className="h-5 w-5" />
                </motion.div>
                <span className="group-hover:font-semibold transition-all duration-200">
                  Add New Education
                </span>
              </Button>
            </motion.div>
          )}

          {fields.length === 0 && isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Build your academic profile
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Add your educational background above
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EducationTab;
