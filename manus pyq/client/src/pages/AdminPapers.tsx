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
import { Loader2, Upload, FileText, Trash2, Check, Clock, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminPapers() {
  const { user, loading: authLoading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // Check if user is admin
  if (!authLoading && user && user.role !== "admin" && user.role !== "super_admin") {
    navigate("/");
    return null;
  }

  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    departmentId: "",
    semester: "",
    academicYear: "",
    examType: "",
    description: "",
    fileUrl: "",
    fileKey: "",
  });

  const uploadMutation = trpc.papers.upload.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subjectId || !formData.departmentId || !formData.semester || !formData.academicYear || !formData.examType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        title: formData.title,
        subjectId: parseInt(formData.subjectId),
        departmentId: parseInt(formData.departmentId),
        semester: parseInt(formData.semester),
        academicYear: formData.academicYear,
        examType: formData.examType as any,
        description: formData.description,
        fileUrl: formData.fileUrl,
        fileKey: formData.fileKey,
      });

      toast.success("Paper uploaded successfully!");
      setFormData({
        title: "",
        subjectId: "",
        departmentId: "",
        semester: "",
        academicYear: "",
        examType: "",
        description: "",
        fileUrl: "",
        fileKey: "",
      });
    } catch (error) {
      toast.error("Failed to upload paper");
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
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Paper Management</span>
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
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Paper</TabsTrigger>
            <TabsTrigger value="manage">Manage Papers</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload New Paper
                </CardTitle>
                <CardDescription>
                  Add a new question paper to the repository
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title" className="text-base font-medium mb-2 block">
                      Paper Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Data Structures Mid Semester 2024"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Grid for select fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Department */}
                    <div>
                      <Label htmlFor="department" className="text-base font-medium mb-2 block">
                        Department *
                      </Label>
                      <Select value={formData.departmentId} onValueChange={(value) => handleSelectChange("departmentId", value)}>
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Computer Science</SelectItem>
                          <SelectItem value="2">Electronics</SelectItem>
                          <SelectItem value="3">Mechanical</SelectItem>
                          <SelectItem value="4">Civil</SelectItem>
                          <SelectItem value="5">Electrical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subject */}
                    <div>
                      <Label htmlFor="subject" className="text-base font-medium mb-2 block">
                        Subject *
                      </Label>
                      <Select value={formData.subjectId} onValueChange={(value) => handleSelectChange("subjectId", value)}>
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Data Structures</SelectItem>
                          <SelectItem value="2">Database Management</SelectItem>
                          <SelectItem value="3">Operating Systems</SelectItem>
                          <SelectItem value="4">Web Development</SelectItem>
                          <SelectItem value="5">Algorithms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Semester */}
                    <div>
                      <Label htmlFor="semester" className="text-base font-medium mb-2 block">
                        Semester *
                      </Label>
                      <Select value={formData.semester} onValueChange={(value) => handleSelectChange("semester", value)}>
                        <SelectTrigger id="semester">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              Semester {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Academic Year */}
                    <div>
                      <Label htmlFor="academicYear" className="text-base font-medium mb-2 block">
                        Academic Year *
                      </Label>
                      <Select value={formData.academicYear} onValueChange={(value) => handleSelectChange("academicYear", value)}>
                        <SelectTrigger id="academicYear">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Exam Type */}
                    <div>
                      <Label htmlFor="examType" className="text-base font-medium mb-2 block">
                        Exam Type *
                      </Label>
                      <Select value={formData.examType} onValueChange={(value) => handleSelectChange("examType", value)}>
                        <SelectTrigger id="examType">
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mid_semester">Mid Semester</SelectItem>
                          <SelectItem value="end_semester">End Semester</SelectItem>
                          <SelectItem value="practical">Practical</SelectItem>
                          <SelectItem value="unit_test">Unit Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-base font-medium mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Add any additional information about this paper..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>

                  {/* File Upload Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Upload your PDF file using the file upload feature and paste the returned file URL and key below.
                    </p>
                  </div>

                  {/* File URL and Key */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fileUrl" className="text-base font-medium mb-2 block">
                        File URL
                      </Label>
                      <Input
                        id="fileUrl"
                        name="fileUrl"
                        placeholder="Paste file URL here"
                        value={formData.fileUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fileKey" className="text-base font-medium mb-2 block">
                        File Key
                      </Label>
                      <Input
                        id="fileKey"
                        name="fileKey"
                        placeholder="Paste file key here"
                        value={formData.fileKey}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={uploadMutation.isPending}
                    className="w-full py-6 text-base"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Paper
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
                  <FileText className="w-5 h-5" />
                  Manage Papers
                </CardTitle>
                <CardDescription>
                  View and manage uploaded papers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Pending Papers */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-orange-900">Pending Approval</p>
                          <p className="text-sm text-orange-700">Papers awaiting admin review</p>
                        </div>
                      </div>
                      <Button variant="outline">View (0)</Button>
                    </div>
                  </div>

                  {/* Approved Papers */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Approved Papers</p>
                          <p className="text-sm text-green-700">Published and visible to students</p>
                        </div>
                      </div>
                      <Button variant="outline">View (0)</Button>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">No papers uploaded yet</p>
                    <p className="text-sm text-slate-500">Upload your first paper using the Upload tab</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
