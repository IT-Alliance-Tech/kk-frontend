"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/lib/admin";
import ImagePicker from "@/components/ImagePicker";
import { ArrowLeft, Save, X, Layers, FileText, Image as ImageIcon, Link2, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Auto-generate slug from category name
  const autoSlug = slugify(name.trim());
  const canBrowseImages = autoSlug.length > 0;

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

    setStatus("Creating category...");
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        slug: generatedSlug,
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
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/categories")}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create New Category</h1>
              <p className="text-sm text-slate-500 mt-0.5">Add a new category to organize your products</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-900">Category Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
                />
                {autoSlug && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <Link2 className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">URL Slug:</span>
                    <code className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{autoSlug}</code>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Category Image Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-900">Category Image</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Image Preview */}
                {imageUrl && (
                  <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt="Category image"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Image URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => canBrowseImages && setShowImagePicker(true)}
                      disabled={!canBrowseImages}
                      className={`inline-flex items-center gap-2 px-4 py-3 border rounded-lg font-medium transition-colors ${
                        canBrowseImages
                          ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                          : "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                      }`}
                      title={!canBrowseImages ? "Enter category name first" : "Browse Images"}
                    >
                      <ImageIcon className="w-5 h-5" />
                      Browse
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {canBrowseImages
                      ? "Upload or select a category image from Supabase storage"
                      : "Enter category name to enable image upload"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`flex items-center gap-3 p-4 rounded-xl ${
              status.includes("successfully") 
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700" 
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {status.includes("successfully") ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{status}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Category
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
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
    </div>
  );
}
