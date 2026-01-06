"use client";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/ToastContext";

export default function CartButton() {
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();

  const handleBuyNow = async () => {
    if (items.length === 0) {
      showToast("Your cart is empty", "info");
      return;
    }

    showToast(`Order placed for ₹${total.toFixed(2)} (${items.length} items)`, "success");

    // ✅ Clear cart after purchase
    clearCart();
  };

  return (
    <button
      onClick={handleBuyNow}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Buy Now
    </button>
  );
}
