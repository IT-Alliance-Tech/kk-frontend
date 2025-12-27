// kk-frontend/app/(auth)/verify/VerifyOtpClient.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp } from "@/lib/api/auth.api";
import { normalizeAuthResponse } from "@/lib/adapters/auth.adapter";
import { saveAccessToken } from "@/lib/utils/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import GlobalLoader from "@/components/common/GlobalLoader";

interface VerifyOtpClientProps {
  email: string;
  purpose: "login" | "signup" | "forgot";
  redirectTo?: string;
}

export default function VerifyOtpClient({
  email,
  purpose,
  redirectTo,
}: VerifyOtpClientProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to request page if no email provided
  useEffect(() => {
    if (!email) {
      router.push(`/auth/request?purpose=${purpose}`);
    }
  }, [email, purpose, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (purpose === "signup" && !name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        code,
        purpose,
        name: purpose === "signup" ? name : undefined,
      };

      const result = await verifyOtp(payload);

      // Normalize the response to handle various backend response shapes
      const normalized = normalizeAuthResponse(result);

      // Extract token - check multiple possible key names (using type assertion for flexibility)
      const resultAny = result as any;
      const token =
        resultAny.access ||
        resultAny.token ||
        resultAny.accessToken ||
        normalized.token;

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      // Save token using the new auth utility (stores under multiple keys)
      saveAccessToken(token);

      // Also store user data if present
      if (typeof window !== "undefined") {
        if (normalized.user || resultAny.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(normalized.user || resultAny.user),
          );
        }
      }

      // Refresh user state in auth context
      await refreshUser();

      // Notify the provider in the same tab immediately
      window.dispatchEvent(new Event('auth:update'));

      // Redirect to orders page by default, or specified redirect destination
      const destination = redirectTo || "/orders";
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-slate-600">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600"
          />
        </div>

        {purpose === "signup" && (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={loading}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            6-Digit OTP
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(value);
            }}
            required
            placeholder="123456"
            maxLength={6}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-center text-2xl tracking-widest font-mono"
            disabled={loading}
            autoFocus
          />
          <p className="mt-2 text-xs text-slate-500">
            Check your email for the 6-digit code
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <GlobalLoader size="small" className="mr-2 border-white border-t-transparent" />
              Verifying...
            </>
          ) : (
            "Verify & Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        <p>
          Didn&apos;t receive the code?{" "}
          <a
            href={`/auth/request?purpose=${purpose}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Resend OTP
          </a>
        </p>
      </div>
    </div>
  );
}
