"use client";

import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trackGaEvent } from "@/lib/gtag";
import { pricingByMarket, type Market, type PricingPlan } from "@/lib/pricing";

type PricingFlowProps = {
  scanId: string;
  leadId: string;
  websiteUrl: string;
};

type SelectedPlan = {
  market: Market;
  plan: PricingPlan;
};

export function PricingFlow({ scanId, leadId, websiteUrl }: PricingFlowProps) {
  const [market, setMarket] = useState<Market>("india");
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [error, setError] = useState("");
  const plans = useMemo(() => pricingByMarket[market], [market]);

  const trackEvent = useCallback(
    async (eventName: string, metadata: Record<string, unknown>) => {
      await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventName,
          scanId,
          websiteUrl,
          metadata
        })
      }).catch(() => undefined);
    },
    [scanId, websiteUrl]
  );

  useEffect(() => {
    trackEvent("pricing_viewed", {
      market: "india"
    });
    trackGaEvent("pricing_viewed", {
      market: "india",
      scan_id: scanId,
      website_url: websiteUrl
    });
  }, [scanId, trackEvent, websiteUrl]);

  async function handleMarketChange(nextMarket: Market) {
    setMarket(nextMarket);
    trackGaEvent("pricing_market_changed", {
      market: nextMarket,
      scan_id: scanId,
      website_url: websiteUrl
    });
    await trackEvent("pricing_market_changed", {
      market: nextMarket
    });
  }

  async function handlePlanClick(plan: PricingPlan) {
    setError("");
    trackGaEvent("pricing_plan_clicked", {
      market,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_price: plan.price,
      scan_id: scanId,
      website_url: websiteUrl
    });

    const response = await fetch("/api/pricing-clicks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        scanId,
        leadId,
        websiteUrl,
        market,
        planId: plan.id
      })
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Could not save pricing interest.");
      trackGaEvent("pricing_plan_save_failed", {
        error: data.error ?? "unknown",
        market,
        plan_id: plan.id,
        scan_id: scanId,
        website_url: websiteUrl
      });
      return;
    }

    trackGaEvent("pricing_interest_saved", {
      market,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_price: plan.price,
      scan_id: scanId,
      website_url: websiteUrl
    });
    setSelectedPlan({
      market,
      plan
    });
  }

  if (selectedPlan) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <CheckCircle2
            aria-hidden="true"
            className="text-emerald-800"
            size={32}
          />
          <h1 className="mt-4 text-4xl font-semibold text-slate-950">
            You&apos;re on the list.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            This plan is not available yet, but we saved your interest.
            We&apos;ll email you when one-click SEO fixes are ready for your
            website.
          </p>
          <div className="mt-5 grid gap-3 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              Selected plan:{" "}
              <strong className="text-slate-950">{selectedPlan.plan.name}</strong>
            </p>
            <p>
              Price shown:{" "}
              <strong className="text-slate-950">{selectedPlan.plan.price}</strong>
            </p>
            <p>
              Website: <strong className="text-slate-950">{websiteUrl}</strong>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-emerald-800">Pricing</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950 sm:text-5xl">
          Choose how you want to fix your SEO issues
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          These plans are not available yet. Clicks help us understand what
          people want before we build the final fixing system.
        </p>
      </header>

      <div className="mt-8 inline-flex rounded-md border border-slate-200 bg-white p-1">
        <button
          className={`market-toggle ${market === "india" ? "market-toggle-active" : ""}`}
          onClick={() => handleMarketChange("india")}
          type="button"
        >
          India
        </button>
        <button
          className={`market-toggle ${market === "us" ? "market-toggle-active" : ""}`}
          onClick={() => handleMarketChange("us")}
          type="button"
        >
          US
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <div className="pricing-grid mt-8">
        {plans.map((plan) => (
          <article className="pricing-plan" key={plan.id}>
            <h2 className="text-2xl font-semibold text-slate-950">
              {plan.name}
            </h2>
            <p className="mt-4 text-4xl font-semibold text-slate-950">
              {plan.price}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {plan.description}
            </p>
            <button
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
              onClick={() => handlePlanClick(plan)}
              type="button"
            >
              Choose {plan.name}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
