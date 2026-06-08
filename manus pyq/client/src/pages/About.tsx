import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Target, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function About() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">About</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            About College PYQ Hub
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Empowering students with access to previous year question papers to excel in their academic journey
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 leading-relaxed">
              College PYQ Hub is dedicated to creating a centralized, secure, and user-friendly platform for accessing previous year question papers. Our mission is to help students prepare effectively for exams by providing easy access to past papers, understanding exam patterns, and building confidence.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We believe that access to quality study materials is fundamental to academic success. By digitizing and organizing question papers, we make it easier for students to find relevant resources and prepare comprehensively.
            </p>
          </CardContent>
        </Card>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-green-600" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We ensure that all students have easy access to question papers with an intuitive interface and powerful search capabilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-red-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We prioritize data security with role-based access control, encryption, and strict authentication to protect student information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We maintain high standards by verifying papers, organizing them systematically, and providing a clean, organized repository.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-orange-600" />
                Continuous Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We regularly update our platform with new features, papers, and improvements based on user feedback and evolving needs.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>
              What makes College PYQ Hub the best choice for your exam preparation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">Comprehensive collection of previous year question papers</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">Advanced search and filtering by subject, semester, year, and exam type</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">Bookmark and save papers for later reference</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">Download papers for offline access</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">Report incorrect or corrupted papers</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">Regular announcements about new papers and exam schedules</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span className="text-slate-600">Secure access with role-based permissions</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card>
          <CardHeader>
            <CardTitle>Built For Students</CardTitle>
            <CardDescription>
              By your college administration and development team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed">
              College PYQ Hub is developed and maintained by your college's administration and technical team. We're committed to providing you with the best platform for accessing study materials and preparing for your exams. Your feedback helps us improve continuously.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Button size="lg" onClick={() => navigate("/")}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
