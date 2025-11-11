// components/CategoryList.tsx
"use client";
import React, { useState } from "react";

export default function CategoryList({ categories }: { categories: any[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex gap-6">
      <aside className="w-64">
        <ul>
          {categories.map((c) => (
            <li key={c.id ?? c._id} className="mb-2">
              <button
                onClick={() => setSelected(c.slug ?? c.name)}
                className="text-left w-full"
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1">
        {selected ? <p>Showing products for: <strong>{selected}</strong></p> : <p>Select a category</p>}
      </section>
    </div>
  );
}
