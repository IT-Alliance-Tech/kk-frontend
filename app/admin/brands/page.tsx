"use client";

import { useEffect, useState } from "react";
import { getAdminBrands, deleteBrand } from "@/lib/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const router = useRouter();

  const loadBrands = async () => {
    const data = await getAdminBrands();
    setBrands(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await deleteBrand(id);
      loadBrands();
    } catch (err: any) {
      console.error("Brand deletion error:", err);
      alert(err.message || "Failed to delete brand");
      
      // Handle 401 Unauthorized - redirect to login
      if (err.status === 401 || err.message?.includes("Invalid user") || err.message?.includes("Not authenticated")) {
        router.push("/admin/login");
      }
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Brands</h1>
        <Link
          href="/admin/brands/new"
          className="bg-black text-white px-4 py-2 rounded text-sm sm:text-base whitespace-nowrap"
        >
          + Add Brand
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border min-w-[640px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-xs sm:text-sm">Logo</th>
            <th className="border p-2 text-xs sm:text-sm">Name</th>
            <th className="border p-2 text-xs sm:text-sm">Slug</th>
            <th className="border p-2 text-xs sm:text-sm">Action</th>
          </tr>
        </thead>

        <tbody>
          {brands.map((b: any) => (
            <tr key={b._id}>
              <td className="border p-2">
                {b.logoUrl ? (
                  <Image
                    src={b.logoUrl}
                    alt={b.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                    width={500}
                    height={500}
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 flex items-center justify-center text-xs">
                    No Logo
                  </div>
                )}
              </td>
              <td className="border p-2 text-xs sm:text-sm">{b.name}</td>
              <td className="border p-2 text-xs sm:text-sm text-gray-600">{b.slug}</td>
              <td className="border p-2 space-x-2 sm:space-x-3 whitespace-nowrap">
                <Link
                  href={`/admin/brands/${b._id}`}
                  className="text-blue-600 text-xs sm:text-sm"
                >
                  Edit
                </Link>

                <button
                  className="text-red-600 text-xs sm:text-sm"
                  onClick={() => handleDelete(b._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
