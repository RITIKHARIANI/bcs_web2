"use client";

import { useState } from "react";
import Link from "next/link";
import { NeuralButton } from "../ui/neural-button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-neural p-4">
        <Card className="w-full max-w-md shadow-neural">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-neural-primary">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-base">
              If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Please check your email and click the reset link. The link will expire in 1 hour for security reasons.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              
              <div className="space-y-2">
                <NeuralButton
                  variant="outline"
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="w-full"
                >
                  Try Again
                </NeuralButton>
                
                <Link href="/auth/login">
                  <NeuralButton variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </NeuralButton>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-neural p-4">
      <Card className="w-full max-w-md shadow-neural">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-neural-primary">
            Reset Your Password
          </CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
                className="border-neural-light/30 focus:border-neural-primary"
              />
            </div>

            <NeuralButton
              type="submit"
              className="w-full"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </NeuralButton>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Remember your password?
              </p>
              <Link href="/auth/login">
                <NeuralButton variant="ghost" className="text-neural-primary hover:text-neural-primary/80">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </NeuralButton>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
