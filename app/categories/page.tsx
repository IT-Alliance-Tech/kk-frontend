"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Category = {
  _id: string;
  slug: string;
  name: string;
  image_url?: string;
  description?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <section className="bg-gradient-to-br from-emerald-200 via-emerald-100 to-teal-100 py-16 shadow-inner">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Shop by Category
            </h1>
            <p className="text-slate-700">
              Find the perfect kitchen tools for your needs
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-56 bg-gray-200 rounded-2xl shadow"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!categories.length) return <p>No categories found.</p>;

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-emerald-200 via-emerald-100 to-teal-100 py-16 shadow-inner">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Shop by Category
          </h1>
          <p className="text-slate-700">Find the perfect kitchen tools for your needs</p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className="
                  bg-white border border-gray-100 rounded-2xl shadow-sm 
                  hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 
                  transition-all duration-300 cursor-pointer overflow-hidden
                ">
                  {category.image_url && (
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 shadow">
                        {category.slug}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {category.name}
                    </h2>

                    {category.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
