"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CartButton from "./CartButton";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [q, setQ] = useState("");
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch Supabase user and subscribe to auth changes
  useEffect(() => {
    let subscription: any;

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user ?? null);
      } catch (err) {
        console.error("Failed to get supabase user", err);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Grab subscription object safely (structure: { data: { subscription } } in some versions)
    // Try common shapes to be robust:
    subscription = sub?.subscription ?? sub;

    return () => {
      try {
        subscription?.unsubscribe?.();
      } catch (err) {
        // best-effort cleanup
      }
    };
  }, [supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/login");
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 shadow">
      {/* ===== Top Header ===== */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col lg:flex-row items-center justify-between gap-2 sm:gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Image
              src="https://prgkwuilcdaxujjflnbb.supabase.co/storage/v1/object/public/Kitchen%20kettles/Kitchen%20kettles%20product/Screenshot%202025-10-23%20120734.png"
              alt="Kitchen Kettles Logo"
              width={160}
              height={64}
              className="h-10 sm:h-12 md:h-16 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="w-full lg:flex-1 lg:max-w-xl relative order-3 lg:order-2"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Product / Service"
              className="w-full border rounded-full py-1.5 sm:py-2 pl-4 sm:pl-5 pr-10 sm:pr-12 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white rounded-full p-1.5 sm:p-2 hover:bg-emerald-700 text-xs sm:text-base"
            >
              🔍
            </button>
          </form>

          {/* Contact + Auth */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-700 order-2 lg:order-3">
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="hidden sm:inline truncate max-w-[120px] md:max-w-none">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/login" className="text-emerald-600 flex items-center gap-1">
                  <span>Login</span>
                </Link>
                <span>|</span>
                <Link href="/register" className="text-emerald-600 flex items-center gap-1">
                  <span>Register</span>
                </Link>
              </div>
            )}

            <div className="hidden md:flex items-center gap-2 text-xs lg:text-sm">
              <span className="hidden lg:inline">📧 info@kitchenkettles.com</span>
              <span>📞 8989889880</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Second Header ===== */}
      <nav className="bg-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between py-2 sm:py-3">
          {/* Mobile Hamburger */}
          <button
            className="lg:hidden text-gray-700 text-xl sm:text-2xl"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {/* Menu Links */}
          {/* Mobile fix: menu now scrolls horizontally on small screens. Original classes preserved. */}
          <ul className="flex gap-6 overflow-x-auto whitespace-nowrap px-2 sm:px-4 -mx-2 sm:mx-0 items-center xl:gap-8 text-sm xl:text-base text-gray-800 font-medium">
            <li>
              <Link href="/" className="hover:text-emerald-600">
                Home
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-emerald-600">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/brands" className="hover:text-emerald-600">
                Brands
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-emerald-600">
                Services
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-emerald-600">
                About us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-emerald-600">
                Contact us
              </Link>
            </li>
          </ul>

          {/* Cart */}
          <div className="flex items-center gap-2">
            <CartButton />
          </div>
        </div>

        {/* ===== Mobile Menu ===== */}
        {mobileOpen && (
          <div className="md:hidden bg-gray-100 border-t px-4 py-2 space-y-2">
            <Link href="/" className="block py-2 hover:text-emerald-600 text-sm sm:text-base">
              Home
            </Link>
            <Link href="/categories" className="block py-2 hover:text-emerald-600 text-sm sm:text-base">
              Categories
            </Link>
            <Link href="/brands" className="block py-2 hover:text-emerald-600 text-sm sm:text-base">
              Brands
            </Link>
            <Link href="/services" className="block py-2 hover:text-emerald-600 text-sm sm:text-base">
              Services
            </Link>
            <Link href="/about" className="block py-2 hover:text-emerald-600 text-sm sm:text-base">
              About us
            </Link>
            <Link href="/contact" className="block py-2 hover:text-emerald-600 text-sm sm:text-base">
              Contact us
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
