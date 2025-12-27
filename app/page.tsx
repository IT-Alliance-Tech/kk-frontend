"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Category } from "@/lib/supabase";
import { Product } from "@/lib/api/products.api";
import { buildUrl } from "@/lib/api";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import HeroBanner from "@/components/HeroBanner";
import { normalizeSrc } from "@/lib/normalizeSrc";
import GlobalLoader from "@/components/common/GlobalLoader";

const BrandsPreview = dynamic(() => import("@/components/BrandsPreview"), { ssr: false });
const HomeCategories = dynamic(() => import("@/components/HomeCategories"), { ssr: false });

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(false);
    try {
      // Use lightweight homepage-specific API for random top picks
      const res = await fetch(buildUrl("/api/homepage/top-picks"), { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      
      const json = await res.json();
      const items = json?.data || [];
      setProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      // Silently handle error - show empty state
      setError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Category + Hero */}
      <section className="bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6">
          {/* homepage categories strip removed */}
          <HeroCarousel />
        </div>
      </section>

      {/* Brands Preview */}
      <BrandsPreview />

      {/* Categories preview section (4 items) */}
      <HomeCategories />

      {/* Top Products - only show if loading or has products */}
      {(loading || products.length > 0) && (
        <section className="max-w-8xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
          {/* Header row: centered title + right aligned Explore link */}
          <div className="relative py-4">
            <div className="flex items-center justify-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">
                Top Picks for You
              </h2>
            </div>

            {/* Explore link pinned to right on same horizontal band (desktop) */}
            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 hidden sm:block">
              <Link href="/products" className="text-emerald-600 hover:underline whitespace-nowrap">
                See more products →
              </Link>
            </div>

            {/* Mobile: show explore below title for small screens */}
            <div className="mt-3 sm:hidden text-right">
              <Link href="/products" className="text-emerald-600 hover:underline whitespace-nowrap">
                See more products →
              </Link>
            </div>
          </div>

          {/* Products preview grid: 8 items, 4 per row on desktop */}
          <div className="flex flex-col divide-y divide-gray-200 md:divide-y-0 md:grid md:grid-cols-4 md:gap-4 lg:gap-6">
            {loading ? (
              <div className="col-span-4 flex justify-center py-12">
                <GlobalLoader size="large" />
              </div>
            ) : (
              products.map((p) => <ProductCard key={p._id || p.id} product={p} />)
            )}
          </div>
        </section>
      )}

      {/* About Us Section - Premium Glass Morphism Design */}
      <section className="w-full py-12 sm:py-16 md:py-20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 opacity-60"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-8xl mx-auto px-3 sm:px-4 relative z-10">
          <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left side - Visual brand element */}
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-8 sm:p-10 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-40 h-40 border-2 border-white rounded-full -translate-x-20 -translate-y-20"></div>
                  <div className="absolute bottom-0 right-0 w-60 h-60 border-2 border-white rounded-full translate-x-30 translate-y-30"></div>
                </div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  
                  <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">Our Story</h3>
                  <div className="w-16 h-1 bg-white/40 mx-auto rounded-full mb-4"></div>
                  <p className="text-emerald-50 text-sm leading-relaxed max-w-xs mx-auto">
                    Building the future of kitchen excellence, one product at a time
                  </p>
                </div>
              </div>

              {/* Right side - Content */}
              <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium w-fit">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Trusted by 10,000+ customers
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    About Us
                  </h2>

                  <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                    We design and deliver reliable kitchen solutions built for everyday life. From innovative tools to timeless essentials, every product reflects our commitment to quality, sustainability, and your cooking experience.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">Quality craftsmanship</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">Sustainable materials</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link
                      href="/about"
                      className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      aria-label="Learn more about our company"
                    >
                      Discover our story
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section - Modern Split Design */}
      <section className="w-full py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-8xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left side - Content */}
              <div className="p-8 sm:p-10 md:p-14 flex flex-col justify-center order-2 lg:order-1">
                <div className="space-y-6">
                  {/* Eye-catching heading */}
                  <div className="space-y-3">
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-sm font-semibold rounded-full">
                      💬 We{"'"}re here to help
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      Contact Us
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Questions? Our support team is ready to help — fast responses and helpful guidance whenever you need it.
                    </p>
                  </div>

                  {/* Contact methods grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 hover:border-emerald-300 transition-all duration-300 group/card">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">Phone Support</h4>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">Mon-Sat, 9AM-6PM IST</p>
                    </div>

                    <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 hover:border-blue-300 transition-all duration-300 group/card">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">Email & Chat</h4>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">24/7 response time</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:gap-6 pt-4 border-t border-gray-100">
                    <div className="text-center sm:text-left">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">2hrs</div>
                      <div className="text-xs text-gray-500">Avg. response</div>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                    <div className="text-center sm:text-left">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">98%</div>
                      <div className="text-xs text-gray-500">Satisfaction rate</div>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                    <div className="text-center sm:text-left">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">24/7</div>
                      <div className="text-xs text-gray-500">Always available</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Link
                      href="/contact"
                      className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      aria-label="Contact our team"
                    >
                      Get in touch
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right side - Visual element */}
              <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-700 p-8 sm:p-10 md:p-14 flex items-center justify-center order-1 lg:order-2 min-h-[300px] lg:min-h-[500px] overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                  <div className="absolute top-1/4 right-1/4 w-64 h-64 border-4 border-white rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1/4 left-1/4 w-48 h-48 border-4 border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 w-96 h-96 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Main icon */}
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-3">Let{"'"}s Talk</h3>
                  <p className="text-emerald-50 text-sm leading-relaxed max-w-xs mx-auto">
                    We{"'"}re excited to hear from you and answer any questions you may have
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
