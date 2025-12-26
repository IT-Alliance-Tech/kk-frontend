"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSingleCategory, updateCategory } from "@/lib/admin";
import ImagePicker from "@/components/ImagePicker";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [homepageOrder, setHomepageOrder] = useState<number | "">("");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Auto-generate slug from category name
  const autoSlug = slugify(name.trim());
  const canBrowseImages = autoSlug.length > 0;

  useEffect(() => {
    async function loadCategory() {
      try {
        const category = await getSingleCategory(id);
        setName(category.name || "");
        setDescription(category.description || "");
        setImageUrl(category.image_url || category.image || "");
        setShowOnHomepage(category.showOnHomepage || false);
        setHomepageOrder(category.homepageOrder || "");
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

    // Auto-generate slug from name
    const generatedSlug = slugify(name.trim());
    if (!generatedSlug) {
      setStatus("Invalid category name");
      return;
    }

    // Validate homepage fields
    if (showOnHomepage && !homepageOrder) {
      setStatus("Homepage order is required when showing on homepage");
      return;
    }

    setStatus("Updating category...");
    setLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        slug: generatedSlug,
        description: description.trim(),
        image_url: imageUrl.trim() || "",
        showOnHomepage,
        homepageOrder: showOnHomepage && homepageOrder ? Number(homepageOrder) : null,
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
          {autoSlug && (
            <p className="text-xs text-gray-500 mt-1">
              Slug: <span className="font-mono">{autoSlug}</span>
            </p>
          )}
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
              onClick={() => canBrowseImages && setShowImagePicker(true)}
              disabled={!canBrowseImages}
              className={`px-4 py-2 border rounded whitespace-nowrap ${
                canBrowseImages
                  ? "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
              title={!canBrowseImages ? "Category slug is required" : ""}
            >
              📷 Browse Images
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {canBrowseImages
              ? "Upload or select a category image from Supabase storage"
              : "Category slug is required to enable image upload"}
          </p>
        </div>

        {/* Homepage Priority Section */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-md font-semibold mb-3">Homepage Visibility</h3>
          
          <div className="space-y-3">
            {/* Show on Homepage Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showOnHomepage"
                checked={showOnHomepage}
                onChange={(e) => {
                  setShowOnHomepage(e.target.checked);
                  if (!e.target.checked) {
                    setHomepageOrder("");
                  }
                }}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="showOnHomepage" className="text-sm font-medium cursor-pointer">
                Show on Homepage
              </label>
            </div>

            {/* Homepage Order Selector */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Homepage Order (1-4) {showOnHomepage && <span className="text-red-500">*</span>}
              </label>
              <select
                value={homepageOrder}
                onChange={(e) => setHomepageOrder(e.target.value ? Number(e.target.value) : "")}
                disabled={!showOnHomepage}
                className={`border p-2 rounded w-full ${!showOnHomepage ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Select order...</option>
                <option value="1">1st Position</option>
                <option value="2">2nd Position</option>
                <option value="3">3rd Position</option>
                <option value="4">4th Position</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Controls the display order on homepage (only 4 categories can be shown)
              </p>
            </div>
          </div>
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
        slug={autoSlug}
      />
    </div>
  );
}
