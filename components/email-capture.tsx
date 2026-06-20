"use client";

import { ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  GOOGLE_ADS_LEAD_CONVERSION_LABEL,
  trackGaEvent,
  trackGoogleAdsConversion
} from "@/lib/gtag";

type EmailCaptureProps = {
  scanId: string;
  websiteUrl: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function EmailCapture({ scanId, websiteUrl }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");
    trackGaEvent("lead_form_submitted", {
      scan_id: scanId,
      website_url: websiteUrl
    });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scanId,
          websiteUrl,
          email
        })
      });

      const data = (await response.json()) as {
        error?: string;
        lead?: { id: string };
      };

      if (!response.ok) {
        setState("error");
        setMessage(data.error ?? "Could not save your email. Please try again.");
        trackGaEvent("lead_form_failed", {
          error: data.error ?? "unknown",
          scan_id: scanId,
          website_url: websiteUrl
        });
        return;
      }

      setState("success");
      setMessage("Email saved. The pricing page is next.");

      if (data.lead?.id) {
        trackGaEvent("lead_captured", {
          lead_id: data.lead.id,
          scan_id: scanId,
          website_url: websiteUrl
        });
        trackGoogleAdsConversion(GOOGLE_ADS_LEAD_CONVERSION_LABEL, {
          lead_id: data.lead.id,
          scan_id: scanId,
          website_url: websiteUrl
        });
        window.location.href = `/pricing?scanId=${encodeURIComponent(
          scanId
        )}&leadId=${encodeURIComponent(data.lead.id)}&websiteUrl=${encodeURIComponent(
          websiteUrl
        )}`;
      }
    } catch {
      setState("error");
      setMessage("Could not reach the server. Please try again.");
      trackGaEvent("lead_form_failed", {
        error: "network",
        scan_id: scanId,
        website_url: websiteUrl
      });
    }
  }

  return (
    <form
      className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4"
      onSubmit={handleSubmit}
    >
      <label className="text-sm font-medium text-slate-950" htmlFor="lead-email">
        Email address
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          className="min-h-12 flex-1 rounded-md border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          id="lead-email"
          name="lead-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={state === "submitting"}
          type="submit"
        >
          {state === "submitting" ? "Saving" : "Continue"}
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>
      {message ? (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            state === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
