"use client";
import React, { useState, ChangeEvent, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

const EmployeeProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const { data: employeeData, isLoading, error } = useGetEmployeeQuery();
  const [createOrUpdateEmployee] = useCreateOrUpdateEmployeeMutation();

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
        setAlertMessage("Profile updated successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error("Error saving employee:", error);
        setAlertMessage("Failed to save employee data");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
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
        setAlertMessage("Resume uploaded successfully!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
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
    if (error) {
      setAlertMessage("Failed to load employee data");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  }, [employeeData, error, reset]);

  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          ></motion.div>
        </div>
      </AppLayout>
    );
  }

  if (status !== "authenticated") {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <AnimatePresence>
            {showAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Alert>
                  <AlertDescription>{alertMessage}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

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
