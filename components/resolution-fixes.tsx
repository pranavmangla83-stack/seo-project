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

type ReportIssue = {
  id: string;
  pageUrl: string;
  issueType: string;
  severity: "high" | "medium" | "low";
  message: string;
  businessImpact: string | null;
  fixDifficulty: string | null;
  exactFix: string | null;
  priorityScore: number | null;
  details: Record<string, unknown>;
};

type DisplayFix = {
  id: string;
  pageUrl: string;
  issueType: string;
  priority: string;
  priorityScore: number;
  difficulty: string;
  businessImpact: string;
  recommendation: string;
  problem: string;
  verificationStatus?: string;
};

type ResolutionFixesProps = {
  issues?: ReportIssue[];
  scanId: string;
};

type FetchState = "loading" | "success" | "error";

export function ResolutionFixes({ issues = [], scanId }: ResolutionFixesProps) {
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

  const displayFixes = buildDisplayFixes(resolutions, issues);

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

      {state === "error" && displayFixes.length === 0 ? (
        <div className="top-fixes-state">
          <p>
            Top fixes are not available yet. You can still use the SEO findings
            below to improve the website.
          </p>
        </div>
      ) : null}

      {state !== "loading" && displayFixes.length === 0 ? (
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

      {state !== "loading" && displayFixes.length > 0 ? (
        <div className="premium-fix-list">
          {displayFixes.map((fix, index) => (
            <ResolutionCard
              fix={fix}
              index={index}
              key={fix.id}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ResolutionCard({
  fix,
  index,
}: {
  fix: DisplayFix;
  index: number;
}) {
  const [open, setOpen] = useState(index === 0);

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
            <span className={`severity-pill severity-${getPriorityTone(fix.priority)}`}>
              <i />
              {formatPriorityLabel(fix.priority)}
            </span>
            <span className="premium-fix-area">{formatIssueArea(fix.issueType)}</span>
          </span>
          <strong>{formatResolutionTitle(fix.issueType)}</strong>
          <span className="premium-fix-quick-meta">
            <span>{fix.priorityScore}/100 priority</span>
            <span>{formatValue(fix.difficulty)} effort</span>
            <span>{formatVerificationStatus(fix.verificationStatus)}</span>
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
                businessImpact: fix.businessImpact,
                problem: fix.problem
              })}
            </span>
          </div>

          <div className="premium-fix-action-box">
            <div className="premium-fix-icon">
              <Sparkles aria-hidden="true" size={18} />
            </div>
            <div>
              <p>Use this</p>
              <span>{fix.recommendation}</span>
            </div>
          </div>

          <div className="premium-fix-footer">
            <a
              className="premium-fix-url"
              href={fix.pageUrl}
              rel="noreferrer"
              target="_blank"
            >
              {fix.pageUrl}
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

function buildDisplayFixes(resolutions: Resolution[], issues: ReportIssue[]) {
  const resolutionFixes = resolutions.map(resolutionToDisplayFix);
  const resolutionKeys = new Set(
    resolutionFixes.map((fix) => getFixKey(fix.pageUrl, fix.issueType))
  );
  const issueFixes = issues
    .filter((issue) => !resolutionKeys.has(getFixKey(issue.pageUrl, issue.issueType)))
    .map(issueToDisplayFix);

  return [...resolutionFixes, ...issueFixes]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);
}

function resolutionToDisplayFix(resolution: Resolution): DisplayFix {
  const explanation = getOutput(resolution, "explanation");
  const suggestedFix = getOutput(resolution, "suggested_fix");
  const recommendation = getStringContent(
    suggestedFix,
    "suggestedReplacement",
    suggestedFix?.body ?? resolution.recommendedAction
  );

  return {
    businessImpact: resolution.businessImpact,
    difficulty: resolution.difficulty,
    id: `resolution-${resolution.id}`,
    issueType: resolution.issueType,
    pageUrl: resolution.pageUrl,
    priority: resolution.priority,
    priorityScore: resolution.priorityScore,
    problem: explanation?.body ?? getBeforeText(resolution.issueType),
    recommendation,
    verificationStatus: resolution.verification?.status
  };
}

function issueToDisplayFix(issue: ReportIssue): DisplayFix {
  const detailsExplanation = getStringDetail(issue.details, "explanation");
  const suggestedFix = getStringDetail(issue.details, "suggestedFix");
  const priorityScore = issue.priorityScore ?? getSeverityPriorityScore(issue.severity);

  return {
    businessImpact:
      issue.businessImpact ?? getIssueBusinessImpact(issue.issueType),
    difficulty: issue.fixDifficulty ?? "medium",
    id: `issue-${issue.id}`,
    issueType: issue.issueType,
    pageUrl: issue.pageUrl,
    priority: getIssuePriority(issue.severity, priorityScore),
    priorityScore,
    problem: detailsExplanation ?? issue.message,
    recommendation:
      issue.exactFix ?? suggestedFix ?? getSuggestedFix(issue.issueType),
    verificationStatus: "pending"
  };
}

function getFixKey(pageUrl: string, issueType: string) {
  return `${pageUrl}::${issueType}`;
}

function getStringDetail(details: Record<string, unknown>, key: string) {
  const value = details[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function getSeverityPriorityScore(severity: ReportIssue["severity"]) {
  switch (severity) {
    case "high":
      return 90;
    case "medium":
      return 70;
    case "low":
      return 50;
  }
}

function getIssuePriority(severity: ReportIssue["severity"], score: number) {
  if (severity === "high" || score >= 120) {
    return "high";
  }

  if (severity === "medium" || score >= 80) {
    return "medium";
  }

  return "low";
}

function getSuggestedFix(issueType: string) {
  switch (issueType) {
    case "weak_page_title":
      return "Write a clear page title that includes the service, location, or main offer.";
    case "weak_meta_description":
      return "Add a short description that explains the page and gives people a reason to click.";
    case "bad_heading_structure":
      return "Use one clear H1 heading that describes the main topic of the page.";
    case "missing_image_alt":
      return "Add simple alt text that describes each important image.";
    case "broken_internal_link":
      return "Update or remove links that point to missing pages.";
    case "blocked_from_indexing":
      return "Remove the noindex instruction if this page should appear in Google.";
    case "thin_content":
      return "Add more useful details, services, FAQs, examples, or local information.";
    case "missing_canonical":
      return "Add a canonical tag that points to the preferred version of this page.";
    case "canonical_points_elsewhere":
      return "Check whether this page should point to itself or intentionally point to another canonical URL.";
    case "duplicate_page_title":
      return "Write a unique page title for each affected page.";
    case "duplicate_meta_description":
      return "Write a unique meta description for each affected page.";
    default:
      return "Review this page and apply the recommended SEO improvement.";
  }
}

function getIssueBusinessImpact(issueType: string) {
  switch (issueType) {
    case "weak_page_title":
      return "The title is one of the strongest signals searchers see before clicking your page.";
    case "weak_meta_description":
      return "A weak description can reduce clicks because customers do not see a clear reason to visit.";
    case "bad_heading_structure":
      return "A clear heading helps visitors and search engines understand the page quickly.";
    case "missing_image_alt":
      return "Missing image descriptions can hurt accessibility and image search relevance.";
    case "broken_internal_link":
      return "Broken links create dead ends and reduce trust.";
    case "blocked_from_indexing":
      return "If Google cannot index the page, customers may not find it in search.";
    case "thin_content":
      return "Thin pages often do not give Google or customers enough reason to trust and rank them.";
    case "missing_canonical":
    case "canonical_points_elsewhere":
      return "Canonical issues can make it harder for Google to understand the preferred page version.";
    case "duplicate_page_title":
      return "Duplicate titles make different pages look the same in search results.";
    case "duplicate_meta_description":
      return "Duplicate descriptions can make pages less compelling and harder to distinguish in Google.";
    default:
      return "This issue can make the page harder for customers or search engines to understand.";
  }
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
    case "weak_page_title":
      return "Improve this page title";
    case "weak_meta_description":
      return "Improve this page description";
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
    case "broken_internal_link":
      return "Remove the dead end on this page";
    case "missing_canonical":
      return "Add a canonical tag";
    case "duplicate_page_title":
      return "Give this page a unique title";
    case "duplicate_meta_description":
      return "Give this page a unique description";
    default:
      return "Improve this page first";
  }
}

function getBeforeText(issueType: string) {
  switch (issueType) {
    case "missing_title":
    case "weak_page_title":
      return "The page is missing the title people usually see in Google.";
    case "missing_meta_description":
    case "weak_meta_description":
      return "The page is missing the short description that can help people decide to click.";
    case "missing_h1":
      return "The page does not have one clear main heading for visitors.";
    case "thin_content":
      return "The page may not answer enough customer questions yet.";
    case "noindex":
      return "The page may be telling Google not to show it in search.";
    case "broken_internal_links":
    case "broken_internal_link":
      return "The page sends visitors to a link that does not work.";
    case "missing_canonical":
      return "The page does not tell Google which URL version is preferred.";
    case "duplicate_page_title":
      return "This page shares a title with another page.";
    case "duplicate_meta_description":
      return "This page shares a description with another page.";
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
    case "weak_page_title":
    case "missing_meta_description":
    case "weak_meta_description":
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
