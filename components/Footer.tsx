// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* About Section */}
        <div>
      
           <li>
              <Link href="/about" className="hover:underline">
               <h4 className="font-bold mb-2">About</h4>
              </Link>
            </li>
          <p className="text-sm text-gray-600">
            KitchenKettles — premium kitchen products.
          </p>
        </div>

        {/* Help Section */}
        <div>
          <h4 className="font-bold mb-2">Help</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="hover:underline">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:underline">
                Shipping Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Shop Section */}
        <div>
          <h4 className="font-bold mb-2">Shop</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <Link href="/category/cookware" className="hover:underline">
                Cookware
              </Link>
            </li>
            <li>
              <Link href="/category/kettles" className="hover:underline">
                Kettles
              </Link>
            </li>
            <li>
              <Link href="/category/accessories" className="hover:underline">
                Accessories
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Section */}
        <div>
          <h4 className="font-bold mb-2">Follow</h4>
          <div className="text-sm text-gray-600 space-x-2">
            <a href="#" className="hover:underline">
              Facebook
            </a>
            •
            <a href="#" className="hover:underline">
              Instagram
            </a>
            •
            <a href="#" className="hover:underline">
              YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} KitchenKettles. All rights reserved.
      </div>
    </footer>
  );
}
