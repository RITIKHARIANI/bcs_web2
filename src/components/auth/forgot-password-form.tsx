"use client";

import { useState } from "react";
import Link from "next/link";
import { NeuralButton } from "@/components/ui/neural-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setMessage(data.message);
      setEmail(""); // Clear form on success

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neural-light via-background to-cognition-teal/20 p-4">
      <div className="max-w-md w-full space-y-8">
        <Card className="cognitive-card">
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                  <Mail className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Check your email for the reset link. It may take a few minutes to arrive.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Don&apos;t see it? Check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="neural-input"
                  />
                </div>

                <NeuralButton
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </NeuralButton>
              </form>
            )}

            <div className="mt-6 text-center space-y-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-neural-primary hover:text-neural-deep transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </Link>

              {!message && (
                <p className="text-xs text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="text-neural-primary hover:text-neural-deep">
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}