"use client";

import { Phone, Mail, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useRef } from "react";

// ⭐ Image Imports
import contactMainImg from "../../assets/images/contact.png";

// ⭐ API BASE URL (SAFE: ENV → FALLBACK)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://kk-backend-5c11.onrender.com";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  
  // ⭐ Card reveal states
  const [revealPhone, setRevealPhone] = useState(false);
  const [revealEmail, setRevealEmail] = useState(false);
  const [revealAddress, setRevealAddress] = useState(false);

  // ⭐ Static Contact Info (matching Footer)
  const contactData = {
    phone: "+91 8989889880",
    email: "saleskitchenkettles@gmail.com",
    address: "Ground Floor & First Floor, No. 305, Shop No. 9,\nVarthur Main Road, Opp. Shani Mahatma Temple,\nGunjur, Bengaluru – 560087",
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-emerald-50 max-w-2xl mx-auto"
          >
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </motion.p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Phone Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => setRevealPhone(!revealPhone)}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[200px] flex flex-col justify-center"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4 mx-auto">
              <Phone className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Phone</h3>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{
                opacity: revealPhone ? 1 : 0,
                y: revealPhone ? 0 : 10,
                scale: revealPhone ? 1 : 0.95,
                height: revealPhone ? 'auto' : 0
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <p className="text-gray-600 text-center break-words pt-2">{contactData.phone}</p>
            </motion.div>
            {!revealPhone && (
              <p className="text-sm text-emerald-600 text-center mt-2 font-medium">Click to reveal</p>
            )}
          </motion.div>

          {/* Email Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => setRevealEmail(!revealEmail)}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer min-h-[200px] flex flex-col justify-center"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4 mx-auto">
              <Mail className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Email</h3>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{
                opacity: revealEmail ? 1 : 0,
                y: revealEmail ? 0 : 10,
                scale: revealEmail ? 1 : 0.95,
                height: revealEmail ? 'auto' : 0
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <p className="text-gray-600 text-center break-words pt-2">{contactData.email}</p>
            </motion.div>
            {!revealEmail && (
              <p className="text-sm text-emerald-600 text-center mt-2 font-medium">Click to reveal</p>
            )}
          </motion.div>

          {/* Address Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => setRevealAddress(!revealAddress)}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer sm:col-span-2 lg:col-span-1 min-h-[200px] flex flex-col justify-center"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4 mx-auto">
              <MapPin className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Address</h3>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{
                opacity: revealAddress ? 1 : 0,
                y: revealAddress ? 0 : 10,
                scale: revealAddress ? 1 : 0.95,
                height: revealAddress ? 'auto' : 0
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <p className="text-gray-600 text-center whitespace-pre-line break-words pt-2">
                {contactData.address}
              </p>
            </motion.div>
            {!revealAddress && (
              <p className="text-sm text-emerald-600 text-center mt-2 font-medium">Click to reveal</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Form + Image Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative h-64 sm:h-80 lg:h-auto min-h-[400px] rounded-2xl overflow-hidden shadow-xl"
          >
            <Image 
              src={contactMainImg} 
              alt="Contact Kitchen Kettles" 
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
            <p className="text-gray-600 mb-8">Fill out the form below and we&apos;ll get back to you shortly.</p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us what&apos;s on your mind..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
