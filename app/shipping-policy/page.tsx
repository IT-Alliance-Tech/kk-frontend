export const metadata = {
  title: "Shipping Policy | KitchenKettles",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-700 space-y-4">
      <h1 className="text-3xl font-bold mb-4 text-emerald-700">Shipping Policy</h1>
      <p className="text-sm text-gray-500">Last Updated: 15-06-2025</p>

      <p>
        At KitchenKettles.com, we are committed to delivering your kitchen appliances safely and promptly.
      </p>

      <h2 className="text-xl font-semibold mt-6">1. Shipping Coverage</h2>
      <p>
        We ship across all major PIN codes in India. If your location is not serviceable, we’ll notify you during checkout or via email.
      </p>

      <h2 className="text-xl font-semibold mt-6">2. Processing Time</h2>
      <p>Orders are processed within 24–48 hours after payment confirmation.</p>

      <h2 className="text-xl font-semibold mt-6">3. Delivery Timeline</h2>
      <p>Standard delivery takes 3–7 business days depending on your location.</p>

      <h2 className="text-xl font-semibold mt-6">4. Shipping Charges</h2>
      <ul className="list-disc ml-6 space-y-1">
        <li>Free shipping on orders above ₹999.</li>
        <li>₹49 flat fee for orders below ₹999.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">5. Order Tracking</h2>
      <p>
        Once dispatched, tracking details will be shared via SMS/email. Use the courier’s portal to track your shipment.
      </p>

      <h2 className="text-xl font-semibold mt-6">6. Damaged or Missing Products</h2>
      <p>
        Please inspect packages upon delivery. For damaged or missing items, contact us within 48 hours:
      </p>
      <p>
        Phone: +91-8989889880<br />
        Email: <a href="mailto:saleskitchenkettles@gmail.com" className="text-emerald-600">saleskitchenkettles@gmail.com</a><br />
        Address: Kitchen Kettles, 305, Shop No. 9, Gunjur Varthur Main Road, Bengaluru – 560087
      </p>
    </div>
  );
}
