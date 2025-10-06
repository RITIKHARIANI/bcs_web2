"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NeuralButton } from "@/components/ui/neural-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Mail, ArrowRight } from "lucide-react";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Verification token is missing");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setMessage(data.message);
          setIsSuccess(true);

          // Redirect to login after success
          setTimeout(() => {
            router.push("/auth/login?message=Email verified! Please sign in.");
          }, 3000);
        } else {
          setError(data.error || "Failed to verify email");
        }
      } catch (error) {
        setError("Failed to verify email");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neural-light via-background to-cognition-teal/20 p-4">
        <Card className="cognitive-card max-w-md w-full">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4 text-center">
              <Mail className="h-12 w-12 text-neural-primary mx-auto" />
              <div className="h-4 bg-gradient-to-r from-neural-light/30 to-neural-primary/30 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gradient-to-r from-neural-primary/30 to-neural-light/30 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neural-light via-background to-cognition-teal/20 p-4">
      <div className="max-w-md w-full space-y-8">
        <Card className="cognitive-card">
          <CardHeader>
            <CardTitle className={isSuccess ? "text-green-600" : "text-red-600"}>
              {isSuccess ? (
                <>
                  <CheckCircle className="h-6 w-6 inline mr-2" />
                  Email Verified!
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 inline mr-2" />
                  Verification Failed
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isSuccess
                ? "Your email has been successfully verified"
                : "We couldn't verify your email address"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>

                <div className="text-center space-y-6">
                  <p className="text-sm text-muted-foreground pt-2">
                    Redirecting to login page...
                  </p>

                  <Link href="/auth/login">
                    <NeuralButton className="w-full">
                      Continue to Login
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </NeuralButton>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This could happen if the verification link has expired or has already been used.
                  </p>

                  <div className="space-y-2">
                    <Link href="/auth/register">
                      <NeuralButton variant="outline" className="w-full">
                        Register Again
                      </NeuralButton>
                    </Link>

                    <Link href="/auth/login">
                      <NeuralButton variant="ghost" className="w-full">
                        Back to Login
                      </NeuralButton>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}