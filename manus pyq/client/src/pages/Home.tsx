import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, Download, Users, TrendingUp, Search, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const trendingPapersQuery = trpc.papers.getTrending.useQuery({ limit: 6 });
  const recentPapersQuery = trpc.papers.getRecent.useQuery({ limit: 6 });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">College PYQ Hub</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">Welcome, {user?.name}</span>
                <Button onClick={() => navigate("/dashboard")} variant="default">
                  Dashboard
                </Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())} variant="default">
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Your Complete PYQ Repository
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Access previous year question papers from your college. Search, download, and prepare for your exams with ease.
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 mb-12">
            <Input
              placeholder="Search papers by subject, semester, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="text-base"
            />
            <Button onClick={handleSearch} size="lg" className="px-8">
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">1000+</div>
                <div className="text-sm text-slate-600">Active Students</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">500+</div>
                <div className="text-sm text-slate-600">Question Papers</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900">5000+</div>
                <div className="text-sm text-slate-600">Downloads</div>
              </CardContent>
            </Card>
          </div>

          {!isAuthenticated && (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="px-8 py-6 text-lg"
            >
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Trending Papers Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-slate-900">Trending Papers</h2>
          </div>

          {trendingPapersQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : trendingPapersQuery.data && trendingPapersQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingPapersQuery.data.map((paper) => (
                <Card key={paper.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{paper.title}</CardTitle>
                    <CardDescription>
                      Semester {paper.semester} • {paper.academicYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Download className="w-4 h-4" />
                      <span>{paper.downloadCount} downloads</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No trending papers available yet
            </div>
          )}
        </div>
      </section>

      {/* Recent Papers Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Recently Uploaded</h2>

          {recentPapersQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : recentPapersQuery.data && recentPapersQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPapersQuery.data.map((paper) => (
                <Card key={paper.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{paper.title}</CardTitle>
                    <CardDescription>
                      {paper.examType.replace(/_/g, " ")} • {paper.academicYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {paper.description || "No description available"}
                    </p>
                    {isAuthenticated && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No recent papers available yet
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Choose Us?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-none bg-slate-50">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Comprehensive Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Access papers from multiple years, semesters, and exam types all in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-slate-50">
              <CardHeader>
                <Search className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Advanced Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Filter papers by department, semester, subject, and year for quick access.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-slate-50">
              <CardHeader>
                <Users className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Contribute papers, report issues, and help your peers prepare better.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to ace your exams?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students using College PYQ Hub to prepare effectively.
          </p>
          {!isAuthenticated && (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              variant="secondary"
              className="px-8 py-6 text-lg"
            >
              Get Started Now
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6" />
                <span className="text-lg font-bold">College PYQ Hub</span>
              </div>
              <p className="text-slate-400 text-sm">
                Your comprehensive repository for previous year question papers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Browse Papers</a></li>
                <li><a href="#" className="hover:text-white">Upload Paper</a></li>
                <li><a href="#" className="hover:text-white">Report Issue</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 College PYQ Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
