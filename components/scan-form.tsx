"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  GOOGLE_ADS_SCAN_CONVERSION_LABEL,
  trackGaEvent,
  trackGoogleAdsConversion
} from "@/lib/gtag";
import type { ScanReport } from "@/lib/report";
import { normalizeWebsiteUrl } from "@/lib/url";

type FormState = "idle" | "submitting" | "success" | "error";

export function ScanForm() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const isSubmittingRef = useRef(false);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    const submittedUrl = getSubmittedWebsiteUrl(event.currentTarget, websiteUrl);
    const submitDebug = getSubmitDebug(event.currentTarget, websiteUrl, submittedUrl);
    setWebsiteUrl(submittedUrl);

    try {
      normalizeWebsiteUrl(submittedUrl);
    } catch {
      setState("error");
      setProgress(0);
      setMessage("Enter a valid website URL.");
      trackGaEvent("scan_failed", {
        website_url: submittedUrl,
        error: "invalid_url"
      });
      void logInvalidScanAttempt(submittedUrl, submitDebug);
      return;
    }

    isSubmittingRef.current = true;
    setState("submitting");
    setProgress(12);
    setMessage("");
    trackGaEvent("scan_started", {
      website_url: submittedUrl
    });

    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          websiteUrl: submittedUrl,
          campaign: getCampaignParams(),
          debug: submitDebug
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
          website_url: submittedUrl,
          error: data.error ?? "unknown"
        });
        return;
      }

      setState("success");
      setProgress(100);
      setMessage("Report is ready. Opening your SEO audit.");

      if (data.scan && data.pages && data.issues) {
        trackGaEvent("scan_completed", {
          issue_count: data.issues.length,
          page_count: data.pages.length,
          scan_id: data.scan.id,
          website_url: data.scan.normalized_url
        });
        trackGoogleAdsConversion(GOOGLE_ADS_SCAN_CONVERSION_LABEL, {
          scan_id: data.scan.id,
          website_url: data.scan.normalized_url
        });
        router.push(`/reports/${data.scan.id}`);
      }
    } catch {
      setState("error");
      setMessage("Could not reach the scanner. Please try again.");
      trackGaEvent("scan_failed", {
        website_url: submittedUrl,
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
        className="home-scan-form"
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="website-url">
          Website URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            autoCapitalize="none"
            autoComplete="url"
            autoCorrect="off"
            className="home-scan-input"
            id="website-url"
            inputMode="url"
            name="website-url"
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="example.com"
            spellCheck={false}
            type="text"
            value={websiteUrl}
          />
          <button
            className="home-scan-button"
            disabled={state === "submitting"}
            type="submit"
          >
            {state === "submitting" ? "Scanning website" : "Scan my website"}
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </div>
        {message ? (
          <p
            className={`home-scan-message ${
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
    </>
  );
}

function getSubmittedWebsiteUrl(form: HTMLFormElement, fallback: string) {
  const formData = new FormData(form);
  const value = formData.get("website-url");

  if (typeof value === "string") {
    return value.trim();
  }

  return fallback.trim();
}

function getSubmitDebug(
  form: HTMLFormElement,
  stateUrl: string,
  submittedUrl: string
) {
  const formData = new FormData(form);
  const formValue = formData.get("website-url");
  const formUrl = typeof formValue === "string" ? formValue.trim() : "";
  const trimmedStateUrl = stateUrl.trim();

  return {
    formInputLength: formUrl.length,
    reactStateLength: trimmedStateUrl.length,
    submittedInputLength: submittedUrl.length,
    stateAndFormMatched: trimmedStateUrl === formUrl,
    temporaryReason: "scan_url_submission_monitoring"
  };
}

async function logInvalidScanAttempt(
  websiteUrl: string,
  debug: ReturnType<typeof getSubmitDebug>
) {
  try {
    await fetch("/api/scans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        websiteUrl,
        campaign: getCampaignParams(),
        debug
      })
    });
  } catch {
    // Best-effort analytics only; the visible validation message is already shown.
  }
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
