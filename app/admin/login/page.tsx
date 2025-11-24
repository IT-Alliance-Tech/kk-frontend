// kk-frontend/app/admin/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/admin";

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
      if (res && res.token) {
        localStorage.setItem("adminToken", res.token);
        localStorage.setItem("adminUser", JSON.stringify(res.admin || {}));
        router.push("/admin");
        return;
      }
      setError("Login failed: no token returned");
    } catch (err: any) {
      console.error("Admin login error:", err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full py-4 px-6 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto font-semibold">Kitchen Kettles — Admin</div>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-md p-6 shadow-md">
          <h2 className="text-center text-lg font-semibold mb-4">Admin Login</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
              className="w-full border px-3 py-2 rounded"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              required
              className="w-full border px-3 py-2 rounded"
            />
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded mt-2"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      <footer className="w-full py-4 px-6 bg-white text-center">
        <div className="max-w-6xl mx-auto text-sm text-gray-600">© Kitchen Kettles</div>
      </footer>
    </div>
  );
}
