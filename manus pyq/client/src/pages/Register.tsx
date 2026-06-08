import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Register() {
  const [, navigate] = useLocation();
  const [accessCode, setAccessCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const verifyCodeMutation = trpc.auth.verifyAccessCode.useMutation();

  const handleVerifyCode = async () => {
    if (!accessCode.trim()) {
      toast.error("Please enter an access code");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyCodeMutation.mutateAsync({ code: accessCode });
      if (result.isValid) {
        setCodeVerified(true);
        toast.success("Access code verified! You can now proceed with registration.");
        // Store the verified code in localStorage for the registration form
        localStorage.setItem("verified-access-code", accessCode);
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast.error("Invalid access code. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to verify access code");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">College PYQ Hub</span>
          </div>
          <p className="text-slate-600">Join your college's question paper repository</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Register with Access Code</CardTitle>
            <CardDescription>
              Enter your college access code to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!codeVerified ? (
              <div className="space-y-6">
                {/* Access Code Input */}
                <div className="space-y-2">
                  <Label htmlFor="accessCode" className="text-base font-medium">
                    College Access Code
                  </Label>
                  <Input
                    id="accessCode"
                    placeholder="e.g., COLLEGE2026"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === "Enter" && handleVerifyCode()}
                    disabled={isVerifying}
                    className="text-base"
                  />
                  <p className="text-sm text-slate-500">
                    You can get this code from your college administration office
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">What is an access code?</p>
                      <p>
                        Your college provides a unique access code to verify that you are a legitimate student. This ensures only authorized students can access the platform.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || !accessCode.trim()}
                  className="w-full py-6 text-base"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Access Code"
                  )}
                </Button>

                {/* Help Text */}
                <div className="text-center text-sm text-slate-600">
                  <p>Don't have an access code?</p>
                  <p className="text-blue-600 font-medium">
                    Contact your college administration office
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                {/* Success State */}
                <div className="py-6">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Access Code Verified!
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Your access code has been successfully verified. You can now login to access the platform.
                  </p>
                </div>

                {/* Next Steps */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-green-900 mb-2">Next Steps:</p>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>Click the button below to proceed to login</li>
                    <li>Use your Manus OAuth credentials to sign in</li>
                    <li>Complete your profile information</li>
                    <li>Start accessing question papers</li>
                  </ol>
                </div>

                {/* Redirect Button */}
                <Button
                  onClick={() => navigate("/")}
                  className="w-full py-6 text-base"
                >
                  Continue to Login
                </Button>

                <p className="text-xs text-slate-500">
                  Redirecting automatically in a few seconds...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-600">
          <p>
            By registering, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
