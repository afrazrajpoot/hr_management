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
import { Progress } from "@/components/ui/progress";
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
  Star,
} from "lucide-react";
import { Employee } from "../../../types/profileTypes";
interface Skill {
  name: string;
  proficiency: number; // 0-100 percentage
}
interface SkillsTabProps {
  isEditing: boolean;
  control: Control<Employee>;
}

const SkillsTab: React.FC<SkillsTabProps> = ({ isEditing, control }: any) => {
  const [newSkill, setNewSkill] = useState<string>("");
  const [newProficiency, setNewProficiency] = useState<number>(50); // Default proficiency
  const [state, updateState] = useState<boolean>(false);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    if (!control) {
      console.error("Control is undefined");
      return;
    }

    // Create skill object
    const skillObject: Skill = {
      name: newSkill.trim(),
      proficiency: newProficiency,
    };

    if (control.setValue && control.getValues) {
      const currentSkills = control.getValues("skills") || [];

      // Avoid duplicates
      if (!currentSkills.some((s: Skill) => s.name === skillObject.name)) {
        const updatedSkills = [...currentSkills, skillObject];
        control.setValue("skills", updatedSkills);
        setNewSkill(""); // reset input
        setNewProficiency(50); // reset to default
      } else {
        // Skill already exists
        console.warn("Skill already exists");
      }
    } else if (control._formValues) {
      const currentSkills = control._formValues.skills || [];
      if (!currentSkills.some((s: Skill) => s.name === skillObject.name)) {
        const updatedSkills = [...currentSkills, skillObject];
        control._formValues.skills = updatedSkills;
        setNewSkill("");
        setNewProficiency(50);
      }
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
      const currentSkills = control.getValues("skills") || [];
      control.setValue(
        "skills",
        currentSkills.filter((_: Skill, i: number) => i !== index)
      );
    } else if (control._formValues) {
      const currentSkills = control._formValues.skills || [];
      control._formValues.skills = currentSkills.filter(
        (_: Skill, i: number) => i !== index
      );
    } else {
      console.error(
        "Neither setValue/getValues nor _formValues available:",
        control
      );
    }
  };

  const handleProficiencyChange = (index: number, value: number) => {
    if (!control) return;

    if (control.setValue && control.getValues) {
      const currentSkills = control.getValues("skills") || [];
      const updatedSkills = [...currentSkills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        proficiency: value,
      };
      control.setValue("skills", updatedSkills);
    } else if (control._formValues) {
      const currentSkills = control._formValues.skills || [];
      const updatedSkills = [...currentSkills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        proficiency: value,
      };
      control._formValues.skills = updatedSkills;
    }
  };

  // Fallback for skills to prevent render crash
  const skills =
    control && control.getValues
      ? control.getValues("skills") || []
      : control && control._formValues
      ? control._formValues.skills || []
      : [];

  // Get skill category color based on common skill types

  // Get proficiency level text
  const getProficiencyText = (level: number) => {
    if (level <= 25) return "Beginner";
    if (level <= 50) return "Intermediate";
    if (level <= 75) return "Advanced";
    return "Expert";
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
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Skills & Expertise
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Showcase your technical and professional competencies with
                proficiency levels
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium text-muted-foreground">
                  Add New Skill
                </label>
              </div>

              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., React, Python, Project Management"
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
                    className="px-4 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Proficiency Level
                  </span>
                  <span className="text-sm font-medium">
                    {newProficiency}% - {getProficiencyText(newProficiency)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newProficiency}
                    onChange={(e) => setNewProficiency(Number(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-2">
                <Lightbulb className="h-3 w-3" />
                Add a skill and set your proficiency level
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
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Code className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Your Skills ({skills.length})
                  </h3>
                </div>

                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {skills.map((skill: Skill, index: number) => (
                      <motion.div
                        key={`${skill.name}-${index}`}
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
                        className="group p-4 rounded-lg border border-border/30 bg-card hover:bg-muted/30 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          {isEditing && control ? (
                            <Controller
                              name={`skills.${index}.name`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="border-none bg-transparent h-auto p-0 text-base font-semibold min-w-[100px] focus:ring-0 focus:outline-none focus:border-b focus:border-primary"
                                />
                              )}
                            />
                          ) : (
                            <span className="text-base font-semibold">
                              {skill.name}
                            </span>
                          )}

                          {isEditing && (
                            <motion.button
                              onClick={() => handleRemoveSkill(index)}
                              className="hover:bg-destructive/20 rounded-full p-1 transition-colors duration-200"
                              whileHover={{ scale: 1.2, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </motion.button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Proficiency
                            </span>
                            <span className="text-sm font-medium">
                              {skill.proficiency}% -{" "}
                              {getProficiencyText(skill.proficiency)}
                            </span>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                  0%
                                </span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={skill.proficiency}
                                  onChange={(e) =>
                                    handleProficiencyChange(
                                      index,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xs text-muted-foreground">
                                  100%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Progress
                                value={skill.proficiency}
                                className="h-2"
                              />
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">
                                  Beginner
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Intermediate
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Advanced
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Expert
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
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
                {skills.length === 1 ? "skill" : "skills"} with proficiency
                levels
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SkillsTab;
