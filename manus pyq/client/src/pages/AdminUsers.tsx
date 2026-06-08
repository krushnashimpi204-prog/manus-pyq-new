import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  Search,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";

export default function AdminUsers() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<'all' | 'student' | 'admin' | 'super_admin'>('all');

  // Check if user is super admin
  if (!loading && user?.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
              <p className="text-slate-600">
                Only super admins can access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const usersQuery = trpc.auth.getAllUsers.useQuery({ limit: 100, offset: 0 });
  const promoteUserMutation = trpc.auth.promoteToAdmin.useMutation();
  const demoteUserMutation = trpc.auth.demoteAdmin.useMutation();

  const handlePromoteUser = async (userId: number) => {
    try {
      await promoteUserMutation.mutateAsync({ userId });
      usersQuery.refetch();
      toast.success("User promoted to admin successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to promote user");
    }
  };

  const handleDemoteUser = async (userId: number) => {
    try {
      await demoteUserMutation.mutateAsync({ userId });
      usersQuery.refetch();
      toast.success("User demoted to student successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to demote user");
    }
  };

  const filteredUsers = usersQuery.data?.filter((u: any) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  if (loading || usersQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">Manage Users</span>
            </div>
            <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              Super Admin
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Search and Filter */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search & Filter Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div>
                  <Label htmlFor="search" className="mb-2 block">
                    Search by Name or Email
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <Label htmlFor="role" className="mb-2 block">
                    Filter by Role
                  </Label>
                  <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as 'all' | 'student' | 'admin' | 'super_admin')}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((u: any) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {u.name || u.email}
                          </h3>
                          {u.role === "super_admin" && (
                            <Shield className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{u.email}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Role: <span className="capitalize font-medium">{u.role.replace(/_/g, " ")}</span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {u.role === "student" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePromoteUser(u.id)}
                            disabled={promoteUserMutation.isPending}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            {promoteUserMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Promote to Admin
                              </>
                            )}
                          </Button>
                        )}

                        {u.role === "admin" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDemoteUser(u.id)}
                            disabled={demoteUserMutation.isPending}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            {demoteUserMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Demote to Student
                              </>
                            )}
                          </Button>
                        )}

                        {u.role === "super_admin" && (
                          <span className="text-xs font-medium text-purple-600 px-3 py-2 bg-purple-50 rounded">
                            Super Admin (Protected)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Role Management</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Students</strong> can search, download, and bookmark papers</li>
                    <li>• <strong>Admins</strong> can upload papers, create announcements, and manage reports</li>
                    <li>• <strong>Super Admin</strong> is protected and can manage all users</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
