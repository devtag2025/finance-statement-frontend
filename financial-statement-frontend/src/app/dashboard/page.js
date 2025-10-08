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
  Gauge,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

function signOut() {
  useAuthStore.getState().logout(); // assuming you have a logout action in your store
  window.location.href = "/login"; // redirect to login
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
      ? { icon: <BadgeCheck className="h-4 w-4" />, text: "Active", color: "bg-brand-mint-light text-brand-accent" }
      : subscriptionStatus === "past_due"
      ? { icon: <AlertCircle className="h-4 w-4" />, text: "Past Due", color: "bg-red-100 text-red-700" }
      : { icon: <AlertCircle className="h-4 w-4" />, text: "Free", color: "bg-brand-tint text-brand-primary" };

  return (
    <div className="relative min-h-screen">
      {/* Background image + overlay pinned behind everything */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/background2.jpg)" }}
      />
      {/* Gradient overlay for brand colors */}
      <div className="fixed inset-0 -z-15 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-accent/10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-black/10 pointer-events-none" />

      {/* Foreground */}
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-brand-primary drop-shadow-lg">
            Welcome{profile?.name ? `, ${profile.name}` : ""}
          </h1>
          <p className="text-brand-accent/90 drop-shadow-sm">
            Here's what's happening with your account.
          </p>
        </motion.div>

        {/* Top row: Subscription + Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Subscription Card */}
          <Card className="md:col-span-2 bg-white/90 backdrop-blur border-brand-tint shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-primary">
                <CreditCard className="h-5 w-5 text-brand-accent" />
                Subscription
              </CardTitle>
              <CardDescription className="text-brand-subtext">
                Manage your plan and billing details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>

                <span className="text-sm text-brand-dark">
                  Plan: <strong className="uppercase text-brand-primary">{planKey}</strong>
                  {planInterval ? (
                    <span className="ml-1 text-brand-subtext">
                      ({planInterval})
                    </span>
                  ) : null}
                </span>

                {periodEnd ? (
                  <span className="text-sm text-brand-subtext">
                    Renews: <strong className="text-brand-dark">{periodEnd.toLocaleDateString()}</strong>
                  </span>
                ) : null}
              </div>

              {subscriptionStatus === "free" && (
                <div className="mt-4 text-sm text-brand-subtext">
                  You're currently on the free tier. Upgrade to unlock more
                  features.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Link href="/pricing">
                <Button className="bg-brand-primary hover:bg-brand-purple-light text-brand-white">
                  {subscriptionStatus === "free"
                    ? "Choose a Plan"
                    : "Change Plan"}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={openBillingPortal}
                className="border-brand-primary text-brand-primary hover:bg-brand-tint"
              >
                Open Billing Portal
              </Button>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="border-brand-subtext text-brand-subtext hover:bg-brand-tint"
              >
                Sign Out
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Usage */}
          <Card className="bg-white/90 backdrop-blur border-brand-tint shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-primary">
                <Gauge className="h-5 w-5 text-brand-accent" />
                Usage
              </CardTitle>
              <CardDescription className="text-brand-subtext">Monthly summary</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-16 animate-pulse rounded bg-brand-tint" />
              ) : usage ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-brand-dark">
                    <span>Exports</span>
                    <span className="font-medium text-brand-accent">
                      {usage.exportsUsed ?? 0} / {usage.exportsLimit ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-dark">
                    <span>Storage</span>
                    <span className="font-medium text-brand-accent">
                      {usage.storageUsedGb ?? 0} GB
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-dark">
                    <span>API Calls</span>
                    <span className="font-medium text-brand-accent">{usage.apiCalls ?? 0}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-brand-subtext">
                  No usage data available yet.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/usage">
                <Button
                  variant="ghost"
                  className="gap-1 px-0 text-brand-accent hover:text-brand-teal-dark"
                >
                  View details <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/90 backdrop-blur border-brand-tint shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-primary">
              <ListChecks className="h-5 w-5 text-brand-accent" />
              Recent activity
            </CardTitle>
            <CardDescription className="text-brand-subtext">Your latest exports or actions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-10 animate-pulse rounded bg-brand-tint" />
                <div className="h-10 animate-pulse rounded bg-brand-tint" />
                <div className="h-10 animate-pulse rounded bg-brand-tint" />
              </div>
            ) : activity && activity.length > 0 ? (
              <ul className="divide-y divide-brand-tint">
                {activity.map((item, idx) => (
                  <li
                    key={item.id || idx}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-brand-dark">
                        {item.title || item.type || "Activity"}
                      </div>
                      <div className="text-xs text-brand-subtext">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-brand-accent text-sm hover:text-brand-teal-dark hover:underline font-medium"
                      >
                        Open
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-brand-subtext">
                No recent activity yet.
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Link href="/activity">
              <Button 
                variant="outline"
                className="border-brand-primary text-brand-primary hover:bg-brand-tint"
              >
                See all
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}