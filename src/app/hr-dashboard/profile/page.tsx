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
        <div className="mx-auto p-6 space-y-8 flex justify-center items-center min-h-screen">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-700 border-t-primary h-12 w-12 animate-spin"></div>
        </div>
      </HRLayout>
    );
  }

  const sessionUser = session?.user as SessionUser;
  const firstNameInitial =
    profileForm.getValues("firstName")?.charAt(0)?.toUpperCase() || "U";

  return (
    <HRLayout>
      <div className="mx-auto p-6 space-y-8">
        {/* Avatar Section */}
        <div className="flex justify-center items-center">
          {profileForm.getValues("image") ? (
            <img
              src={profileForm.getValues("image")}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold border-2 border-gray-700">
              {firstNameInitial}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <Button variant="destructive" onClick={handleLogout} className="w-40">
            Sign Out
          </Button>
        </div>

        {/* Profile Section */}
        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between card">
            <div>
              <CardTitle>
                <p>Personal Information</p>
              </CardTitle>
              <CardDescription>
                <p> Your personal details and contact information</p>
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              {isEditingProfile ? "Cancel" : "Edit Profile"}
            </Button>
          </CardHeader>

          <CardContent className="card">
            {isEditingProfile ? (
              <form
                onSubmit={profileForm.handleSubmit(onUpdateProfile)}
                className="space-y-4 bg-gray-800 border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
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

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
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

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
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

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      type="url"
                      {...profileForm.register("image")}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={profileForm.formState.isSubmitting}
                  >
                    {profileForm.formState.isSubmitting
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground">First Name</Label>
                    <p className="text-lg font-medium">
                      {profileForm.getValues("firstName") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Name</Label>
                    <p className="text-lg font-medium">
                      {profileForm.getValues("lastName") || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-lg font-medium">
                      {profileForm.getValues("email") || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Section */}
        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between card">
            <div>
              <p>Company Information</p>
              <p>Your company details and business information</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditingCompany(!isEditingCompany)}
            >
              {isEditingCompany
                ? "Cancel"
                : company
                ? "Edit Company"
                : "Add Company"}
            </Button>
          </CardHeader>

          <CardContent className="card">
            {isEditingCompany ? (
              <form
                onSubmit={companyForm.handleSubmit(onUpdateCompany)}
                className="space-y-4 card"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
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

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      {...companyForm.register("industry")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      {...companyForm.register("website")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...companyForm.register("phone")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foundedYear">Founded Year</Label>
                    <Input
                      id="foundedYear"
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      {...companyForm.register("foundedYear", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      min="0"
                      {...companyForm.register("employeeCount", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      rows={3}
                      {...companyForm.register("address")}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      {...companyForm.register("description")}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={companyForm.formState.isSubmitting}
                  >
                    {companyForm.formState.isSubmitting
                      ? "Saving..."
                      : "Save Company"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingCompany(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : company ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground">
                      Company Name
                    </Label>
                    <p className="text-lg font-medium">
                      {company.companyDetail?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Industry</Label>
                    <p className="text-lg font-medium">
                      {company.companyDetail?.industry || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Website</Label>
                    <p className="text-lg font-medium">
                      {company.companyDetail?.website ? (
                        <a
                          href={company.companyDetail.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {company.companyDetail.website}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="text-lg font-medium">
                      {company.companyDetail?.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Founded Year
                    </Label>
                    <p className="text-lg font-medium">
                      {company.companyDetail?.foundedYear || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Employee Count
                    </Label>
                    <p className="text-lg font-medium">
                      {company.companyDetail?.employeeCount || "N/A"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="text-lg">
                    {company.companyDetail?.address || "N/A"}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-lg">
                    {company.companyDetail?.description || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-muted-foreground text-6xl">🏢</div>
                <h3 className="text-lg font-medium">No Company Information</h3>
                <p className="text-muted-foreground">
                  Add your company information to complete your HR profile.
                </p>
                <Button onClick={() => setIsEditingCompany(true)}>
                  Add Company
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
};

export default HRProfilePage;
