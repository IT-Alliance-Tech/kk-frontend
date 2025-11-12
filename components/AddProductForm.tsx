// components/AddProductForm.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductForm() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving...");
    try {
      // If you need to upload file:
      const form = new FormData();
      form.append("title", title);
      form.append("price", price);
      form.append("category", category);
      form.append("description", description);
      if (file) form.append("image", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`, {
        method: "POST",
        body: form, // backend should accept multipart/form-data
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Create failed");
      }

      setStatus("Created");
      setTitle(""); setPrice(""); setCategory(""); setDescription(""); setFile(null);
      router.refresh();
    } catch (err: any) {
      setStatus(err.message || "Error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-2">
      <div className="flex gap-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required className="border p-2 rounded flex-1" />
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" required className="border p-2 rounded w-28" />
      </div>

      <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category slug" required className="border p-2 rounded w-full" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded w-full" />

      <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />

      <div>
        <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white">Add product</button>
        <span className="ml-3 text-sm text-gray-600">{status}</span>
      </div>
    </form>
  );
}
