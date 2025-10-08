"use client";

import Header from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { useAuthStore } from "@/stores/authStore";

// Simple animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const fadeInDown = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Page() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="min-h-screen">
      {/* Hero section with background */}
      <div className="relative min-h-screen">
        {/* Clean Background with Gradient Overlay */}
        <div
          style={{ backgroundImage: "url(/images/background2.jpg)" }}
          className="absolute inset-0 bg-cover bg-center"
        />

        {/* Gradient overlay for brand colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-accent/20" />

        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Header */}
        <div className="relative z-10">
          <Header />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            {/* Main Heading */}
            <motion.h1
              variants={fadeInDown}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-brand-primary tracking-tight drop-shadow-lg"
            >
              Fin-Xtract
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl sm:text-2xl text-black max-w-2xl mx-auto drop-shadow-md"
            >
              Your financial companion for smarter document processing
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href={user ? "/dashboard" : "/login"}>
                <motion.button
                  className="bg-brand-primary hover:bg-brand-purple-light text-brand-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                </motion.button>
              </Link>

              <Link href="/upload">
                <motion.button
                  className="bg-brand-accent/10 backdrop-blur-sm hover:bg-brand-accent/20 text-brand-accent font-semibold py-3 px-8 rounded-full border border-brand-accent/30 hover:border-brand-accent/50 transition-all shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Upload Document
                </motion.button>
              </Link>
            </motion.div>

            {/* Simple trust indicator */}
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm text-brand-accent/90 pt-8 drop-shadow-sm"
            >
              Trusted by 10,000+ professionals worldwide
            </motion.p>
          </motion.div>
        </div>

        {/* Simple scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            className="w-6 h-6 text-brand-accent/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}