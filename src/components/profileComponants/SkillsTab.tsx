import React, { useState, KeyboardEvent } from "react";
import { Control, Controller, useFieldArray } from "react-hook-form";
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
  Zap,
  Code,
  Lightbulb,
  Target,
  Sparkles,
  Hash,
  BarChart3,
  TrendingUp,
  Award,
  Brain,
  Edit,
  Save,
  X,
  Pencil,
} from "lucide-react";
import { Employee } from "../../../types/profileTypes";

interface Skill {
  name: string;
  proficiency: number;
}

interface SkillsTabProps {
  isEditing: boolean;
  control: Control<Employee>;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const SkillsTab: React.FC<SkillsTabProps> = ({
  isEditing,
  control,
  onEdit,
  onSave,
  onCancel,
}: any) => {
  const [newSkill, setNewSkill] = useState<string>("");
  const [newProficiency, setNewProficiency] = useState<number>(50);

  // Use react-hook-form's useFieldArray for proper array management
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "skills",
  });

  // Handle adding a new skill
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    const skillObject: Skill = {
      name: newSkill.trim(),
      proficiency: newProficiency,
    };

    // Check for duplicates
    const isDuplicate = fields.some(
      (field: any) =>
        field.name.toLowerCase() === skillObject.name.toLowerCase()
    );

    if (!isDuplicate) {
      append(skillObject);
      setNewSkill("");
      setNewProficiency(50);
    }
  };

  const handleSkillKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (index: number) => {
    remove(index);
  };

  const getProficiencyText = (level: number) => {
    if (level <= 25) return "Beginner";
    if (level <= 50) return "Intermediate";
    if (level <= 75) return "Advanced";
    return "Expert";
  };

  const getProficiencyColor = (level: number) => {
    if (level <= 25) return "destructive";
    if (level <= 50) return "warning";
    if (level <= 75) return "success";
    return "primary";
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
            <div className="ml-auto flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={onSave}
                    className="btn-gradient-primary"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
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
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Skills
                </Button>
              )}
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
                    Add
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
                    value={newProficiency}
                    onChange={(e) => setNewProficiency(Number(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer smooth-slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${newProficiency}%, #e5e7eb ${newProficiency}%, #e5e7eb 100%)`,
                    }}
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
            {fields.length === 0 ? (
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
                    : "Click 'Edit Skills' to add your expertise"}
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
                      <h3 className="font-semibold text-lg">
                        {isEditing ? "Edit Your Skills" : "Your Skills"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {fields.length} skill{fields.length !== 1 ? "s" : ""}
                        {isEditing && " - Click on any skill to edit"}
                      </p>
                    </div>
                  </div>
                  {fields.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="icon-wrapper-green p-2">
                          <BarChart3 className="w-4 h-4 text-success" />
                        </div>
                        <Badge className="badge-green">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {Math.round(
                            fields.reduce(
                              (acc: any, field: any) =>
                                acc + (field.proficiency || 0),
                              0
                            ) / fields.length
                          )}
                          % avg
                        </Badge>
                      </div>
                      <Badge className="badge-blue">
                        <Award className="w-3 h-3 mr-1" />
                        {
                          fields.filter(
                            (field: any) => (field.proficiency || 0) >= 75
                          ).length
                        }{" "}
                        expert
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {fields.map((field: any, index: number) => {
                      const proficiency = field.proficiency || 0;
                      const proficiencyColor = getProficiencyColor(proficiency);
                      const colorValue =
                        proficiencyColor === "destructive"
                          ? "#ef4444"
                          : proficiencyColor === "warning"
                          ? "#f59e0b"
                          : proficiencyColor === "success"
                          ? "#10b981"
                          : "#3b82f6";

                      return (
                        <motion.div
                          key={field.id}
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
                          className={`group p-5 rounded-xl border ${
                            isEditing
                              ? "border-primary/30 bg-primary/5"
                              : "border-input bg-card"
                          } hover:bg-muted/20 transition-all duration-200`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={`icon-wrapper-blue p-2 mt-1 ${
                                  isEditing ? "bg-primary/20" : ""
                                }`}
                              >
                                <Brain className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                {isEditing ? (
                                  <div className="flex flex-col gap-2">
                                    <div className="relative">
                                      <div className="icon-wrapper-blue absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5">
                                        <Pencil className="h-3 w-3 text-primary" />
                                      </div>
                                      <Controller
                                        name={`skills.${index}.name`}
                                        control={control}
                                        render={({ field: nameField }) => (
                                          <Input
                                            {...nameField}
                                            className="pl-10 border-primary bg-background text-base font-semibold focus:border-primary focus:ring-1 focus:ring-primary"
                                            placeholder="Skill name"
                                          />
                                        )}
                                      />
                                    </div>
                                    <div className="mt-1">
                                      <Badge
                                        className={`badge-${proficiencyColor}`}
                                      >
                                        {proficiency}% -{" "}
                                        {getProficiencyText(proficiency)}
                                      </Badge>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <h4 className="text-base font-semibold">
                                      {field.name}
                                    </h4>
                                    <div className="mt-2">
                                      <Badge
                                        className={`badge-${proficiencyColor}`}
                                      >
                                        {proficiency}% -{" "}
                                        {getProficiencyText(proficiency)}
                                      </Badge>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {isEditing && (
                              <motion.button
                                type="button"
                                onClick={() => handleRemoveSkill(index)}
                                className="icon-wrapper-blue hover:bg-destructive/20 hover:text-destructive transition-colors ml-2"
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
                                Proficiency Level
                              </span>
                              <span
                                className={`text-sm font-medium text-${proficiencyColor}`}
                              >
                                {getProficiencyText(proficiency)}
                              </span>
                            </div>

                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-muted-foreground">
                                    0%
                                  </span>
                                  <Controller
                                    name={`skills.${index}.proficiency`}
                                    control={control}
                                    render={({ field: proficiencyField }) => (
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={proficiencyField.value || 0}
                                        onChange={(e) => {
                                          proficiencyField.onChange(
                                            Number(e.target.value)
                                          );
                                        }}
                                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer smooth-slider"
                                        style={{
                                          background: `linear-gradient(to right, ${colorValue} 0%, ${colorValue} ${
                                            proficiencyField.value || 0
                                          }%, #e5e7eb ${
                                            proficiencyField.value || 0
                                          }%, #e5e7eb 100%)`,
                                        }}
                                      />
                                    )}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    100%
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                  <span>Beginner</span>
                                  <span>Intermediate</span>
                                  <span>Advanced</span>
                                  <span>Expert</span>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                                  <Lightbulb className="h-3 w-3" />
                                  <span>
                                    Drag the slider to adjust proficiency
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
                                    style={{ width: `${proficiency}%` }}
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

          {!isEditing && fields.length > 0 && (
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
                  <p className="text-2xl font-bold">{fields.length}</p>
                  <p className="text-xs text-muted-foreground">Total Skills</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <p className="text-2xl font-bold">
                    {Math.round(
                      fields.reduce(
                        (acc: any, field: any) =>
                          acc + (field.proficiency || 0),
                        0
                      ) / fields.length
                    )}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg Proficiency
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <p className="text-2xl font-bold">
                    {
                      fields.filter(
                        (field: any) => (field.proficiency || 0) >= 75
                      ).length
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Expert Skills</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <p className="text-2xl font-bold">
                    {
                      fields.filter(
                        (field: any) => (field.proficiency || 0) <= 50
                      ).length
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Beginner Skills
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isEditing && fields.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
              <div className="flex items-start gap-3">
                <div className="icon-wrapper-blue p-2 mt-0.5">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Editing Mode Active</h4>
                  <p className="text-xs text-muted-foreground">
                    You can now edit skill names, adjust proficiency levels, add
                    new skills, or remove existing ones. Click "Save Changes"
                    when done or "Cancel" to discard changes.
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
