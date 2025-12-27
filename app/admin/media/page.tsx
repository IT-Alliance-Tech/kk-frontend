"use client";

import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import GlobalLoader from "@/components/common/GlobalLoader";

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Media Manager</h1>
        <p className="text-gray-600">
          Upload and manage product images for your store
        </p>
      </div>

      {/* Upload Area */}
      <div className="mb-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
            className="cursor-pointer flex flex-col items-center"
          >
            {uploading ? (
              <>
                <GlobalLoader size="large" className="mb-4" />
                <span className="text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-blue-600">
                  Click to upload
                </span>
                <span className="text-sm text-gray-600 mt-2">
                  or drag and drop files here
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Image Gallery */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Uploaded Images ({images.length})
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <GlobalLoader size="large" />
            <p className="text-gray-500 mt-4">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No images uploaded yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Upload some images to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.path}
                className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className="aspect-square">
                  <Image
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                  />
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(img.url)}
                    className="px-3 py-1 bg-white text-black text-sm rounded hover:bg-gray-100 transition-colors"
                  >
                    Copy URL
                  </button>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-white text-black text-sm rounded hover:bg-gray-100 transition-colors"
                  >
                    View Full
                  </a>
                </div>

                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs truncate" title={img.name}>
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
      </div>
    </div>
  );
}
