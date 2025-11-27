"use client";

import { useEffect, useState } from "react";
import { getAdminCategories, deleteCategory } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();

  const loadCategories = async () => {
    const data = await getAdminCategories();
    setCategories(data || []);
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
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Category
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Image</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Slug</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((c: any) => (
            <tr key={c._id}>
              <td className="border p-2">
                {c.image_url || c.image ? (
                  <img
                    src={c.image_url || c.image}
                    alt={c.name}
                    className="w-16 h-16 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs">
                    No Image
                  </div>
                )}
              </td>
              <td className="border p-2">{c.name}</td>
              <td className="border p-2 text-gray-600">{c.slug}</td>
              <td className="border p-2 text-sm text-gray-600">
                {c.description || "-"}
              </td>
              <td className="border p-2 space-x-3">
                <Link
                  href={`/admin/categories/${c._id}`}
                  className="text-blue-600"
                >
                  Edit
                </Link>

                <button
                  className="text-red-600"
                  onClick={() => handleDelete(c._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
