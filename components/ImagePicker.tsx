"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

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
}

export default function ImagePicker({
  isOpen,
  onClose,
  onSelect,
  multiSelect = true,
  maxFiles = 10,
}: ImagePickerProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Fetch existing images
  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken") || document.cookie.split("; ").find((row) => row.startsWith("adminToken="))?.split("=")[1];

      // TODO: Remove debug log after testing
      console.log("[DEBUG] Fetching images with token:", token ? "present" : "missing");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/upload/admin`,
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
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setSelectedUrls([]);
    }
  }, [isOpen, fetchImages]);

  // Handle file upload
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const token = localStorage.getItem("adminToken") || document.cookie.split("; ").find((row) => row.startsWith("adminToken="))?.split("=")[1];

      // TODO: Remove debug log after testing
      console.log("[DEBUG] Uploading files:", files.length);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/upload/admin`,
        {
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
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-sm text-gray-600"
            >
              {uploading ? (
                <span>Uploading...</span>
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
            <div className="text-center py-8 text-gray-500">Loading...</div>
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
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-32 object-cover"
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
