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
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Briefcase,
  Calendar,
  Building2,
  FileText,
} from "lucide-react";
import InfoField from "./InfoField";
import { Experience } from "../../../types/profileTypes";
import { experienceFields } from "@/config/profileData";

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
      <Card className="border-0 bg-gradient-to-br from-background to-muted/20 shadow-lg dark:shadow-2xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Work Experience
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Showcase your professional journey and achievements
              </CardDescription>
            </div>
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
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No work experience added yet
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Click edit to add your professional experience
                </p>
              </motion.div>
            )}

            {fields.map((exp, index) => (
              <motion.div
                key={exp.id}
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
                            {experienceFields.map((field) => (
                              <InfoField
                                key={`${field.field}-${index}`}
                                {...field}
                                field={`experience.${index}.${field.field}`}
                                isEditing={isEditing}
                                control={control}
                                defaultValue={
                                  (exp as Experience)[
                                    field.field as keyof Experience
                                  ]
                                }
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20 mt-0.5">
                                <Briefcase className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-200">
                                  {(exp as Experience).position}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <p className="font-semibold text-foreground/90">
                                    {(exp as Experience).company}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {(exp as Experience).duration && (
                              <div className="flex items-center gap-2 ml-9">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-medium"
                                >
                                  {(exp as Experience).duration}
                                </Badge>
                              </div>
                            )}

                            {(exp as Experience).description && (
                              <div className="ml-9 mt-3">
                                <div className="flex items-start gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <p className="text-muted-foreground leading-relaxed">
                                    {(exp as Experience).description}
                                  </p>
                                </div>
                              </div>
                            )}
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
                    company: "",
                    position: "",
                    duration: "",
                    description: "",
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
                  Add New Experience
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
                Start building your professional profile
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Add your first work experience above
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExperienceTab;
