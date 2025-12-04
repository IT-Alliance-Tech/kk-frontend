import Image from "next/image";
import Link from "next/link";
import { getCategoryLogoUrl } from "@/lib/supabaseUrls";

export default function CategoryBar({
  categories = [],
}: {
  categories: any[];
}) {
  const items = categories.length
    ? categories
    : [
        {
          id: "c1",
          name: "Mobiles",
          slug: "mobiles",
          image_url: "/icons/mobile.png",
        },
        {
          id: "c2",
          name: "Kitchen",
          slug: "kitchen",
          image_url: "/icons/home.png",
        },
        {
          id: "c3",
          name: "Appliances",
          slug: "appliances",
          image_url: "/icons/tv.png",
        },
        {
          id: "c4",
          name: "Furniture",
          slug: "furniture",
          image_url: "/icons/furniture.png",
        },
      ];

  return (
    <div className="py-4 sm:py-6 bg-white shadow-md mb-4 sm:mb-6 rounded-lg sm:rounded-xl">
      <div className="flex gap-4 sm:gap-6 md:gap-8 items-center overflow-x-auto no-scrollbar px-3 sm:px-6">
        {items.map((c) => {
          const slug = c.slug || c.name?.toLowerCase().replace(/\s+/g, '-');
          const logoUrl = getCategoryLogoUrl(slug) || c.image_url || '/brand-placeholder.svg';
          
          return (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="flex flex-col items-center text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] md:min-w-[130px] hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-gray-100 hover:bg-gray-200 transition rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-lg w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={c.name}
                  width={64}
                  height={64}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
                />
              </div>
              <span className="mt-2 sm:mt-3 font-medium text-gray-800 truncate w-16 sm:w-20 md:w-28 text-center text-xs sm:text-sm md:text-base">
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
