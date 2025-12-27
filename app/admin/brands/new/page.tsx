"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrand } from "@/lib/admin";
import { slugify } from "@/lib/api/brands.api";
import ImagePicker from "@/components/ImagePicker";
import GlobalLoader from "@/components/common/GlobalLoader";

export default function NewBrandPage() {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
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

    setStatus("Creating brand...");
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slugify(name.trim()),
        logoUrl: logoUrl.trim() || undefined,
      };

      await createBrand(payload);
      setStatus("Brand created successfully!");
      setTimeout(() => {
        router.push("/admin/brands");
      }, 1000);
    } catch (err: any) {
      console.error("Brand creation error:", err);
      const errorMsg = err.message || "Error creating brand";
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
      <h1 className="text-2xl font-bold mb-6">Create New Brand</h1>

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
              onClick={() => setShowImagePicker(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border rounded whitespace-nowrap"
            >
              📷 Browse Images
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload or select a brand logo from Supabase storage
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
            className="px-4 py-2 rounded bg-black text-white disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              <>
                <GlobalLoader size="small" className="border-white" />
                Creating...
              </>
            ) : (
              "Create Brand"
            )}
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

      {/* Image Picker Modal */}
      <ImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(urls) => {
          // Set the first selected URL as the brand logo
          if (urls.length > 0) {
            setLogoUrl(urls[0]);
          }
        }}
        multiSelect={false}
        maxFiles={1}
        folder="brands"
        slug={slugify(name.trim())}
      />
    </div>
  );
}
