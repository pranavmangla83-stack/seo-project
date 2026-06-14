"use client";

import { AlertCircle, CheckCircle2, ExternalLink, Wrench } from "lucide-react";
import { useState } from "react";
import { EmailCapture } from "@/components/email-capture";
import type { ScanReport } from "@/lib/report";
import { getSuggestedFix } from "@/lib/report";

type SeoReportProps = {
  report: ScanReport;
};

export function SeoReport({ report }: SeoReportProps) {
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const topIssues = report.issues.slice(0, 5);
  const fetchedPages = report.pages.filter((page) => page.status === "fetched");

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
        <p className="text-sm font-medium text-emerald-800">SEO report</p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Your SEO report is ready
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Main issues found for {new URL(report.scan.normalized_url).hostname}
        </p>
        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
          <span className="rounded-md border border-slate-200 px-3 py-2">
            {report.pages.length} pages checked
          </span>
          <span className="rounded-md border border-slate-200 px-3 py-2">
            {fetchedPages.length} pages loaded
          </span>
          <span className="rounded-md border border-slate-200 px-3 py-2">
            {report.issues.length} issues found
          </span>
        </div>
      </div>

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
                      {issue.explanation ?? issue.message}
                    </p>
                  </div>
                </div>
                <span className={`severity-pill severity-${issue.severity}`}>
                  {issue.severity}
                </span>
              </div>

              <div className="mt-4 rounded-md bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-950">
                  Suggested fix
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {issue.suggestedFix ?? getSuggestedFix(issue.issueType)}
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
                  No major issues found in this first scan.
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  The MVP scanner did not find problems from the first issue
                  set. A deeper scan can still be added later.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        onClick={handleFixClick}
        type="button"
      >
        <Wrench aria-hidden="true" size={18} />
        Fix these issues for me
      </button>
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
