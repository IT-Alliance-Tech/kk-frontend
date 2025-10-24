"use client";
import { useCart } from "@/components/CartContext";

export default function CartButton() {
  const { items, total, clearCart } = useCart();

  const handleBuyNow = async () => {
    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    alert(`Order placed for ₹${total.toFixed(2)} (${items.length} items)`);

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
