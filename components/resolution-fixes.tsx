"use client";

import {
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wrench
} from "lucide-react";
import { useEffect, useState } from "react";

type ResolutionOutput = {
  id: string;
  outputType: string;
  title: string;
  body: string;
  content: Record<string, unknown>;
  status: string;
};

type Resolution = {
  id: string;
  pageUrl: string;
  issueType: string;
  status: string;
  priority: string;
  priorityScore: number;
  difficulty: string;
  businessImpact: string;
  recommendedAction: string;
  verificationStep: string;
  outputs: ResolutionOutput[];
  verification: {
    status: string;
    failureReason: string | null;
    checkedAt: string | null;
  } | null;
};

type ResolutionResponse = {
  resolutions?: Resolution[];
  error?: string;
};

type ResolutionFixesProps = {
  scanId: string;
};

type FetchState = "loading" | "success" | "error";

export function ResolutionFixes({ scanId }: ResolutionFixesProps) {
  const [state, setState] = useState<FetchState>("loading");
  const [resolutions, setResolutions] = useState<Resolution[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadResolutions() {
      setState("loading");

      try {
        const response = await fetch(`/api/scans/${scanId}/resolutions`);
        const data = (await response.json()) as ResolutionResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load top fixes.");
        }

        if (isMounted) {
          setResolutions(data.resolutions ?? []);
          setState("success");
        }
      } catch {
        if (isMounted) {
          setResolutions([]);
          setState("error");
        }
      }
    }

    loadResolutions();

    return () => {
      isMounted = false;
    };
  }, [scanId]);

  return (
    <section className="top-fixes-experience">
      <div className="top-fixes-header">
        <div>
          <h3>Your top fixes, in order</h3>
          <p>
            Start at number one and work down. Open any fix to see what is
            happening, why it matters, and what to do next.
          </p>
        </div>
        <div className="top-fixes-legend">
          <span><i className="legend-dot legend-high" />Urgent</span>
          <span><i className="legend-dot legend-medium" />Important</span>
          <span><i className="legend-dot legend-low" />Minor</span>
        </div>
      </div>

      {state === "loading" ? (
        <div className="top-fixes-state">
          <Loader2 aria-hidden="true" size={18} />
          Loading the recommended fixes
        </div>
      ) : null}

      {state === "error" ? (
        <div className="top-fixes-state">
          <p>
            Top fixes are not available yet. You can still use the SEO findings
            below to improve the website.
          </p>
        </div>
      ) : null}

      {state === "success" && resolutions.length === 0 ? (
        <div className="top-fixes-empty">
          <CheckCircle2 aria-hidden="true" size={22} />
          <div>
            <p>Good news - we did not find urgent basic SEO issues.</p>
            <span>
              Next, we&apos;ll look for improvement opportunities as the scan gets
              deeper.
            </span>
          </div>
        </div>
      ) : null}

      {state === "success" && resolutions.length > 0 ? (
        <div className="premium-fix-list">
          {resolutions.map((resolution, index) => (
            <ResolutionCard
              index={index}
              key={resolution.id}
              resolution={resolution}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ResolutionCard({
  index,
  resolution
}: {
  index: number;
  resolution: Resolution;
}) {
  const [open, setOpen] = useState(index === 0);
  const explanation = getOutput(resolution, "explanation");
  const suggestedFix = getOutput(resolution, "suggested_fix");
  const replacement = getStringContent(
    suggestedFix,
    "suggestedReplacement",
    suggestedFix?.body ?? resolution.recommendedAction
  );
  const problemExplanation = explanation?.body ?? getBeforeText(resolution.issueType);

  return (
    <article className={`premium-fix-card ${open ? "premium-fix-open" : ""}`}>
      <button
        aria-expanded={open}
        className="premium-fix-toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="premium-fix-number">{index + 1}</span>
        <span className="premium-fix-heading">
          <span className="premium-fix-title-row">
            <span className={`severity-pill severity-${getPriorityTone(resolution.priority)}`}>
              <i />
              {formatPriorityLabel(resolution.priority)}
            </span>
            <span className="premium-fix-area">{formatIssueArea(resolution.issueType)}</span>
          </span>
          <strong>{formatResolutionTitle(resolution.issueType)}</strong>
          <span className="premium-fix-quick-meta">
            <span>{resolution.priorityScore}/100 priority</span>
            <span>{formatValue(resolution.difficulty)} effort</span>
            <span>{formatVerificationStatus(resolution.verification?.status)}</span>
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="premium-fix-chevron"
          size={20}
        />
      </button>

      {open ? (
        <div className="premium-fix-expanded">
          <div className="premium-fix-story">
            <p>Problem</p>
            <span>
              {buildProblemSummary({
                businessImpact: resolution.businessImpact,
                problem: problemExplanation
              })}
            </span>
          </div>

          <div className="premium-fix-action-box">
            <div className="premium-fix-icon">
              <Sparkles aria-hidden="true" size={18} />
            </div>
            <div>
              <p>Use this</p>
              <span>{replacement}</span>
            </div>
          </div>

          <div className="premium-fix-footer">
            <a
              className="premium-fix-url"
              href={resolution.pageUrl}
              rel="noreferrer"
              target="_blank"
            >
              {resolution.pageUrl}
              <ExternalLink aria-hidden="true" size={14} />
            </a>
            <div className="premium-fix-actions">
              <button disabled type="button">
                <Wrench aria-hidden="true" size={17} />
                Mark as Done
              </button>
              <button disabled type="button">
                <ShieldCheck aria-hidden="true" size={17} />
                Verify Fix
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function getOutput(resolution: Resolution, outputType: string) {
  return resolution.outputs.find((output) => output.outputType === outputType);
}

function getStringContent(
  output: ResolutionOutput | undefined,
  key: string,
  fallback: string
) {
  const value = output?.content?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function buildProblemSummary({
  businessImpact,
  problem
}: {
  businessImpact: string;
  problem: string;
}) {
  return `${problem} ${businessImpact}`;
}

function formatResolutionTitle(issueType: string) {
  switch (issueType) {
    case "missing_title":
      return "Give this page a clearer Google title";
    case "missing_meta_description":
      return "Give this page a better Google description";
    case "missing_h1":
      return "Give this page a clear main heading";
    case "thin_content":
      return "Make this page more helpful for customers";
    case "noindex":
      return "Make sure this page can appear on Google";
    case "broken_internal_links":
      return "Remove the dead end on this page";
    default:
      return "Improve this page first";
  }
}

function getBeforeText(issueType: string) {
  switch (issueType) {
    case "missing_title":
      return "The page is missing the title people usually see in Google.";
    case "missing_meta_description":
      return "The page is missing the short description that can help people decide to click.";
    case "missing_h1":
      return "The page does not have one clear main heading for visitors.";
    case "thin_content":
      return "The page may not answer enough customer questions yet.";
    case "noindex":
      return "The page may be telling Google not to show it in search.";
    case "broken_internal_links":
      return "The page sends visitors to a link that does not work.";
    default:
      return "The page has a basic SEO gap worth fixing.";
  }
}

function formatVerificationStatus(status?: string) {
  switch (status) {
    case "pending":
      return "Verification waiting";
    case "verified":
      return "Verified";
    case "failed":
    case "verification_failed":
      return "Needs another check";
    default:
      return "Not checked yet";
  }
}

function getPriorityTone(priority: string) {
  if (priority === "critical" || priority === "high") {
    return "high";
  }

  if (priority === "medium") {
    return "medium";
  }

  return "low";
}

function formatPriorityLabel(priority: string) {
  if (priority === "critical" || priority === "high") {
    return "Urgent";
  }

  if (priority === "medium") {
    return "Important";
  }

  return "Minor";
}

function formatIssueArea(issueType: string) {
  switch (issueType) {
    case "missing_title":
    case "missing_meta_description":
    case "missing_h1":
      return "First impressions";
    case "thin_content":
      return "Content";
    case "noindex":
      return "Visibility";
    case "broken_internal_links":
      return "Navigation";
    default:
      return "SEO";
  }
}

function formatValue(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
