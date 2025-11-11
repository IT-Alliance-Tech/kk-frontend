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

  if (loading) return <p>Loading...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat._id} className="border p-3 rounded">
            <Link href={`/categories/${cat.slug}`}>
              <h2 className="font-semibold">{cat.name}</h2>
              <p className="text-gray-500 text-sm">{cat.slug}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
