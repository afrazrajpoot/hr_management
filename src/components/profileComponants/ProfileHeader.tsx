import React, { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Save, X, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { Employee } from "../../../types/profileTypes";
// import { Employee } from "./types";

interface ProfileHeaderProps {
  employee: Employee;
  formData: Employee;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  handleAvatarUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  employee,
  formData,
  isEditing,
  setIsEditing,
  handleSave,
  handleCancel,
  handleAvatarUpload,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="shadow-lg border-0 overflow-hidden bg-gray-800 border-gray-700">
      <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
      <CardContent className="relative pt-0 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              <AvatarImage
                src={formData.avatar}
                alt={`${employee.firstName} ${employee.lastName}`}
              />
              <AvatarFallback className="text-2xl font-semibold">
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </motion.div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  {employee.firstName} {employee.lastName}
                </h1>
                <p className="text-lg opacity-80">{employee.position}</p>
                <p className="text-md opacity-60">{employee.department}</p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button onClick={handleCancel} variant="outline">
                        <X size={16} className="mr-2" />
                        Cancel
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
            <Badge variant="outline" className="w-fit">
              Employee ID: {employee.employeeId}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default ProfileHeader;
