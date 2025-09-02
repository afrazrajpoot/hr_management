import React, { useState, KeyboardEvent, useEffect } from "react";
import { Control, Controller } from "react-hook-form";
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
  X,
  Zap,
  Code,
  Lightbulb,
  Target,
  Sparkles,
  Hash,
} from "lucide-react";
import { Employee } from "../../../types/profileTypes";

interface SkillsTabProps {
  isEditing: boolean;
  control: Control<Employee>;
}

const SkillsTab: React.FC<SkillsTabProps> = ({ isEditing, control }: any) => {
  console.log("SkillsTab control:", control); // Debug log
  const [newSkill, setNewSkill] = useState<string>("");
  const [state, updateState] = useState<boolean>(false);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    if (!control) {
      console.error("Control is undefined");
      return;
    }

    // Split by comma and trim
    const newSkillsArray = newSkill
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (control.setValue && control.getValues) {
      const currentSkills = control.getValues("skills") || [];

      // Avoid duplicates
      const updatedSkills = [
        ...currentSkills,
        ...newSkillsArray.filter((s) => !currentSkills.includes(s)),
      ];

      control.setValue("skills", updatedSkills);
      setNewSkill(""); // reset input
    } else if (control._formValues) {
      const currentSkills = control._formValues.skills || [];
      const updatedSkills = [
        ...currentSkills,
        ...newSkillsArray.filter((s) => !currentSkills.includes(s)),
      ];
      control._formValues.skills = updatedSkills;
      setNewSkill("");
    } else {
      console.error(
        "Neither setValue/getValues nor _formValues available:",
        control
      );
    }
  };

  const handleSkillKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent form submission
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (index: number) => {
    updateState(!state);
    if (!control) {
      console.error("Control is undefined");
      return;
    }
    if (control.setValue && control.getValues) {
      // Modern react-hook-form (6.0.0+)
      const currentSkills = control.getValues("skills") || [];
      control.setValue(
        "skills",
        currentSkills.filter((_: string, i: number) => i !== index)
      );
    } else if (control._formValues) {
      // Fallback for older react-hook-form versions
      console.warn(
        "Using _formValues fallback for older react-hook-form version"
      );
      const currentSkills = control._formValues.skills || [];
      control._formValues.skills = currentSkills.filter(
        (_: string, i: number) => i !== index
      );
    } else {
      console.error(
        "Neither setValue/getValues nor _formValues available:",
        control
      );
    }
  };

  // Fallback for skills to prevent render crash
  const skills =
    control && control.getValues
      ? control.getValues("skills") || []
      : control && control._formValues
      ? control._formValues.skills || []
      : [];

  useEffect(() => {
    console.log(state);
  }, [state]);

  // Get skill category color based on common skill types
  const getSkillVariant = (skill: string) => {
    const lowerSkill = skill.toLowerCase();
    if (
      lowerSkill.includes("react") ||
      lowerSkill.includes("javascript") ||
      lowerSkill.includes("typescript") ||
      lowerSkill.includes("node")
    ) {
      return "default";
    }
    if (
      lowerSkill.includes("python") ||
      lowerSkill.includes("java") ||
      lowerSkill.includes("c++")
    ) {
      return "secondary";
    }
    if (
      lowerSkill.includes("design") ||
      lowerSkill.includes("ui") ||
      lowerSkill.includes("ux")
    ) {
      return "outline";
    }
    return "secondary";
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
      <Card className="border-0 bg-gradient-to-br from-background to-muted/20 shadow-lg dark:shadow-2xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Skills & Expertise
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Showcase your technical and professional competencies
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium text-muted-foreground">
                  Add Skills
                </label>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., React, Python, Project Management (comma-separated)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    className="pl-10 border-border/50 focus:border-primary transition-colors"
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleAddSkill}
                    variant="outline"
                    className="px-4 border-primary/30 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 text-primary transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                Tip: Separate multiple skills with commas
              </p>
            </motion.div>
          )}

          <div className="space-y-4">
            {skills.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No skills added yet
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {isEditing
                    ? "Start adding your skills above"
                    : "Click edit to showcase your expertise"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Code className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Your Skills ({skills.length})
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {skills.map((skill: string, index: number) => (
                      <motion.div
                        key={`${skill}-${index}`}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: {
                            duration: 0.2,
                            delay: index * 0.02,
                          },
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          y: -10,
                          transition: { duration: 0.15 },
                        }}
                        whileHover={{ scale: 1.05 }}
                        className="group"
                      >
                        <Badge
                          variant={getSkillVariant(skill)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium cursor-default hover:shadow-sm transition-all duration-200 relative overflow-hidden"
                        >
                          {!isEditing && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}

                          {isEditing && control ? (
                            <Controller
                              name={`skills.${index}`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="border-none bg-transparent h-auto p-0 text-sm font-medium min-w-[60px] focus:ring-0 focus:outline-none"
                                />
                              )}
                            />
                          ) : (
                            <span className="relative z-10">{skill}</span>
                          )}

                          {isEditing && (
                            <motion.button
                              onClick={() => handleRemoveSkill(index)}
                              className="relative z-10 hover:bg-destructive/20 rounded-full p-0.5 transition-colors duration-200"
                              whileHover={{ scale: 1.2, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="h-3 w-3 text-destructive" />
                            </motion.button>
                          )}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>

          {!isEditing && skills.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Skill Summary
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {skills.length} professional{" "}
                {skills.length === 1 ? "skill" : "skills"} showcasing diverse
                expertise across multiple domains
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SkillsTab;
