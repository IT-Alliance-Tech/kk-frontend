// components/HeroCarousel.tsx
"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    title: "Big Bang Sale",
    subtitle: "Up to 70% off on premium cookware",
    image:
      "https://prgkwuilcdaxujjflnbb.supabase.co/storage/v1/object/public/Kitchen%20kettles/Kitchen%20kettles%20product/3bf3098cd2428bc67db31e057b4ec0c4.jpg",
  },
  {
    id: 2,
    title: "Exclusive Kettles",
    subtitle: "Shop our best-selling range today",
    image:
      "https://prgkwuilcdaxujjflnbb.supabase.co/storage/v1/object/public/Kitchen%20kettles/Kitchen%20kettles%20product/fab9ecd3d3b39a7ee39ef3e87e083713.jpg",
  },
  {
    id: 3,
    title: "Cookware Collections",
    subtitle: "Durable, stylish, and affordable",
    image:
      "https://prgkwuilcdaxujjflnbb.supabase.co/storage/v1/object/public/Kitchen%20kettles/Kitchen%20kettles%20product/bb9381033ddf761710bf8bc8835a243b.jpg",
  },
];

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mt-4">
      {/* Banner Container */}
      <div className="relative h-64 md:h-[28rem] rounded overflow-hidden bg-gray-100">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            {/* Text */}
            <div className="absolute left-8 top-1/3 text-white">
              <h2 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
                {s.title}
              </h2>
              <p className="mt-2 text-lg md:text-2xl drop-shadow-md">
                {s.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="flex gap-2 justify-center mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === idx ? "bg-orange-600 scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
