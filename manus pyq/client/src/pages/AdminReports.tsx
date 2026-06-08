import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, XCircle, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminReports() {
  const { user, loading: authLoading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Check if user is admin
  if (!authLoading && user && user.role !== "admin" && user.role !== "super_admin") {
    navigate("/");
    return null;
  }

  const reportsQuery = trpc.announcements.getReports.useQuery({ status: "pending" });
  const resolveReportMutation = trpc.announcements.resolveReport.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleResolve = async (reportId: number, status: "resolved" | "rejected") => {
    if (!resolutionNotes.trim()) {
      toast.error("Please add resolution notes");
      return;
    }

    try {
      await resolveReportMutation.mutateAsync({
        reportId,
        status,
        resolutionNotes,
      });

      toast.success(`Report ${status} successfully!`);
      setSelectedReport(null);
      setResolutionNotes("");
      reportsQuery.refetch();
    } catch (error) {
      toast.error("Failed to resolve report");
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
            <AlertCircle className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Paper Reports</span>
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
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {/* Pending Reports */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Pending Reports
                </CardTitle>
                <CardDescription>
                  Reports awaiting your action
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportsQuery.isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin w-8 h-8" />
                  </div>
                ) : reportsQuery.data && reportsQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {reportsQuery.data.map((report: any) => (
                      <div
                        key={report.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedReport === report.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Paper ID: {report.paperId}
                            </h3>
                            <p className="text-sm text-slate-600">
                              Reported by: {report.reportedBy}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">
                            {report.reason.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        {report.description && (
                          <p className="text-slate-600 text-sm mb-3">
                            {report.description}
                          </p>
                        )}

                        {selectedReport === report.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-2">
                                Resolution Notes *
                              </label>
                              <Textarea
                                placeholder="Explain your resolution..."
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                rows={4}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleResolve(report.id, "resolved")}
                                disabled={resolveReportMutation.isPending}
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Resolve
                              </Button>
                              <Button
                                onClick={() => handleResolve(report.id, "rejected")}
                                disabled={resolveReportMutation.isPending}
                                variant="outline"
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">No pending reports</p>
                    <p className="text-sm text-slate-500">All reports have been addressed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resolved Reports */}
          <TabsContent value="resolved">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Resolved Reports
                </CardTitle>
                <CardDescription>
                  Reports that have been addressed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No resolved reports yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected Reports */}
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Rejected Reports
                </CardTitle>
                <CardDescription>
                  Reports that were rejected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No rejected reports yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">0</div>
                <p className="text-sm text-slate-600">Pending Reports</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">0</div>
                <p className="text-sm text-slate-600">Resolved Reports</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">0</div>
                <p className="text-sm text-slate-600">Rejected Reports</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
