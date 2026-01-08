// kk-frontend/app/admin/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/admin";
import { ShieldCheck } from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await adminLogin(email.trim(), password);
      
      // Safe extraction: handle both direct response and envelope format
      // res might be { token, admin } OR { statusCode, success, error, data: { token, admin } }
      const token = (res && res.token) || (res && res.data && res.data.token) || null;
      const admin = (res && res.admin) || (res && res.data && res.data.admin) || null;
      
      if (!token || typeof token !== "string") {
        setError("Login failed: no token returned");
        return;
      }
      
      // Store token and admin info
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(admin || {}));
      
      // Notify auth provider to update state
      window.dispatchEvent(new Event('auth:update'));
      
      router.push("/admin");
    } catch (err: any) {
      console.error("Admin login error:", err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100"></div>
      
      {/* Layered radial gradients for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent"></div>
      
      {/* Floating orbs with sophisticated blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/60 to-emerald-300/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/50 to-slate-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-emerald-100/30 to-transparent rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
      
      {/* Content container with elevated z-index */}
      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 rounded-2xl shadow-lg">
              <ShieldCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-3 sm:mb-4">
            Admin Portal
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            Kitchen Kettles
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Authorized access only
          </p>
        </div>

        <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl border border-white/50 p-6 sm:p-8 lg:p-10 hover:shadow-emerald-200/50 transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2.5"
              >
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@kitchenkettles.com"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-base placeholder:text-slate-400 hover:border-slate-400 bg-white/50 backdrop-blur-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-base placeholder:text-slate-400 hover:border-slate-400 bg-white/50 backdrop-blur-sm"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50/90 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm font-medium backdrop-blur-sm">
                {error}
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
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login to Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
