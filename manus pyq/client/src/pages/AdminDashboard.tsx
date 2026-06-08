import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Users,
  BookOpen,
  Download,
  AlertCircle,
  Bell,
  LogOut,
  Upload,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  const statsQuery = trpc.dashboard.getAdminStats.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  const pendingReportsQuery = trpc.dashboard.getPendingReportsCount.useQuery();
  const pendingPapersQuery = trpc.dashboard.getPendingPapersCount.useQuery();

  // Check if user is admin
  if (!loading && user && user.role !== "admin" && user.role !== "super_admin") {
    navigate("/");
    return null;
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (loading || statsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const stats = statsQuery.data;

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
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              {user?.role.replace(/_/g, " ").toUpperCase()}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-slate-600">
            Manage papers, users, announcements, and monitor platform activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <Users className="w-4 h-4 text-blue-600 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAdmins || 0}</div>
              <Users className="w-4 h-4 text-purple-600 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Papers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPapers || 0}</div>
              <BookOpen className="w-4 h-4 text-green-600 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDownloads || 0}</div>
              <Download className="w-4 h-4 text-blue-600 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReportsQuery.data || 0}</div>
              <AlertCircle className="w-4 h-4 text-red-600 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAnnouncements || 0}</div>
              <Bell className="w-4 h-4 text-yellow-600 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="w-full" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Paper
              </Button>
              <Button className="w-full" variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full" variant="outline">
                <AlertCircle className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="papers">Papers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>
                  Overview of platform activity and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-slate-600">Active Users (Last 30 days)</span>
                    <span className="text-2xl font-bold">-</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-slate-600">Downloads This Month</span>
                    <span className="text-2xl font-bold">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Average Papers per Semester</span>
                    <span className="text-2xl font-bold">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-slate-500 py-8">
                  Activity log will appear here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Papers Tab */}
          <TabsContent value="papers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paper Management</CardTitle>
                <CardDescription>
                  Manage uploaded papers and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium">Pending Approval</p>
                      <p className="text-sm text-slate-600">Papers awaiting admin review</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {pendingPapersQuery.data || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium">Approved Papers</p>
                      <p className="text-sm text-slate-600">Ready for student access</p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {(stats?.totalPapers || 0) - (pendingPapersQuery.data || 0)}
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-4">Manage Papers</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage student and admin accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium">Total Students</p>
                      <p className="text-sm text-slate-600">Active student accounts</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats?.totalStudents || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium">Total Admins</p>
                      <p className="text-sm text-slate-600">Admin and super admin accounts</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {stats?.totalAdmins || 0}
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-4">View All Users</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paper Reports</CardTitle>
                <CardDescription>
                  Review and resolve student reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded border border-red-200">
                    <div>
                      <p className="font-medium text-red-900">Pending Reports</p>
                      <p className="text-sm text-red-700">Awaiting admin action</p>
                    </div>
                    <span className="text-2xl font-bold text-red-600">
                      {pendingReportsQuery.data || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium">Total Reports</p>
                      <p className="text-sm text-slate-600">All time reports</p>
                    </div>
                    <span className="text-2xl font-bold">
                      {stats?.totalReports || 0}
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-4">View Reports</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}
