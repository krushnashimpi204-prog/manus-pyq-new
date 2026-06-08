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
import { Loader2, Download, Bookmark, Search, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function SearchPapers() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("");
  const [examType, setExamType] = useState<string>("");

  const searchQuery = trpc.papers.search.useQuery(
    {
      searchTerm: searchTerm || undefined,
      departmentId: department ? parseInt(department) : undefined,
      semesterId: semester ? parseInt(semester) : undefined,
      subjectId: subject ? parseInt(subject) : undefined,
      academicYear: academicYear || undefined,
      examType: examType || undefined,
      limit: 20,
      offset: 0,
    },
    { enabled: true }
  );

  const handleSearch = () => {
    searchQuery.refetch();
  };

  const handleReset = () => {
    setSearchTerm("");
    setDepartment("");
    setSemester("");
    setSubject("");
    setAcademicYear("");
    setExamType("");
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
            <Search className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Search Papers</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter
            </CardTitle>
            <CardDescription>
              Use the filters below to find papers that match your criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Search Term */}
              <div>
                <Label htmlFor="searchTerm" className="text-base font-medium mb-2 block">
                  Search by Title or Description
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="searchTerm"
                    placeholder="Enter keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} variant="default">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Department */}
                <div>
                  <Label htmlFor="department" className="text-sm font-medium mb-2 block">
                    Department
                  </Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      <SelectItem value="1">Computer Science</SelectItem>
                      <SelectItem value="2">Electronics</SelectItem>
                      <SelectItem value="3">Mechanical</SelectItem>
                      <SelectItem value="4">Civil</SelectItem>
                      <SelectItem value="5">Electrical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Semester */}
                <div>
                  <Label htmlFor="semester" className="text-sm font-medium mb-2 block">
                    Semester
                  </Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger id="semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Semesters</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
                    Subject
                  </Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Subjects</SelectItem>
                      <SelectItem value="1">Data Structures</SelectItem>
                      <SelectItem value="2">Database Management</SelectItem>
                      <SelectItem value="3">Operating Systems</SelectItem>
                      <SelectItem value="4">Web Development</SelectItem>
                      <SelectItem value="5">Algorithms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Academic Year */}
                <div>
                  <Label htmlFor="academicYear" className="text-sm font-medium mb-2 block">
                    Academic Year
                  </Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger id="academicYear">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Years</SelectItem>
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
                  <Label htmlFor="examType" className="text-sm font-medium mb-2 block">
                    Exam Type
                  </Label>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger id="examType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="mid_semester">Mid Semester</SelectItem>
                      <SelectItem value="end_semester">End Semester</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="unit_test">Unit Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Search Results
            {searchQuery.data && searchQuery.data.length > 0 && (
              <span className="text-lg font-normal text-slate-600 ml-2">
                ({searchQuery.data.length} papers found)
              </span>
            )}
          </h2>

          {searchQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : searchQuery.data && searchQuery.data.length > 0 ? (
            <div className="grid gap-6">
              {searchQuery.data.map((paper) => (
                <Card key={paper.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{paper.title}</CardTitle>
                        <CardDescription className="text-base">
                          Semester {paper.semester} • {paper.academicYear} • {paper.examType.replace(/_/g, " ")}
                        </CardDescription>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {paper.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {paper.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {paper.downloadCount} downloads
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No papers found</h3>
                <p className="text-slate-600">
                  Try adjusting your search filters or search terms
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
