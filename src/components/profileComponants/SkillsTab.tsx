import React, { useState, KeyboardEvent } from "react";
import { Controller } from "react-hook-form";
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
import { Plus, X } from "lucide-react";

interface SkillsTabProps {
  isEditing: boolean;
  control: any;
}

const SkillsTab: React.FC<SkillsTabProps> = ({ isEditing, control }) => {
  const [newSkill, setNewSkill] = useState<string>("");

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = control._formValues.skills || [];
      if (!currentSkills.includes(newSkill.trim())) {
        control.setValue("skills", [...currentSkills, newSkill.trim()]);
        setNewSkill("");
      }
    }
  };

  const handleRemoveSkill = (index: number) => {
    const currentSkills = control._formValues.skills || [];
    control.setValue(
      "skills",
      currentSkills.filter((_: string, i: number) => i !== index)
    );
  };

  const handleSkillKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddSkill();
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
      }}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle>Skills & Expertise</CardTitle>
          <CardDescription>
            Manage your professional skills and competencies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add a new skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleSkillKeyPress}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button onClick={handleAddSkill} variant="outline">
                  <Plus size={16} />
                </Button>
              </motion.div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {(control._formValues.skills || []).map(
                (skill: string, index: number) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {isEditing ? (
                        <Controller
                          name={`skills.${index}`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              className="border-none bg-transparent h-auto p-0"
                            />
                          )}
                        />
                      ) : (
                        skill
                      )}
                      {isEditing && (
                        <motion.button
                          onClick={() => handleRemoveSkill(index)}
                          className="hover:opacity-70 transition-opacity"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X size={12} />
                        </motion.button>
                      )}
                    </Badge>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SkillsTab;
