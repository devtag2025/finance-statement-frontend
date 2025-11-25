"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  AlertCircle,
  CreditCard,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

function signOut() {
  useAuthStore.getState().logout();
  window.location.href = "/login";
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);

  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [usage, setUsage] = React.useState(null);
  const [activity, setActivity] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [meRes, usageRes, actRes] = await Promise.all([
          api("/auth/me", { method: "GET", token }).catch(() => null),
          api("/usage/summary", { method: "GET", token }).catch(() => null),
          api("/activity?limit=5", { method: "GET", token }).catch(() => null),
        ]);
        setProfile(meRes?.data || meRes || user || null);
        setUsage(usageRes?.data || usageRes || null);
        setActivity(actRes?.data || actRes || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function openBillingPortal() {
    try {
      if (!token) {
        toast.error("Please log in");
        return (window.location.href = "/login");
      }
      const res = await api("/billing/create-portal", {
        method: "POST",
        token,
        body: {},
      });
      if (res?.url) window.location.href = res.url;
      else throw new Error("No portal URL returned");
    } catch (e) {
      toast.error("Couldn't open billing portal", {
        description: e?.message || "Try again in a moment.",
      });
    }
  }

  const subscriptionStatus =
    profile?.subscriptionStatus || user?.subscriptionStatus || "free";
  const planKey = profile?.planKey || user?.planKey || "free";
  const planInterval = profile?.planInterval || user?.planInterval || "";
  const periodEnd = profile?.currentPeriodEnd
    ? new Date(profile.currentPeriodEnd)
    : null;

  const statusBadge =
    subscriptionStatus === "active" || subscriptionStatus === "trialing"
      ? { icon: <BadgeCheck className="h-4 w-4" />, text: "Active", color: "bg-brand-mint-light text-brand-primary" }
      : subscriptionStatus === "past_due"
      ? { icon: <AlertCircle className="h-4 w-4" />, text: "Past Due", color: "bg-red-100 text-red-700" }
      : { icon: <AlertCircle className="h-4 w-4" />, text: "Free", color: "bg-brand-tint text-brand-primary" };

  return (
    <div className="relative min-h-screen">
      {/* Background image + overlay */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/background2.jpg)" }}
      />
      <div className="fixed inset-0 -z-15 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-primary/10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-black/10 pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-brand-primary drop-shadow-lg">
            Welcome{profile?.name ? `, ${profile.name}` : ""}
          </h1>
          <p className="text-sm sm:text-base text-brand-primary/90 drop-shadow-sm mt-1">
            Here's what's happening with your account.
          </p>
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-white/90 backdrop-blur border-brand-tint shadow-lg">
            <CardHeader className="space-y-1 pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-brand-primary">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-brand-primary" />
                Subscription
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-brand-subtext">
                Manage your plan and billing details.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status and Plan Info */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusBadge.color} w-fit`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="text-brand-dark">
                    Plan: <strong className="uppercase text-brand-primary">{planKey}</strong>
                    {planInterval && (
                      <span className="ml-1 text-brand-subtext">
                        ({planInterval})
                      </span>
                    )}
                  </span>

                  {periodEnd && (
                    <span className="text-brand-subtext">
                      Renews: <strong className="text-brand-dark">{periodEnd.toLocaleDateString()}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Free Tier Message */}
              {subscriptionStatus === "free" && (
                <div className="mt-3 p-3 bg-brand-tint/50 rounded-lg text-xs sm:text-sm text-brand-subtext border border-brand-primary/10">
                  You're currently on the free tier. Upgrade to unlock more features.
                </div>
              )}
            </CardContent>

            {/* Action Buttons */}
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button className="w-full bg-brand-primary hover:bg-brand-purple-light text-brand-white text-sm">
                  {subscriptionStatus === "free" ? "Choose a Plan" : "Change Plan"}
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={openBillingPortal}
                className="w-full sm:w-auto border-brand-primary text-brand-primary hover:bg-brand-tint text-sm"
              >
                Billing Portal
              </Button>
              
              <Button 
                variant="outline" 
                onClick={signOut}
                className="w-full sm:w-auto border-brand-subtext text-brand-subtext hover:bg-brand-tint text-sm sm:ml-auto"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-brand-subtext text-sm"
          >
            Loading your data...
          </motion.div>
        )}
      </main>
    </div>
  );
}