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
import { Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

// Optional: static feature lists keyed by plan.key
const FEATURES = {
  basic: [
    "Up to 20 exports / month",
    "Client-side OCR first",
    "Rule-based calculations",
    "CSV/PDF export",
    "Email support",
  ],
  pro: [
    "Up to 200 exports / month",
    "Priority parsing pipeline",
    "Advanced field rules",
    "Branded export templates",
    "Priority support",
  ],
};

export default function PricingPage() {
  const [cycle, setCycle] = React.useState("month"); // 'month' | 'year'
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState();

  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  // Fetch plans from backend (expects { ok: true, data: Plan[] })
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api("/plans", { method: "GET" }); // adjust if mounted elsewhere
        const data = Array.isArray(res) ? res : res?.data;
        if (!data) throw new Error("No plan data returned");
        setPlans(data);
        setErr(undefined);
      } catch (e) {
        setErr(e?.message || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter to the selected billing interval
  const visiblePlans = React.useMemo(
    () =>
      plans
        .filter((p) => p.active && p.interval === cycle)
        .sort((a, b) => a.amount - b.amount),
    [plans, cycle]
  );

  // Find a plan by key with current interval
  const getPlan = (key) => visiblePlans.find((p) => p.key === key);

  async function startCheckoutByPlanId(planId) {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      toast.error("Please log in to subscribe");
      window.location.href = "/login";
      return;
    }
    if (!planId) {
      toast.error("No plan selected");
      return;
    }
    try {
      const data = await api("/billing/create-checkout-session", {
        method: "POST",
        token,
        body: { planId },
      });
      if (data?.url) {
        window.location.href = data.url; // redirect to Stripe
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e) {
      toast.error("Checkout failed", {
        description: e?.message ?? "Please try again.",
      });
    }
  }

  function PlanCard({ planKey, name, blurb, popular, cta }) {
    const planDoc = getPlan(planKey);
    const price = planDoc ? (planDoc.amount ?? 0) / 100 : 0;
    const currency = (planDoc?.currency || "usd").toUpperCase();
    const disabled = !planDoc;

    return (
      <Card
        className={`h-full bg-white/90 backdrop-blur border-brand-tint shadow-lg ${
          popular ? "ring-2 ring-brand-accent" : ""
        }`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-brand-primary">{name}</CardTitle>
              <CardDescription className="mt-1 text-brand-subtext">{blurb}</CardDescription>
            </div>
            {popular && (
              <span className="rounded-full bg-brand-tint text-brand-accent text-xs font-semibold px-3 py-1">
                Most Popular
              </span>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-brand-primary">
              {disabled ? "—" : `$${price}`}
            </span>
            <span className="text-brand-subtext text-sm">
              / {cycle === "month" ? "mo" : "yr"}{" "}
              <span className="ml-1 opacity-70">{currency}</span>
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3 text-sm">
            {(FEATURES[planKey] || []).map((f) => (
              <li key={f} className="flex items-start gap-2 text-brand-dark">
                <Check className="shrink-0 mt-0.5 h-4 w-4 text-brand-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-2 text-xs text-brand-subtext">
            <AlertCircle className="h-4 w-4 text-brand-accent" />
            <span>Cancel anytime in the customer portal.</span>
          </div>
        </CardContent>

        <CardFooter className="mt-2">
          <Button
            className={`w-full cursor-pointer ${
              popular
                ? "bg-brand-accent hover:bg-brand-teal-dark text-brand-white"
                : "bg-brand-primary hover:bg-brand-purple-light text-brand-white"
            }`}
            disabled={disabled}
            onClick={() => startCheckoutByPlanId(planDoc?._id)}
          >
            {!user ? "Log in to continue" : cta}
          </Button>
        </CardFooter>
      </Card>
    );
  }

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
        
        <Header />

        <section className="relative pt-24 pb-6 sm:pt-28 sm:pb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-primary drop-shadow-lg"
            >
              Simple, transparent pricing
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mt-3 text-brand-dark drop-shadow-sm max-w-2xl mx-auto"
            >
              Pay monthly, or yearly for a discount. No hidden fees. Cancel
              anytime from your portal.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mt-6 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur p-1 shadow-md"
              role="tablist"
              aria-label="Billing cycle"
            >
              <button
                onClick={() => setCycle("month")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  cycle === "month"
                    ? "bg-brand-accent text-brand-white shadow"
                    : "text-brand-dark hover:text-brand-accent"
                }`}
                role="tab"
                aria-selected={cycle === "month"}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("year")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  cycle === "year"
                    ? "bg-brand-accent text-brand-white shadow"
                    : "text-brand-dark hover:text-brand-accent"
                }`}
                role="tab"
                aria-selected={cycle === "year"}
              >
                Yearly{" "}
                <span className="ml-1 text-xs opacity-80">(save 20%)</span>
              </button>
            </motion.div>

            <div className="mt-4 text-sm">
              {loading && (
                <span className="text-brand-subtext drop-shadow-sm">Loading plans…</span>
              )}
              {!loading && err && (
                <span className="text-red-600 drop-shadow-sm">Error: {err}</span>
              )}
            </div>
          </div>
        </section>

        <section className="pb-16 z-10 sm:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-6 sm:gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <PlanCard
                planKey="basic"
                name="Basic"
                blurb="Everything you need to get started."
                cta="Get Basic"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <PlanCard
                planKey="pro"
                name="Pro"
                blurb="For power users and small teams."
                popular
                cta="Go Pro"
              />
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12 text-center text-sm text-brand-dark drop-shadow-sm">
            Questions?{" "}
            <Link href="/contact" className="text-brand-accent hover:text-brand-teal-dark hover:underline font-medium">
              Contact us
            </Link>
            . Already subscribed?{" "}
            <Link href="/dashboard" className="text-brand-accent hover:text-brand-teal-dark hover:underline font-medium">
              Go to dashboard
            </Link>
            .
          </div>
        </section>
      </div>
    </div>
  );
}