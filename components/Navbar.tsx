"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout: authLogout, refreshUser } = useAuth();
  const headerRef = useRef<HTMLElement | null>(null);

  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // === FIX MAIN PADDING ========================================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const main = document.querySelector("main") as HTMLElement | null;
      const header = headerRef.current;
      if (!main || !header) return;
      const h = Math.round(header.getBoundingClientRect().height);
      main.style.paddingTop = `${h}px`;
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // === CUSTOM JWT AUTH SYNC ====================================================
  useEffect(() => {
    if (typeof refreshUser === "function") {
      refreshUser();
    }
  }, [refreshUser]);

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    authLogout();
    router.push("/login");
  };

  return (
    <header ref={headerRef} className="w-full sticky top-0 z-50 bg-white shadow">
      {/* ================== TOP HEADER AREA ================== */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row items-center justify-between gap-5">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            {!logoError ? (
              <Image
                src="https://prgkwuilcdaxujjflnbb.supabase.co/storage/v1/object/public/Kitchen%20kettles/Kitchen%20kettles%20product/Screenshot%202025-10-23%20120734.png"
                alt="Kitchen Kettles"
                width={200}
                height={60}
                className="w-auto h-14 md:h-16 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-2xl font-bold text-emerald-600">
                Kitchen Kettles
              </span>
            )}
          </Link>

          {/* SEARCH BOX */}
          <form
            onSubmit={handleSearch}
            className="w-full lg:flex-1 lg:max-w-2xl relative"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded-full py-3 pl-5 pr-14 text-base focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Search Product / Service"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 text-white rounded-full p-3 hover:bg-emerald-700 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          {/* AUTH + CONTACT */}
          <div className="flex items-center gap-5 text-base font-medium">
            {loading ? (
              <span className="text-gray-500">Loading...</span>
            ) : user ? (
              <>
                <span className="hidden sm:inline text-gray-700 max-w-[180px] truncate">
                  {user.name ?? "Account"}
                </span>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-1 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-emerald-600 hover:underline">
                  Login
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/register" className="text-emerald-600 hover:underline">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================== NAVBAR MENU ================== */}
      <nav className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* DESKTOP MENU — SMALLER SIZE ADDED HERE */}
          <ul className="hidden lg:flex items-center gap-6 text-base font-semibold text-gray-800">
            <li><Link href="/" className="hover:text-emerald-600">Home</Link></li>
            <li><Link href="/products" className="hover:text-emerald-600">Products</Link></li>
            <li><Link href="/categories" className="hover:text-emerald-600">Categories</Link></li>
            <li><Link href="/brands" className="hover:text-emerald-600">Brands</Link></li>
            <li><Link href="/services" className="hover:text-emerald-600">Services</Link></li>
            <li><Link href="/about" className="hover:text-emerald-600">About</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-600">Contact</Link></li>
          </ul>

          {/* RIGHT SIDE CART */}
          <Link
            href="/cart"
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 rounded text-lg font-semibold"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
