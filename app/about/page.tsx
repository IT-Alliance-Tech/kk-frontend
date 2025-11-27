import { Metadata } from 'next';
import Image from "next/image";
import { ChefHat, Target, Users, Award } from 'lucide-react';

// Image imports
import aboutBanner from "../../assets/images/about.png";
import kitchenProducts from "../../assets/images/kitchen.png";
import missionVisionBg from "../../assets/images/mission.png";
import whyChooseUs from "../../assets/images/whychoose.png";

export const metadata: Metadata = {
  title: "About Us - Kitchen Kettels",
  description:
    "Learn about Kitchen Kettels, your trusted source for quality kitchen utensils and cookware.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* ---- HERO SECTION ---- */}
      <section className="relative w-full h-[200px] md:h-[300px] lg:h-[450px] overflow-hidden">
        <Image
          src={aboutBanner}
          alt="About Banner"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <h1 className="text-white text-5xl md:text-6xl font-bold px-8 md:px-16 drop-shadow-lg">
            About Us
          </h1>
        </div>
      </section>

      {/* ---- SECTION 2 ---- */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          <div>
            <ul className="space-y-6 text-lg text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 text-2xl">➤</span>
                Experience lightning-fast boiling with our energy-efficient design.
              </li>

              <li className="flex items-start gap-2">
                <span className="text-emerald-600 text-2xl">➤</span>
                Made with premium food-grade stainless steel for pure taste.
              </li>

              <li className="flex items-start gap-2">
                <span className="text-emerald-600 text-2xl">➤</span>
                Auto shut-off + dry-boil protection for maximum safety.
              </li>

              <li className="flex items-start gap-2">
                <span className="text-emerald-600 text-2xl">➤</span>
                Sleek, modern, elegant design enhances any kitchen.
              </li>

              <li className="flex items-start gap-2">
                <span className="text-emerald-600 text-2xl">➤</span>
                Perfect for tea, coffee, noodles, soups, and quick meals.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl overflow-hidden border-[4px] border-emerald-500 shadow-lg">
            <Image
              src={kitchenProducts}
              alt="Kitchen appliances"
              width={900}
              height={600}
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---- MISSION / VISION ---- */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <Image
            src={missionVisionBg}
            alt="Mission Vision Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-10 bg-white/10 backdrop-blur-md p-10 rounded-2xl">

            <div>
              <h2 className="text-3xl font-bold text-emerald-600 mb-4">Our Mission</h2>
              <p className="text-white text-lg leading-relaxed">
                At Kitchen Kettles, we believe the kitchen is the heart of every home.
                What began with a simple goal — to enhance everyday cooking with high-quality
                appliances — has grown into a commitment to make your kitchen smarter, safer, and more stylish.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-emerald-600 mb-4">Our Vision</h2>
              <p className="text-white text-lg leading-relaxed">
                To revolutionize modern kitchens by delivering innovative, reliable,
                and stylish appliances that make everyday cooking faster, safer, and more enjoyable.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ---- WHY CHOOSE US ---- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* LEFT IMAGE */}
          <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
            <Image
              src={whyChooseUs}
              alt="Why Choose Us"
              width={900}
              height={700}
              className="object-cover"
            />
          </div>

          {/* RIGHT TEXT */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">
              Why Choose Us
            </h2>

            <ul className="space-y-6 text-lg text-slate-700">

              <li className="flex items-start gap-3">
                <span className="text-emerald-600 text-2xl">✓</span>
                <p><strong>Premium Quality:</strong> Food-grade material built for long-term daily use.</p>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-emerald-600 text-2xl">✓</span>
                <p><strong>Smart Features:</strong> Auto shut-off, dry-boil protection, and fast-boil technology.</p>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-emerald-600 text-2xl">✓</span>
                <p><strong>Modern Designs:</strong> Sleek, elegant kettles for every kitchen.</p>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-emerald-600 text-2xl">✓</span>
                <p><strong>Trusted Service:</strong> Responsive support & reliable warranty coverage.</p>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-emerald-600 text-2xl">✓</span>
                <p><strong>Affordable Excellence:</strong> Top-notch performance without overpaying.</p>
              </li>

            </ul>
          </div>

        </div>
      </section>

    </div>
  );
}
