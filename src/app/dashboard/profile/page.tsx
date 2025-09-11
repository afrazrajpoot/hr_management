"use client";

import { useState } from "react";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Bell,
  Moon,
  Sun,
  Save,
  Eye,
  Settings,
} from "lucide-react";

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: "HR",
    lastName: "Manager",
    email: "hr@geniusfactor.com",
    phone: "+1 (555) 123-4567",
    company: "Genius Factor",
    role: "Senior HR Manager",
    department: "Human Resources",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    riskAlerts: true,
    assessmentReminders: false,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    shareAnalytics: false,
    allowDataExport: true,
  });

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const handleNotificationChange = (field: string, value: boolean) =>
    setNotifications((prev) => ({ ...prev, [field]: value }));
  const handlePrivacyChange = (field: string, value: boolean) =>
    setPrivacy((prev) => ({ ...prev, [field]: value }));
  const handleSave = () =>
    console.log("Saving profile:", { formData, notifications, privacy });

  return (
    <HRLayout
      title="Profile Settings"
      subtitle="Manage your account settings and preferences"
    >
      <div className="space-y-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt="Profile" />
                <AvatarFallback className="bg-gradient-primary text-white text-lg">
                  {formData.firstName[0]}
                  {formData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Access Level</p>
                  <p className="text-sm text-muted-foreground">
                    Your current access permissions
                  </p>
                </div>
                <Badge variant="default">Administrator</Badge>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Accessible Companies</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">All Companies</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Available Features</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Analytics</Badge>
                    <Badge variant="outline">Risk Analysis</Badge>
                    <Badge variant="outline">Reports</Badge>
                    <Badge variant="outline">User Management</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(value) =>
                      handleNotificationChange("emailNotifications", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(value) =>
                      handleNotificationChange("pushNotifications", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Weekly analytics summary
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(value) =>
                      handleNotificationChange("weeklyReports", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Risk Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      High-risk employee alerts
                    </p>
                  </div>
                  <Switch
                    checked={notifications.riskAlerts}
                    onCheckedChange={(value) =>
                      handleNotificationChange("riskAlerts", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Assessment Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Pending assessment notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.assessmentReminders}
                    onCheckedChange={(value) =>
                      handleNotificationChange("assessmentReminders", value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            {/* <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Appearance & Privacy
              </CardTitle>
            </CardHeader> */}
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 mr-2" />
                    ) : (
                      <Moon className="h-4 w-4 mr-2" />
                    )}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">
                      Show profile to other users
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showProfile}
                    onCheckedChange={(value) =>
                      handlePrivacyChange("showProfile", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Share Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Share usage analytics
                    </p>
                  </div>
                  <Switch
                    checked={privacy.shareAnalytics}
                    onCheckedChange={(value) =>
                      handlePrivacyChange("shareAnalytics", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Export</p>
                    <p className="text-sm text-muted-foreground">
                      Allow data export requests
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowDataExport}
                    onCheckedChange={(value) =>
                      handlePrivacyChange("allowDataExport", value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    Today at 9:23 AM
                  </p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Reports Generated</p>
                  <p className="text-sm text-muted-foreground">
                    3 reports this week
                  </p>
                </div>
                <Badge variant="outline">Normal</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Settings Updated</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
                <Badge variant="outline">Recent</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </HRLayout>
  );
}
