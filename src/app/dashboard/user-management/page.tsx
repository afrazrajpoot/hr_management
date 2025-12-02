// /app/admin/hr-users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HRLayout } from '@/components/admin/layout/admin-layout';
import { Search, Download, Eye, Edit, UserCheck, Building, DollarSign, Calendar, Mail, Phone, Users, Briefcase, Shield, Save, X, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';


export default function AdminHRUsersPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    paid: false,
    amount: 0,
    quota: 0
  });

  useEffect(() => {
    fetchHRUsers();
  }, [search]);

  const fetchHRUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '50',
        search: search || '',
      }).toString();

      const response = await fetch(`/api/admin/get-companies?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch HR users');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    //   toast({
    //     title: "Error",
    //     description: "Failed to load HR users",
    //     variant: "destructive",
    //   });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setEditForm({
      paid: user.paid,
      amount: user.amount || 0,
      quota: user.quota || 0
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ paid: false, amount: 0, quota: 0 });
  };

  const handleSaveEdit = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/get-companies`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...editForm
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const result = await response.json();
      
      // Update local state
      setData((prevData: any) => ({
        ...prevData,
        data: {
          ...prevData.data,
          users: prevData.data.users.map((user: any) =>
            user.id === userId ? { ...user, ...result.user } : user
          )
        },
        statistics: {
          ...prevData.statistics,
          paidUsers: result.user.paid 
            ? prevData.statistics.paidUsers + 1 
            : prevData.statistics.paidUsers - 1,
          unpaidUsers: result.user.paid 
            ? prevData.statistics.unpaidUsers - 1 
            : prevData.statistics.unpaidUsers + 1
        }
      }));

      setEditingUserId(null);
      
    //   toast({
    //     title: "Success",
    //     description: "User updated successfully",
    //   });
    } catch (err: any) {
    //   toast({
    //     title: "Error",
    //     description: err.message || "Failed to update user",
    //     variant: "destructive",
    //   });
    }
  };

  const handleExport = () => {
    // toast({
    //   title: "Export Started",
    //   description: "Exporting HR users data...",
    // });
    // Implement export logic here
  };

  if (loading) {
    return (
      <HRLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </HRLayout>
    );
  }

  if (error) {
    return (
      <HRLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Failed to load HR users data. Please try again.</p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={fetchHRUsers}>
                Retry
              </Button>
            </CardFooter>
          </Card>
        </div>
      </HRLayout>
    );
  }

  const { statistics, data: apiData, requestedBy } = data || {};
  const { users = [], companies = [] } = apiData || {};

  const filteredUsers = users.filter((user: any) => {
    if (activeTab === 'paid') return user.paid;
    if (activeTab === 'unpaid') return !user.paid;
    if (activeTab === 'with-company') return user.hasCompany;
    if (activeTab === 'without-company') return !user.hasCompany;
    return true;
  });

  return (
    <HRLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">HR Users Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage HR users, update payment status, quota, and amount
              </p>
              {requestedBy && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>
                    Admin: <span className="font-semibold text-primary">{requestedBy.name}</span>
                  </span>
                </div>
              )}
            </div>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total HR Users</p>
                    <h3 className="text-3xl font-bold mt-2">{statistics?.totalHrUsers || 0}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm">
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {statistics?.withCompany || 0} with company
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    {statistics?.withoutCompany || 0} without
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid Users</p>
                    <h3 className="text-3xl font-bold mt-2">{statistics?.paidUsers || 0}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-muted-foreground">Unpaid: {statistics?.unpaidUsers || 0}</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {statistics?.totalHrUsers ? 
                      `${Math.round((statistics.paidUsers / statistics.totalHrUsers) * 100)}%` : 
                      '0%'} paid
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <h3 className="text-3xl font-bold mt-2">
                      ${users.reduce((sum: number, user: any) => sum + (user.amount || 0), 0).toLocaleString()}
                    </h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Total amount collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Quota</p>
                    <h3 className="text-3xl font-bold mt-2">
                      {users.reduce((sum: number, user: any) => sum + (user.quota || 0), 0)}
                    </h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Total quota allocated
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search HR users by name, email, or HR ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                  <TabsList className="grid grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                    <TabsTrigger value="with-company">With Company</TabsTrigger>
                    <TabsTrigger value="without-company">Without Company</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Users Grid */}
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsers.map((user: any) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-12 w-12 rounded-full"
                              />
                            ) : (
                              <UserCheck className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          {user.paid && (
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                              <DollarSign className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {user.firstName} {user.lastName}
                          </CardTitle>
                          <CardDescription>{user.email}</CardDescription>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              HR User
                            </Badge>
                            {user.hrId && (
                              <Badge variant="outline" className="text-xs">
                                ID: {user.hrId}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEditClick(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Company Info */}
                    {user.company ? (
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold">Company</h4>
                        </div>
                        <p className="font-medium">{user.company.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {user.company.companyDetail?.industry || 'No industry specified'}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 p-4">
                        <p className="font-medium text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          No Company Assigned
                        </p>
                      </div>
                    )}

                    {/* Editable Fields */}
                    {editingUserId === user.id ? (
                      <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`paid-${user.id}`} className="flex items-center gap-2">
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
                                    Toggle to mark user as paid/unpaid. Paid users have full access to all features.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Switch
                            id={`paid-${user.id}`}
                            checked={editForm.paid}
                            onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, paid: checked }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`amount-${user.id}`}>Amount ($)</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    The amount paid by the user. This affects revenue calculations.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Input
                            id={`amount-${user.id}`}
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`quota-${user.id}`}>Quota</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    Number of job posts allowed. Set to 0 for unlimited access.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Input
                            id={`quota-${user.id}`}
                            type="number"
                            value={editForm.quota}
                            onChange={(e) => setEditForm(prev => ({ ...prev, quota: parseInt(e.target.value) || 0 }))}
                            placeholder="Enter quota"
                            min="0"
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => handleSaveEdit(user.id)} className="gap-1">
                            <Save className="h-3 w-3" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit} className="gap-1">
                            <X className="h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Display Fields */
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border bg-card p-3">
                            <p className="text-sm text-muted-foreground">Jobs Posted</p>
                            <p className="text-2xl font-bold text-primary">{user.jobCount}</p>
                          </div>
                          <div className="rounded-lg border bg-card p-3">
                            <p className="text-sm text-muted-foreground">Applications</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{user.applicationCount}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Payment Status</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">
                                      {user.paid 
                                        ? 'User has paid and has full access to all features'
                                        : 'User has not paid. Limited access to features.'}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Badge variant={user.paid ? "default" : "destructive"}>
                              {user.paid ? 'Paid' : 'Unpaid'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Amount</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Amount paid by the user</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <span className="font-semibold">${user.amount || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Quota</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Number of job posts allowed</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <span className="font-semibold">{user.quota || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Joined</span>
                            <span className="text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* User Info */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      {user.phoneNumber && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{user.phoneNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <UserCheck className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No HR Users Found</h3>
                <p className="text-muted-foreground mb-6">
                  {search ? 'Try a different search term' : 'Try adjusting your filters'}
                </p>
                <Button onClick={() => {
                  setSearch('');
                  setActiveTab('all');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </HRLayout>
  );
}