"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { HRLayout } from "@/components/admin/layout/admin-layout";
import {
  Search,
  Download,
  Eye,
  Edit,
  UserCheck,
  Building,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Users,
  Briefcase,
  Shield,
  Save,
  X,
  Info,
  Loader2,
  Plus,
  Filter,
  MoreHorizontal,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminHRUsersPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    paid: false,
    amount: 0,
    quota: 0,
  });

  useEffect(() => {
    fetchHRUsers();
  }, [search]);

  const fetchHRUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "50",
        search: search || "",
      }).toString();

      const response = await fetch(`/api/admin/get-companies?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch HR users");
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error("Failed to load HR users", {
        description: err.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setEditForm({
      paid: user.paid,
      amount: user.amount || 0,
      quota: user.quota || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ paid: false, amount: 0, quota: 0 });
  };

  const handleSaveEdit = async (userId: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/get-companies`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...editForm,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const result = await response.json();

      // Update local state
      setData((prevData: any) => ({
        ...prevData,
        data: {
          ...prevData.data,
          users: prevData.data.users.map((user: any) =>
            user.id === userId ? { ...user, ...result.user } : user
          ),
        },
        statistics: {
          ...prevData.statistics,
          paidUsers: result.user.paid
            ? prevData.statistics.paidUsers + 1
            : prevData.statistics.paidUsers - 1,
          unpaidUsers: result.user.paid
            ? prevData.statistics.unpaidUsers - 1
            : prevData.statistics.unpaidUsers + 1,
        },
      }));

      setEditingUserId(null);
      toast.success("User updated successfully", {
        description: `Updated payment status, amount, and quota for ${result.user.firstName} ${result.user.lastName}`,
      });
    } catch (err: any) {
      toast.error("Failed to update user", {
        description: err.message || "An error occurred while updating the user",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    toast.success("Export Started", {
      description: "Exporting HR users data...",
    });
  };

  if (loading) {
    return (
      <HRLayout
        title="HR Users Management"
        subtitle="Manage HR users, update payment status, quota, and amount"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="icon-wrapper-blue p-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Loading HR Users
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait while we fetch the data...
              </p>
            </div>
          </div>
        </div>
      </HRLayout>
    );
  }

  if (error) {
    return (
      <HRLayout
        title="HR Users Management"
        subtitle="Manage HR users, update payment status, quota, and amount"
      >
        <Card className="card-primary border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Failed to load HR users data. Please try again.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={fetchHRUsers}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </HRLayout>
    );
  }

  const { statistics, data: apiData, requestedBy } = data || {};
  const { users = [], companies = [] } = apiData || {};

  const filteredUsers = users.filter((user: any) => {
    if (activeTab === "paid") return user.paid;
    if (activeTab === "unpaid") return !user.paid;
    if (activeTab === "with-company") return user.hasCompany;
    if (activeTab === "without-company") return !user.hasCompany;
    return true;
  });

  const totalRevenue = users.reduce(
    (sum: number, user: any) => sum + (user.amount || 0),
    0
  );
  const totalQuota = users.reduce(
    (sum: number, user: any) => sum + (user.quota || 0),
    0
  );
  const paidPercentage = statistics?.totalHrUsers
    ? Math.round((statistics.paidUsers / statistics.totalHrUsers) * 100)
    : 0;

  return (
    <HRLayout
      title="HR Users Management"
      subtitle="Manage HR users, update payment status, quota, and amount"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">HR Users</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and monitor all HR users across the platform
            </p>
            {requestedBy && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <div className="icon-wrapper-blue p-1">
                  <Shield className="h-3 w-3 text-blue-600" />
                </div>
                <span>
                  Admin:{" "}
                  <span className="font-semibold text-primary">
                    {requestedBy.name}
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hover:bg-muted">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="btn-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add HR User
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total HR Users
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {statistics?.totalHrUsers || 0}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="badge-green text-xs">
                    <Building className="h-3 w-3 mr-1" />
                    {statistics?.withCompany || 0} with company
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {statistics?.withoutCompany || 0} without
                  </Badge>
                </div>
              </div>
              <div className="icon-wrapper-blue">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Paid Users
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {statistics?.paidUsers || 0}
                </h3>
                <div className="mt-2">
                  <Progress
                    value={paidPercentage}
                    className="progress-bar-primary h-2"
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {paidPercentage}% paid rate
                  </span>
                </div>
              </div>
              <div className="icon-wrapper-green">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ${totalRevenue.toLocaleString()}
                </h3>
                <Badge className="badge-purple mt-2">
                  <Target className="h-3 w-3 mr-1" />
                  Total collected
                </Badge>
              </div>
              <div className="icon-wrapper-purple">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Quota
                </p>
                <h3 className="text-2xl font-bold mt-1">{totalQuota}</h3>
                <Badge className="badge-amber mt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  Quota allocated
                </Badge>
              </div>
              <div className="icon-wrapper-amber">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="card-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search HR users by name, email, or HR ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/50 border-border"
                />
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full lg:w-auto overflow-x-auto"
              >
                <TabsList className="w-full min-w-max">
                  <TabsTrigger value="all" className="whitespace-nowrap">All</TabsTrigger>
                  <TabsTrigger value="paid" className="whitespace-nowrap">Paid</TabsTrigger>
                  <TabsTrigger value="unpaid" className="whitespace-nowrap">Unpaid</TabsTrigger>
                  <TabsTrigger value="with-company" className="whitespace-nowrap">With Company</TabsTrigger>
                  <TabsTrigger value="without-company" className="whitespace-nowrap">
                    Without Company
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user: any) => (
              <Card key={user.id} className="card-primary card-hover group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="sidebar-user-avatar h-12 w-12 flex items-center justify-center">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <UserCheck className="h-6 w-6 text-white" />
                        )}
                        {user.paid && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-background">
                            <DollarSign className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                          {user.firstName} {user.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge className="badge-blue text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            HR User
                          </Badge>
                          {user.hrId && (
                            <Badge variant="outline" className="text-xs">
                              ID: {user.hrId.slice(0, 8)}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(user)}
                      className="h-8 w-8 hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Company Info */}
                  {user.company ? (
                    <div className="assessment-item p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="icon-wrapper-blue p-2">
                          <Building className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            Company
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.company.companyDetail?.industry ||
                              "No industry specified"}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-foreground">
                        {user.company.name}
                      </p>
                    </div>
                  ) : (
                    <div className="assessment-item p-3 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-900/10">
                      <p className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        No Company Assigned
                      </p>
                    </div>
                  )}

                  {/* Editable Fields */}
                  {editingUserId === user.id ? (
                    <div className="assessment-item p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`paid-${user.id}`}
                            className="flex items-center gap-2 text-sm font-medium"
                          >
                            <DollarSign className="h-4 w-4" />
                            Payment Status
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Toggle to mark user as paid/unpaid. Paid users
                                  have full access.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Switch
                          id={`paid-${user.id}`}
                          checked={editForm.paid}
                          onCheckedChange={(checked) =>
                            setEditForm((prev) => ({ ...prev, paid: checked }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={`amount-${user.id}`}
                          className="text-sm font-medium"
                        >
                          Amount ($)
                        </Label>
                        <Input
                          id={`amount-${user.id}`}
                          type="number"
                          value={editForm.amount}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              amount: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="bg-muted/50 border-border"
                          placeholder="Enter amount"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={`quota-${user.id}`}
                          className="text-sm font-medium"
                        >
                          Quota
                        </Label>
                        <Input
                          id={`quota-${user.id}`}
                          type="number"
                          value={editForm.quota}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              quota: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="bg-muted/50 border-border"
                          placeholder="Enter quota"
                          min="0"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(user.id)}
                          className="gap-1 hover:bg-primary"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="gap-1 hover:bg-muted"
                          disabled={saving}
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Display Fields */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="assessment-item p-3 text-center">
                          <p className="text-sm text-muted-foreground">
                            Jobs Posted
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {user.jobCount}
                          </p>
                        </div>
                        <div className="assessment-item p-3 text-center">
                          <p className="text-sm text-muted-foreground">
                            Applications
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {user.applicationCount}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Payment Status
                          </span>
                          <Badge
                            className={user.paid ? "badge-green" : "badge-blue"}
                          >
                            {user.paid ? "Paid" : "Unpaid"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Amount
                          </span>
                          <span className="font-semibold text-foreground">
                            ${user.amount || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Quota
                          </span>
                          <span className="font-semibold text-foreground">
                            {user.quota || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Joined
                          </span>
                          <span className="text-sm text-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* User Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                      <div className="icon-wrapper-green p-2">
                        <Mail className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {user.phoneNumber && (
                      <div className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                        <div className="icon-wrapper-blue p-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium text-foreground">
                            {user.phoneNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="w-full hover:bg-primary hover:text-primary-foreground transition-all group/btn"
                  >
                    <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    View Details
                    <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-primary">
            <CardContent className="py-16 text-center">
              <div className="icon-wrapper-purple p-4 mb-4 inline-block">
                <Users className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No HR Users Found
              </h3>
              <p className="text-muted-foreground mb-6">
                {search
                  ? "Try a different search term"
                  : "Try adjusting your filters"}
              </p>
              <Button
                variant="outline"
                className="hover:bg-muted"
                onClick={() => {
                  setSearch("");
                  setActiveTab("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </HRLayout>
  );
}
