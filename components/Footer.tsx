"use client";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      {/* Main Footer Section */}
      <footer className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 py-8 relative border-t border-gray-200">
        <div className="max-w-8xl mx-auto px-3 sm:px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Column 1 - Quick Links */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-widest mb-3 sm:mb-4 border-b-2 border-emerald-500 inline-block pb-1">
              KITCHEN KETTLES
            </h2>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-emerald-600 transition"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link href="/brand" className="hover:text-emerald-600 transition">
                  Brand
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-emerald-600 transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions" // ✅ Correct path format
                  className="hover:text-emerald-600 transition"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="hover:text-emerald-600 transition"
                >
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Address */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-widest mb-3 sm:mb-4 border-b-2 border-emerald-500 inline-block pb-1">
              ADDRESS
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed">
              Ground Floor & First Floor, No. 305, Shop No. 9, <br />
              Varthur Main Road, Opp. Shani Mahatma Temple, <br />
              Gunjur, Bengaluru – 560087
            </p>
          </div>

          {/* Column 3 - Contact + Socials */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-widest mb-3 sm:mb-4 border-b-2 border-emerald-500 inline-block pb-1">
              CONNECT WITH US
            </h2>

            <div className="text-xs sm:text-sm mb-4 space-y-2">
              <p className="flex items-center gap-2">
                <FaPhoneAlt className="text-emerald-600" />{" "}
                <a
                  href="tel:+918989889880"
                  className="hover:text-emerald-600 transition break-all"
                >
                  +91 8989889880
                </a>
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-emerald-600" />{" "}
                <a
                  href="mailto:saleskitchenkettles@gmail.com"
                  className="hover:text-emerald-600 transition break-all text-xs sm:text-sm"
                >
                  saleskitchenkettles@gmail.com
                </a>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 sm:gap-4 mt-3">
              <a
                href="#"
                aria-label="Facebook"
                className="p-2 bg-white border border-gray-200 rounded-full hover:bg-emerald-600 hover:text-white transition"
              >
                <FaFacebookF className="text-base sm:text-lg" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="p-2 bg-white border border-gray-200 rounded-full hover:bg-emerald-600 hover:text-white transition"
              >
                <FaInstagram className="text-base sm:text-lg" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-300 mt-8 sm:mt-10 pt-4 sm:pt-6 text-center text-[10px] sm:text-xs text-gray-600 px-4">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-gray-800">Kitchen Kettles</span> |
          Designed & Developed by{" "}
          <span className="text-emerald-600 font-medium hover:underline">
            IT Alliance
          </span>
        </div>
      </footer>

      {/* Floating WhatsApp and Call Buttons */}
      <div className="fixed left-4 bottom-20 z-50 flex flex-col gap-3 sm:left-6">
        {/* WhatsApp */}
        <a
          href="https://wa.me/918989889880"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <FaWhatsapp className="text-xl sm:text-2xl" />
        </a>

        {/* Call */}
        <a
          href="tel:+918989889880"
          className="w-12 h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110"
          aria-label="Call Now"
        >
          <FaPhoneAlt className="text-xl sm:text-2xl" />
        </a>
      </div>
    </>
  );
}
