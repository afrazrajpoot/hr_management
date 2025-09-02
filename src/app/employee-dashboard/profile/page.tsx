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

const EmployeeProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
        toast.success("Profile updated successfully!", { id: toastId });
      } catch (error) {
        console.error("Error saving employee:", error);
        const errorMessage =
          (error as any)?.data?.error || "Failed to save employee data";
        toast.error(errorMessage, { id: toastId, duration: 5000 });
      }
    },
    [createOrUpdateEmployee, formData, reset]
  );

  const handleCancel = useCallback((): void => {
    setFormData({ ...employee });
    reset(employee);
    setIsEditing(false);
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
            toast.success("Avatar uploaded successfully!", { duration: 3000 });
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
        toast.success("Resume uploaded successfully!", { duration: 3000 });
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
      toast.error(errorMessage, { duration: 5000 });
    }
  }, [employeeData, fetchError, reset]);

  if (status === "loading" || isFetching || isMutating) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-lg p-6 shadow-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            ></motion.div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (status !== "authenticated") {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <AppLayout>
      <Toaster
        theme="system"
        position="top-right"
        richColors
        toastOptions={{
          duration: 3000, // Default duration for success toasts
        }}
      />
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <ProfileHeader
            employee={employee}
            formData={formData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSave={handleSubmit(handleSave)}
            handleCancel={handleCancel}
            handleAvatarUpload={handleAvatarUpload}
          />

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 shadow-sm border">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoTab
                employee={employee}
                isEditing={isEditing}
                control={control}
              />
            </TabsContent>

            <TabsContent value="employment">
              <EmploymentTab
                employee={employee}
                isEditing={isEditing}
                control={control}
              />
            </TabsContent>

            <TabsContent value="skills">
              <SkillsTab isEditing={isEditing} control={control} />
            </TabsContent>

            <TabsContent value="experience">
              <div className="space-y-6">
                <ExperienceTab isEditing={isEditing} control={control} />
                <EducationTab isEditing={isEditing} control={control} />
              </div>
            </TabsContent>

            <TabsContent value="resume">
              <ResumeTab
                formData={formData}
                handleResumeUpload={handleResumeUpload}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmployeeProfilePage;
