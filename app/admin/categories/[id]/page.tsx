"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSingleCategory, updateCategory } from "@/lib/admin";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadCategory() {
      try {
        const category = await getSingleCategory(id);
        setName(category.name || "");
        setSlug(category.slug || "");
        setDescription(category.description || "");
        setImageUrl(category.image_url || category.image || "");
      } catch (err) {
        setStatus("Failed to load category");
      }
    }
    loadCategory();
  }, [id]);

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

    setStatus("Updating category...");
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || "",
      };

      await updateCategory(id, payload);
      setStatus("Category updated successfully!");
      setTimeout(() => {
        router.push("/admin/categories");
      }, 1000);
    } catch (err: any) {
      console.error("Category update error:", err);
      const errorMsg = err.message || "Error updating category";
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
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="category-slug"
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description"
            rows={4}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
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
            {loading ? "Updating..." : "Update Category"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
