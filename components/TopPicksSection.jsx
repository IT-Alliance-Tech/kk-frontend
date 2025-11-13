"use client";
import ProductCard from "@/components/ProductCard";

export default function TopPicksSection() {
  const products = [
    { id: "1", name: "Mixer Grinder", price: 1200, image_url: "/images/mixer.jpg" },
    { id: "2", name: "Milton Pro Munch Lunch Boxes", price: 800, image_url: "/images/lunchbox.jpg" },
    { id: "3", name: "Kitchen Product Cooker", price: 1000, image_url: "/images/cooker.jpg" },
    { id: "4", name: "Bottle", price: 400, image_url: "/images/bottle.jpg" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Top Picks for You</h2>
        <button className="text-red-500 hover:underline text-xs sm:text-sm md:text-base">View all</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
