import React, { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Save,
  X,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Employee } from "../../../types/profileTypes";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative Top Gradient */}
      <div className="relative h-48 rounded-t-xl overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-purple-500" />

        {/* Floating Elements */}
        <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-primary/10 blur-xl" />
        <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-accent/10 blur-xl" />
        <div className="absolute bottom-4 left-1/4 w-20 h-20 rounded-full bg-purple-500/10 blur-xl" />
      </div>

      <Card className="card-primary -mt-24 relative border-t-0 rounded-t-none shadow-xl">
        <CardContent className="pt-0 pb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
            {/* Avatar Section */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
                  <AvatarImage
                    src={formData.avatar}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                    {employee.firstName?.[0]?.toUpperCase() || "U"}
                    {employee.lastName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {isEditing && (
                  <motion.label
                    className="absolute -bottom-2 -right-2 icon-wrapper-blue cursor-pointer shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload size={18} className="text-primary" />
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
                  <Badge className="badge-green">
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
                    <h1 className="text-3xl lg:text-4xl font-bold gradient-text-primary">
                      {employee.firstName} {employee.lastName}
                    </h1>
                    <Badge className="badge-blue">
                      ID: {employee.employeeId}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-lg">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Briefcase size={18} />
                      <span>{employee.position || "Position not set"}</span>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="flex items-center gap-2 text-accent font-semibold">
                      <Building size={18} />
                      <span>{employee.department || "Department not set"}</span>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="icon-wrapper-blue p-2">
                        <Mail size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">
                          {employee.email || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="icon-wrapper-green p-2">
                        <Phone size={16} className="text-success" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {employee.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="icon-wrapper-amber p-2">
                        <Calendar size={16} className="text-warning" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="font-medium">
                          {formatDate(employee.hireDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="icon-wrapper-purple p-2">
                        <MapPin size={16} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">
                          {employee.address || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                  {isEditing ? (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleSave}
                          className="btn-gradient-primary w-full"
                          size="lg"
                        >
                          <Save size={18} className="mr-2" />
                          Save Changes
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="w-full border-input"
                          size="lg"
                        >
                          <X size={18} className="mr-2" />
                          Cancel
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="btn-gradient-primary w-full"
                        size="lg"
                      >
                        <Edit size={18} className="mr-2" />
                        Edit Profile
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Profile Progress Bar */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="icon-wrapper-purple p-2">
                      <Sparkles size={16} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">Profile Completion</p>
                      <p className="text-sm text-muted-foreground">
                        Complete your profile for better career recommendations
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">
                    {profileCompletion}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`progress-bar-primary rounded-full h-3 transition-all duration-700 ${
                      profileCompletion >= 80
                        ? "bg-success"
                        : profileCompletion >= 50
                        ? "bg-warning"
                        : "bg-destructive"
                    }`}
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                {profileCompletion < 100 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {profileCompletion >= 80
                      ? "Almost there!"
                      : profileCompletion >= 50
                      ? "Good progress!"
                      : "Let's complete your profile!"}
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
              className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10"
            >
              <div className="flex items-start gap-3">
                <div className="icon-wrapper-blue p-2 mt-1">
                  <User size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    Professional Bio
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {employee.bio}
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

// Add missing imports
import { Briefcase, Building } from "lucide-react";

export default ProfileHeader;
