"use client";

import { Phone, Mail, MapPin, User, Info } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// ⭐ Image Imports
import contactMainImg from "../../assets/images/contact.png";

// ⭐ API BASE URL (SAFE: ENV → FALLBACK)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://kk-backend-5c11.onrender.com";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  // ⭐ Contact Info State
  const [contactData, setContactData] = useState({
    phone: "",
    email: "",
    address: "",
  });

  // ⭐ Fetch Contact Info
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/contact/contact-info`);
        const data = await res.json();
        setContactData(data);
      } catch (error) {
        console.error("Failed to load contact info", error);
      }
    };

    fetchContactInfo();
  }, []);

  // ⭐ Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(formRef.current!);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || "Your message has been sent successfully!");
        formRef.current?.reset();
      } else {
        alert(result.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-semibold text-emerald-600 mb-10 tracking-wide"
      >
        CONTACT US
      </motion.h1>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-6 mb-16">
        <div className="border-2 border-emerald-500 rounded-xl p-8 text-center">
          <Phone className="mx-auto mb-2 text-emerald-600" />
          <p>{contactData.phone}</p>
        </div>
        <div className="border-2 border-emerald-500 rounded-xl p-8 text-center">
          <Mail className="mx-auto mb-2 text-emerald-600" />
          <p>{contactData.email}</p>
        </div>
        <div className="border-2 border-emerald-500 rounded-xl p-8 text-center">
          <MapPin className="mx-auto mb-2 text-emerald-600" />
          <p className="whitespace-pre-line">{contactData.address}</p>
        </div>
      </div>

      {/* Form + Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full px-6">
        <Image src={contactMainImg} alt="Contact" className="rounded-xl" />
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="name" required placeholder="Name" />
          <input name="phone" required placeholder="Phone" />
          <input name="email" required placeholder="Email" />
          <input name="subject" placeholder="Subject" />
          <textarea name="message" placeholder="Message" />
          <button disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
