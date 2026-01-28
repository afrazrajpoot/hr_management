import React, { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
  Sparkles,
  Briefcase,
  Building,
} from "lucide-react";
import { motion } from "framer-motion";
import { Employee } from "../../../types/profileTypes";

interface ProfileHeaderProps {
  employee: Employee;
  formData: Employee;
  handleAvatarUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  employee,
  formData,
  handleAvatarUpload,
  isEditing,
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    const fields = [
      employee.firstName,
      employee.lastName,
      employee.email,
      employee.phone,
      employee.address,
      employee.dateOfBirth,
      employee.hireDate,
      employee.department,
      employee.position,
      employee.bio,
    ];
    const filledFields = fields.filter(
      (field) => field && field.trim() !== ""
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Progress bar color based on completion using global colors
  const getProgressColor = () => {
    if (profileCompletion >= 80) return "bg-emerald-500 dark:bg-emerald-400";
    if (profileCompletion >= 50) return "bg-amber-500 dark:bg-amber-400";
    return "bg-destructive";
  };

  // Progress message based on completion
  const getProgressMessage = () => {
    if (profileCompletion >= 80) return "Almost there! 🎯";
    if (profileCompletion >= 50) return "Good progress! 📈";
    return "Let's complete your profile! 💪";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-[7vw]"
    >
      {/* Background Bubbles using global CSS colors */}
      <div className="relative ">
        {/* Background Bubbles */}
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-30 bg-purple-600" />
        <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 bg-purple-600" />
        <div className="absolute -bottom-8 left-1/3 w-32 h-32 rounded-full blur-2xl opacity-15 bg-purple-600" />
        <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-xl opacity-10 bg-purple-600" />

        <Card className="card-purple -mt-24 relative border-t-0 rounded-t-none shadow-xl border-matte overflow-hidden">
          {/* Additional bubble inside card */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-10 bg-purple-600" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-5 bg-purple-600" />

          <CardContent className="pt-0 pb-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
              {/* Avatar Section */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-xl">
                    <AvatarImage
                      src={formData.avatar}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl font-bold bg-purple-600 dark:bg-purple-500 text-white">
                      {employee.firstName?.[0]?.toUpperCase() || "U"}
                      {employee.lastName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {isEditing && (
                    <motion.label
                      className="absolute -bottom-2 -right-2 icon-brand cursor-pointer shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Upload size={18} className="text-purple-accent" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </motion.label>
                  )}

                  {/* Status Badge */}
                  <div className="absolute -top-2 -right-2">
                    <Badge className="badge-success">
                      <Shield size={12} className="mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              </motion.div>

              {/* Main Info Section */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl lg:text-4xl font-bold text-on-matte">
                        {employee.firstName} {employee.lastName}
                      </h1>
                      <Badge className="badge-info">
                        ID: {employee.employeeId}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-lg">
                      <div className="flex items-center gap-2 text-on-matte font-semibold">
                        <Briefcase size={18} className="text-purple-accent" />
                        <span>{employee.position || "Position not set"}</span>
                      </div>
                      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                      <div className="flex items-center gap-2 text-on-matte font-semibold">
                        <Building size={18} className="text-purple-accent" />
                        <span>{employee.department || "Department not set"}</span>
                      </div>
                    </div>

                    {/* Contact Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg surface-matte border border-matte">
                        <div className="icon-info p-2">
                          <Mail size={16} className="text-purple-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-on-matte-subtle">Email</p>
                          <p className="font-medium text-on-matte">
                            {employee.email || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg surface-matte border border-matte">
                        <div className="icon-success p-2">
                          <Phone size={16} className="text-purple-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-on-matte-subtle">Phone</p>
                          <p className="font-medium text-on-matte">
                            {employee.phone || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg surface-matte border border-matte">
                        <div className="icon-warning p-2">
                          <Calendar size={16} className="text-purple-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-on-matte-subtle">Joined</p>
                          <p className="font-medium text-on-matte">
                            {formatDate(employee.hireDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg surface-matte border border-matte">
                        <div className="icon-brand p-2">
                          <MapPin size={16} className="text-purple-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-on-matte-subtle">
                            Location
                          </p>
                          <p className="font-medium text-on-matte">
                            {employee.address || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Progress Bar */}
                <div className="pt-4 border-t border-matte">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="icon-brand p-2">
                        <Sparkles size={16} className="text-purple-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-on-matte">Profile Completion</p>
                        <p className="text-sm text-on-matte-subtle">
                          Complete your profile for better career recommendations
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-purple-accent">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompletion}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`${getProgressColor()} rounded-full h-3`}
                    />
                  </div>
                  {profileCompletion < 100 && (
                    <p className="text-xs text-on-matte-subtle mt-2">
                      {getProgressMessage()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {employee.bio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-matte"
              >
                <div className="flex items-start gap-3">
                  <div className="icon-brand p-2 mt-1">
                    <User size={16} className="text-purple-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-on-matte flex items-center gap-2">
                      Professional Bio
                    </h3>
                    <p className="text-on-matte-subtle leading-relaxed">
                      {employee.bio}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;