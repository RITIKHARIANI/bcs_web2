"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NeuralButton } from "@/components/ui/neural-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Resend verification email state
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!resendEmail.trim()) {
      setResendMessage("Please enter your email address");
      return;
    }

    setIsResending(true);
    setResendMessage("");

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setResendMessage(`Rate limited. Please wait ${data.retryAfter} minute${data.retryAfter > 1 ? 's' : ''} before trying again.`);
      } else if (response.ok) {
        setResendMessage("If an account with this email exists and is unverified, a verification email has been sent. Please check your inbox.");
        setResendCooldown(60);
        setResendEmail(""); // Clear the input
      } else {
        setResendMessage(data.error || "Failed to send verification email. Please try again.");
      }
    } catch (error) {
      setResendMessage("An error occurred. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyClick = async () => {
    if (!token) {
      setError("Verification token is missing");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
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
      setIsVerifying(false);
    }
  };

  // Handle missing token
  useEffect(() => {
    if (!token && !error) {
      setError("Verification token is missing");
    }
  }, [token, error]);

  // Show initial verification prompt if not yet verified and no error
  if (!isSuccess && !error && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neural-light via-background to-cognition-teal/20 p-4">
        <div className="max-w-md w-full space-y-8">
          <Card className="cognitive-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-neural-primary">
                <Mail className="h-6 w-6 mr-2" />
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-center">
                Click the button below to verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="bg-neural-light/10 p-6 rounded-lg">
                  <ShieldCheck className="h-16 w-16 text-neural-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Thank you for registering! To complete your account setup and
                    ensure the security of your account, please verify your email address.
                  </p>
                </div>

                <NeuralButton
                  onClick={handleVerifyClick}
                  disabled={isVerifying}
                  className="w-full"
                  size="lg"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify My Email
                    </>
                  )}
                </NeuralButton>

                <p className="text-xs text-muted-foreground">
                  This link is valid for 24 hours and can only be used once.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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

                <div className="text-center space-y-8">
                  <p className="text-sm text-muted-foreground pt-2 pb-4">
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

                  {/* Resend verification email section */}
                  <div className="border-t pt-4 text-left space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Need a new verification link?
                    </p>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      disabled={isResending || resendCooldown > 0}
                      className="border-neural-light/30 focus:border-neural-primary"
                    />
                    <NeuralButton
                      onClick={handleResendVerification}
                      disabled={!resendEmail.trim() || isResending || resendCooldown > 0}
                      className="w-full"
                      variant="neural"
                    >
                      {resendCooldown > 0
                        ? `Wait ${resendCooldown}s`
                        : isResending
                        ? "Sending..."
                        : "Resend Verification Email"
                      }
                    </NeuralButton>
                    {resendMessage && (
                      <p className={`text-xs ${resendMessage.includes('sent') ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {resendMessage}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 border-t pt-4">
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