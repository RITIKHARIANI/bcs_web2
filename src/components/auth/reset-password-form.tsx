"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NeuralButton } from "@/components/ui/neural-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserInfo {
  email: string;
  name: string;
}

export function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tokenValid, setTokenValid] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid reset link. Please request a new password reset.");
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
          setUserInfo(data.user);
        } else {
          setError(data.error || "Invalid or expired reset link.");
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setError("Failed to validate reset link. Please try again.");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    
    return {
      valid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
      checks: {
        minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError("Password does not meet requirements");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login?message=password_reset");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-neural p-4">
        <Card className="w-full max-w-md shadow-neural">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-neural-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Validating reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-neural p-4">
        <Card className="w-full max-w-md shadow-neural">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-neural-primary">
              Password Reset Successful!
            </CardTitle>
            <CardDescription className="text-base">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link href="/auth/login">
                <NeuralButton className="w-full">
                  Continue to Login
                </NeuralButton>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (invalid token)
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-neural p-4">
        <Card className="w-full max-w-md shadow-neural">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-neural-primary">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-base">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <Link href="/auth/forgot-password">
                <NeuralButton className="w-full">
                  Request New Reset Link
                </NeuralButton>
              </Link>
              
              <Link href="/auth/login">
                <NeuralButton variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </NeuralButton>
              </Link>
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
          <div className="mx-auto w-12 h-12 bg-neural-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-neural-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-neural-primary">
            Set New Password
          </CardTitle>
          <CardDescription>
            {userInfo && (
              <>
                Creating new password for <strong>{userInfo.name}</strong> ({userInfo.email})
              </>
            )}
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
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter new password"
                  required
                  disabled={isLoading}
                  className="border-neural-light/30 focus:border-neural-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password requirements */}
              {formData.password && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Password requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center space-x-2 ${passwordValidation.checks.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <CheckCircle className={`h-3 w-3 ${passwordValidation.checks.minLength ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.checks.hasUpper ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <CheckCircle className={`h-3 w-3 ${passwordValidation.checks.hasUpper ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.checks.hasLower ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <CheckCircle className={`h-3 w-3 ${passwordValidation.checks.hasLower ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.checks.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <CheckCircle className={`h-3 w-3 ${passwordValidation.checks.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.checks.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <CheckCircle className={`h-3 w-3 ${passwordValidation.checks.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>One special character (@$!%*?&)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                  disabled={isLoading}
                  className="border-neural-light/30 focus:border-neural-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <NeuralButton
              type="submit"
              className="w-full"
              disabled={isLoading || !passwordValidation.valid || formData.password !== formData.confirmPassword}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </NeuralButton>

            <div className="text-center">
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
