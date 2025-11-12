"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function HeroBanner() {
  const [banner, setBanner] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setBanner(data);
    };
    fetchBanner();
    // supabase client is stable, safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!banner) return null;

  return (
    <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[450px] relative rounded-lg sm:rounded-xl overflow-hidden">
      {/* TODO: replace with next/image if src is static */}
      <img
        src={banner.image_url}
        alt="Hero Banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-1/2 left-4 sm:left-6 md:left-10 transform -translate-y-1/2 text-white max-w-[80%] sm:max-w-[70%] md:max-w-[60%]">
        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">{banner.title}</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg drop-shadow-md">{banner.subtitle}</p>
      </div>
    </div>
  );
}
