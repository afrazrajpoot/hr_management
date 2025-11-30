// app/auth/verify-email/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  useEffect(() => {
    if (session?.user?.emailVerified) {
      router.push(session.redirectTo || '/dashboard');
    }
  }, [session, router]);

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
        // Session will update automatically and redirect
      } else {
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setMessage('An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email }),
      });

      const data = await response.json();
      setMessage(data.message || 'Verification email sent!');
    } catch (error) {
      setMessage('Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.includes('successfully') ? 'default' : 'destructive'}>
              {message.includes('successfully') ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-center text-sm text-gray-600">
            <p>Please check your inbox and click the verification link to continue.</p>
          </div>

          <Button
            onClick={resendVerification}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Resend Verification Email'}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/auth/sign-in')}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}