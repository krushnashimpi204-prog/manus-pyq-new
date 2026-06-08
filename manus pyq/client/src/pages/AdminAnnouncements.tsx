import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Bell, Trash2, LogOut, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminAnnouncements() {
  const { user, loading: authLoading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // Check if user is admin
  if (!authLoading && user && user.role !== "admin" && user.role !== "super_admin") {
    navigate("/");
    return null;
  }

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "notice" as "notice" | "circular" | "exam_alert" | "update",
    priority: "medium" as "low" | "medium" | "high",
  });

  const createMutation = trpc.announcements.create.useMutation();
  const announcementsQuery = trpc.announcements.getAll.useQuery({ limit: 20, offset: 0 });
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value } as any));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
      });

      toast.success("Announcement created successfully!");
      setFormData({
        title: "",
        content: "",
        type: "notice",
        priority: "medium",
      });
      announcementsQuery.refetch();
    } catch (error) {
      toast.error("Failed to create announcement");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Announcements</span>
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Announcement</TabsTrigger>
            <TabsTrigger value="manage">Manage Announcements</TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Announcement
                </CardTitle>
                <CardDescription>
                  Post a notice, circular, exam alert, or update for all students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title" className="text-base font-medium mb-2 block">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Mid Semester Exam Schedule"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Type and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type */}
                    <div>
                      <Label htmlFor="type" className="text-base font-medium mb-2 block">
                        Announcement Type *
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notice">Notice</SelectItem>
                          <SelectItem value="circular">Circular</SelectItem>
                          <SelectItem value="exam_alert">Exam Alert</SelectItem>
                          <SelectItem value="update">Update</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div>
                      <Label htmlFor="priority" className="text-base font-medium mb-2 block">
                        Priority *
                      </Label>
                      <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <Label htmlFor="content" className="text-base font-medium mb-2 block">
                      Content *
                    </Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Write your announcement here..."
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={8}
                      required
                    />
                  </div>

                  {/* Priority Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Priority Levels:</strong> Low (regular updates) • Medium (important notices) • High (urgent alerts)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full py-6 text-base"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Post Announcement
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Manage Announcements
                </CardTitle>
                <CardDescription>
                  View and manage all announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {announcementsQuery.isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin w-8 h-8" />
                  </div>
                ) : announcementsQuery.data && announcementsQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {announcementsQuery.data.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{announcement.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {new Date(announcement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              announcement.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : announcement.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {announcement.priority}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {announcement.type}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                          {announcement.content}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">No announcements yet</p>
                    <p className="text-sm text-slate-500">Create your first announcement using the Create tab</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
