"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCart } from "@/components/CartContext";
import LogoImg from "@/assets/images/logo.png";

const CartBadgeClient = dynamic(() => import("./CartBadgeClient"), { ssr: false });

/* PREVIOUS HEADER MARKUP (kept for review)
   Two-row header: white bg top row with logo/search/auth, gray-100 bottom nav row
*/

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout: authLogout } = useAuth();
  const { distinctCount: cartCount } = useCart();
  const headerRef = useRef<HTMLElement | null>(null);

  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  // === REMOVED: Custom JWT auth sync that was calling refreshUser() repeatedly ===
  // The AuthProvider now handles all auth state initialization and syncing

  // === DROPDOWN CLICK OUTSIDE HANDLER ==========================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    // Logout will handle navigation and reload
    await authLogout();
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header ref={headerRef} className="w-full sticky top-0 z-50 bg-[#0f1720] shadow-lg border-b border-gray-800/40">
      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: LOGO */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src={LogoImg}
              alt="Kitchen Kettles"
              width={160}
              height={50}
              className="w-auto h-12 object-contain"
              priority
            />
          </Link>

          {/* CENTER: DESKTOP NAV LINKS */}
          <ul className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-200">
            <li>
              <Link href="/" className="hover:text-emerald-400 transition-colors focus:outline-none focus:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-emerald-400 transition-colors focus:outline-none focus:underline">
                Products
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-emerald-400 transition-colors focus:outline-none focus:underline">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/brands" className="hover:text-emerald-400 transition-colors focus:outline-none focus:underline">
                Brands
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-emerald-400 transition-colors focus:outline-none focus:underline">
                Services
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-emerald-400 transition-colors focus:outline-none focus:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-emerald-400 transition-colors focus:outline-none focus:underline">
                Contact
              </Link>
            </li>
          </ul>

          {/* RIGHT: SEARCH + CART + USER */}
          <div className="flex items-center gap-4">
            
            {/* SEARCH (Desktop & Mobile) */}
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-56 bg-gray-800/50 border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="Search..."
                aria-label="Search products or services"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors"
                aria-label="Submit search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* CART ICON */}
            <Link
              href="/cart"
              className="relative inline-block text-gray-200 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-6 w-6" />
              <CartBadgeClient />
            </Link>

            {/* USER AVATAR / AUTH */}
            {loading ? (
              <span className="text-gray-400 text-sm">Loading...</span>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full bg-emerald-600 text-white font-semibold flex items-center justify-center hover:bg-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0f1720]"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-label="User menu"
                  title={user.name || user.email || "User menu"}
                >
                  {getInitials(user.name, user.email) || (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Login
                </Link>
                <span>/</span>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  Register
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-gray-200 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded p-1"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-800/40 py-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative md:hidden mb-3">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Search..."
                aria-label="Search products or services"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400"
                aria-label="Submit search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Mobile Nav Links */}
            <Link
              href="/"
              className="block px-4 py-2 text-gray-200 hover:bg-gray-800/50 hover:text-emerald-400 rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block px-4 py-2 text-gray-200 hover:bg-gray-800/50 hover:text-emerald-400 rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="block px-4 py-2 text-gray-200 hover:bg-gray-800/50 hover:text-emerald-400 rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/brands"
              className="block px-4 py-2 text-gray-200 hover:bg-gray-800/50 hover:text-emerald-400 rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Brands
            </Link>
            <Link
              href="/services"
              className="block px-4 py-2 text-gray-200 hover:bg-gray-800/50 hover:text-emerald-400 rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-gray-200 hover:bg-gray-800/50 hover:text-emerald-400 rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-gray-200 hover:bg-gray-800/50 hover:text-emerald-400 rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>

            {/* Mobile Auth Links (if not logged in) */}
            {!user && !loading && (
              <div className="md:hidden border-t border-gray-800/40 mt-3 pt-3 flex gap-4 px-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <span className="text-gray-600">/</span>
                <Link
                  href="/register"
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
