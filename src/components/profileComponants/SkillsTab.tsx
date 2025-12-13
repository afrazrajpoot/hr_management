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
  BarChart3,
  TrendingUp,
  Award,
  Brain,
} from "lucide-react";
import { Employee } from "../../../types/profileTypes";

interface Skill {
  name: string;
  proficiency: number;
}

interface SkillsTabProps {
  isEditing: boolean;
  control: Control<Employee>;
}

const SkillsTab: React.FC<SkillsTabProps> = ({ isEditing, control }: any) => {
  const [newSkill, setNewSkill] = useState<string>("");
  const [newProficiency, setNewProficiency] = useState<number>(50);
  const [state, updateState] = useState<boolean>(false);

  // Your existing logic functions - unchanged
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    if (!control) {
      console.error("Control is undefined");
      return;
    }

    const skillObject: Skill = {
      name: newSkill.trim(),
      proficiency: newProficiency,
    };

    if (control.setValue && control.getValues) {
      const currentSkills = control.getValues("skills") || [];
      if (!currentSkills.some((s: Skill) => s.name === skillObject.name)) {
        const updatedSkills = [...currentSkills, skillObject];
        control.setValue("skills", updatedSkills);
        setNewSkill("");
        setNewProficiency(50);
      }
    } else if (control._formValues) {
      const currentSkills = control._formValues.skills || [];
      if (!currentSkills.some((s: Skill) => s.name === skillObject.name)) {
        const updatedSkills = [...currentSkills, skillObject];
        control._formValues.skills = updatedSkills;
        setNewSkill("");
        setNewProficiency(50);
      }
    }
  };

  const handleSkillKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (index: number) => {
    updateState(!state);
    if (!control) return;

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

  const getProficiencyText = (level: number) => {
    if (level <= 25) return "Beginner";
    if (level <= 50) return "Intermediate";
    if (level <= 75) return "Advanced";
    return "Expert";
  };

  // Get proficiency color
  const getProficiencyColor = (level: number) => {
    if (level <= 25) return "destructive";
    if (level <= 50) return "warning";
    if (level <= 75) return "success";
    return "primary";
  };

  const skills =
    control && control.getValues
      ? control.getValues("skills") || []
      : control && control._formValues
      ? control._formValues.skills || []
      : [];

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
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold gradient-text-primary">
                Skills & Expertise
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
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
              className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-wrapper-blue p-2">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Add New Skill</h3>
                  <p className="text-sm text-muted-foreground">
                    Add a skill and set your proficiency level
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <div className="icon-wrapper-blue absolute left-3 top-1/2 transform -translate-y-1/2 p-2">
                    <Hash className="h-4 w-4 text-primary" />
                  </div>
                  <Input
                    placeholder="e.g., React, Python, Project Management"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    className="pl-14 border-input focus:border-primary h-12"
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleAddSkill}
                    className="btn-gradient-primary px-6 h-12"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">
                    Proficiency Level
                  </span>
                  <span className="text-sm font-medium">
                    {newProficiency}% - {getProficiencyText(newProficiency)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newProficiency}
                    onChange={(e) => setNewProficiency(Number(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer progress-bar-primary"
                  />
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Lightbulb className="h-4 w-4 text-warning" />
                <span>Add skills to improve your career recommendations</span>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {skills.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="icon-wrapper-purple mx-auto mb-4 p-4">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold gradient-text-primary mb-2">
                  No skills added yet
                </h3>
                <p className="text-muted-foreground">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-wrapper-blue p-2">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Your Skills</h3>
                      <p className="text-sm text-muted-foreground">
                        {skills.length} skill{skills.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="icon-wrapper-green p-2">
                          <BarChart3 className="w-4 h-4 text-success" />
                        </div>
                        <Badge className="badge-green">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {Math.round(
                            skills.reduce(
                              (acc: number, skill: Skill) =>
                                acc + skill.proficiency,
                              0
                            ) / skills.length
                          )}
                          % avg
                        </Badge>
                      </div>
                      <Badge className="badge-blue">
                        <Award className="w-3 h-3 mr-1" />
                        {
                          skills.filter((s: Skill) => s.proficiency >= 75)
                            .length
                        }{" "}
                        expert
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {skills.map((skill: Skill, index: number) => {
                      const proficiencyColor = getProficiencyColor(
                        skill.proficiency
                      );

                      return (
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
                          className="group p-5 rounded-xl border border-input bg-card hover:bg-muted/20 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-3">
                              <div className="icon-wrapper-blue p-2 mt-1">
                                <Brain className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                {isEditing && control ? (
                                  <Controller
                                    name={`skills.${index}.name`}
                                    control={control}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        className="border-none bg-transparent h-auto p-0 text-base font-semibold min-w-[100px] focus:ring-0 focus:outline-none focus:border-b-2 focus:border-primary"
                                      />
                                    )}
                                  />
                                ) : (
                                  <h4 className="text-base font-semibold">
                                    {skill.name}
                                  </h4>
                                )}
                                <div className="mt-2">
                                  <Badge
                                    className={`badge-${proficiencyColor}`}
                                  >
                                    {skill.proficiency}% -{" "}
                                    {getProficiencyText(skill.proficiency)}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {isEditing && (
                              <motion.button
                                onClick={() => handleRemoveSkill(index)}
                                className="icon-wrapper-blue hover:bg-destructive/20 hover:text-destructive transition-colors"
                                whileHover={{ scale: 1.2, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="h-4 w-4" />
                              </motion.button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                Proficiency
                              </span>
                              <span
                                className={`text-sm font-medium text-${proficiencyColor}`}
                              >
                                {getProficiencyText(skill.proficiency)} Level
                              </span>
                            </div>

                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-4">
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
                                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer progress-bar-primary"
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    100%
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className={`progress-bar-primary rounded-full h-2 ${
                                      proficiencyColor === "destructive"
                                        ? "bg-destructive"
                                        : proficiencyColor === "warning"
                                        ? "bg-warning"
                                        : proficiencyColor === "success"
                                        ? "bg-success"
                                        : "bg-primary"
                                    }`}
                                    style={{ width: `${skill.proficiency}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Beginner</span>
                                  <span>Intermediate</span>
                                  <span>Advanced</span>
                                  <span>Expert</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
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
              className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-wrapper-purple p-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Skill Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    Overview of your professional competencies
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-card border">
                  <p className="text-2xl font-bold">{skills.length}</p>
                  <p className="text-xs text-muted-foreground">Total Skills</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <p className="text-2xl font-bold">
                    {Math.round(
                      skills.reduce(
                        (acc: number, skill: Skill) => acc + skill.proficiency,
                        0
                      ) / skills.length
                    )}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg Proficiency
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <p className="text-2xl font-bold">
                    {skills.filter((s: Skill) => s.proficiency >= 75).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Expert Skills</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <p className="text-2xl font-bold">
                    {skills.filter((s: Skill) => s.proficiency <= 50).length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Beginner Skills
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SkillsTab;
