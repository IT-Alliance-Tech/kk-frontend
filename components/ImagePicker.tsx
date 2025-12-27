"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import GlobalLoader from "@/components/common/GlobalLoader";

interface ImageFile {
  url: string;
  path: string;
  name: string;
  size: number;
  createdAt?: string;
}

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiSelect?: boolean;
  maxFiles?: number;
  folder?: string;
  slug?: string;
}

export default function ImagePicker({
  isOpen,
  onClose,
  onSelect,
  multiSelect = true,
  maxFiles = 10,
  folder = 'products',
  slug,
}: ImagePickerProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Check if slug is required but missing (for brands and categories folders)
  const requiresSlug = folder === 'brands' || folder === 'categories';
  const isSlugValid = !requiresSlug || (slug && slug.trim().length > 0);
  const canUpload = isSlugValid;

  // Fetch existing images
  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken") || document.cookie.split("; ").find((row) => row.startsWith("adminToken="))?.split("=")[1];

      // TODO: Remove debug log after testing
      console.log("[DEBUG] Fetching images with token:", token ? "present" : "missing");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/admin?folder=${folder}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const result = await response.json();

      if (result.ok && result.data) {
        setImages(result.data);
      } else {
        setError(result.error || "Failed to load images");
      }
    } catch (err: any) {
      console.error("[ERROR] Failed to fetch images:", err);
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setSelectedUrls([]);
    }
  }, [isOpen, fetchImages]);

  // Handle file upload
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Prevent upload if slug is required but missing
    if (!canUpload) {
      setError(`Please enter ${folder === 'categories' ? 'category' : 'brand'} name or slug before uploading an image`);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", folder);

      const token = localStorage.getItem("adminToken") || document.cookie.split("; ").find((row) => row.startsWith("adminToken="))?.split("=")[1];

      let uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/upload/admin?folder=${encodeURIComponent(folder)}`;
      if ((folder === 'brands' || folder === 'categories') && slug) {
        uploadUrl += `&slug=${encodeURIComponent(slug)}`;
      }

      const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.ok && result.data) {
        // Refresh image list
        await fetchImages();
        // Auto-select newly uploaded images
        const newUrls = result.data.map((img: ImageFile) => img.url);
        if (multiSelect) {
          setSelectedUrls((prev) => [...prev, ...newUrls].slice(0, maxFiles));
        } else {
          setSelectedUrls([newUrls[0]]);
        }
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err: any) {
      console.error("[ERROR] Upload failed:", err);
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Prevent upload if slug is required but missing
    if (!canUpload) {
      setError(`Please enter ${folder === 'categories' ? 'category' : 'brand'} name or slug before uploading an image`);
      return;
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  // Toggle image selection
  const toggleSelect = (url: string) => {
    if (multiSelect) {
      setSelectedUrls((prev) =>
        prev.includes(url)
          ? prev.filter((u) => u !== url)
          : [...prev, url].slice(0, maxFiles)
      );
    } else {
      setSelectedUrls([url]);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    onSelect(selectedUrls);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Select Images</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-4 border-b">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              !canUpload
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={canUpload ? handleDrag : undefined}
            onDragLeave={canUpload ? handleDrag : undefined}
            onDragOver={canUpload ? handleDrag : undefined}
            onDrop={canUpload ? handleDrop : undefined}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              disabled={!canUpload}
            />
            <label
              htmlFor="file-upload"
              className={`text-sm text-gray-600 ${canUpload ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              {!canUpload ? (
                <div className="text-amber-600">
                  <span className="font-medium">⚠️ Upload disabled</span>
                  <br />
                  <span className="text-xs">
                    Please enter {folder === 'categories' ? 'category' : 'brand'} name or slug before uploading images
                  </span>
                  <br />
                  <span className="text-xs text-gray-500 mt-2 block">
                    You can still browse and select existing images
                  </span>
                </div>
              ) : uploading ? (
                <div className="flex items-center gap-2">
                  <GlobalLoader size="small" className="border-blue-600" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <span className="text-blue-600 font-medium">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                  <br />
                  <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Image Gallery */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 flex justify-center">
              <GlobalLoader size="medium" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No images yet. Upload some to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.path}
                  onClick={() => toggleSelect(img.url)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedUrls.includes(img.url)
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.name}
                    className="w-full h-32 object-cover"
                    width={500}
                    height={500}
                  />
                  {selectedUrls.includes(img.url) && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedUrls.length > 0 && (
              <span>
                {selectedUrls.length} image{selectedUrls.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedUrls.length === 0}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Select {selectedUrls.length > 0 && `(${selectedUrls.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
