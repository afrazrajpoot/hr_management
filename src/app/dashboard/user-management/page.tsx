"use client";

import { useState, useEffect, useCallback } from "react";
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
  ChevronLeft,
  CheckCircle,
  Trash2,
  AlertCircle,
  Verified,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDebounce } from "@/custom-hooks/useDebounce";

export default function AdminHRUsersPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [activeTab, setActiveTab] = useState("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    paid: false,
    amount: 0,
    quota: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const role =
        activeTab === "all" ? "" : activeTab === "hr" ? "HR" : "Employee";
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearch || "",
        role: role,
      }).toString();

      const response = await fetch(`/api/admin/users?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      setUsers(result.data || []);
      setPagination(result.pagination || pagination);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error("Failed to load users", {
        description: err.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, activeTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when search or tab changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, activeTab]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setEditForm({
      paid: user.paid || false,
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
      const response = await fetch(`/api/admin/users`, {
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
      toast.success("User updated successfully");
      fetchUsers();
      setEditingUserId(null);
    } catch (err: any) {
      toast.error("Failed to update user", {
        description: err.message || "An error occurred while updating the user",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      setVerifyingUserId(userId);
      const response = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action: "verify",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify user");
      }

      const result = await response.json();
      toast.success("User email verified successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error("Failed to verify user", {
        description: err.message || "An error occurred",
      });
    } finally {
      setVerifyingUserId(null);
    }
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/users?userId=${userToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toast.error("Failed to delete user", {
        description: err.message || "An error occurred",
      });
    }
  };

  if (loading && users.length === 0) {
    return (
      <HRLayout
        title="User Management"
        subtitle="Manage all users, verify accounts, and update settings"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="icon-wrapper-blue p-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Loading Users
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

  if (error && users.length === 0) {
    return (
      <HRLayout
        title="User Management"
        subtitle="Manage all users, verify accounts, and update settings"
      >
        <Card className="card-primary border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Failed to load users data. Please try again.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={fetchUsers}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </HRLayout>
    );
  }

  const totalUsers = pagination.total;
  const hrUsers = users.filter((u) => u.role === "HR").length;
  const employeeUsers = users.filter((u) => u.role === "Employee").length;
  const verifiedUsers = users.filter((u) => u.emailVerified).length;

  return (
    <HRLayout
      title="User Management"
      subtitle="Manage all users, verify accounts, and update settings"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and monitor all users across the platform
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <h3 className="text-2xl font-bold mt-1">{totalUsers}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="badge-blue text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {hrUsers} HR
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {employeeUsers} Employees
                  </Badge>
                </div>
              </div>
              <div className="icon-wrapper-blue">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Verified Users
                </p>
                <h3 className="text-2xl font-bold mt-1">{verifiedUsers}</h3>
                <div className="mt-2">
                  <Progress
                    value={
                      totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0
                    }
                    className="progress-bar-primary h-2"
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {totalUsers > 0
                      ? Math.round((verifiedUsers / totalUsers) * 100)
                      : 0}
                    % verified
                  </span>
                </div>
              </div>
              <div className="icon-wrapper-green">
                <Verified className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  HR Users
                </p>
                <h3 className="text-2xl font-bold mt-1">{hrUsers}</h3>
                <Badge className="badge-purple mt-2">
                  <Shield className="h-3 w-3 mr-1" />
                  HR Managers
                </Badge>
              </div>
              <div className="icon-wrapper-purple">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card-primary card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Employees
                </p>
                <h3 className="text-2xl font-bold mt-1">{employeeUsers}</h3>
                <Badge className="badge-amber mt-2">
                  <Users className="h-3 w-3 mr-1" />
                  Active Employees
                </Badge>
              </div>
              <div className="icon-wrapper-amber">
                <Users className="h-6 w-6 text-amber-600" />
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
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-muted/50 border-border focus:border-primary transition-colors"
                />
                {search !== debouncedSearch && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full lg:w-auto overflow-x-auto"
              >
                <TabsList className="w-full min-w-max">
                  <TabsTrigger value="all" className="whitespace-nowrap">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="hr" className="whitespace-nowrap">
                    HR
                  </TabsTrigger>
                  <TabsTrigger value="employee" className="whitespace-nowrap">
                    Employee
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {users.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {users.map((user: any) => (
                <Card key={user.id} className="card-primary card-hover group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="sidebar-user-avatar h-12 w-12 flex items-center justify-center relative">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <UserCheck className="h-6 w-6 text-white" />
                          )}
                          {user.emailVerified && (
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-background">
                              <Verified className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                            {user.firstName} {user.lastName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge
                              className={
                                user.role === "HR"
                                  ? "badge-blue text-xs"
                                  : "badge-green text-xs"
                              }
                            >
                              {user.role}
                            </Badge>
                            {!user.emailVerified && (
                              <Badge variant="outline" className="text-xs">
                                Unverified
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-muted"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-card border-border text-foreground shadow-lg"
                        >
                          <DropdownMenuLabel className="text-foreground font-semibold">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border" />
                          {!user.emailVerified && (
                            <DropdownMenuItem
                              onClick={() => handleVerifyUser(user.id)}
                              disabled={verifyingUserId === user.id}
                              className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10 text-foreground"
                            >
                              {verifyingUserId === user.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                              ) : (
                                <Verified className="h-4 w-4 mr-2 text-green-600" />
                              )}
                              Verify Account
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleEditClick(user)}
                            className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10 text-foreground"
                          >
                            <Edit className="h-4 w-4 mr-2 text-blue-600" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(user)}
                            className="cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
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
                          </div>
                          <Switch
                            id={`paid-${user.id}`}
                            checked={editForm.paid}
                            onCheckedChange={(checked) =>
                              setEditForm((prev) => ({
                                ...prev,
                                paid: checked,
                              }))
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

                        {user?.role?.toLowerCase() === "hr" && (
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
                        )}

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
                        {user.role === "HR" && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="assessment-item p-3 text-center">
                              <p className="text-sm text-muted-foreground">
                                Jobs Posted
                              </p>
                              <p className="text-2xl font-bold text-primary">
                                {user.jobCount || 0}
                              </p>
                            </div>
                            <div className="assessment-item p-3 text-center">
                              <p className="text-sm text-muted-foreground">
                                Applications
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                {user.applicationCount || 0}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Email Status
                            </span>
                            <Badge
                              className={
                                user.emailVerified
                                  ? "badge-green"
                                  : "badge-amber"
                              }
                            >
                              {user.emailVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                          {user.role === "HR" && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Payment Status
                                </span>
                                <Badge
                                  className={
                                    user.paid ? "badge-green" : "badge-blue"
                                  }
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
                            </>
                          )}
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
                            <p className="text-sm text-muted-foreground">
                              Phone
                            </p>
                            <p className="font-medium text-foreground">
                              {user.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Card className="card-primary">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      of {pagination.total} users
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage || loading}
                        className="gap-1 border-border hover:border-primary"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                              pageNum = i + 1;
                            } else if (
                              pagination.page >=
                              pagination.totalPages - 2
                            ) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = pagination.page - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  pagination.page === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={loading}
                                className={`min-w-8 h-8 ${
                                  pagination.page === pageNum
                                    ? "btn-gradient-primary"
                                    : "border-border"
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage || loading}
                        className="gap-1 border-border hover:border-primary"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="card-primary">
            <CardContent className="py-16 text-center">
              <div className="icon-wrapper-purple p-4 mb-4 inline-block">
                <Users className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Users Found
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              account for{" "}
              <strong>
                {userToDelete?.firstName} {userToDelete?.lastName}
              </strong>{" "}
              ({userToDelete?.email}) and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HRLayout>
  );
}
