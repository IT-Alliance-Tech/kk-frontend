/**
 * Login Form Client Component
 * Handles user authentication with email/phone and password/OTP
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth.api";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, LogIn, Smartphone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import GlobalLoader from "@/components/common/GlobalLoader";

interface LoginFormClientProps {
  redirectTo?: string;
}

export default function LoginFormClient({
  redirectTo = "/orders",
}: LoginFormClientProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // UI state
  const [useOTP, setUseOTP] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    // Check if email or phone is provided
    const hasIdentifier = usePhone ? phone.trim() : email.trim();
    if (!hasIdentifier) {
      setError(usePhone ? "Phone number is required" : "Email is required");
      return false;
    }

    // Check if password or OTP is provided
    const hasCredential = useOTP ? otp.trim() : password.trim();
    if (!hasCredential) {
      setError(useOTP ? "OTP is required" : "Password is required");
      return false;
    }

    // Validate email format (basic)
    if (!usePhone && email && !email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare login payload
      const payload: any = {};

      if (usePhone) {
        payload.phone = phone;
      } else {
        payload.email = email;
      }

      if (useOTP) {
        payload.otp = otp;
      } else {
        payload.password = password;
      }

      // Call login API
      const { token, user } = await login(payload);

      // Store token in localStorage (already done by login function, but being explicit)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Refresh user state in auth context
      await refreshUser();

      // Notify the provider in the same tab immediately
      window.dispatchEvent(new Event('auth:update'));

      // Success! Redirect to the specified page
      router.push(redirectTo);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <LogIn className="h-6 w-6" />
          Welcome Back
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Toggle: Email vs Phone */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="usePhone"
              checked={usePhone}
              onCheckedChange={(checked) => setUsePhone(checked as boolean)}
              disabled={loading}
            />
            <Label
              htmlFor="usePhone"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
            >
              <Smartphone className="h-4 w-4" />
              Login with Phone Number
            </Label>
          </div>

          {/* Email or Phone Input */}
          {usePhone ? (
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                required
                autoComplete="tel"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>
          )}

          {/* Toggle: Password vs OTP */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useOTP"
              checked={useOTP}
              onCheckedChange={(checked) => setUseOTP(checked as boolean)}
              disabled={loading}
            />
            <Label
              htmlFor="useOTP"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Login with OTP instead of password
            </Label>
          </div>

          {/* Password or OTP Input */}
          {useOTP ? (
            <div>
              <Label htmlFor="otp">One-Time Password (OTP)</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                required
                maxLength={6}
                autoComplete="one-time-code"
              />
              <p className="text-xs text-slate-500 mt-1">
                OTP sent to your {usePhone ? "phone" : "email"}
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>
          )}

          {/* Forgot Password Link */}
          {!useOTP && (
            <div className="text-right">
              <a
                href="/login/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? (
              <>
                <GlobalLoader size="small" className="mr-2" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </>
            )}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              Sign up
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
