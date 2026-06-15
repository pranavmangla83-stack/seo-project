"use client";

import { ArrowRight } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { SeoReport } from "@/components/seo-report";
import { trackGaEvent } from "@/lib/gtag";
import type { ScanReport } from "@/lib/report";

type FormState = "idle" | "submitting" | "success" | "error";

export function ScanForm() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [report, setReport] = useState<ScanReport | null>(null);
  const [progress, setProgress] = useState(0);
  const isSubmittingRef = useRef(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (state !== "submitting") {
      return;
    }

    const checkpoints = [28, 42, 57, 68, 78, 86, 92];
    let index = 0;

    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = checkpoints[index] ?? Math.min(current + 1, 94);
        index += 1;
        return Math.max(current, next);
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (!report) {
      return;
    }

    window.setTimeout(() => {
      reportRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  }, [report]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setState("submitting");
    setProgress(12);
    setMessage("");
    setReport(null);
    trackGaEvent("scan_started", {
      website_url: websiteUrl
    });

    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          websiteUrl,
          campaign: getCampaignParams()
        })
      });

      const data = (await response.json()) as {
        error?: string;
        scan?: ScanReport["scan"];
        pages?: ScanReport["pages"];
        issues?: ScanReport["issues"];
      };

      if (!response.ok) {
        setState("error");
        setMessage(data.error ?? "Could not start scan. Please try again.");
        trackGaEvent("scan_failed", {
          website_url: websiteUrl,
          error: data.error ?? "unknown"
        });
        return;
      }

      setState("success");
      setProgress(100);
      setMessage("Report is ready. Showing your SEO audit below.");

      if (data.scan && data.pages && data.issues) {
        setReport({
          scan: data.scan,
          pages: data.pages,
          issues: data.issues
        });
        trackGaEvent("scan_completed", {
          issue_count: data.issues.length,
          page_count: data.pages.length,
          scan_id: data.scan.id,
          website_url: data.scan.normalized_url
        });
      }
    } catch {
      setState("error");
      setMessage("Could not reach the scanner. Please try again.");
      trackGaEvent("scan_failed", {
        website_url: websiteUrl,
        error: "network"
      });
    } finally {
      isSubmittingRef.current = false;
    }
  }

  return (
    <>
      {state === "submitting" ? (
        <div className="scan-progress-toast">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Scanning website</span>
            <span>{progress}%</span>
          </div>
          <div
            aria-label="Scan progress"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="mt-3 h-3 overflow-hidden rounded-md bg-slate-100"
            role="progressbar"
          >
            <div
              className="progress-fill h-full rounded-md transition"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
      <form
        className="mt-4 max-w-2xl rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="website-url">
          Website URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="min-h-12 flex-1 rounded-md border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            id="website-url"
            name="website-url"
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="example.com"
            type="text"
            value={websiteUrl}
          />
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={state === "submitting"}
            type="submit"
          >
            {state === "submitting" ? "Scanning website" : "Scan my website"}
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
        {state === "submitting" ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Scanning website</span>
              <span>{progress}%</span>
            </div>
            <div
              aria-label="Scan progress"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progress}
              className="mt-3 h-3 overflow-hidden rounded-md bg-slate-100"
              role="progressbar"
            >
              <div
                className="progress-fill h-full rounded-md transition"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </form>
      {report ? (
        <div ref={reportRef}>
          <SeoReport report={report} />
        </div>
      ) : null}
    </>
  );
}

function getCampaignParams() {
  if (typeof window === "undefined") {
    return {};
  }

  const searchParams = new URLSearchParams(window.location.search);
  const trackedKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid"
  ];

  return Object.fromEntries(
    trackedKeys
      .map((key) => [key, searchParams.get(key)] as const)
      .filter(([, value]) => Boolean(value))
  );
}
