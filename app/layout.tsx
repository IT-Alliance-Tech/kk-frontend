"use client";

import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientProviders from "@/components/ClientProviders";
import { CartProvider } from "@/components/CartContext";
import { ToastProvider } from "@/components/ToastContext";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith('/admin');

  useEffect(() => {
    if (typeof window !== "undefined") {
      // ensure page opens at top on navigation
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body>
        <CartProvider>
          <ClientProviders>
            <ToastProvider>
              <Navbar />
              <main className="min-h-screen bg-gray-50">{children}</main>
              {!hideFooter && <Footer />}
            </ToastProvider>
          </ClientProviders>
        </CartProvider>
      </body>
    </html>
  );
}
