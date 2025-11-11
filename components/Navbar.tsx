"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CartButton from "./CartButton";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [q, setQ] = useState("");
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch Supabase user
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="w-full sticky top-0 z-50 shadow">
      {/* ===== Top Header ===== */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://prgkwuilcdaxujjflnbb.supabase.co/storage/v1/object/public/Kitchen%20kettles/Kitchen%20kettles%20product/Screenshot%202025-10-23%20120734.png"
              alt="Kitchen Kettles Logo"
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-xl w-full relative"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Product / Service"
              className="w-full border rounded-full py-2 pl-5 pr-12 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white rounded-full p-2 hover:bg-emerald-700"
            >
              🔍
            </button>
          </form>

          {/* Contact + Auth */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-gray-700">
            {user ? (
              <div className="flex items-center gap-2">
                <span>{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
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

            <div className="flex items-center gap-2">
              <span>📧 info@kitchenkettles.com</span>
              <span>📞 8989889880</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Second Header ===== */}
      <nav className="bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-3">
          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileOpen((v) => !v)}
          >
            ☰
          </button>

          {/* Menu Links */}
          <ul className="hidden md:flex items-center gap-8 text-gray-800 font-medium">
            <li>
              <Link href="/" className="hover:text-emerald-600">Home</Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-emerald-600">Categories</Link>
            </li>
            <li>
              <Link href="/brands" className="hover:text-emerald-600">Brands</Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-emerald-600">Services</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-emerald-600">About us</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-emerald-600">Contact us</Link>
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
            <Link href="/" className="block py-1 hover:text-emerald-600">Home</Link>
            <Link href="/categories" className="block py-1 hover:text-emerald-600">Categories</Link>
            <Link href="/brands" className="block py-1 hover:text-emerald-600">Brands</Link>
            <Link href="/services" className="block py-1 hover:text-emerald-600">Services</Link>
            <Link href="/about" className="block py-1 hover:text-emerald-600">About us</Link>
            <Link href="/contact" className="block py-1 hover:text-emerald-600">Contact us</Link>
           

          </div>
        )}
      </nav>
    </header>
  );
}
