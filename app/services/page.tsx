import { Metadata } from 'next';
import Image from "next/image";
import { Truck, Shield, RefreshCcw, Headphones as HeadphonesIcon, CreditCard, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Use fallback image since service.png doesn't exist
import repairImage from "../../assets/images/kitchen.png";

export const metadata: Metadata = {
  title: "Our Services - Kitchen Kettels",
  description:
    "Learn about our premium services including free shipping, secure payments, and customer support.",
};

export default function ServicesPage() {
  const services = [
    {
      icon: Truck,
      title: "Free Shipping",
      description:
        "Enjoy free standard shipping on all orders over $50. We deliver to all 50 states.",
      features: [
        "Free on orders $50+",
        "Standard delivery 3-5 business days",
        "Express delivery available",
        "Track your order in real-time",
      ],
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description:
        "Shop with confidence knowing your payment information is protected with industry-standard encryption.",
      features: [
        "256-bit SSL encryption",
        "Multiple payment options",
        "PCI DSS compliant",
        "Fraud protection",
      ],
    },
    {
      icon: RefreshCcw,
      title: "Easy Returns",
      description:
        "Not satisfied? Return any item within 30 days for a full refund. No questions asked.",
      features: [
        "30-day return policy",
        "Free return shipping",
        "Quick refund processing",
        "Simple return process",
      ],
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description:
        "Our dedicated customer service team is always here to help with any questions or concerns.",
      features: [
        "Round-the-clock availability",
        "Multiple contact channels",
        "Expert product advice",
        "Fast response times",
      ],
    },
    {
      icon: CreditCard,
      title: "Flexible Payment",
      description:
        "Pay your way with multiple payment options including credit cards, debit cards, and digital wallets.",
      features: [
        "All major credit cards",
        "Debit card payments",
        "Digital wallet support",
        "Installment options available",
      ],
    },
    {
      icon: Package,
      title: "Quality Guarantee",
      description:
        "Every product is carefully inspected and comes with a manufacturer warranty for your peace of mind.",
      features: [
        "Quality inspection",
        "Manufacturer warranty",
        "Authentic products only",
        "Satisfaction guaranteed",
      ],
    },
  ];

  return (
    <div className="bg-white">

      {/* ---- HERO ---- */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Our Services
            </h1>
            <p className="text-xl text-slate-600">
              {`We're committed to providing exceptional service at every step of your shopping journey.`}
            </p>
          </div>
        </div>
      </section>

      {/* ---- SERVICE CARDS ---- */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-emerald-600" />
                    </div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- DELIVERY INFO ---- */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Delivery Information</h2>

            <div className="bg-white rounded-lg p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Standard Delivery
                </h3>
                <p className="text-slate-600">
                  {`Our standard delivery service typically takes 3-5 business days. Orders are processed within
                  24 hours of placement, and you'll receive tracking information via email.`}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Express Delivery</h3>
                <p className="text-slate-600">
                  {`Need your items faster? Choose express delivery at checkout for 1-2 business day delivery.
                  Express delivery is available for an additional fee.`}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  International Shipping
                </h3>
                <p className="text-slate-600">
                  {`We currently ship to select international destinations. International shipping rates and
                  delivery times vary by location. Contact our support team for more information.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⭐⭐⭐ ---- NEW ADDED SECTION (Your Required UI) ---- ⭐⭐⭐ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            {/* Left Image */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <Image
                src={repairImage}
                alt="Repair Service"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Right Content */}
            <div>
              <h2 className="text-4xl font-bold text-red-600 mb-4">
                Our Expert Appliance Repair Services
              </h2>

              <p className="text-slate-700 mb-6 leading-relaxed">
                Your kitchen deserves to run smoothly — and we&apos;re here to make sure it does!
                From kettles to mixers and everything in between, our expert technicians
                provide fast, reliable, and affordable appliance repair services right at
                your doorstep.
              </p>

              <h3 className="text-2xl font-semibold text-red-600 mb-3">We Repair:</h3>

              <ul className="space-y-2 text-slate-700 text-lg">
                <li>→ Electric Kettles</li>
                <li>→ Microwave Ovens</li>
                <li>→ Induction Cooktops</li>
                <li>→ Mixers & Grinders</li>
                <li>→ Toasters & Sandwich Makers</li>
                <li>→ Blenders & Juicers</li>
                <li>→ Coffee Machines</li>
              </ul>

              <a
                href="/contact"
                className="inline-block mt-8 px-8 py-3 border border-slate-300 rounded-full hover:bg-slate-100 transition"
              >
                CONTACT US
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ---- NEED HELP ---- */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Need Help?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {`Our customer service team is ready to assist you with any questions about our services.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="tel:+916444449"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {`Call +91 916444449`}
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
