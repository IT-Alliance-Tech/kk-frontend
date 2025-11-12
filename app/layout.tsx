import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientProviders from "@/components/ClientProviders";
import { CartProvider } from "@/components/CartContext";
import { ToastProvider } from "@/components/ToastContext";


export const metadata = {
  title: "KitchenKettles",
  description: "Kitchen products and more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <ClientProviders>
            <ToastProvider>
              <Navbar />
              <main className="min-h-screen bg-gray-50">{children}</main>
              <Footer />
            </ToastProvider>
          </ClientProviders>
        </CartProvider>
      </body>
    </html>
  );
}