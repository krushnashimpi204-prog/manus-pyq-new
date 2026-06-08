import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "What is College PYQ Hub?",
    answer: "College PYQ Hub is a centralized repository of previous year question papers from your college. It helps students access past exam papers, prepare for exams, and understand the exam patterns and question types.",
  },
  {
    id: 2,
    question: "How do I register on the platform?",
    answer: "To register, you need a valid college access code provided by your college administration. Visit the registration page, enter your access code, and follow the OAuth login process to create your account.",
  },
  {
    id: 3,
    question: "What is a college access code?",
    answer: "A college access code is a unique code provided by your college administration to verify that you are a legitimate student. This ensures only authorized students can access the platform and maintain data security.",
  },
  {
    id: 4,
    question: "Can I download papers offline?",
    answer: "Yes, you can download papers in PDF format and view them offline. Once downloaded, you can access the papers anytime without an internet connection.",
  },
  {
    id: 5,
    question: "How do I bookmark papers?",
    answer: "Click the bookmark icon on any paper to save it to your bookmarks. You can access all your bookmarked papers from your dashboard under the 'Bookmarks' section.",
  },
  {
    id: 6,
    question: "What should I do if I find an incorrect paper?",
    answer: "If you find an incorrect or corrupted paper, you can report it using the report feature. Click the report button on the paper, select the reason, and provide details. Admins will review and resolve the issue.",
  },
  {
    id: 7,
    question: "Can I upload papers to the platform?",
    answer: "Only admins and super admins can upload papers. If you're an admin, you can access the paper management section from your admin dashboard to upload new papers.",
  },
  {
    id: 8,
    question: "How often are new papers added?",
    answer: "New papers are added regularly by college admins. The frequency depends on your college's update schedule. Check the announcements section for updates about newly added papers.",
  },
  {
    id: 9,
    question: "Is my data secure?",
    answer: "Yes, we take data security seriously. All data is encrypted, and access is controlled through role-based permissions. Only authorized users can access specific papers and information.",
  },
  {
    id: 10,
    question: "How do I reset my password?",
    answer: "You can reset your password through the login page. Click 'Forgot Password' and follow the instructions sent to your registered email address.",
  },
];

export default function FAQ() {
  const [, navigate] = useLocation();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">FAQ</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600">
            Find answers to common questions about College PYQ Hub
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {item.question}
                    </h3>
                    {expandedId === item.id && (
                      <p className="text-slate-600 mt-3 leading-relaxed">
                        {item.answer}
                      </p>
                    )}
                  </div>
                  <div className="text-slate-400 flex-shrink-0">
                    {expandedId === item.id ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Didn't find your answer?
            </h3>
            <p className="text-slate-600 mb-4">
              If you have additional questions, please contact us through the contact page or reach out to your college administration.
            </p>
            <Button onClick={() => navigate("/contact")}>
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
