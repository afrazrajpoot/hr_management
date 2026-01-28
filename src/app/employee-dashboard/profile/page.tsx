"use client";

import React, { useState, ChangeEvent, useCallback, useEffect, useRef } from "react";
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
import { toast } from "sonner";
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
  ChevronRight,
  X,
  Play,
  AlertTriangle,
} from "lucide-react";

const onboardingSteps = [
  {
    tab: "personal",
    title: "Profile Status",
    description: "Let's check your specific profile completion status.",
    icon: TrendingUp,
  },
  {
    tab: "personal",
    title: "Personal Information",
    description:
      "Manage your personal details and contact information. Make sure your name, contact, and bio are up to date!",
    icon: User,
  },
  {
    tab: "employment",
    title: "Employment Details",
    description:
      "Update your job details, department, and manager. Keeping this section current helps HR and managers know your role.",
    icon: Briefcase,
  },
  {
    tab: "skills",
    title: "Skills & Expertise",
    description:
      "Showcase your professional skills and competencies. Add all relevant skills to boost your profile strength!",
    icon: Award,
  },
  {
    tab: "experience",
    title: "Experience & Education",
    description:
      "Add your work experience, education, and upload your resume. This helps you stand out for new opportunities!",
    icon: BookOpen,
  },
];

// LocalStorage key
const ONBOARDING_STORAGE_KEY = "employeeProfileOnboarding";

const EmployeeProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const onboardingInitialized = useRef(false);

  // Check localStorage for onboarding status on page load
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reset the initialization flag on mount to allow re-checking
    onboardingInitialized.current = false;

    // Check URL parameter for forcing tour
    const urlParams = new URLSearchParams(window.location.search);
    const forceTour = urlParams.get("tour") === "true";
    const forceSkipTour = urlParams.get("tour") === "false";

    // Get onboarding status from localStorage
    const onboardingStatus = localStorage.getItem(ONBOARDING_STORAGE_KEY);

    // Show onboarding if:
    // 1. localStorage is null (first time) OR has value "true"
    // 2. AND not forcing skip via URL
    // 3. OR if explicitly forced via URL parameter
    const shouldShowOnboarding =
      forceTour ||
      ((onboardingStatus === null || onboardingStatus === "true") && !forceSkipTour);

    if (shouldShowOnboarding && !onboardingInitialized.current) {
      onboardingInitialized.current = true;

      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setShowOnboarding(true);
        setOnboardingStep(0);
        setActiveTab(onboardingSteps[0].tab);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Update active tab when onboarding step changes
  // Update active tab when onboarding step changes - DISABLED per user request
  // useEffect(() => {
  //   if (showOnboarding) {
  //     setActiveTab(onboardingSteps[onboardingStep].tab);
  //   }
  // }, [onboardingStep, showOnboarding]);

  // Function to mark onboarding as completed (set to false in localStorage)
  const markOnboardingAsCompleted = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "false");
  }, []);

  // Function to reset onboarding (set to true in localStorage)
  const resetOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
  }, []);

  const handleNextOnboarding = useCallback(async () => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (onboardingStep < onboardingSteps.length - 1) {
      const nextStep = onboardingStep + 1;

      // Animate step transition
      await new Promise(resolve => setTimeout(resolve, 200));

      setOnboardingStep(nextStep);
    } else {
      // Finish onboarding - mark as completed
      markOnboardingAsCompleted();
      setShowOnboarding(false);
      toast.success("Profile tour completed! Your profile is now ready.", {
        duration: 3000,
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      });
    }

    setIsAnimating(false);
  }, [onboardingStep, isAnimating, markOnboardingAsCompleted]);

  const handlePrevOnboarding = useCallback(async () => {
    if (isAnimating || onboardingStep === 0) return;

    setIsAnimating(true);

    const prevStep = onboardingStep - 1;

    // Animate step transition
    await new Promise(resolve => setTimeout(resolve, 200));

    setOnboardingStep(prevStep);

    setIsAnimating(false);
  }, [onboardingStep, isAnimating]);

  const handleCloseOnboarding = useCallback(() => {
    // User closed manually - mark as completed
    markOnboardingAsCompleted();
    setShowOnboarding(false);
  }, [markOnboardingAsCompleted]);

  const handleSkipOnboarding = useCallback(() => {
    // User skipped - mark as completed
    markOnboardingAsCompleted();
    setShowOnboarding(false);
    toast.info("Tour skipped. You can restart it anytime.", {
      duration: 4000,
    });
  }, [markOnboardingAsCompleted]);

  const handleRestartOnboarding = useCallback(() => {
    // Reset onboarding to show again
    resetOnboarding();
    setShowOnboarding(true);
    setOnboardingStep(0);
    setActiveTab(onboardingSteps[0].tab);
  }, [resetOnboarding]);

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
          skills: data.skills || [],
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

  const calculateProfileCompletion = () => {
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

    const employmentFieldList = [
      "employer",
      "hireDate",
      "department",
      "position",
      "manager",
    ];
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

    const isSkillsComplete =
      employee && employee.skills && employee.skills.length > 0;

    const isExperienceComplete =
      employee &&
      employee.experience &&
      employee.experience.length > 0 &&
      employee &&
      employee.education &&
      employee.education.length > 0;

    let percentage = 0;
    if (isPersonalComplete) percentage += 25;
    if (isEmploymentComplete) percentage += 25;
    if (isSkillsComplete) percentage += 25;
    if (isExperienceComplete) percentage += 25;

    return {
      percentage,
      breakdown: {
        "Personal Info": isPersonalComplete,
        Employment: isEmploymentComplete,
        Skills: isSkillsComplete,
        Experience: isExperienceComplete,
      },
    };
  };

  const { percentage: profileCompletion, breakdown } = calculateProfileCompletion();
  const CurrentIcon = onboardingSteps[onboardingStep]?.icon || User;

  return (
    <AppLayout>
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <>
            {/* Backdrop with slight blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50"
              onClick={handleCloseOnboarding}
            />

            {/* Onboarding Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
            >
              <div className="relative card-purple rounded-2xl shadow-prominent p-6 overflow-hidden border border-purple-200 dark:border-purple-800 mx-4">
                {/* Animated background */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-400/5 rounded-full blur-3xl" />

                {/* Close button */}
                <button
                  className="absolute top-3 right-3 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30"
                  onClick={handleCloseOnboarding}
                  aria-label="Close onboarding"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'var(--purple-gradient)' }}>
                      <CurrentIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-bold text-gradient-purple">
                          {onboardingSteps[onboardingStep].title}
                        </h2>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          Step {onboardingStep + 1} of {onboardingSteps.length}
                        </span>
                      </div>
                      {onboardingStep === 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Profile Status Check
                            </p>
                            <span className="text-xs font-bold text-gradient-purple">
                              {profileCompletion}% Ready
                            </span>
                          </div>

                          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                              Inorder to access full platform please complete <span className="font-bold">90%</span> of the profile. add personal information, employment, skills
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {Object.entries(breakdown).map(
                              ([label, isComplete]) => (
                                <div
                                  key={label}
                                  className={`flex items-center gap-2 p-2 rounded-lg text-xs border ${isComplete
                                    ? "bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-700 dark:text-green-300"
                                    : "bg-gray-50 border-gray-100 dark:bg-white/5 dark:border-white/10 text-muted-foreground opacity-70"
                                    }`}
                                >
                                  {isComplete ? (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40" />
                                  )}
                                  <span className="font-medium">{label}</span>
                                </div>
                              )
                            )}
                          </div>

                          <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30 mt-2">
                            <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1.5 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              Action Plan
                            </p>
                            <ul className="space-y-1.5">
                              {profileCompletion === 100 ? (
                                <li className="text-xs text-muted-foreground flex items-start gap-2">
                                  <div className="mt-1 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                                  <span>
                                    Great job! Your profile is fully optimized.
                                    Review to keep it current.
                                  </span>
                                </li>
                              ) : (
                                <>
                                  {!breakdown["Personal Info"] && (
                                    <li className="text-xs text-muted-foreground flex items-start gap-2">
                                      <div className="mt-1.5 w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                                      <span>
                                        Start with <b>Personal Info</b> to add
                                        contact details.
                                      </span>
                                    </li>
                                  )}
                                  {!breakdown["Employment"] && (
                                    <li className="text-xs text-muted-foreground flex items-start gap-2">
                                      <div className="mt-1.5 w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                                      <span>
                                        Update <b>Employment</b> with your
                                        current role.
                                      </span>
                                    </li>
                                  )}
                                  {!breakdown["Skills"] && (
                                    <li className="text-xs text-muted-foreground flex items-start gap-2">
                                      <div className="mt-1.5 w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                                      <span>
                                        Add <b>Skills</b> to highlight your
                                        expertise.
                                      </span>
                                    </li>
                                  )}
                                  {!breakdown["Experience"] && (
                                    <li className="text-xs text-muted-foreground flex items-start gap-2">
                                      <div className="mt-1.5 w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                                      <span>
                                        List <b>Experience</b> & Education history.
                                      </span>
                                    </li>
                                  )}
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {onboardingSteps[onboardingStep].description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="mb-6">
                    <div className="flex gap-1.5 mb-2">
                      {onboardingSteps.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${idx === onboardingStep
                            ? "bg-purple-600 dark:bg-purple-400"
                            : idx < onboardingStep
                              ? "bg-purple-400 dark:bg-purple-600"
                              : "bg-purple-200 dark:bg-purple-800"
                            }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Status</span>
                      <span>Personal</span>
                      <span>Work</span>
                      <span>Skills</span>
                      <span>Exp</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <div className="flex gap-2">
                      {onboardingStep > 0 && (
                        <button
                          className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 px-4 py-2 rounded-lg transition-colors border border-input hover:border-purple-300 dark:hover:border-purple-700"
                          onClick={handlePrevOnboarding}
                          disabled={isAnimating}
                        >
                          Back
                        </button>
                      )}
                      <button
                        className="text-sm text-muted-foreground hover:text-red-600 dark:hover:text-red-400 px-4 py-2 rounded-lg transition-colors"
                        onClick={handleSkipOnboarding}
                      >
                        Skip Tour
                      </button>
                    </div>

                    <button
                      className="btn-purple px-5 py-2 text-sm rounded-lg transition-all duration-200 hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleNextOnboarding}
                      disabled={isAnimating}
                    >
                      {onboardingStep === onboardingSteps.length - 1
                        ? "Complete Tour"
                        : "Next Step"}
                      {onboardingStep < onboardingSteps.length - 1 && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Current tab indicator */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-muted-foreground">Now viewing:</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                      {onboardingSteps[onboardingStep].tab.charAt(0).toUpperCase() + onboardingSteps[onboardingStep].tab.slice(1)} Tab
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-layout-purple p-4 md:p-6">
        {/* Admin controls for testing */}
        <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
          {!showOnboarding && (
            <button
              onClick={handleRestartOnboarding}
              className="text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              style={{ background: 'var(--purple-gradient)' }}
              title="Restart Tour"
            >
              <Play className="w-5 h-5" fill="white" />
            </button>
          )}

        </div>

        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl opacity-15" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl opacity-15" />
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-purple hover-lift relative overflow-hidden">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            ref={tabsRef}
          >
            <Tabs
              defaultValue="personal"
              className="space-y-6"
              value={activeTab}
              onValueChange={setActiveTab}
            >
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