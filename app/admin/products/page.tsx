"use client";

import { useEffect, useState } from "react";
import { getAdminProducts, deleteProduct } from "@/lib/admin";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    const data = await getAdminProducts();
    setProducts(data.items ?? data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await deleteProduct(id);
    loadProducts();
  };

  useEffect(() => {
    loadProducts();
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
          <tr className="bg-gray-100">
            <th className="border p-2">Image</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p: any) => (
            <tr key={p._id}>
              <td className="border p-2">
                <img src={p.images?.[0]} className="w-16 h-16 object-cover" />
              </td>
              <td className="border p-2">{p.title}</td>
              <td className="border p-2">₹{p.price}</td>
              <td className="border p-2 space-x-3">
                <Link
                  href={`/admin/products/${p._id}`}
                  className="text-blue-600"
                >
                  Edit
                </Link>

                <button
                  className="text-red-600"
                  onClick={() => handleDelete(p._id)}
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
