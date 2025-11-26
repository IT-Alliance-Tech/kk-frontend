"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSingleBrand, updateBrand } from "@/lib/admin";

export default function EditBrandPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadBrand() {
      try {
        const brand = await getSingleBrand(params.id);
        setName(brand.name || "");
        setSlug(brand.slug || "");
        setLogoUrl(brand.logoUrl || "");
      } catch (err) {
        setStatus("Failed to load brand");
      }
    }
    loadBrand();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setStatus("Name is required");
      return;
    }
    if (!slug.trim()) {
      setStatus("Slug is required");
      return;
    }

    setStatus("Updating brand...");
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        logoUrl: logoUrl.trim() || undefined,
      };

      await updateBrand(params.id, payload);
      setStatus("Brand updated successfully!");
      setTimeout(() => {
        router.push("/admin/brands");
      }, 1000);
    } catch (err: any) {
      console.error("Brand update error:", err);
      const errorMsg = err.message || "Error updating brand";
      setStatus(errorMsg);
      
      // Handle 401 Unauthorized - redirect to login
      if (err.status === 401 || errorMsg.includes("Invalid user") || errorMsg.includes("Not authenticated")) {
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      }
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Brand</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Brand name"
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="brand-slug"
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="border p-2 rounded w-full"
          />
        </div>

        {status && (
          <div
            className={`text-sm ${
              status.includes("successfully") ? "text-green-600" : "text-red-600"
            }`}
          >
            {status}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-black text-white disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Update Brand"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/brands")}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
