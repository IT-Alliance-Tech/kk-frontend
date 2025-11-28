"use client";

import { useEffect, useState } from "react";
import { getAdminProducts, deleteProduct, getBrands, getCategories } from "@/lib/admin";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const loadProducts = async () => {
    const data = await getAdminProducts();
    // getAdminProducts now returns array directly via ensureArray
    setProducts(Array.isArray(data) ? data : []);
  };

  const loadCategoriesAndBrands = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        getCategories(),
        getBrands(),
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (err) {
      console.error("Failed to load categories/brands:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await deleteProduct(id);
    loadProducts();
  };

  useEffect(() => {
    loadProducts();
    loadCategoriesAndBrands();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Product
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          {/* Reordered columns to: Title, Category, Brand, Price, Action (per product owner request) */}
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Brand</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p: any) => {
            // Show category/brand name instead of ID: prefer product.category.name/product.brand.name, then lookup from categories/brands arrays
            const categoryName = p?.category?.name 
              ?? categories?.find(c => String(c._id) === String(p.category))?.name 
              ?? p.category 
              ?? '-';
            
            const brandName = p?.brand?.name 
              ?? brands?.find(b => String(b._id) === String(p.brand))?.name 
              ?? p.brand 
              ?? '-';

            // Defensive access for product id and title
            const pid = p?.id || p?._id;
            const label = p?.title ?? 'product';

            return (
              <tr key={p._id}>
                <td className="border p-2">{p.title}</td>
                <td className="border p-2">{categoryName}</td>
                <td className="border p-2">{brandName}</td>
                <td className="border p-2">₹{p.price}</td>
                <td className="border p-2 space-x-3">
                  {/* Open read-only product view page */}
                  <Link
                    href={`/admin/products/view/${pid}`}
                    className="text-green-600"
                    aria-label={`View ${label}`}
                  >
                    View
                  </Link>

                  <Link
                    href={`/admin/products/${pid}`}
                    className="text-blue-600"
                    aria-label={`Edit ${label}`}
                  >
                    Edit
                  </Link>

                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(p._id)}
                    aria-label={`Delete ${label}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
