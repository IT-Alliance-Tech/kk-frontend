"use client";

import { useEffect, useState } from "react";
import { getAdminCategories, deleteCategory, getAdminProducts } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  const loadCategories = async () => {
    const data = await getAdminCategories();
    setCategories(data || []);
  };

  const loadProducts = async () => {
    const data = await getAdminProducts();
    setProducts(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err: any) {
      console.error("Category deletion error:", err);
      alert(err.message || "Failed to delete category");
      
      // Handle 401 Unauthorized - redirect to login
      if (err.status === 401 || err.message?.includes("Invalid user") || err.message?.includes("Not authenticated")) {
        router.push("/admin/login");
      }
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="bg-black text-white px-4 py-2 rounded text-sm sm:text-base whitespace-nowrap"
        >
          + Add Category
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border min-w-[520px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Name</th>
            <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">#Products</th>
            <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">#Brands</th>
            <th className="border p-1.5 sm:p-2 text-xs sm:text-sm">Action</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((c: any) => {
            // Calculate product count for this category
            const productCount = products?.filter(p => String(p.category) === String(c._id)).length ?? 0;
            
            // Calculate brand count for this category
            const brandCount = Array.from(
              new Set(
                products?.filter(p => String(p.category) === String(c._id))
                  .map(p => String(p.brand))
                  .filter(Boolean) || []
              )
            ).length ?? 0;

            return (
              <tr key={c._id}>
                <td className="border p-1.5 sm:p-2 text-xs sm:text-sm">{c.productCategory?.name || c.name}</td>
                <td className="border p-1.5 sm:p-2 text-center text-xs sm:text-sm whitespace-nowrap">{productCount}</td>
                <td className="border p-1.5 sm:p-2 text-center text-xs sm:text-sm whitespace-nowrap">{brandCount}</td>
                <td className="border p-1.5 sm:p-2 space-x-2 sm:space-x-3 whitespace-nowrap">
                  {/* View category details (read-only) */}
                  <Link
                    href={`/admin/categories/view/${c._id}`}
                    className="text-green-600 text-xs sm:text-sm"
                  >
                    View
                  </Link>

                  <Link
                    href={`/admin/categories/${c._id}`}
                    className="text-blue-600 text-xs sm:text-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
