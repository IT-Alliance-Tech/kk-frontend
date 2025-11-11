// components/AddCategoryForm.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCategoryForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) throw new Error("Create failed");
      setStatus("Created");
      setName(""); setSlug("");
      // refresh current route to refetch server data
      router.refresh();
    } catch (err: any) {
      setStatus(err.message || "Error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-2">
      <div className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required className="border p-2 rounded flex-1" />
        <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Slug" required className="border p-2 rounded w-48" />
      </div>
      <div>
        <button type="submit" className="px-3 py-1 rounded bg-green-600 text-white">Add category</button>
        <span className="ml-3 text-sm text-gray-600">{status}</span>
      </div>
    </form>
  );
}
