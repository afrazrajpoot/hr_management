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
  ChevronDown,
  Search,
  Check,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Use react-hook-form's useFieldArray for proper array management
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "skills",
  });

  // Standard skills list with categories
  const standardSkills = [
    // Web Development
    { name: "React", category: "Frontend" },
    { name: "TypeScript", category: "Frontend" },
    { name: "JavaScript", category: "Frontend" },
    { name: "HTML/CSS", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Vue.js", category: "Frontend" },
    { name: "Angular", category: "Frontend" },
    
    // Backend
    { name: "Node.js", category: "Backend" },
    { name: "Python", category: "Backend" },
    { name: "Java", category: "Backend" },
    { name: "PHP", category: "Backend" },
    { name: "C#", category: "Backend" },
    { name: "Go", category: "Backend" },
    { name: "Rust", category: "Backend" },
    
    // Databases
    { name: "SQL", category: "Database" },
    { name: "MongoDB", category: "Database" },
    { name: "PostgreSQL", category: "Database" },
    { name: "MySQL", category: "Database" },
    { name: "Redis", category: "Database" },
    
    // Cloud & DevOps
    { name: "AWS", category: "Cloud" },
    { name: "Docker", category: "DevOps" },
    { name: "Kubernetes", category: "DevOps" },
    { name: "Git", category: "DevOps" },
    { name: "CI/CD", category: "DevOps" },
    
    // Mobile
    { name: "React Native", category: "Mobile" },
    { name: "Flutter", category: "Mobile" },
    { name: "Swift", category: "Mobile" },
    { name: "Kotlin", category: "Mobile" },
    
    // Web3 & Blockchain
    { name: "Solidity", category: "Web3" },
    { name: "Smart Contracts", category: "Web3" },
    { name: "Ethers.js", category: "Web3" },
    { name: "Web3.js", category: "Web3" },
    { name: "Hardhat", category: "Web3" },
    
    // Soft Skills
    { name: "Communication", category: "Soft Skills" },
    { name: "Problem Solving", category: "Soft Skills" },
    { name: "Team Leadership", category: "Soft Skills" },
    { name: "Project Management", category: "Soft Skills" },
    { name: "Agile/Scrum", category: "Soft Skills" },
    
    // Data & AI
    { name: "Data Analysis", category: "Data & AI" },
    { name: "Machine Learning", category: "Data & AI" },
    { name: "TensorFlow", category: "Data & AI" },
    { name: "PyTorch", category: "Data & AI" },
  ];

  // Filter skills based on search term
  const filteredSkills = standardSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group skills by category
  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof standardSkills>);

  // Handle selecting a skill from dropdown
  const handleSelectStandardSkill = (skillName: string) => {
    if (!skillName) return;
    
    // Check for duplicates
    const isDuplicate = fields.some(
      (field: any) => field.name.toLowerCase() === skillName.toLowerCase()
    );

    if (isDuplicate) {
      // You could show a toast notification here
      console.log(`Skill "${skillName}" already exists`);
      return;
    }

    setNewSkill(skillName);
    setIsDropdownOpen(false);
    setSearchTerm(""); // Clear search after selection
  };

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

  // Get proficiency color value for slider styling
  const getProficiencyColorValue = (level: number) => {
    if (level <= 25) return "var(--color-destructive)";
    if (level <= 50) return "var(--color-warning)";
    if (level <= 75) return "var(--color-success)";
    return "var(--color-primary)";
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
      <Card className="card-primary card-hover border border-input">
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
                  <h3 className="font-semibold text-lg text-foreground">
                    Add New Skill
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select from standard skills or type a custom one
                  </p>
                </div>
              </div>

              {/* Clean Dropdown UI - No hover effects */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Browse Standard Skills
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 pl-14 text-left rounded-lg border border-input bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <div className="flex items-center gap-3">
                      <div className="icon-wrapper-blue p-2">
                        <ChevronDown className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {newSkill || "Select a skill from the list"}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 bg-card border border-input rounded-lg shadow-lg max-h-96 overflow-y-auto"
                    >
                      {/* Search Bar */}
                      <div className="sticky top-0 bg-card border-b border-input p-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Search skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-0 bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                      </div>

                      {/* Skills List */}
                      <div className="p-2">
                        {Object.entries(skillsByCategory).map(([category, skills]) => (
                          <div key={category} className="mb-4 last:mb-0">
                            <div className="px-3 py-2 mb-2">
                              <Badge 
                                variant="outline" 
                                className="badge-blue bg-primary/10 text-primary border-primary/20"
                              >
                                {category}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              {skills.map((skill) => {
                                const isSelected = newSkill === skill.name;
                                const isAlreadyAdded = fields.some(
                                  (field: any) => field.name.toLowerCase() === skill.name.toLowerCase()
                                );
                                
                                return (
                                  <button
                                    key={skill.name}
                                    type="button"
                                    onClick={() => handleSelectStandardSkill(skill.name)}
                                    disabled={isAlreadyAdded}
                                    className={`w-full flex items-center justify-between p-3 rounded-md text-sm ${
                                      isSelected
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : isAlreadyAdded
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                        : 'bg-transparent text-card-foreground border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`icon-wrapper-blue p-1.5 ${isSelected ? 'bg-primary/20' : ''}`}>
                                        <Code className="h-3.5 w-3.5 text-primary" />
                                      </div>
                                      <span className="font-medium">{skill.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isAlreadyAdded && (
                                        <Badge variant="outline" className="badge-green border-success/20 bg-success/10 text-success">
                                          Added
                                        </Badge>
                                      )}
                                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="sticky bottom-0 bg-card border-t border-input p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {filteredSkills.length} skills found
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(false)}
                            className="text-xs font-medium text-primary"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-warning" />
                  Select a skill or type below to add a custom one
                </p>
              </div>

              {/* Skill Input and Proficiency */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Skill Name
                  </label>
                  <div className="relative">
                    <div className="icon-wrapper-blue absolute left-3 top-1/2 transform -translate-y-1/2 p-2">
                      <Hash className="h-4 w-4 text-primary" />
                    </div>
                    <Input
                      placeholder="Type your custom skill here..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      className="pl-14 border-input focus:border-primary h-12 text-base bg-background"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground">
                        Proficiency Level
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Set your skill level
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">
                        {newProficiency}%
                      </span>
                      <p className="text-sm font-medium">
                        {getProficiencyText(newProficiency)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-muted-foreground min-w-8">
                        0%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={newProficiency}
                        onChange={(e) => setNewProficiency(Number(e.target.value))}
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-smooth"
                        style={{
                          background: `linear-gradient(to right, 
                            var(--color-primary) 0%, 
                            var(--color-primary) ${newProficiency}%, 
                            var(--color-muted) ${newProficiency}%, 
                            var(--color-muted) 100%)`,
                        }}
                      />
                      <span className="text-xs font-medium text-muted-foreground min-w-8">
                        100%
                      </span>
                    </div>

                    <div className="flex justify-between px-2">
                      {["Beginner", "Intermediate", "Advanced", "Expert"].map((level, index) => (
                        <div key={level} className="flex flex-col items-center">
                          <div className={`h-2 w-2 rounded-full mb-1 ${
                            newProficiency > index * 25 ? 'bg-primary' : 'bg-muted'
                          }`} />
                          <span className="text-xs text-muted-foreground">{level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-input">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    <span>Add relevant skills to improve job matches</span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                      className="btn-gradient-primary px-8 h-12 text-primary-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rest of the component without hover effects */}
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
                      <h3 className="font-semibold text-lg text-foreground">
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
                      const colorValue = getProficiencyColorValue(proficiency);

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
                          className={`p-5 rounded-xl border ${
                            isEditing
                              ? "border-primary/30 bg-primary/5"
                              : "border-input bg-card"
                          }`}
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
                                        className={`badge-${proficiencyColor} bg-${proficiencyColor}/10 text-${proficiencyColor} border-${proficiencyColor}/20`}
                                      >
                                        {proficiency}% -{" "}
                                        {getProficiencyText(proficiency)}
                                      </Badge>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <h4 className="text-base font-semibold text-card-foreground">
                                      {field.name}
                                    </h4>
                                    <div className="mt-2">
                                      <Badge
                                        className={`badge-${proficiencyColor} bg-${proficiencyColor}/10 text-${proficiencyColor} border-${proficiencyColor}/20`}
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
                                className="icon-wrapper-blue"
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
                                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-smooth"
                                        style={{
                                          background: `linear-gradient(to right, ${colorValue} 0%, ${colorValue} ${
                                            proficiencyField.value || 0
                                          }%, var(--color-muted) ${
                                            proficiencyField.value || 0
                                          }%, var(--color-muted) 100%)`,
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
                                    className={`progress-bar-primary rounded-full h-2 transition-all duration-500 ${
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
                  <h4 className="font-semibold text-lg text-foreground">
                    Skill Summary
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Overview of your professional competencies
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-card border border-input">
                  <p className="text-2xl font-bold text-foreground">{fields.length}</p>
                  <p className="text-xs text-muted-foreground">Total Skills</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border border-input">
                  <p className="text-2xl font-bold text-foreground">
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
                <div className="text-center p-4 rounded-lg bg-card border border-input">
                  <p className="text-2xl font-bold text-foreground">
                    {
                      fields.filter(
                        (field: any) => (field.proficiency || 0) >= 75
                      ).length
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Expert Skills</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border border-input">
                  <p className="text-2xl font-bold text-foreground">
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
                  <h4 className="font-medium text-sm text-foreground">
                    Editing Mode Active
                  </h4>
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