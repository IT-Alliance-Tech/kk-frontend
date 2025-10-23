import Link from "next/link";

export default function CategoryBar({ categories = [] }: { categories: any[] }) {
  const items = categories.length
    ? categories
    : [
        { id: "c1", name: "Mobiles", slug: "mobiles", image_url: "/icons/mobile.png" },
        { id: "c2", name: "Kitchen", slug: "kitchen", image_url: "/icons/home.png" },
        { id: "c3", name: "Appliances", slug: "appliances", image_url: "/icons/tv.png" },
        { id: "c4", name: "Furniture", slug: "furniture", image_url: "/icons/furniture.png" },
      ];

  return (
    <div className="py-6 bg-white shadow-md mb-6 rounded-xl">
      <div className="flex gap-8 items-center overflow-x-auto no-scrollbar px-6">
        {items.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="flex flex-col items-center text-sm min-w-[130px] hover:scale-105 transition-transform duration-200"
          >
            <div className="bg-gray-100 hover:bg-gray-200 transition rounded-2xl p-5 shadow-lg w-28 h-28 flex items-center justify-center">
              <img
                src={c.image_url}
                alt={c.name}
                className="w-16 h-16 object-contain"
              />
            </div>
            <span className="mt-3 font-medium text-gray-800 truncate w-28 text-center text-base">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
