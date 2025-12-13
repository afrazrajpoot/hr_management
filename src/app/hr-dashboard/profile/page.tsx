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
        <div className="gradient-bg-primary min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <div className="ai-recommendation-icon-wrapper w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <User className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading profile...</p>
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
      <div className="gradient-bg-primary min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-3">
                  Profile Settings
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your personal and company information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card-primary card-hover">
                <div className="flex items-center gap-4">
                  <div className="icon-wrapper-blue">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">HR Role</p>
                    <p className="text-xl font-semibold">Recruiter</p>
                  </div>
                </div>
              </div>
              <div className="card-primary card-hover">
                <div className="flex items-center gap-4">
                  <div className="icon-wrapper-green">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Account Status
                    </p>
                    <p className="text-xl font-semibold">Active</p>
                  </div>
                </div>
              </div>
              <div className="card-primary card-hover">
                <div className="flex items-center gap-4">
                  <div className="icon-wrapper-purple">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="text-xl font-semibold">
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
              <div className="card-primary sticky top-6">
                {/* Profile Avatar */}
                <div className="relative mb-6">
                  <div className="relative mx-auto w-32 h-32">
                    {profileForm.getValues("image") ? (
                      <img
                        src={profileForm.getValues("image")}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-4 border-secondary"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white border-4 border-secondary">
                        {firstNameInitial}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-success to-green-400 rounded-full border-4 border-card flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {fullName || "HR Professional"}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {sessionUser?.role || "Human Resources"}
                  </p>
                  <Badge className="badge-blue">Verified Account</Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="icon-wrapper-blue w-10 h-10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium truncate">
                        {profileForm.getValues("email") || "N/A"}
                      </p>
                    </div>
                  </div>

                  {company?.companyDetail?.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="icon-wrapper-green w-10 h-10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {company.companyDetail.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {company?.companyDetail?.website && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="icon-wrapper-purple w-10 h-10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <a
                          href={company.companyDetail.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline truncate block"
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
                <div className="mt-8 pt-6 border-t">
                  <Button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="w-full gap-2 btn-gradient-primary"
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
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Form Card */}
              <Card className="card-primary">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="icon-wrapper-blue">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold">
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Your personal details and contact information
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      className={
                        isEditingProfile ? "badge-amber" : "badge-green"
                      }
                    >
                      {isEditingProfile ? "Editing" : "Ready"}
                    </Badge>
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
                            className="flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            className="bg-card border-input"
                            {...profileForm.register("firstName", {
                              required: "First name is required",
                            })}
                          />
                          {profileForm.formState.errors.firstName && (
                            <p className="text-sm text-destructive">
                              {profileForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="lastName"
                            className="flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            className="bg-card border-input"
                            {...profileForm.register("lastName", {
                              required: "Last name is required",
                            })}
                          />
                          {profileForm.formState.errors.lastName && (
                            <p className="text-sm text-destructive">
                              {profileForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            className="bg-card border-input"
                            {...profileForm.register("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                              },
                            })}
                          />
                          {profileForm.formState.errors.email && (
                            <p className="text-sm text-destructive">
                              {profileForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="image"
                            className="flex items-center gap-2"
                          >
                            <Globe className="w-4 h-4" />
                            Profile Image URL
                          </Label>
                          <Input
                            id="image"
                            type="url"
                            className="bg-card border-input"
                            {...profileForm.register("image")}
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          className="gap-2 btn-gradient-primary"
                          disabled={profileForm.formState.isSubmitting}
                        >
                          <Save className="w-4 h-4" />
                          {profileForm.formState.isSubmitting
                            ? "Saving..."
                            : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="assessment-item">
                          <Label className="text-muted-foreground text-sm">
                            First Name
                          </Label>
                          <p className="text-lg font-semibold mt-1">
                            {profileForm.getValues("firstName") ||
                              "Not provided"}
                          </p>
                        </div>
                        <div className="assessment-item">
                          <Label className="text-muted-foreground text-sm">
                            Last Name
                          </Label>
                          <p className="text-lg font-semibold mt-1">
                            {profileForm.getValues("lastName") ||
                              "Not provided"}
                          </p>
                        </div>
                        <div className="md:col-span-2 assessment-item">
                          <Label className="text-muted-foreground text-sm">
                            Email Address
                          </Label>
                          <p className="text-lg font-semibold mt-1">
                            {profileForm.getValues("email") || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Form Card */}
              <Card className="card-primary">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="icon-wrapper-purple">
                        <Building className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold">
                          Company Information
                        </CardTitle>
                        <CardDescription>
                          Your company details and business information
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingCompany(!isEditingCompany)}
                      className="gap-2"
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
                    </Button>
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
                            className="flex items-center gap-2"
                          >
                            <Building className="w-4 h-4" />
                            Company Name *
                          </Label>
                          <Input
                            id="companyName"
                            className="bg-card border-input"
                            {...companyForm.register("name", {
                              required: "Company name is required",
                            })}
                          />
                          {companyForm.formState.errors.name && (
                            <p className="text-sm text-destructive">
                              {companyForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="industry"
                            className="flex items-center gap-2"
                          >
                            <Briefcase className="w-4 h-4" />
                            Industry
                          </Label>
                          <Input
                            id="industry"
                            className="bg-card border-input"
                            {...companyForm.register("industry")}
                            placeholder="e.g., Technology, Healthcare"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="website"
                            className="flex items-center gap-2"
                          >
                            <Globe className="w-4 h-4" />
                            Website
                          </Label>
                          <Input
                            id="website"
                            type="url"
                            className="bg-card border-input"
                            {...companyForm.register("website")}
                            placeholder="https://example.com"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="phone"
                            className="flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            Phone
                          </Label>
                          <Input
                            id="phone"
                            className="bg-card border-input"
                            {...companyForm.register("phone")}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="foundedYear"
                            className="flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Founded Year
                          </Label>
                          <Input
                            id="foundedYear"
                            type="number"
                            className="bg-card border-input"
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
                            className="flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Employee Count
                          </Label>
                          <Input
                            id="employeeCount"
                            type="number"
                            className="bg-card border-input"
                            min="0"
                            {...companyForm.register("employeeCount", {
                              valueAsNumber: true,
                            })}
                          />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="address"
                            className="flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4" />
                            Address
                          </Label>
                          <Textarea
                            id="address"
                            rows={3}
                            className="bg-card border-input resize-none"
                            {...companyForm.register("address")}
                            placeholder="123 Main Street, City, State, ZIP"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="description"
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            rows={4}
                            className="bg-card border-input resize-none"
                            {...companyForm.register("description")}
                            placeholder="Describe your company's mission, values, and culture..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          className="gap-2 btn-gradient-primary"
                          disabled={companyForm.formState.isSubmitting}
                        >
                          <Save className="w-4 h-4" />
                          {companyForm.formState.isSubmitting
                            ? "Saving..."
                            : company
                            ? "Update Company"
                            : "Create Company"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingCompany(false)}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : company ? (
                    <div className="space-y-8">
                      {/* Company Header */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-secondary/30 to-transparent">
                        <div className="flex items-center gap-4">
                          <div className="icon-wrapper-purple w-12 h-12 flex items-center justify-center">
                            <Building className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">
                              {company.companyDetail?.name}
                            </h3>
                            <p className="text-muted-foreground">
                              {company.companyDetail?.industry ||
                                "Industry not specified"}
                            </p>
                          </div>
                        </div>
                        <Badge className="badge-green">Connected</Badge>
                      </div>

                      {/* Company Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="assessment-item">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="icon-wrapper-blue">
                              <Globe className="w-4 h-4 text-blue-600" />
                            </div>
                            <Label className="text-muted-foreground">
                              Website
                            </Label>
                          </div>
                          <p className="font-medium">
                            {company.companyDetail?.website ? (
                              <a
                                href={company.companyDetail.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
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

                        <div className="assessment-item">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="icon-wrapper-green">
                              <Phone className="w-4 h-4 text-green-600" />
                            </div>
                            <Label className="text-muted-foreground">
                              Phone
                            </Label>
                          </div>
                          <p className="font-medium">
                            {company.companyDetail?.phone || "Not provided"}
                          </p>
                        </div>

                        <div className="assessment-item">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="icon-wrapper-amber">
                              <Calendar className="w-4 h-4 text-amber-600" />
                            </div>
                            <Label className="text-muted-foreground">
                              Founded Year
                            </Label>
                          </div>
                          <p className="font-medium">
                            {company.companyDetail?.foundedYear ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="assessment-item">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="icon-wrapper-purple">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <Label className="text-muted-foreground">
                              Employee Count
                            </Label>
                          </div>
                          <p className="font-medium">
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
                              <div className="icon-wrapper-blue">
                                <MapPin className="w-4 h-4 text-blue-600" />
                              </div>
                              <Label className="text-muted-foreground">
                                Company Address
                              </Label>
                            </div>
                            <p className="text-foreground/80 p-4 rounded-lg bg-secondary/30">
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
                              <div className="icon-wrapper-green">
                                <FileText className="w-4 h-4 text-green-600" />
                              </div>
                              <Label className="text-muted-foreground">
                                Company Description
                              </Label>
                            </div>
                            <p className="text-foreground/80 leading-relaxed p-4 rounded-lg bg-secondary/30">
                              {company.companyDetail.description}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="icon-wrapper-purple w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <Building className="w-10 h-10 text-purple-600" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-3">
                        No Company Information
                      </h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Add your company information to complete your HR profile
                        and start managing job postings.
                      </p>
                      <Button
                        onClick={() => setIsEditingCompany(true)}
                        className="gap-2 btn-gradient-primary"
                      >
                        <Building className="w-4 h-4" />
                        Add Company Information
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

// Add missing components
const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      className || ""
    }`}
  >
    {children}
  </span>
);

const FileText = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export default HRProfilePage;
