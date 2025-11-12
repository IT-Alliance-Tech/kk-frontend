"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Shop by Category</h1>
            <p className="text-slate-600">Find the perfect kitchen tools for your needs</p>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse h-48 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Shop by Category</h1>
          <p className="text-slate-600">Find the perfect kitchen tools for your needs</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category._id || category.id} href={`/categories/${category.slug}`}>
                <div className="border p-6 rounded-xl hover:shadow-lg transition-shadow cursor-pointer bg-white">
                  {category.image_url && (
                    <div className="mb-4 h-48 overflow-hidden rounded-lg">
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-slate-900 mb-2 hover:text-emerald-600 transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                      {category.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{category.slug}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
