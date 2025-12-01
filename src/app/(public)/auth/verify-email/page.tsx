"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function VerifyEmailContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Email verified successfully! Redirecting...');
        setIsSuccess(true);
        
        // Update session to reflect email verification
        await update();
        
        // Redirect based on role with proper path
        setTimeout(() => {
          const role = data.role || session?.user?.role;
          let redirectPath = '/employee-dashboard'; // Default fallback
          
          // Map role to correct dashboard path
          if (role === 'Admin') {
            redirectPath = '/dashboard';
          } else if (role === 'HR') {
            redirectPath = '/hr-dashboard';
          } else if (role === 'Employee') {
            redirectPath = '/employee-dashboard';
          }
          
          // Use window.location for hard navigation with verified flag
          // This bypasses middleware email verification check since JWT not immediately updated
          window.location.href = `${redirectPath}?verified=true`;
        }, 2000);
      } else {
        setMessage(data.error || 'Verification failed');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred during verification');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      setIsLoading(true);
      const emailToUse = email || session?.user?.email;
      
      if (!emailToUse) {
        setMessage('No email address found. Please sign in again.');
        return;
      }

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await response.json();
      setMessage(data.message || 'Verification email sent!');
      setIsSuccess(true);
    } catch (error) {
      setMessage('Failed to send verification email');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <CardHeader className="text-center space-y-4 pt-8">
            <motion.div 
              className="mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Mail className="h-10 w-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
              {email ? (
                <>
                  We've sent a verification link to<br />
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span>
                </>
              ) : (
                "We've sent a verification link to your email address"
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
                <Alert variant={isSuccess ? 'default' : 'destructive'} className={`border-l-4 ${isSuccess ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500'}`}>
                  <div className="flex items-start gap-3">
                    {isSuccess ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <AlertDescription className="flex-1 text-sm font-medium">{message}</AlertDescription>
                  </div>
                </Alert>
              </motion.div>
            )}
            
            {!token && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-300 space-y-3 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <p className="leading-relaxed font-medium">
                  Please check your inbox and click the verification link to continue.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Don't forget to check your spam folder if you don't see it.
                </p>
              </div>
            )}

            {!token && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <Button
                  onClick={resendVerification}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/sign-in')}
                  className="w-full h-12 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 rounded-lg font-medium"
                >
                  Back to Sign In
                </Button>
              </motion.div>
            )}

            {isLoading && token && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}