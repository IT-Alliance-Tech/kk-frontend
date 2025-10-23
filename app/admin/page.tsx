"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminDashboard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.log("Admin page loaded:", pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome to the admin area.</p>

      <div className="mt-8">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
   