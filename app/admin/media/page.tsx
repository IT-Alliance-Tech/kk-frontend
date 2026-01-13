"use client";

import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Trash2, Copy, ExternalLink, RefreshCw, FolderOpen, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";

interface ImageFile {
  url: string;
  path: string;
  name: string;
  size: number;
  createdAt?: string;
}

export default function MediaManagerPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Fetch images
  const fetchImages = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken") || document.cookie.split("; ").find((row) => row.startsWith("adminToken="))?.split("=")[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/admin`,
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
      console.error("Failed to fetch images:", err);
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle file upload
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const token = localStorage.getItem("adminToken") || document.cookie.split("; ").find((row) => row.startsWith("adminToken="))?.split("=")[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/admin`,
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
        setSuccess(`Successfully uploaded ${result.data.length} file(s)`);
        await fetchImages();
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
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

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSuccess("URL copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="Media Manager"
        description="Upload and manage product images for your store"
        actions={
          <button
            onClick={fetchImages}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Upload Area */}
      <AdminCard>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
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
            className="cursor-pointer flex flex-col items-center"
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                <span className="text-slate-600 font-medium">Uploading...</span>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-emerald-600" />
                </div>
                <span className="text-lg font-semibold text-emerald-600">
                  Click to upload
                </span>
                <span className="text-sm text-slate-500 mt-2">
                  or drag and drop files here
                </span>
                <span className="text-xs text-slate-400 mt-2 px-3 py-1 bg-slate-100 rounded-full">
                  PNG, JPG, GIF up to 10MB
                </span>
              </>
            )}
          </label>
        </div>
      </AdminCard>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Image Gallery */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            Uploaded Images
            <span className="text-sm font-normal text-slate-500">({images.length})</span>
          </h2>
        </div>

        {loading ? (
          <AdminLoadingState message="Loading images..." />
        ) : images.length === 0 ? (
          <AdminEmptyState
            icon={<FolderOpen className="w-12 h-12" />}
            title="No Images Uploaded"
            description="Upload some images to get started"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {images.map((img) => (
              <div
                key={img.path}
                className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-square bg-slate-100">
                  <Image
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                  />
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(img.url)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy URL
                  </button>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Full
                  </a>
                </div>

                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate" title={img.name}>
                    {img.name}
                  </p>
                  <p className="text-white/70 text-xs">
                    {(img.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
