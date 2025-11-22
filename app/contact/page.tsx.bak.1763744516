"use client";

import { Phone, Mail, MapPin, User, Info } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// ⭐ Image Imports
import contactMainImg from "../../assets/images/contact.png";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  // ⭐ Contact Info State (Dynamic)
  const [contactData, setContactData] = useState({
    phone: "",
    email: "",
    address: "",
  });

  // ⭐ Fetch Contact Info From Backend
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/contact-info"); 
        const data = await res.json();
        setContactData(data);
      } catch (error) {
        console.error("Failed to load contact info", error);
      }
    };

    fetchContactInfo();
  }, []);

  // ⭐ Form Submit Handler
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
      const res = await fetch("http://localhost:5001/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Your message has been sent successfully!");
        formRef.current?.reset(); // ⭐ FIXED reset error
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send message");
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
        className="text-3xl md:text-4xl font-semibold text-red-600 mb-10 tracking-wide"
      >
        CONTACT US
      </motion.h1>

      {/* ⭐ Contact Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-6 mb-16">

        {/* Phone */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex flex-col items-center justify-center border-2 border-red-500 rounded-xl p-8 shadow-md hover:shadow-xl transition-all"
        >
          <div className="bg-red-600 text-white rounded-full p-4 mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Phone Number</h2>
          <p className="text-gray-700">{contactData.phone}</p>
        </motion.div>

        {/* Email */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex flex-col items-center justify-center border-2 border-red-500 rounded-xl p-8 shadow-md hover:shadow-xl transition-all"
        >
          <div className="bg-red-600 text-white rounded-full p-4 mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold mb-2">E-mail</h2>
          <p className="text-gray-700 text-center">
            {contactData.email}
          </p>
        </motion.div>

        {/* Address */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex flex-col items-center justify-center border-2 border-red-500 rounded-xl p-8 shadow-md hover:shadow-xl transition-all"
        >
          <div className="bg-red-600 text-white rounded-full p-4 mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Address</h2>
          <p className="text-gray-700 text-center leading-relaxed">
            {contactData.address
              ? contactData.address.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))
              : "Loading..."}
          </p>
        </motion.div>
      </div>

      {/* ⭐ Contact Form + Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full px-6">

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl border-2 border-red-500"
        >
          <Image
            priority
            src={contactMainImg}
            alt="Contact Image"
            width={600}
            height={400}
            className="object-cover w-full h-full"
          />
        </motion.div>

        {/* Form */}
        <motion.form
          ref={formRef}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 bg-white shadow-md rounded-2xl p-8 border border-gray-200"
        >
          <div className="flex items-center border rounded-md px-3 py-2">
            <User className="text-red-600 w-5 h-5 mr-2" />
            <input name="name" type="text" placeholder="Your Name *" className="w-full focus:outline-none" required />
          </div>

          <div className="flex items-center border rounded-md px-3 py-2">
            <Phone className="text-red-600 w-5 h-5 mr-2" />
            <input name="phone" type="tel" placeholder="Mobile *" className="w-full focus:outline-none" required />
          </div>

          <div className="flex items-center border rounded-md px-3 py-2">
            <Mail className="text-red-600 w-5 h-5 mr-2" />
            <input name="email" type="email" placeholder="Email Address *" className="w-full focus:outline-none" required />
          </div>

          <div className="flex items-center border rounded-md px-3 py-2">
            <Info className="text-red-600 w-5 h-5 mr-2" />
            <input name="subject" type="text" placeholder="Subject" className="w-full focus:outline-none" />
          </div>

          <div className="border rounded-md px-3 py-2">
            <textarea
              name="message"
              placeholder="Additional Information..."
              rows={4}
              className="w-full focus:outline-none resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 transition"
          >
            {loading ? "Sending..." : "Send Query →"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
