"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

// Simple animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const fadeInDown = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      {/* Hero section with background */}
      <div className="relative min-h-screen">
        {/* Clean Background */}
        <div
          style={{ backgroundImage: "url(/images/background2.jpg)" }}
          className="absolute inset-0 bg-cover bg-center"
        />

        {/* Gradient overlay for brand colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-primary/20" />

        {/* Simple overlay for readability */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Header */}
        <div className="relative z-10">
          <Header />
        </div>

        {/* Main Content */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="min-h-screen flex items-center py-20">
            <div className="grid w-full gap-12 lg:grid-cols-2 items-center">
              {/* Left: Simple Marketing Content */}
              <motion.div
                className="space-y-6"
                variants={fadeInDown}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary leading-tight drop-shadow-lg">
                  Welcome to Fin-XTract
                </h1>
                <p className="text-lg text-brand-primary max-w-lg drop-shadow-md">
                  Transform your financial statements with AI-powered
                  processing. Upload, analysis, and export with complete privacy.
                </p>
              </motion.div>

              {/* Right: Auth Card */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <AuthCard />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthCard() {
  const [tab, setTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };
    try {
      await useAuthStore.getState().login(payload);
      toast.success("Welcome back 👋", {
        description: "Redirecting to your dashboard…",
      });
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error("Login failed", {
        description: err?.data?.message || "Check your credentials.",
      });
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };
    try {
      await useAuthStore.getState().register(payload);
      toast.success("Account created 🎉", {
        description: "Let's pick a plan.",
      });
      window.location.href = "/pricing";
    } catch (err) {
      toast.error("Registration failed", {
        description: err?.data?.message || "Try a different email.",
      });
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-brand-tint max-w-md mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-brand-primary">
          {tab === "login" ? "Sign In" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-brand-subtext">
          {tab === "login"
            ? "Access your dashboard"
            : "Join thousands of professionals"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v)} className="w-full">
          <div className="relative mb-6">
            <TabsList className="grid grid-cols-2 bg-brand-tint rounded-lg p-1 w-full">
              <TabsTrigger 
                value="login" 
                className="rounded-md font-medium data-[state=active]:bg-brand-primary data-[state=active]:text-brand-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="rounded-md font-medium data-[state=active]:bg-brand-primary data-[state=active]:text-brand-white"
              >
                Create Account
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-dark">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  className="h-10 border-brand-tint focus:border-brand-primary focus:ring-brand-primary"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-dark">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="h-10 border-brand-tint focus:border-brand-primary focus:ring-brand-primary"
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end text-sm pt-1">
                <Link
                  href="/forgot-password"
                  className="text-brand-primary hover:text-brand-teal-dark hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-purple-light text-brand-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-brand-subtext mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-brand-primary hover:text-brand-teal-dark font-medium hover:underline"
                onClick={() => setTab("register")}
              >
                Sign up
              </button>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-brand-dark">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="h-10 border-brand-tint focus:border-brand-primary focus:ring-brand-primary"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-brand-dark">
                  Email
                </Label>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  className="h-10 border-brand-tint focus:border-brand-primary focus:ring-brand-primary"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-brand-dark">
                  Password
                </Label>
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  required
                  className="h-10 border-brand-tint focus:border-brand-primary focus:ring-brand-primary"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-purple-light text-brand-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-brand-subtext mt-4">
              Already have an account?{" "}
              <button
                type="button"
                className="text-brand-primary hover:text-brand-teal-dark font-medium hover:underline"
                onClick={() => setTab("login")}
              >
                Sign in
              </button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-brand-tint">
          <p className="text-xs text-center text-brand-subtext">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-brand-primary hover:text-brand-teal-dark hover:underline font-medium">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand-primary hover:text-brand-teal-dark hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}