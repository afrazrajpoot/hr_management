"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";

function VerifyEmailContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || session?.user?.email;

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setMessage("Please enter a valid 6-digit code");
      setIsSuccess(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Email verified successfully! Redirecting...");
        setIsSuccess(true);

        // Update session to reflect email verification
        await update();

        // Redirect based on role with proper path
        setTimeout(() => {
          const role = data.role || session?.user?.role;
          let redirectPath = "/employee-dashboard"; // Default fallback

          // Map role to correct dashboard path
          if (role === "Admin") {
            redirectPath = "/dashboard";
          } else if (role === "HR") {
            redirectPath = "/hr-dashboard";
          } else if (role === "Employee") {
            redirectPath = "/employee-dashboard";
          }

          // Use window.location for hard navigation with verified flag
          // This bypasses middleware email verification check since JWT not immediately updated
          window.location.href = `${redirectPath}?verified=true`;
        }, 2000);
      } else {
        setMessage(data.error || "Verification failed");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("An error occurred during verification");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      setIsLoading(true);

      if (!email) {
        setMessage("No email address found. Please sign in again.");
        return;
      }

      const emailLower = email.toLowerCase();

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailLower }),
      });

      const data = await response.json();
      setMessage(data.message || "Verification code sent!");
      setIsSuccess(true);
    } catch (error) {
      setMessage("Failed to send verification code");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-primary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-primary py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full card-primary backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center space-y-4 pt-8">
            <motion.div
              className="mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Lock className="h-10 w-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold gradient-text-primary">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              {email ? (
                <>
                  We've sent a 6-digit code to
                  <br />
                  <span className="font-semibold text-primary">{email}</span>
                </>
              ) : (
                "Enter the 6-digit code sent to your email"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  variant={isSuccess ? "default" : "destructive"}
                  className={`border-l-4 ${
                    isSuccess
                      ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                      : "bg-red-50 dark:bg-red-900/20 border-red-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isSuccess ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <AlertDescription className="flex-1 text-sm font-medium">
                      {message}
                    </AlertDescription>
                  </div>
                </Alert>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="otp"
                  className="text-sm font-medium text-foreground"
                >
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  className="text-center text-2xl tracking-widest h-14 font-mono"
                  maxLength={6}
                />
              </div>

              <Button
                onClick={handleVerify}
                disabled={isLoading || otp.length < 6}
                className="w-full h-12 btn-gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </div>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={resendVerification}
                disabled={isLoading}
                className="w-full h-10 border-input text-foreground hover:bg-secondary"
              >
                Resend Code
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => router.push("/auth/sign-in")}
                className="text-muted-foreground hover:text-foreground"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center gradient-bg-primary">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
