"use client";
import React, { useState, ChangeEvent, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
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

const onboardingSteps = [
  {
    tab: "personal",
    title: "Personal Information",
    description:
      "Manage your personal details and contact information. Make sure your name, contact, and bio are up to date!",
  },
  {
    tab: "employment",
    title: "Employment Details",
    description:
      "Update your job details, department, and manager. Keeping this section current helps HR and managers know your role.",
  },
  {
    tab: "skills",
    title: "Skills & Expertise",
    description:
      "Showcase your professional skills and competencies. Add all relevant skills to boost your profile strength!",
  },
  {
    tab: "experience",
    title: "Experience & Education",
    description:
      "Add your work experience, education, and upload your resume. This helps you stand out for new opportunities!",
  },
];

const EmployeeProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const updateModalPosition = useCallback(() => {
    if (!showOnboarding) return;
    const activeTabValue = onboardingSteps[onboardingStep].tab;
    const element = document.getElementById(`tab-trigger-${activeTabValue}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      setModalPosition({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  }, [onboardingStep, showOnboarding]);

  useEffect(() => {
    if (showOnboarding) {
      const timer = setTimeout(updateModalPosition, 100);
      window.addEventListener("resize", updateModalPosition);
      window.addEventListener("scroll", updateModalPosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateModalPosition);
        window.removeEventListener("scroll", updateModalPosition);
      };
    }
  }, [showOnboarding, onboardingStep, updateModalPosition]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const forceTour = urlParams.get('tour') === 'true';
      const seen = localStorage.getItem("profileOnboardingSeen");

      if (!seen || forceTour) {
        setShowOnboarding(true);
        setOnboardingStep(0);
        setActiveTab(onboardingSteps[0].tab);
        if (forceTour) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, []);

  const handleNextOnboarding = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      const nextStep = onboardingStep + 1;
      setOnboardingStep(nextStep);
      setActiveTab(onboardingSteps[nextStep].tab);
    } else {
      setShowOnboarding(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("profileOnboardingSeen", "true");
      }
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("profileOnboardingSeen", "true");
    }
  };

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
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        });
      } catch (error) {
        console.error("Error saving employee:", error);
        const errorMessage =
          (error as any)?.data?.error || "Failed to save employee data";
        toast.error(errorMessage, {
          id: toastId,
          duration: 5000,
          icon: <Shield className="w-5 h-5 text-red-600" />,
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
      icon: <Upload className="w-5 h-5 text-yellow-600" />,
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
              icon: <Sparkles className="w-5 h-5 text-purple-600" />,
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
          icon: <FileText className="w-5 h-5 text-green-600" />,
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
        icon: <Shield className="w-5 h-5 text-red-600" />,
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
      <div className="min-h-screen bg-layout-purple flex items-center justify-center p-6">
        <div className="card-purple max-w-md text-center p-8">
          <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gradient-purple mb-4">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your professional profile
          </p>
          <button
            onClick={() => (window.location.href = "/api/auth/signin")}
            className="btn-purple w-full"
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
    // 1. Personal Tab Completion
    const personalFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "dateOfBirth",
      "bio",
    ];
    const isPersonalComplete = personalFields.every(
      (field) =>
        employee &&
        employee[field as keyof Employee] &&
        employee[field as keyof Employee]?.toString().trim() !== ""
    );

    // 2. Employment Tab Completion
    const employmentFieldList = [
      "employer",
      "hireDate",
      "department",
      "position",
      "manager",
    ];
    // Check either annualSalary or salary
    const hasSalary =
      (employee &&
        employee.annualSalary &&
        employee.annualSalary.toString().trim() !== "") ||
      (employee && employee.salary && employee.salary.toString().trim() !== "");

    const isEmploymentComplete =
      employmentFieldList.every(
        (field) =>
          employee &&
          employee[field as keyof Employee] &&
          employee[field as keyof Employee]?.toString().trim() !== ""
      ) && hasSalary;

    // 3. Skills Tab Completion
    const isSkillsComplete =
      employee && employee.skills && employee.skills.length > 0;

    // 4. Experience Tab Completion (Requires both Experience and Education)
    const isExperienceComplete =
      employee &&
      employee.experience &&
      employee.experience.length > 0 &&
      employee &&
      employee.education &&
      employee.education.length > 0;

    // Calculate total percentage (25% per tab)
    let percentage = 0;
    if (isPersonalComplete) percentage += 25;
    if (isEmploymentComplete) percentage += 25;
    if (isSkillsComplete) percentage += 25;
    if (isExperienceComplete) percentage += 25;

    return percentage;
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <AppLayout>
      {/* Onboarding Modal - Dynamic Tour */}
      <AnimatePresence>
        {showOnboarding && (modalPosition.top > 0 || modalPosition.left > 0) && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Backdrop - Only allow clicking to close if needed */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseOnboarding}
              className="absolute inset-0 bg-black/20 pointer-events-auto backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, y: "-80%", scale: 0.9, x: "-50%" }}
              animate={{
                opacity: 1,
                top: modalPosition.top - 20,
                x: "-50%",
                y: "-100%",
                scale: 1,
                left: modalPosition.left
              }}
              exit={{ opacity: 0, y: "-80%", scale: 0.9, x: "-50%" }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full max-w-sm pointer-events-auto"
            >
              <div className="relative card-purple rounded-2xl shadow-prominent p-6 overflow-hidden">
                {/* Decorative background pulse */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />

                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  onClick={handleCloseOnboarding}
                  aria-label="Close onboarding"
                >
                  <span className="text-xl">&times;</span>
                </button>

                {/* Content with its own animation for step changes */}
                <motion.div
                  key={onboardingStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-ping" />
                    <h2 className="text-lg font-bold text-gradient-purple">
                      {onboardingSteps[onboardingStep].title}
                    </h2>
                  </div>

                  <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                    {onboardingSteps[onboardingStep].description}
                  </p>
                </motion.div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-1.5">
                    {onboardingSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === onboardingStep ? "w-6 bg-purple-600 dark:bg-purple-400" : "w-1.5 bg-purple-600/20 dark:bg-purple-400/20"
                          }`}
                      />
                    ))}
                  </div>

                  <button
                    className="btn-purple px-5 py-2 text-sm rounded-xl transition-all duration-200"
                    onClick={handleNextOnboarding}
                  >
                    {onboardingStep === onboardingSteps.length - 1
                      ? "Get Started"
                      : "Next Step"}
                  </button>
                </div>
              </div>

              {/* Arrow pointing down */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card dark:bg-matte-gray-medium rotate-45 border-b border-r border-border" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Toaster
        theme="system"
        position="top-right"
        richColors
        toastOptions={{
          duration: 3000,
          className: "border border-input",
        }}
      />

      <div className="min-h-screen bg-layout-purple p-4 md:p-6">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl opacity-15" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl opacity-15" />
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
            <div className="card-purple hover-lift relative overflow-hidden">
              {/* Bubble Effects */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 bg-green-500" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-15 bg-green-400" />

              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs px-3 py-1 rounded-full">
                    Profile Strength
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {profileCompletion}%
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Profile Completion
                </p>
                <div className="w-full bg-gray-100 dark:bg-matte-gray-light rounded-full h-2">
                  <div
                    className={`rounded-full h-2 transition-all duration-500 ${profileCompletion >= 80
                      ? "bg-green-600"
                      : profileCompletion >= 50
                        ? "bg-yellow-600"
                        : "bg-red-600"
                      }`}
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="card-purple hover-lift relative overflow-hidden">
              {/* Bubble Effects */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 bg-blue-500" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-15 bg-blue-400" />

              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl">
                    <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                    Skills
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {employee.skills?.length || 0}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Total Skills Listed
                </p>
              </div>
            </div>

            <div className="card-purple hover-lift relative overflow-hidden">
              {/* Bubble Effects */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 bg-purple-500" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-15 bg-purple-400" />

              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-xl">
                    <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs px-3 py-1 rounded-full">
                    Experience
                  </span>
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
              {/* Tabs Container - Keep your existing styling */}
              <div className="bg-white dark:bg-matte-gray-dark rounded-2xl p-2 shadow-subtle">
                <TabsList className="grid w-full grid-cols-4 bg-transparent border-none h-14">
                  <TabsTrigger
                    value="personal"
                    id="tab-trigger-personal"
                    className="data-[state=active]:bg-[image:var(--purple-gradient)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span className="text-sm font-medium">Personal</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="employment"
                    id="tab-trigger-employment"
                    className="data-[state=active]:bg-[image:var(--purple-gradient)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span className="text-sm font-medium">Employment</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="skills"
                    id="tab-trigger-skills"
                    className="data-[state=active]:bg-[image:var(--purple-gradient)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span className="text-sm font-medium">Skills</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="experience"
                    id="tab-trigger-experience"
                    className="data-[state=active]:bg-[image:var(--purple-gradient)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 flex items-center justify-center py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span className="text-sm font-medium">Experience</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="personal" className="mt-0">
                  <div className="card-purple p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
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
                  <div className="card-purple p-6">
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
                  <div className="card-purple p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-xl">
                        <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
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
                    <div className="card-purple p-6">
                      <ExperienceTab
                        isEditing={isEditing}
                        control={control}
                        onEdit={() => setIsEditing(true)}
                        onSave={handleSubmit(handleSave)}
                        onCancel={handleCancel}
                      />
                    </div>

                    <div className="card-purple p-6">
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
                      <div className="card-purple p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-xl">
                            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
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

          {/* Profile Tips */}
          {!isEditing && profileCompletion < 100 && (
            <div className="card-purple border-dashed border-2 border-purple-300 dark:border-purple-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-xl flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      Boost Your Profile Visibility
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete your profile to improve your career
                      recommendations and visibility to HR managers.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {!employee.bio && (
                        <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                          Add Bio
                        </span>
                      )}
                      {!employee.skills?.length && (
                        <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs px-3 py-1 rounded-full">
                          Add Skills
                        </span>
                      )}
                      {!employee.experience?.length && (
                        <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs px-3 py-1 rounded-full">
                          Add Experience
                        </span>
                      )}
                      {!employee.education?.length && (
                        <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs px-3 py-1 rounded-full">
                          Add Education
                        </span>
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