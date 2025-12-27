// kk-frontend/app/(auth)/request/RequestOtpClient.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { requestOtp } from "@/lib/api/auth.api";
import GlobalLoader from "@/components/common/GlobalLoader";

interface RequestOtpClientProps {
  purpose: "login" | "signup" | "forgot";
}

export default function RequestOtpClient({ purpose }: RequestOtpClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await requestOtp(email, purpose);
      setSuccess(result.message || "OTP sent to your email!");

      // Navigate to verify page after brief delay
      setTimeout(() => {
        const encodedEmail = encodeURIComponent(email);
        router.push(`/auth/verify?email=${encodedEmail}&purpose=${purpose}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl border border-white/50 p-6 sm:p-8 lg:p-10 hover:shadow-emerald-200/50 transition-all duration-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-700 mb-2.5"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-base placeholder:text-slate-400 hover:border-slate-400 bg-white/50 backdrop-blur-sm"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50/90 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm font-medium backdrop-blur-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50/90 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-xl text-sm font-medium backdrop-blur-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 disabled:from-emerald-400 disabled:via-emerald-400 disabled:to-emerald-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transform"
        >
          {loading ? (
            <>
              <GlobalLoader size="small" className="mr-2 border-white border-t-transparent" />
              <span>Sending OTP...</span>
            </>
          ) : (
            <span>Send OTP</span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm">
        {purpose === "signup" ? (
          <p className="text-slate-600">
            Already have an account?{" "}
            <a
              href="/auth/request?purpose=login"
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors duration-200"
            >
              Sign in
            </a>
          </p>
        ) : (
          <p className="text-slate-600">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/request?purpose=signup"
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors duration-200"
            >
              Sign up
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
