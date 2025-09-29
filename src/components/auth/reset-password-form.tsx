"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NeuralButton } from "@/components/ui/neural-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, Lock } from "lucide-react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Reset token is missing");
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setIsTokenValid(true);
          setEmail(data.email);
        } else {
          setError(data.error || "Invalid reset token");
        }
      } catch (error) {
        setError("Failed to validate reset token");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePasswords = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePasswords();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setMessage(data.message);

      // Redirect to login after success
      setTimeout(() => {
        router.push("/auth/login?message=Password reset successfully! Please sign in.");
      }, 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neural-light via-background to-cognition-teal/20 p-4">
        <Card className="cognitive-card max-w-md w-full">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gradient-to-r from-neural-light/30 to-neural-primary/30 rounded w-3/4"></div>
              <div className="h-4 bg-gradient-to-r from-neural-primary/30 to-neural-light/30 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neural-light via-background to-cognition-teal/20 p-4">
        <div className="max-w-md w-full space-y-8">
          <Card className="cognitive-card">
            <CardHeader>
              <CardTitle className="text-red-600">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="mt-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Password reset links expire after 1 hour for security reasons.
                </p>

                <div className="space-y-2">
                  <Link href="/auth/forgot-password">
                    <NeuralButton className="w-full">
                      Request New Reset Link
                    </NeuralButton>
                  </Link>

                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-neural-primary hover:text-neural-deep transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Login
                  </Link>
                </div>
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
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Enter a new password for {email}
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
                  <Lock className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Redirecting to login page...
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
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      disabled={isLoading}
                      className="neural-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li className={password.length >= 8 ? "text-green-600" : ""}>
                        At least 8 characters
                      </li>
                      <li className={/(?=.*[a-z])/.test(password) ? "text-green-600" : ""}>
                        One lowercase letter
                      </li>
                      <li className={/(?=.*[A-Z])/.test(password) ? "text-green-600" : ""}>
                        One uppercase letter
                      </li>
                      <li className={/(?=.*\d)/.test(password) ? "text-green-600" : ""}>
                        One number
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      disabled={isLoading}
                      className="neural-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                <NeuralButton
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !password || !confirmPassword || validatePasswords() !== null}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </NeuralButton>
              </form>
            )}

            {!message && (
              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-neural-primary hover:text-neural-deep transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}