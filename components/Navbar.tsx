"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CartButton from "./CartButton";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ Fetch current user
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // ✅ Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ✅ Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="bg-white sticky top-0 z-40 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Hamburger (mobile) */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* ✅ Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="https://prgkwuilcdaxujjflnbb.supabase.co/storage/v1/object/public/Kitchen%20kettles/Kitchen%20kettles%20product/Screenshot%202025-10-23%20120734.png"
            alt="Kitchen Kettles Logo"
            className="h-20 md:h-30 w-auto object-contain transition-all duration-300"
          />
          <span className="hidden sm:inline text-xl font-bold text-emerald-600">
            KitchenKettles
          </span>
        </Link>

        {/* ✅ Search bar */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, brands, or categories"
              className="w-full rounded-full border px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Search
            </button>
          </div>
        </form>

        {/* ✅ Right side actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-gray-700">{user.email}</div>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-emerald-600 font-medium">
              Login
            </Link>
          )}
          <CartButton />
          <Link
            href="/become-seller"
            className="hidden lg:inline text-sm text-gray-600 hover:text-emerald-600"
          >
            Become Best Customer
          </Link>
        </div>
      </div>

      {/* ✅ Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2">
          {user ? (
            <>
              <div className="text-sm text-gray-700">{user.email}</div>
              <button
                onClick={handleLogout}
                className="py-2 border rounded px-3 text-red-600 border-red-500 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="py-2 border rounded px-3 text-emerald-600">
              Login
            </Link>
          )}
          <Link href="/cart" className="py-2 border rounded px-3">
            Cart
          </Link>
        </div>
      )}
    </header>
  );
}
