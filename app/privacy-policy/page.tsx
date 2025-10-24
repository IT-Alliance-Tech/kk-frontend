export const metadata = {
  title: "Privacy Policy | KitchenKettles",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-700 space-y-4">
      <h1 className="text-3xl font-bold mb-4 text-emerald-700">Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last Updated: 15-06-2025</p>

      <p>
        At <strong>KitchenKettles.com</strong>, we value your privacy and are committed to
        protecting your personal information.
      </p>

      <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
      <ul className="list-disc ml-6 space-y-1">
        <li>Identity Data: Full name, contact number, email address</li>
        <li>Transaction Data: Order history, billing and shipping details</li>
        <li>Technical Data: IP address, browser type, device information, and cookies</li>
        <li>Usage Data: How you interact with our website</li>
        <li>Communication Data: Any feedback or support messages you send</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">2. How We Use Your Information</h2>
      <ul className="list-disc ml-6 space-y-1">
        <li>To process and fulfill your orders</li>
        <li>To communicate updates and offers (if opted-in)</li>
        <li>To improve our website and customer experience</li>
        <li>To comply with legal obligations and prevent fraud</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">3. Sharing Your Information</h2>
      <p>
        We share data only with trusted third parties such as logistics providers, payment gateways,
        and technical service providers. We do not sell or rent your data to anyone.
      </p>

      <h2 className="text-xl font-semibold mt-6">4. Data Security</h2>
      <p>
        We implement SSL encryption, restricted access, and secure storage. However, no system is
        100% secure, and we cannot guarantee absolute protection.
      </p>

      <h2 className="text-xl font-semibold mt-6">5. Cookies and Tracking</h2>
      <p>
        Cookies help us personalize your experience and analyze site usage. You may disable cookies
        in your browser settings.
      </p>

      <h2 className="text-xl font-semibold mt-6">6. Data Retention</h2>
      <p>
        Your personal data is retained as long as your account is active or required by law. You may
        request deletion of your data.
      </p>

      <h2 className="text-xl font-semibold mt-6">7. Your Rights</h2>
      <ul className="list-disc ml-6 space-y-1">
        <li>Access or correct your personal data</li>
        <li>Withdraw consent for marketing</li>
        <li>Request deletion of your data</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">8. Contact Us</h2>
      <p>
        Email: <a href="mailto:saleskitchenkettles@gmail.com" className="text-emerald-600">saleskitchenkettles@gmail.com</a><br />
        Phone: +91-8989889880
      </p>
    </div>
  );
}
