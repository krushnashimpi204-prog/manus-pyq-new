import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Bookmark, BookOpen, Bell, User, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";

export default function StudentDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  const dashboardQuery = trpc.dashboard.getStudentDashboard.useQuery();
  const downloadStatsQuery = trpc.dashboard.getUserDownloadStats.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (loading || dashboardQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const dashboard = dashboardQuery.data;
  const stats = downloadStatsQuery.data;

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
            <span className="text-xl font-bold text-slate-900">College PYQ Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-slate-600">
            Manage your papers, bookmarks, and track your downloads.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalDownloads || 0}</div>
              <p className="text-xs text-slate-500 mt-2">
                This month: {stats?.thisMonth || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Bookmarked Papers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboard?.bookmarks.length || 0}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Saved for later
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.thisWeek || 0}</div>
              <p className="text-xs text-slate-500 mt-2">
                Downloads this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recent">Recent Papers</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          {/* Recent Papers Tab */}
          <TabsContent value="recent" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Recently Uploaded Papers</h2>
            {dashboard?.recentPapers && dashboard.recentPapers.length > 0 ? (
              <div className="grid gap-4">
                {dashboard.recentPapers.map((paper) => (
                  <Card key={paper.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{paper.title}</CardTitle>
                          <CardDescription>
                            Semester {paper.semester} • {paper.academicYear}
                          </CardDescription>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {paper.examType.replace(/_/g, " ")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-4">
                        {paper.description || "No description available"}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Bookmark className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  No recent papers available
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Latest Announcements</h2>
            {dashboard?.recentAnnouncements && dashboard.recentAnnouncements.length > 0 ? (
              <div className="grid gap-4">
                {dashboard.recentAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="border-l-4 border-l-blue-600">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          <CardDescription>
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          announcement.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : announcement.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {announcement.priority}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">{announcement.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  No announcements available
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Download History</h2>
            {dashboard?.downloadHistory && dashboard.downloadHistory.length > 0 ? (
              <div className="space-y-2">
                {dashboard.downloadHistory.map((download, idx) => (
                  <Card key={idx} className="hover:bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-900">Paper ID: {download.paperId}</p>
                          <p className="text-sm text-slate-500">
                            Downloaded on {new Date(download.downloadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  No downloads yet
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Saved Papers</h2>
            {dashboard?.bookmarks && dashboard.bookmarks.length > 0 ? (
              <div className="space-y-2">
                {dashboard.bookmarks.map((bookmark, idx) => (
                  <Card key={idx} className="hover:bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-900">Paper ID: {bookmark.paperId}</p>
                          <p className="text-sm text-slate-500">
                            Saved on {new Date(bookmark.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  No bookmarked papers yet
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Profile Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <p className="text-slate-900">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-slate-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Roll Number</label>
                <p className="text-slate-900">{user?.rollNumber || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Department</label>
                <p className="text-slate-900">{user?.department || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Semester</label>
                <p className="text-slate-900">{user?.semester || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Academic Year</label>
                <p className="text-slate-900">{user?.academicYear || "Not set"}</p>
              </div>
            </div>
            <Button className="mt-6">Edit Profile</Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
