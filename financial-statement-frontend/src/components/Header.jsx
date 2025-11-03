"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Calculator", href: "/upload" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 rounded-5xl">
        <header className="flex items-center justify-between h-12 pt-6 sm:h-14 px-3 sm:px-6 relative">
          {/* Logo + Nav container */}
          <div className="flex items-center rounded-2xl sm:rounded-4xl bg-brand-white px-3 sm:px-6 py-2 opacity-90 shadow-md">
            <div className="flex items-center">
              <span className="text-base sm:text-lg font-bold tracking-wide">
                <span className="text-brand-primary">Fin-Xtract</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:block ml-8">
              <ul className="flex space-x-8 font-medium text-sm">
                {navLinks.map((link) => (
                  <li
                    key={link.label}
                    className="cursor-pointer text-brand-subtext hover:text-brand-accent transition-colors"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex items-center">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="hidden lg:inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-brand-primary bg-brand-tint hover:bg-brand-mint-light transition-colors shadow-sm mr-2"
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
            <button
              onClick={() => (window.location.href = "/upload")}
              className="hidden sm:block bg-brand-primary text-brand-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-brand-purple-light transition-colors shadow-lg"
            >
              Upload Document
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-1 text-brand-primary"
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-brand-white shadow-lg rounded-lg p-3 sm:p-4 z-50 mx-2 sm:mx-6 border border-gray-100 sm:hidden">
              <ul className="space-y-2 sm:space-y-3 font-medium text-sm">
                {navLinks.map((link) => (
                  <li
                    key={link.label}
                    className="py-2 cursor-pointer text-brand-subtext hover:text-brand-accent hover:bg-brand-tint rounded px-2 transition-colors"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>

              {/* Mobile CTA Buttons */}
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href={user ? "/dashboard" : "/signup"}
                  className="w-full text-center bg-brand-tint text-brand-primary px-4 py-2 rounded-full font-semibold hover:bg-brand-mint-light transition-colors"
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                </Link>
                <button
                  onClick={() => (window.location.href = "/upload")}
                  className="w-full bg-brand-primary text-brand-white px-4 py-2 rounded-full font-medium hover:bg-brand-purple-light transition-colors"
                >
                  Upload Document
                </button>
              </div>
            </div>
          )}
        </header>
      </div>
    </motion.div>
  );
}
