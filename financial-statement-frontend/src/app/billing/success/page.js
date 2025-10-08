"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen">
      {/* Hero section with background */}
      <div className="relative min-h-screen">
        {/* Clean Background */}
        <div
          style={{ backgroundImage: "url(/images/background2.jpg)" }}
          className="absolute inset-0 -z-20 bg-cover bg-center"
        />

        {/* Gradient overlay for brand colors */}
        <div className="absolute inset-0 -z-15 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-accent/10 pointer-events-none" />

        {/* Simple overlay for readability */}
        <div className="absolute inset-0 -z-10 bg-black/10 pointer-events-none" />
        
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-md text-center bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl border border-brand-tint"
            >
              <CheckCircle className="mx-auto h-16 w-16 text-brand-accent" />
              <h1 className="mt-4 text-2xl font-bold text-brand-primary">
                Payment Successful 🎉
              </h1>
              <p className="mt-2 text-brand-subtext">
                Thank you for subscribing! Your account has been upgraded.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/dashboard">
                  <Button className="w-full bg-brand-primary hover:bg-brand-purple-light text-brand-white">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/account">
                  <Button 
                    variant="outline" 
                    className="w-full border-brand-accent text-brand-accent hover:bg-brand-tint"
                  >
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}