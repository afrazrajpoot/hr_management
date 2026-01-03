"use client";
import React, { useState, ChangeEvent, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import {
  useCreateOrUpdateEmployeeMutation,
  useGetEmployeeQuery,
} from "@/redux/employe-api";
import ProfileHeader from "@/components/profileComponants/ProfileHeader";
import { Employee, ResumeFile } from "../../../../types/profileTypes";
import PersonalInfoTab from "@/components/profileComponants/PersonalInfoTab";
import EmploymentTab from "@/components/profileComponants/EmploymentTab";
import SkillsTab from "@/components/profileComponants/SkillsTab";
import ExperienceTab from "@/components/profileComponants/ExperienceTab";
import EducationTab from "@/components/profileComponants/EducationTab";
import ResumeTab from "@/components/profileComponants/ResumeTab";
import { toast, Toaster } from "sonner";
import Loader from "@/components/Loader";
import {
  User,
  Briefcase,
  Award,
  BookOpen,
  FileText,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle,
  Upload,
} from "lucide-react";

const EmployeeProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("personal");

  const {
    data: employeeData,
    isLoading: isFetching,
    error: fetchError,
  } = useGetEmployeeQuery();
  const [
    createOrUpdateEmployee,
    { isLoading: isMutating, error: mutationError },
  ] = useCreateOrUpdateEmployeeMutation();

  const [employee, setEmployee] = useState<Employee>(
    employeeData || {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      hireDate: "",
      department: "",
      position: "",
      manager: "",
      employeeId: "",
      salary: "",
      bio: "",
      avatar: "",
      password: "",
      skills: [],
      education: [],
      experience: [],
      resume: null,
      employer: "",
    }
  );

  const [formData, setFormData] = useState<Employee>({ ...employee });

  const { control, handleSubmit, reset, setValue } = useForm<Employee>({
    defaultValues: employee,
  });

  const handleSave = useCallback(
    async (data: Employee): Promise<void> => {
      const toastId = toast.loading("Saving profile...");
      try {
        const saveData: any = {
          ...formData,
          ...data,
          skills: data.skills || [], // Ensure skills is an array
        };
        const updatedEmployee: any = await createOrUpdateEmployee(
          saveData
        ).unwrap();
        setEmployee(updatedEmployee);
        setFormData(updatedEmployee);
        reset(updatedEmployee);
        setIsEditing(false);
        toast.success("Profile updated successfully!", {
          id: toastId,
          icon: <CheckCircle className="w-5 h-5 text-success" />,
        });
      } catch (error) {
        console.error("Error saving employee:", error);
        const errorMessage =
          (error as any)?.data?.error || "Failed to save employee data";
        toast.error(errorMessage, {
          id: toastId,
          duration: 5000,
          icon: <Shield className="w-5 h-5 text-destructive" />,
        });
      }
    },
    [createOrUpdateEmployee, formData, reset]
  );

  const handleCancel = useCallback((): void => {
    setFormData({ ...employee });
    reset(employee);
    setIsEditing(false);
    toast.info("Changes discarded", {
      icon: <Upload className="w-5 h-5 text-warning" />,
    });
  }, [employee, reset]);

  const handleAvatarUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (e.target?.result) {
            setFormData((prev) => ({
              ...prev,
              avatar: e.target.result as string,
            }));
            setValue("avatar", e.target.result as string);
            toast.success("Profile picture updated!", {
              duration: 3000,
              icon: <Sparkles className="w-5 h-5 text-primary" />,
            });
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [setValue]
  );

  const handleResumeUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (file) {
        const resumeFile: ResumeFile = {
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          type: file.type,
          uploadDate: new Date().toLocaleDateString(),
        };
        setFormData((prev) => ({ ...prev, resume: resumeFile }));
        setValue("resume", resumeFile);
        toast.success("Resume uploaded successfully!", {
          duration: 3000,
          icon: <FileText className="w-5 h-5 text-success" />,
        });
      }
    },
    [setValue]
  );

  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData);
      setFormData(employeeData);
      reset(employeeData);
    }
    if (fetchError) {
      const errorMessage =
        (fetchError as any)?.data?.error || "Failed to load employee data";
      toast.error(errorMessage, {
        duration: 5000,
        icon: <Shield className="w-5 h-5 text-destructive" />,
      });
    }
  }, [employeeData, fetchError, reset]);

  if (status === "loading" || isFetching || isMutating) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen gradient-bg-primary flex items-center justify-center p-6">
        <div className="card-primary max-w-md text-center p-8">
          <div className="icon-wrapper-blue mx-auto mb-6">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold gradient-text-primary mb-4">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your professional profile
          </p>
          <button
            onClick={() => (window.location.href = "/api/auth/signin")}
            className="btn-gradient-primary w-full"
          >
            <User className="w-4 h-4 mr-2" />
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const textFields = [
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
    const filledTextFields = textFields.filter(
      (field) => field && field.trim() !== ""
    ).length;
    
    // Skills count as 1 field if at least one skill is added
    const hasSkills = employee.skills && employee.skills.length > 0 ? 1 : 0;
    
    const totalFields = textFields.length + 1; // +1 for skills
    const filledFields = filledTextFields + hasSkills;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <AppLayout>
      <Toaster
        theme="system"
        position="top-right"
        richColors
        toastOptions={{
          duration: 3000,
          className: "border border-input",
        }}
      />

      <div className="min-h-screen gradient-bg-primary p-4 md:p-6">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 decorative-gradient-blur-blue opacity-15" />
          <div className="absolute bottom-20 right-10 decorative-gradient-blur-purple opacity-15" />
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProfileHeader
              employee={employee}
              formData={formData}
              handleAvatarUpload={handleAvatarUpload}
              isEditing={isEditing}
            />
          </motion.div>

          {/* Profile Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-primary card-hover">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="icon-wrapper-green p-3">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <span className="badge-green text-sm">Profile Strength</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {profileCompletion}%
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Profile Completion
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`progress-bar-primary rounded-full h-2 transition-all duration-500 ${
                      profileCompletion >= 80
                        ? "bg-success"
                        : profileCompletion >= 50
                        ? "bg-warning"
                        : "bg-destructive"
                    }`}
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="card-primary card-hover">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="icon-wrapper-blue p-3">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <span className="badge-blue text-sm">Skills</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {employee.skills?.length || 0}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Total Skills Listed
                </p>
              </div>
            </div>

            <div className="card-primary card-hover">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="icon-wrapper-purple p-3">
                    <Briefcase className="w-6 h-6 text-accent" />
                  </div>
                  <span className="badge-purple text-sm">Experience</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {employee.experience?.length || 0}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Work Experiences
                </p>
              </div>
            </div>
          </div>

          {/* Main Profile Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs
              defaultValue="personal"
              className="space-y-6"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-4 bg-transparent border-none rounded-xl h-14">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:btn-gradient-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-gradient-to-r from-transparent to-transparent hover:from-white/5 hover:to-white/5"
                >
                  <span className="text-sm font-medium">Personal</span>
                </TabsTrigger>

                <TabsTrigger
                  value="employment"
                  className="data-[state=active]:btn-gradient-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-gradient-to-r from-transparent to-transparent hover:from-white/5 hover:to-white/5"
                >
                  <span className="text-sm font-medium">Employment</span>
                </TabsTrigger>

                <TabsTrigger
                  value="skills"
                  className="data-[state=active]:btn-gradient-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-gradient-to-r from-transparent to-transparent hover:from-white/5 hover:to-white/5"
                >
                  <span className="text-sm font-medium">Skills</span>
                </TabsTrigger>

                <TabsTrigger
                  value="experience"
                  className="data-[state=active]:btn-gradient-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-gradient-to-r from-transparent to-transparent hover:from-white/5 hover:to-white/5"
                >
                  <span className="text-sm font-medium">Experience</span>
                </TabsTrigger>
              </TabsList>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="personal" className="mt-0">
                  <div className="card-primary p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="icon-wrapper-blue p-3">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground">
                          Personal Information
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Manage your personal details and contact information
                        </p>
                      </div>
                    </div>
                    <PersonalInfoTab
                      employee={employee}
                      isEditing={isEditing}
                      control={control}
                      onEdit={() => setIsEditing(true)}
                      onSave={handleSubmit(handleSave)}
                      onCancel={handleCancel}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="employment" className="mt-0">
                  <div className="card-primary p-6">
                    <EmploymentTab
                      employee={employee}
                      isEditing={isEditing}
                      control={control}
                      onEdit={() => setIsEditing(true)}
                      onSave={handleSubmit(handleSave)}
                      onCancel={handleCancel}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="mt-0">
                  <div className="card-primary p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="icon-wrapper-amber p-3">
                        <Award className="w-6 h-6 text-warning" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground">
                          Skills & Expertise
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Showcase your professional skills and competencies
                        </p>
                      </div>
                    </div>
                    <SkillsTab 
                      isEditing={isEditing} 
                      control={control}
                      onEdit={() => setIsEditing(true)}
                      onSave={handleSubmit(handleSave)}
                      onCancel={handleCancel}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="mt-0">
                  <div className="space-y-6">
                    <div className="card-primary p-6">
                      <ExperienceTab 
                        isEditing={isEditing} 
                        control={control}
                        onEdit={() => setIsEditing(true)}
                        onSave={handleSubmit(handleSave)}
                        onCancel={handleCancel}
                      />
                    </div>

                    <div className="card-primary p-6">
                      <EducationTab 
                        isEditing={isEditing} 
                        control={control}
                        onEdit={() => setIsEditing(true)}
                        onSave={handleSubmit(handleSave)}
                        onCancel={handleCancel}
                      />
                    </div>

                    {/* Resume Section (Optional) */}
                    {employee.resume && (
                      <div className="card-primary p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="icon-wrapper-green p-3">
                            <FileText className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-card-foreground">
                              Resume
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Your professional resume document
                            </p>
                          </div>
                        </div>
                        <ResumeTab
                          formData={formData}
                          handleResumeUpload={handleResumeUpload}
                          onEdit={() => setIsEditing(true)}
                          onSave={handleSubmit(handleSave)}
                          onCancel={handleCancel}
                          isEditing={isEditing}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </motion.div>
            </Tabs>
          </motion.div>

          {/* Action Buttons (Mobile) - Removed as requested */}

          {/* Profile Tips */}
          {!isEditing && profileCompletion < 100 && (
            <div className="card-primary border-dashed border-2 border-primary/20">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="icon-wrapper-purple p-3 flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-warning" />
                      Boost Your Profile Visibility
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete your profile to improve your career
                      recommendations and visibility to HR managers.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {!employee.bio && (
                        <span className="badge-blue">Add Bio</span>
                      )}
                      {!employee.skills?.length && (
                        <span className="badge-amber">Add Skills</span>
                      )}
                      {!employee.experience?.length && (
                        <span className="badge-green">Add Experience</span>
                      )}
                      {!employee.education?.length && (
                        <span className="badge-purple">Add Education</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default EmployeeProfilePage;