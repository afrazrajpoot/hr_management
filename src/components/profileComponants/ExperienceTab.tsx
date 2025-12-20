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
  Edit,
  Save,
  X,
} from "lucide-react";
import InfoField from "./InfoField";
import { Experience } from "../../../types/profileTypes";
import { experienceFields } from "@/config/profileData";

interface ExperienceTabProps {
  isEditing: boolean;
  control: any;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ExperienceTab: React.FC<ExperienceTabProps> = ({
  isEditing,
  control,
  onEdit,
  onSave,
  onCancel,
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
      <Card className="card-primary card-hover">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-4">
            <div className="icon-wrapper-blue p-3">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold gradient-text-primary">
                Work Experience
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Showcase your professional journey and achievements
              </CardDescription>
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
                <div className="icon-wrapper-blue mx-auto mb-4 p-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold gradient-text-primary mb-2">
                  No work experience added yet
                </h3>
                <p className="text-muted-foreground">
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
                <Card className="border border-input bg-card hover:bg-muted/10 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:border-primary/30 overflow-hidden">
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
                          <div className="space-y-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-xl gradient-text-primary group-hover:text-primary transition-colors duration-200">
                                {(exp as Experience).position}
                              </h4>
                              <div className="flex items-center gap-3 mt-2">
                                <p className="font-semibold text-foreground/90">
                                  {(exp as Experience).company}
                                </p>
                                {(exp as Experience).duration && (
                                  <>
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    <Badge className="badge-green">
                                      {(exp as Experience).duration}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>

                            {(exp as Experience).description && (
                              <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-input">
                                {(exp as Experience).description}
                              </p>
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
                            className="border-destructive/30 hover:border-destructive hover:bg-destructive/10 text-destructive hover:text-destructive transition-all duration-200"
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
                className="w-full h-14 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-primary font-medium transition-all duration-300 group"
              >
                <div className="icon-wrapper-blue mr-3 group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
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
              className="text-center py-8 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-dashed border-primary/20"
            >
              <div className="icon-wrapper-blue mx-auto mb-4 p-3">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Start building your professional profile
              </h3>
              <p className="text-muted-foreground">
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
