"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Category } from '@/lib/supabase';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <div className="grid grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
                    <div className="p-5 bg-white rounded-xl shadow-lg hover:scale-105 transition">
                      {category.image_url ? (
                        /* TODO: replace with next/image if src is static */
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-emerald-300" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="group-hover:text-emerald-600 transition-colors">
                        {category.name}
                      </CardTitle>
                      {category.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
