"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSingleBrand, updateBrand } from "@/lib/admin";

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [homepageOrder, setHomepageOrder] = useState<number | "">("");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadBrand() {
      try {
        const brand = await getSingleBrand(id);
        setName(brand.name || "");
        setSlug(brand.slug || "");
        setLogoUrl(brand.logoUrl || "");
        setShowOnHomepage(brand.showOnHomepage || false);
        setHomepageOrder(brand.homepageOrder || "");
      } catch (err) {
        setStatus("Failed to load brand");
      }
    }
    loadBrand();
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

    // Validate homepage fields
    if (showOnHomepage && !homepageOrder) {
      setStatus("Homepage order is required when showing on homepage");
      return;
    }

    setStatus("Updating brand...");
    setLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        slug: slug.trim(),
        logoUrl: logoUrl.trim() || undefined,
        showOnHomepage,
        homepageOrder: showOnHomepage && homepageOrder ? Number(homepageOrder) : null,
      };

      await updateBrand(id, payload);
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
          <div className="flex gap-2">
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="border p-2 rounded w-full"
            />
            <button
              type="button"
              onClick={() => setShowImageUploadModal(true)}
              className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 flex items-center gap-1 whitespace-nowrap"
              title="Browse Images"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              Browse
            </button>
          </div>
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
                Controls the display order on homepage (only 4 brands can be shown)
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

      {/* Image Upload Modal */}
      {showImageUploadModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowImageUploadModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">Brand Logo Upload</h2>
            <p className="text-gray-600 text-center mb-6">
              Brand logo upload coming soon
            </p>
            <button
              onClick={() => setShowImageUploadModal(false)}
              className="w-full px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
