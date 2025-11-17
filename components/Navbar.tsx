"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/*
  Robust Navbar with ResizeObserver-based dynamic body padding.
  - Uses ResizeObserver to measure the header exactly when its size changes.
  - SSR-safe (guarded by typeof window).
  - Cleans up on unmount.
  - Inline SVG fallbacks to avoid external /icons/*.png 404s.
  To revert: remove ResizeObserver logic and restore any CSS-based top padding.
*/

export default function Navbar() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const headerRef = useRef<HTMLElement | null>(null);

  const [q, setQ] = useState("");
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // DEMO: robust dynamic padding — put padding on the <main> container (not body).
  // This avoids creating a global blank area above the header while keeping content
  // from being hidden behind a sticky header. It retries after layout settles.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    let timeoutId: number | null = null;

    const applyPadding = () => {
      const headerEl = headerRef.current;
      if (!headerEl) {
        // ensure nothing left on body/main if header missing
        document.body.style.paddingTop = "";
        const mainEl0 = document.querySelector("main") as HTMLElement | null;
        if (mainEl0) mainEl0.style.paddingTop = "";
        return;
      }

      const h = Math.round(headerEl.getBoundingClientRect().height || 0);
      const mainEl = document.querySelector("main") as HTMLElement | null;

      // Clear any body padding we may have set earlier (avoid double-offset)
      document.body.style.paddingTop = "";

      if (mainEl) {
        mainEl.style.paddingTop = h ? `${h}px` : "";
      } else {
        // fallback: if no main element, apply to body (last resort)
        document.body.style.paddingTop = h ? `${h}px` : "";
      }
    };

    const scheduleUpdate = () => {
      // cancel prior
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);

      // measure once on next frame, then again after 120ms (images/fonts)
      rafId = requestAnimationFrame(() => {
        applyPadding();
        timeoutId = window.setTimeout(() => {
          applyPadding();
        }, 120);
      });
    };

    // initial cleanup of old inline styles (defensive)
    const mainInit = document.querySelector("main") as HTMLElement | null;
    if (mainInit) mainInit.style.paddingTop = "";
    document.body.style.paddingTop = "";

    // run immediately (safe even if header loads later)
    scheduleUpdate();

    // also run after window load (images/fonts done)
    window.addEventListener("load", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("load", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
      // cleanup inline styles when component unmounts
      const mainElClean = document.querySelector("main") as HTMLElement | null;
      if (mainElClean) mainElClean.style.paddingTop = "";
      document.body.style.paddingTop = "";
    };
  }, [mobileOpen]);

  // Supabase auth user subscribe (robust)
  useEffect(() => {
    let unsub: any;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user ?? null);
      } catch (err) {
        console.error("supabase getUser err", err);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Some versions return { subscription }, some return subscription directly
    unsub = sub?.subscription ?? sub;

    return () => {
      try {
        unsub?.unsubscribe?.();
      } catch {}
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
    <header ref={headerRef} className="w-full sticky top-0 z-50 shadow bg-white">
      {/* Top header row */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-col lg:flex-row items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {!logoError ? (
              <Image
                src="https://prgkwuilcdaxujjflnbb.supabase.co/storage/v1/object/public/Kitchen%20kettles/Kitchen%20kettles%20product/Screenshot%202025-10-23%20120734.png"
                alt="Kitchen Kettles Logo"
                width={160}
                height={48}
                className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                priority
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-8 sm:h-10 md:h-12 flex items-center">
                <svg className="h-full w-auto" viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="160" height="48" rx="8" fill="#10b981" />
                  <text x="80" y="30" fontSize="14" fontWeight="700" fill="white" textAnchor="middle" fontFamily="system-ui, sans-serif">
                    Kitchen Kettles
                  </text>
                </svg>
              </div>
            )}
          </Link>

          {/* Search (center) */}
          <form onSubmit={handleSearch} className="w-full lg:flex-1 lg:max-w-xl relative order-3 lg:order-2">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Product / Service"
              className="w-full border rounded-full py-2 pl-4 pr-12 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white rounded-full p-2 hover:bg-emerald-700 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Auth / contact */}
          <div className="flex items-center gap-3 text-sm order-2 lg:order-3">
            {user ? (
              <>
                <span className="hidden sm:inline truncate max-w-[160px]">{user.email}</span>
                <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-emerald-600 hover:text-emerald-700 px-2 py-1">
                  Login
                </Link>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <Link href="/register" className="text-emerald-600 hover:text-emerald-700 px-2 py-1">
                  Register
                </Link>
              </>
            )}

            <a href="mailto:info@kitchenkettles.com" className="hidden lg:flex items-center gap-2 text-xs text-gray-600">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
                <rect x="3" y="6" width="18" height="12" rx="2" />
              </svg>
              <span>info@kitchenkettles.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation row */}
      <nav className="bg-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-12 flex items-center justify-between">
          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            type="button"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop menu */}
          <ul className="hidden lg:flex gap-6 items-center text-sm text-gray-800 font-medium">
            <li><Link href="/" className="px-2 py-1 hover:text-emerald-600">Home</Link></li>
            <li><Link href="/products" className="px-2 py-1 hover:text-emerald-600">Products</Link></li>
            <li><Link href="/categories" className="px-2 py-1 hover:text-emerald-600">Categories</Link></li>
            <li><Link href="/brands" className="px-2 py-1 hover:text-emerald-600">Brands</Link></li>
            <li><Link href="/services" className="px-2 py-1 hover:text-emerald-600">Services</Link></li>
            <li><Link href="/about" className="px-2 py-1 hover:text-emerald-600">About</Link></li>
            <li><Link href="/contact" className="px-2 py-1 hover:text-emerald-600">Contact</Link></li>
          </ul>

          {/* Mobile quick links */}
          <div className="flex lg:hidden items-center gap-3">
            <Link href="/products" className="px-2 py-1 text-sm hover:text-emerald-600">Products</Link>
            <Link href="/categories" className="px-2 py-1 text-sm hover:text-emerald-600">Categories</Link>
          </div>

          {/* Cart button */}
          <Link href="/cart" className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>

        {/* Mobile dropdown */}
        <div className={`lg:hidden bg-gray-100 border-t transition-[max-height] duration-300 ease-in-out overflow-hidden ${mobileOpen ? "max-h-96" : "max-h-0"}`}>
          <div className="px-4 py-2 space-y-1">
            <Link href="/" className="block py-2 px-2 rounded hover:bg-gray-200" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/products" className="block py-2 px-2 rounded hover:bg-gray-200" onClick={() => setMobileOpen(false)}>Products</Link>
            <Link href="/categories" className="block py-2 px-2 rounded hover:bg-gray-200" onClick={() => setMobileOpen(false)}>Categories</Link>
            <Link href="/brands" className="block py-2 px-2 rounded hover:bg-gray-200" onClick={() => setMobileOpen(false)}>Brands</Link>
            <Link href="/services" className="block py-2 px-2 rounded hover:bg-gray-200" onClick={() => setMobileOpen(false)}>Services</Link>
            <Link href="/about" className="block py-2 px-2 rounded hover:bg-gray-200" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/contact" className="block py-2 px-2 rounded hover:bg-gray-200" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link href="/cart" className="block py-2 px-2 rounded hover:bg-gray-200 border-t mt-2 pt-2" onClick={() => setMobileOpen(false)}>🛒 Cart</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
