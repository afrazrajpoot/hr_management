"use client";

import HRLayout from "@/components/hr/HRLayout";
import { useSession, signOut } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Calendar,
  Briefcase,
  User,
  LogOut,
  Edit2,
  Save,
  X,
  CheckCircle,
  Award,
  Shield,
  FileText,
} from "lucide-react";

// Types
interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  image?: string;
  hrId?: string;
}

interface Company {
  id: string;
  companyDetail: {
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    industry?: string;
    description?: string;
    foundedYear?: number;
    employeeCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
}

interface CompanyFormData {
  name: string;
  address: string;
  phone: string;
  website: string;
  industry: string;
  description: string;
  foundedYear: number;
  employeeCount: number;
}

const HRProfilePage = () => {
  const { data: session, update } = useSession();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      image: "",
    },
  });

  // Company form
  const companyForm = useForm<CompanyFormData>({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      website: "",
      industry: "",
      description: "",
      foundedYear: new Date().getFullYear(),
      employeeCount: 0,
    },
  });

  // Load user and company data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (session?.user?.id) {
          const sessionUser = session.user as SessionUser;

          // Fetch user profile data
          const profileResponse = await fetch(
            `/api/hr-api/profile?id=${sessionUser.id}`
          );
          if (profileResponse.ok) {
            const userData = await profileResponse.json();
            profileForm.reset({
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: userData.email || "",
              image: userData.image || "",
            });
          } else {
            throw new Error("Failed to fetch profile data");
          }

          // Load company data
          const companyResponse = await fetch(
            `/api/hr-api/company?userId=${sessionUser.id}`
          );
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            setCompany(companyData);

            if (companyData) {
              // Set company form values
              companyForm.reset({
                name: companyData.companyDetail?.name || "",
                address: companyData.companyDetail?.address || "",
                phone: companyData.companyDetail?.phone || "",
                website: companyData.companyDetail?.website || "",
                industry: companyData.companyDetail?.industry || "",
                description: companyData.companyDetail?.description || "",
                foundedYear:
                  companyData.companyDetail?.foundedYear ||
                  new Date().getFullYear(),
                employeeCount: companyData.companyDetail?.employeeCount || 0,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadData();
    }
  }, [session, profileForm, companyForm]);

  // Update profile
  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      const sessionUser = session?.user as SessionUser;
      const response = await fetch("/api/hr-api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sessionUser?.id,
          ...data,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();

      // Update session
      await update({
        ...session,
        user: { ...sessionUser, ...updatedUser },
      });

      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  // Update/Create company
  const onUpdateCompany = async (data: CompanyFormData) => {
    try {
      const sessionUser = session?.user as SessionUser;
      const companyDetail = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        description: data.description,
        foundedYear: data.foundedYear,
        employeeCount: data.employeeCount,
      };

      const response = await fetch("/api/hr-api/company", {
        method: company ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sessionUser?.id,
          companyDetail,
          ...(company && { id: company.id }),
        }),
      });

      if (!response.ok) throw new Error("Failed to update company");

      const updatedCompany = await response.json();
      setCompany(updatedCompany);

      toast.success(
        company
          ? "Company updated successfully"
          : "Company created successfully"
      );
      setIsEditingCompany(false);
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Failed to update company");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <HRLayout>
        <div className="bg-layout-purple min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <div className="icon-brand w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <User className="w-8 h-8 animate-pulse" />
            </div>
            <p className="text-subtle dark:text-subtle-dark">Loading profile...</p>
          </div>
        </div>
      </HRLayout>
    );
  }

  const sessionUser = session?.user as SessionUser;
  const firstNameInitial =
    profileForm.getValues("firstName")?.charAt(0)?.toUpperCase() || "U";
  const fullName = `${profileForm.getValues(
    "firstName"
  )} ${profileForm.getValues("lastName")}`.trim();

  return (
    <HRLayout>
      <div className="bg-layout-purple min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-on-matte dark:text-on-matte mb-3">
                  Profile Settings
                </h1>
                <p className="text-lg text-subtle dark:text-subtle-dark">
                  Manage your personal and company information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Stats Cards with Bubble Effects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* HR Role Card */}
              <div className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 rounded-full -translate-y-8 translate-x-4 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center gap-4 p-4 relative z-10">
                  <div className="icon-info group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-subtle dark:text-subtle-dark">HR Role</p>
                    <p className="text-xl font-semibold text-gradient-purple">Recruiter</p>
                  </div>
                </div>
              </div>

              {/* Account Status Card */}
              <div className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 rounded-full -translate-y-8 translate-x-4 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center gap-4 p-4 relative z-10">
                  <div className="icon-success group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-subtle dark:text-subtle-dark">Account Status</p>
                    <p className="text-xl font-semibold text-gradient-green">Active</p>
                  </div>
                </div>
              </div>

              {/* Company Card */}
              <div className="card-purple relative overflow-hidden group card-hover border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-matte-gray-medium dark:to-matte-gray-light">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 rounded-full -translate-y-8 translate-x-4 group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center gap-4 p-4 relative z-10">
                  <div className="icon-brand group-hover:scale-110 transition-transform duration-300">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-subtle dark:text-subtle-dark">Company</p>
                    <p className="text-xl font-semibold text-gradient-purple">
                      {company ? "Connected" : "Not Set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="card-purple sticky top-6 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                {/* Purple gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-purple" />

                {/* Profile Avatar */}
                <div className="relative mb-6 pt-6">
                  <div className="relative mx-auto w-32 h-32">
                    {profileForm.getValues("image") ? (
                      <img
                        src={profileForm.getValues("image")}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-4 border-matte dark:border-matte"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-purple flex items-center justify-center text-4xl font-bold text-white border-4 border-matte dark:border-matte">
                        {firstNameInitial}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-full border-4 border-white dark:border-matte-gray-medium flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-on-matte dark:text-on-matte mb-2">
                    {fullName || "HR Professional"}
                  </h2>
                  <p className="text-purple-600 dark:text-purple-400 font-medium mb-4">
                    {sessionUser?.role || "Human Resources"}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium badge-indigo">
                    Verified Account
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                    <div className="icon-info bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Email</p>
                      <p className="font-medium truncate text-gray-900 dark:text-white">
                        {profileForm.getValues("email") || "N/A"}
                      </p>
                    </div>
                  </div>

                  {company?.companyDetail?.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                      <div className="icon-success bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {company.companyDetail.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {company?.companyDetail?.website && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20">
                      <div className="icon-brand bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Website</p>
                        <a
                          href={company.companyDetail.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-teal-600 dark:text-teal-400 hover:underline truncate block"
                        >
                          {company.companyDetail.website.replace(
                            /^https?:\/\//,
                            ""
                          )}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Profile Button */}
                <div className="mt-8 pt-6 border-t border-matte dark:border-matte">
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="w-full flex items-center justify-center gap-2 btn-purple rounded-lg py-3 hover:shadow-xl transition-all duration-300"
                  >
                    {isEditingProfile ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel Editing
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Form Card */}
              <Card className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                {/* Purple gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-purple" />

                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-50 dark:bg-purple-900/10 p-2 rounded-lg">
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-on-matte dark:text-on-matte">
                          Personal Information
                        </CardTitle>
                        <CardDescription className="text-subtle dark:text-subtle-dark">
                          Your personal details and contact information
                        </CardDescription>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isEditingProfile ? "badge-warning" : "badge-success"
                      }`}>
                      {isEditingProfile ? "Editing" : "Ready"}
                    </span>
                  </div>
                </CardHeader>

                <Separator className="mb-6" />

                <CardContent>
                  {isEditingProfile ? (
                    <form
                      onSubmit={profileForm.handleSubmit(onUpdateProfile)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label
                            htmlFor="firstName"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <User className="w-4 h-4" />
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            className="input-purple border-matte dark:border-matte"
                            {...profileForm.register("firstName", {
                              required: "First name is required",
                            })}
                          />
                          {profileForm.formState.errors.firstName && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {profileForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="lastName"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <User className="w-4 h-4" />
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            className="input-purple border-matte dark:border-matte"
                            {...profileForm.register("lastName", {
                              required: "Last name is required",
                            })}
                          />
                          {profileForm.formState.errors.lastName && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {profileForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <Mail className="w-4 h-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            className="input-purple border-matte dark:border-matte"
                            {...profileForm.register("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                              },
                            })}
                          />
                          {profileForm.formState.errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {profileForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="image"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <Globe className="w-4 h-4" />
                            Profile Image URL
                          </Label>
                          <Input
                            id="image"
                            type="url"
                            className="input-purple border-matte dark:border-matte"
                            {...profileForm.register("image")}
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg btn-purple hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={profileForm.formState.isSubmitting}
                        >
                          <Save className="w-4 h-4" />
                          {profileForm.formState.isSubmitting
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/20">
                          <Label className="text-pink-600 dark:text-pink-400 text-sm font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            First Name
                          </Label>
                          <p className="text-lg font-bold mt-1 text-gray-900 dark:text-white">
                            {profileForm.getValues("firstName") ||
                              "Not provided"}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                          <Label className="text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Last Name
                          </Label>
                          <p className="text-lg font-bold mt-1 text-gray-900 dark:text-white">
                            {profileForm.getValues("lastName") ||
                              "Not provided"}
                          </p>
                        </div>
                        <div className="md:col-span-2 p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                          <Label className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email Address
                          </Label>
                          <p className="text-lg font-bold mt-1 text-gray-900 dark:text-white">
                            {profileForm.getValues("email") || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Form Card */}
              <Card className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                {/* Purple gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-purple" />

                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="icon-brand p-2 rounded-lg">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-on-matte dark:text-on-matte">
                          Company Information
                        </CardTitle>
                        <CardDescription className="text-subtle dark:text-subtle-dark">
                          Your company details and business information
                        </CardDescription>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingCompany(!isEditingCompany)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg btn-purple-outline hover:scale-105 transition-all duration-200"
                    >
                      {isEditingCompany ? (
                        <>
                          <X className="w-4 h-4" />
                          Cancel
                        </>
                      ) : company ? (
                        <>
                          <Edit2 className="w-4 h-4" />
                          Edit Company
                        </>
                      ) : (
                        <>
                          <Building className="w-4 h-4" />
                          Add Company
                        </>
                      )}
                    </button>
                  </div>
                </CardHeader>

                <Separator className="mb-6" />

                <CardContent>
                  {isEditingCompany ? (
                    <form
                      onSubmit={companyForm.handleSubmit(onUpdateCompany)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="companyName"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <Building className="w-4 h-4" />
                            Company Name *
                          </Label>
                          <Input
                            id="companyName"
                            className="input-purple border-matte dark:border-matte"
                            {...companyForm.register("name", {
                              required: "Company name is required",
                            })}
                          />
                          {companyForm.formState.errors.name && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {companyForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="industry"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <Briefcase className="w-4 h-4" />
                            Industry
                          </Label>
                          <Input
                            id="industry"
                            className="input-purple border-matte dark:border-matte"
                            {...companyForm.register("industry")}
                            placeholder="e.g., Technology, Healthcare"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="website"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <Globe className="w-4 h-4" />
                            Website
                          </Label>
                          <Input
                            id="website"
                            type="url"
                            className="input-purple border-matte dark:border-matte"
                            {...companyForm.register("website")}
                            placeholder="https://example.com"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="phone"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <Phone className="w-4 h-4" />
                            Phone
                          </Label>
                          <Input
                            id="phone"
                            className="input-purple border-matte dark:border-matte"
                            {...companyForm.register("phone")}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="foundedYear"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <Calendar className="w-4 h-4" />
                            Founded Year
                          </Label>
                          <Input
                            id="foundedYear"
                            type="number"
                            className="input-purple border-matte dark:border-matte"
                            min="1800"
                            max={new Date().getFullYear()}
                            {...companyForm.register("foundedYear", {
                              valueAsNumber: true,
                            })}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="employeeCount"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <Users className="w-4 h-4" />
                            Employee Count
                          </Label>
                          <Input
                            id="employeeCount"
                            type="number"
                            className="input-purple border-matte dark:border-matte"
                            min="0"
                            {...companyForm.register("employeeCount", {
                              valueAsNumber: true,
                            })}
                          />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="address"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <MapPin className="w-4 h-4" />
                            Address
                          </Label>
                          <Textarea
                            id="address"
                            rows={3}
                            className="input-purple border-matte dark:border-matte resize-none"
                            {...companyForm.register("address")}
                            placeholder="123 Main Street, City, State, ZIP"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="description"
                            className="flex items-center gap-2 text-on-matte dark:text-on-matte"
                          >
                            <FileText className="w-4 h-4" />
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            rows={4}
                            className="input-purple border-matte dark:border-matte resize-none"
                            {...companyForm.register("description")}
                            placeholder="Describe your company's mission, values, and culture..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg btn-purple hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={companyForm.formState.isSubmitting}
                        >
                          <Save className="w-4 h-4" />
                          {companyForm.formState.isSubmitting
                            ? "Saving..."
                            : company
                              ? "Update Company"
                              : "Create Company"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingCompany(false)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-matte dark:border-matte text-subtle dark:text-subtle-dark hover:bg-gray-100 dark:hover:bg-matte-gray-subtle transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : company ? (
                    <div className="space-y-8">
                      {/* Company Header */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/20">
                        <div className="flex items-center gap-4">
                          <div className="icon-brand w-12 h-12 flex items-center justify-center">
                            <Building className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-on-matte dark:text-on-matte">
                              {company.companyDetail?.name}
                            </h3>
                            <p className="text-subtle dark:text-subtle-dark">
                              {company.companyDetail?.industry ||
                                "Industry not specified"}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium badge-success">
                          Connected
                        </span>
                      </div>

                      {/* Company Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="icon-info bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                              <Globe className="w-4 h-4" />
                            </div>
                            <Label className="text-teal-600 dark:text-teal-400 font-medium">Website</Label>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {company.companyDetail?.website ? (
                              <a
                                href={company.companyDetail.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 dark:text-teal-400 hover:underline"
                              >
                                {company.companyDetail.website.replace(
                                  /^https?:\/\//,
                                  ""
                                )}
                              </a>
                            ) : (
                              "Not provided"
                            )}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="icon-success bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              <Phone className="w-4 h-4" />
                            </div>
                            <Label className="text-emerald-600 dark:text-emerald-400 font-medium">Phone</Label>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {company.companyDetail?.phone || "Not provided"}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="icon-warning bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <Label className="text-amber-600 dark:text-amber-400 font-medium">Founded Year</Label>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {company.companyDetail?.foundedYear ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="icon-brand bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              <Users className="w-4 h-4" />
                            </div>
                            <Label className="text-blue-600 dark:text-blue-400 font-medium">Employee Count</Label>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {company.companyDetail?.employeeCount
                              ? `${company.companyDetail.employeeCount.toLocaleString()} employees`
                              : "Not provided"}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      {company.companyDetail?.address && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="icon-info">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <Label className="text-subtle dark:text-subtle-dark">Company Address</Label>
                            </div>
                            <p className="text-on-matte/80 dark:text-on-matte/80 p-4 rounded-lg bg-gray-50/50 dark:bg-matte-gray-subtle/30">
                              {company.companyDetail.address}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Description */}
                      {company.companyDetail?.description && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="icon-brand">
                                <FileText className="w-4 h-4" />
                              </div>
                              <Label className="text-subtle dark:text-subtle-dark">Company Description</Label>
                            </div>
                            <p className="text-on-matte/80 dark:text-on-matte/80 p-4 rounded-lg bg-gray-50/50 dark:bg-matte-gray-subtle/30 leading-relaxed">
                              {company.companyDetail.description}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Company Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-subtle dark:text-subtle-dark pt-4 border-t border-matte dark:border-matte">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(company.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Updated: {new Date(company.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="icon-brand w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20">
                        <Building className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-on-matte dark:text-on-matte mb-3">
                        No Company Information
                      </h3>
                      <p className="text-subtle dark:text-subtle-dark max-w-md mx-auto mb-8">
                        You haven't added any company information yet. Add your company details to complete your HR profile.
                      </p>
                      <button
                        onClick={() => setIsEditingCompany(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-purple hover:shadow-xl transition-all duration-300"
                      >
                        <Building className="w-4 h-4" />
                        Add Company Information
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information Section */}
              <Card className="card-purple border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
                {/* Purple gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-purple" />

                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="icon-info p-2 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-on-matte dark:text-on-matte">
                        Additional Information
                      </CardTitle>
                      <CardDescription className="text-subtle dark:text-subtle-dark">
                        Account details and preferences
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <Separator className="mb-6" />

                <CardContent>
                  <div className="space-y-6">
                    {/* Account Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                        <Label className="text-blue-600 dark:text-blue-400 text-sm font-medium block mb-2">
                          Account Type
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="icon-info bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                            <Shield className="w-4 h-4" />
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            HR Professional
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800">
                        <Label className="text-slate-600 dark:text-slate-400 text-sm font-medium block mb-2">
                          Account ID
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="icon-brand bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <code className="text-lg font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-black/20 px-2 py-1 rounded">
                            {sessionUser?.id?.substring(0, 8)}...
                          </code>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                        <Label className="text-purple-600 dark:text-purple-400 text-sm font-medium block mb-2">
                          HR ID
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="icon-success bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            <Award className="w-4 h-4" />
                          </div>
                          <code className="text-lg font-mono font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-black/20 px-2 py-1 rounded">
                            {sessionUser?.hrId || "HR-0000"}
                          </code>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20">
                        <Label className="text-teal-600 dark:text-teal-400 text-sm font-medium block mb-2">
                          Member Since
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="icon-warning bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {session?.user?.createdAt
                              ? new Date(session.user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-matte dark:border-matte">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg btn-purple-outline hover:scale-105 transition-all duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setIsEditingCompany(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg btn-purple hover:shadow-xl transition-all duration-300"
                      >
                        <Building className="w-4 h-4" />
                        {company ? "Update Company" : "Add Company"}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-matte dark:border-matte text-center">
            <p className="text-sm text-subtle dark:text-subtle-dark">
              Last updated: {new Date().toLocaleDateString()} • Your data is secure and protected
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="inline-flex items-center gap-1 text-xs text-subtle dark:text-subtle-dark">
                <Shield className="w-3 h-3" />
                SSL Secured
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-subtle dark:text-subtle-dark">
                <CheckCircle className="w-3 h-3" />
                GDPR Compliant
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-subtle dark:text-subtle-dark">
                <Award className="w-3 h-3" />
                Trusted Partner
              </span>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default HRProfilePage;