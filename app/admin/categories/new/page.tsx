"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/lib/admin";
import ImagePicker from "@/components/ImagePicker";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

    setStatus("Creating category...");
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() || "",
      };

      await createCategory(payload);
      setStatus("Category created successfully!");
      setTimeout(() => {
        router.push("/admin/categories");
      }, 1000);
    } catch (err: any) {
      console.error("Category creation error:", err);
      const errorMsg = err.message || "Error creating category";
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
      <h1 className="text-2xl font-bold mb-6">Create New Category</h1>

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
          <div className="flex gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="border p-2 rounded w-full"
            />
            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border rounded whitespace-nowrap"
            >
              📷 Browse Images
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload or select a category image from Supabase storage
          </p>
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
            {loading ? "Creating..." : "Create Category"}
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

      {/* Image Picker Modal */}
      <ImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(urls) => {
          // Set the first selected URL as the category image
          if (urls.length > 0) {
            setImageUrl(urls[0]);
          }
        }}
        multiSelect={false}
        maxFiles={1}
        folder="categories"
        slug={slugify(slug.trim() || name.trim())}
      />
    </div>
  );
}
