// components/HeroCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// ⭐ Local Image Imports
import img1 from "../assets/images/hero1.png";
import img2 from "../assets/images/hero2.png";
import img3 from "../assets/images/hero3.png";

const slides = [
  {
    id: 1,
    title: "Big Bang Sale",
    subtitle: "Up to 70% off on premium cookware",
    image: img1,
  },
  {
    id: 2,
    title: "Exclusive Kettles",
    subtitle: "Shop our best-selling range today",
    image: img2,
  },
  {
    id: 3,
    title: "Cookware Collections",
    subtitle: "Durable, stylish, and affordable",
    image: img3,
  },
];

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mt-2 sm:mt-4">
      {/* Banner Container */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-[28rem] rounded-lg sm:rounded-xl overflow-hidden bg-gray-100">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
                  {s.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/90 mt-3 drop-shadow-md">
                  {s.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="flex gap-1.5 sm:gap-2 justify-center mt-2 sm:mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
              i === idx ? "bg-orange-600 scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
