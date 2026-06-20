"use client";

import { AlertCircle, CheckCircle2, ExternalLink, Wrench } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmailCapture } from "@/components/email-capture";
import { ResolutionFixes } from "@/components/resolution-fixes";
import type { ScanReport } from "@/lib/report";
import { getSuggestedFix } from "@/lib/report";

type SeoReportProps = {
  report: ScanReport;
};

export function SeoReport({ report }: SeoReportProps) {
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const topIssues = report.issues.slice(0, 5);
  const fetchedPages = report.pages.filter((page) => page.status === "fetched");
  const host = new URL(report.scan.normalized_url).hostname;

  async function handleFixClick() {
    setShowEmailCapture(true);

    await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventName: "fix_cta_clicked",
        scanId: report.scan.id,
        websiteUrl: report.scan.normalized_url
      })
    }).catch(() => undefined);
  }

  return (
    <section className="mt-10 max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5">
        <p className="text-sm font-medium text-emerald-800">SEO report for {host}</p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Top issues blocking traffic
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          These are the fixes most likely to help customers find and trust your
          website in search.
        </p>
      </div>

      <ResolutionFixes scanId={report.scan.id} />

      <div className="grid gap-4 py-5">
        {topIssues.length > 0 ? (
          topIssues.map((issue, index) => (
            <article
              className="rounded-md border border-slate-200 p-4"
              key={`${issue.pageUrl}-${issue.issueType}-${index}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-50 text-rose-800">
                    <AlertCircle aria-hidden="true" size={19} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">
                      {formatIssueType(issue.issueType)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {issue.businessImpact ?? issue.explanation ?? issue.message}
                    </p>
                  </div>
                </div>
                <span className="severity-pill severity-high">
                  Priority {issue.priority ?? index + 1}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-950">
                    Priority score
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {issue.priorityScore ?? issue.sortScore ?? "Medium"}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-950">
                    Business impact
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatValue(issue.estimatedImpact)}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-950">
                    Difficulty
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatValue(issue.fixDifficulty)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="rounded-md border border-slate-200 px-3 py-2">
                  Severity: {formatValue(issue.severity)}
                </span>
                <span className="rounded-md border border-slate-200 px-3 py-2">
                  Page importance: {issue.pageImportance ?? "Unknown"}
                </span>
                <span className="rounded-md border border-slate-200 px-3 py-2">
                  Confidence: {formatValue(issue.confidence)}
                </span>
              </div>

              <div className="mt-4 rounded-md bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800">
                  Why this matters
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  {issue.explanation ?? issue.message}
                </p>
              </div>

              <div className="mt-4 rounded-md bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-950">
                  Exact fix instructions
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {issue.exactFix ??
                    issue.suggestedFix ??
                    getSuggestedFix(issue.issueType)}
                </p>
              </div>

              <a
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600"
                href={issue.pageUrl}
                rel="noreferrer"
                target="_blank"
              >
                View page
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            </article>
          ))
        ) : (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex gap-3">
              <CheckCircle2
                aria-hidden="true"
                className="text-emerald-800"
                size={20}
              />
              <div>
                <p className="font-semibold text-emerald-800">
                  No major traffic blockers found in this first scan.
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  The scanner did not find high-priority problems in the pages
                  checked. A deeper scan can still be added later.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 border-t border-slate-200 pt-5 text-sm text-slate-600">
        <span className="rounded-md border border-slate-200 px-3 py-2">
          {report.pages.length} pages checked
        </span>
        <span className="rounded-md border border-slate-200 px-3 py-2">
          {fetchedPages.length} pages loaded
        </span>
        <span className="rounded-md border border-slate-200 px-3 py-2">
          {report.issues.length} total findings
        </span>
      </div>

      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        onClick={handleFixClick}
        type="button"
      >
        <Wrench aria-hidden="true" size={18} />
        Fix these issues for me
      </button>
      <Link
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
        href={`/reports/${report.scan.id}`}
      >
        Open full report dashboard
        <ExternalLink aria-hidden="true" size={16} />
      </Link>
      {showEmailCapture ? (
        <EmailCapture
          scanId={report.scan.id}
          websiteUrl={report.scan.normalized_url}
        />
      ) : null}
    </section>
  );
}

function formatIssueType(issueType: string) {
  return issueType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatValue(value?: string) {
  if (!value) {
    return "Medium";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
