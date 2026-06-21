"use client";

import {
  ChevronDown,
  CheckCircle2,
  Check,
  Copy,
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
  scanIssueId: string;
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
  affectedPages?: AffectedPage[];
  totalAffectedCount?: number;
  id: string;
  pageUrl: string;
  issueType: string;
  priority: string;
  priorityScore: number;
  difficulty: string;
  businessImpact: string;
  recommendation: string;
  problem: string;
  title: string;
  verificationStatus?: string;
};

type AffectedPage = {
  label: string;
  valueLabel: string;
  pageUrl: string;
  suggestedLabel?: string;
  suggestedValue?: string;
  value: string;
  length: number | null;
};

type ResolutionFixesProps = {
  issues?: ReportIssue[];
  scanId: string;
};

type FetchState = "loading" | "success" | "error";

const MAX_VISIBLE_AFFECTED_ITEMS = 3;

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copySuggestedValue(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      setCopiedKey(null);
    }
  }

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
          <strong>{fix.title}</strong>
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
            {fix.affectedPages && fix.affectedPages.length > 0 ? (
              <div className="premium-affected-pages">
                {fix.affectedPages.map((page) => (
                  <div className="premium-affected-page" key={`${page.pageUrl}-${page.value}`}>
                    <p className="premium-affected-field">
                      <span className="premium-affected-label premium-affected-label-page">
                        Page
                      </span>
                      <strong>{page.label}</strong>
                    </p>
                    <p className="premium-affected-field">
                      <span className="premium-affected-label premium-affected-label-value">
                        {page.valueLabel}
                      </span>
                      <strong>{page.value}</strong>
                    </p>
                    {page.suggestedValue ? (
                      <p className="premium-affected-field">
                        <span className="premium-affected-label premium-affected-label-suggested">
                          {page.suggestedLabel ?? "Suggested fix"}
                        </span>
                        <strong>{page.suggestedValue}</strong>
                        <button
                          className="premium-copy-button"
                          onClick={() =>
                            copySuggestedValue(
                              page.suggestedValue!,
                              `${page.pageUrl}-${page.suggestedValue}`
                            )
                          }
                          type="button"
                        >
                          {copiedKey === `${page.pageUrl}-${page.suggestedValue}` ? (
                            <Check aria-hidden="true" size={15} />
                          ) : (
                            <Copy aria-hidden="true" size={15} />
                          )}
                          {copiedKey === `${page.pageUrl}-${page.suggestedValue}`
                            ? "Copied"
                            : "Copy"}
                        </button>
                      </p>
                    ) : null}
                    {page.length !== null ? (
                      <p className="premium-affected-field">
                        <span className="premium-affected-label premium-affected-label-length">
                          Length
                        </span>
                        <strong>{page.length} characters</strong>
                      </p>
                    ) : null}
                  </div>
                ))}
                {fix.totalAffectedCount &&
                fix.totalAffectedCount > fix.affectedPages.length ? (
                  <p className="premium-affected-more">
                    +{fix.totalAffectedCount - fix.affectedPages.length} more affected
                  </p>
                ) : null}
              </div>
            ) : null}
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
              {fix.affectedPages && fix.affectedPages.length > 1
                ? `${fix.totalAffectedCount ?? fix.affectedPages.length} pages affected`
                : fix.pageUrl}
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
  const issueById = new Map(issues.map((issue) => [issue.id, issue]));
  const issueByPageAndType = new Map(
    issues.map((issue) => [getFixKey(issue.pageUrl, issue.issueType), issue])
  );
  const resolutionFixes = resolutions.map((resolution) =>
    resolutionToDisplayFix(
      resolution,
      issueById.get(resolution.scanIssueId) ??
        issueByPageAndType.get(getFixKey(resolution.pageUrl, resolution.issueType))
    )
  );
  const resolutionKeys = new Set(
    resolutionFixes.map((fix) => getFixKey(fix.pageUrl, fix.issueType))
  );
  const issueFixes = groupReportIssues(
    issues.filter((issue) => !resolutionKeys.has(getFixKey(issue.pageUrl, issue.issueType)))
  );

  return groupDisplayFixesByIssueType([...resolutionFixes, ...issueFixes])
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);
}

function groupDisplayFixesByIssueType(fixes: DisplayFix[]) {
  const grouped = new Map<string, DisplayFix[]>();

  for (const fix of fixes) {
    const groupKey = normalizeIssueTypeForGrouping(fix.issueType);
    grouped.set(groupKey, [...(grouped.get(groupKey) ?? []), fix]);
  }

  return [...grouped.entries()].map(([issueType, group]) => {
    if (group.length === 1) {
      return group[0];
    }

    const sortedGroup = [...group].sort((a, b) => b.priorityScore - a.priorityScore);
    const primaryFix = sortedGroup[0];
    const allAffectedPages = sortedGroup.flatMap((fix) =>
      fix.affectedPages && fix.affectedPages.length > 0
        ? fix.affectedPages
        : [displayFixToAffectedPage(fix)]
    );

    return {
      ...primaryFix,
      affectedPages: allAffectedPages.slice(0, MAX_VISIBLE_AFFECTED_ITEMS),
      id: `display-group-${issueType}`,
      issueType,
      pageUrl: primaryFix.pageUrl,
      problem: getGroupedProblem(issueType, allAffectedPages.length),
      title: getGroupedTitle(issueType),
      totalAffectedCount: allAffectedPages.length
    };
  });
}

function displayFixToAffectedPage(fix: DisplayFix): AffectedPage {
  return {
    label: getPageLabel(fix.pageUrl),
    length: null,
    pageUrl: fix.pageUrl,
    value: fix.pageUrl,
    valueLabel: "Page URL"
  };
}

function resolutionToDisplayFix(
  resolution: Resolution,
  sourceIssue?: ReportIssue
): DisplayFix {
  const explanation = getOutput(resolution, "explanation");
  const suggestedFix = getOutput(resolution, "suggested_fix");
  const recommendation = getStringContent(
    suggestedFix,
    "suggestedReplacement",
    suggestedFix?.body ?? resolution.recommendedAction
  );
  const affectedPages = sourceIssue
    ? issueToAffectedPages(sourceIssue, {
        suggestedValue: recommendation,
        suggestedLabel: getSuggestedValueLabel(resolution.issueType)
      }).slice(0, MAX_VISIBLE_AFFECTED_ITEMS)
    : undefined;

  return {
    affectedPages,
    businessImpact: resolution.businessImpact,
    difficulty: resolution.difficulty,
    id: `resolution-${resolution.id}`,
    issueType: resolution.issueType,
    pageUrl: resolution.pageUrl,
    priority: resolution.priority,
    priorityScore: resolution.priorityScore,
    problem: explanation?.body ?? getBeforeText(resolution.issueType),
    recommendation,
    title: formatResolutionTitle(resolution.issueType),
    totalAffectedCount: affectedPages?.length,
    verificationStatus: resolution.verification?.status
  };
}

function groupReportIssues(issues: ReportIssue[]) {
  const grouped = new Map<string, ReportIssue[]>();

  for (const issue of issues) {
    grouped.set(issue.issueType, [...(grouped.get(issue.issueType) ?? []), issue]);
  }

  return [...grouped.entries()].map(([issueType, group]) =>
    groupedIssueToDisplayFix(issueType, group)
  );
}

function groupedIssueToDisplayFix(issueType: string, issues: ReportIssue[]): DisplayFix {
  const sortedIssues = [...issues].sort(
    (a, b) =>
      (b.priorityScore ?? getSeverityPriorityScore(b.severity)) -
      (a.priorityScore ?? getSeverityPriorityScore(a.severity))
  );
  const firstIssue = sortedIssues[0];
  const allAffectedPages = sortedIssues.flatMap((issue) =>
    issueToAffectedPages(issue)
  );
  const affectedPages = allAffectedPages.slice(0, MAX_VISIBLE_AFFECTED_ITEMS);
  const priorityScore =
    sortedIssues[0]?.priorityScore ?? getSeverityPriorityScore(sortedIssues[0]?.severity ?? "low");

  return {
    affectedPages,
    businessImpact:
      firstIssue.businessImpact ?? getIssueBusinessImpact(firstIssue.issueType),
    difficulty: firstIssue.fixDifficulty ?? "easy",
    id: `issue-group-${issueType}`,
    issueType,
    pageUrl: firstIssue.pageUrl,
    priority: getIssuePriority(firstIssue.severity, priorityScore),
    priorityScore,
    problem: getGroupedProblem(issueType, allAffectedPages.length),
    recommendation: getGroupedRecommendation(issueType),
    title: getGroupedTitle(issueType),
    totalAffectedCount: allAffectedPages.length,
    verificationStatus: "pending"
  };
}

function issueToAffectedPages(
  issue: ReportIssue,
  suggestion?: { suggestedLabel: string; suggestedValue: string }
): AffectedPage[] {
  const affectedUrls = getStringArrayDetail(issue.details, "affectedPages");
  const pageUrls = affectedUrls.length > 0 ? affectedUrls : [issue.pageUrl];
  const value = getAffectedPageValue(issue);
  const rawLength = issue.details.length;

  return pageUrls.map((pageUrl) => ({
    label: getPageLabel(pageUrl),
    length: typeof rawLength === "number" ? rawLength : null,
    pageUrl,
    value: value.text,
    valueLabel: value.label,
    ...suggestion
  }));
}

function getAffectedPageValue(issue: ReportIssue) {
  switch (issue.issueType) {
    case "weak_page_title":
      return {
        label: "Current title tag",
        text: getStringDetail(issue.details, "title") ?? "Missing title tag"
      };
    case "weak_meta_description":
      return {
        label: "Current meta description",
        text:
          getStringDetail(issue.details, "metaDescription") ??
          "Missing meta description"
      };
    case "duplicate_page_title":
      return {
        label: "Shared title tag",
        text: getStringDetail(issue.details, "duplicateTitle") ?? "Duplicate title tag"
      };
    case "duplicate_meta_description":
      return {
        label: "Shared meta description",
        text:
          getStringDetail(issue.details, "duplicateMetaDescription") ??
          "Duplicate meta description"
      };
    case "missing_canonical":
      return {
        label: "Canonical tag",
        text: "Missing canonical tag"
      };
    case "canonical_points_elsewhere":
      return {
        label: "Current canonical URL",
        text:
          getStringDetail(issue.details, "canonicalUrl") ??
          "Points to another URL"
      };
    case "bad_heading_structure":
      return {
        label: "Current H1 headings",
        text: formatH1Headings(issue)
      };
    case "missing_image_alt":
      return {
        label: "Image alt text",
        text: formatMissingAltText(issue)
      };
    case "blocked_from_indexing":
      return {
        label: "Robots meta tag",
        text: getStringDetail(issue.details, "robotsMeta") ?? "noindex"
      };
    case "thin_content":
      return {
        label: "Word count",
        text: formatNumberDetail(issue.details, "wordCount", issue.message)
      };
    case "broken_internal_link":
      return {
        label: "Broken link",
        text: getFirstStringDetail(issue.details, "brokenLinks") ?? issue.message
      };
    default:
      return {
        label: "Issue",
        text: issue.message
      };
  }
}

function getSuggestedValueLabel(issueType: string) {
  switch (issueType) {
    case "missing_title":
    case "weak_page_title":
      return "Suggested title tag";
    case "missing_meta_description":
    case "weak_meta_description":
      return "Suggested meta description";
    case "missing_h1":
      return "Suggested H1 heading";
    default:
      return "Suggested fix";
  }
}

function getGroupedTitle(issueType: string) {
  if (issueType === "weak_page_title") {
    return "Improve title tag";
  }

  if (issueType === "weak_meta_description") {
    return "Improve meta description";
  }

  return formatResolutionTitle(issueType);
}

function getGroupedProblem(issueType: string, count: number) {
  if (issueType === "weak_page_title") {
    return count === 1
      ? "One title tag is too short, too long, or too generic."
      : `${count} title tags are too short, too long, or too generic.`;
  }

  if (issueType === "weak_meta_description") {
    return count === 1
      ? "One meta description is too short, too long, or not clear enough."
      : `${count} meta descriptions are too short, too long, or not clear enough.`;
  }

  return getBeforeText(issueType);
}

function getGroupedRecommendation(issueType: string) {
  if (issueType === "weak_page_title") {
    return "Write a unique 50-60 character title tag for each page. Include the main service, course, product, or location so people know why to click.";
  }

  if (issueType === "weak_meta_description") {
    return "Write a unique 120-155 character meta description for each page. Explain what the page offers and give searchers a clear reason to visit.";
  }

  return getSuggestedFix(issueType);
}

function getPageLabel(pageUrl: string) {
  try {
    const url = new URL(pageUrl);
    const path = url.pathname.replace(/^\/|\/$/g, "");

    if (!path) {
      return "Page - Homepage";
    }

    const pageName = path
      .split("/")
      .filter(Boolean)
      .at(-1)!
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return `Page - ${pageName}`;
  } catch {
    return "Page - This page";
  }
}

function getFixKey(pageUrl: string, issueType: string) {
  return `${pageUrl}::${normalizeIssueTypeForGrouping(issueType)}`;
}

function normalizeIssueTypeForGrouping(issueType: string) {
  switch (issueType) {
    case "missing_title":
      return "weak_page_title";
    case "missing_meta_description":
      return "weak_meta_description";
    case "missing_h1":
      return "bad_heading_structure";
    case "noindex":
      return "blocked_from_indexing";
    case "broken_internal_links":
      return "broken_internal_link";
    default:
      return issueType;
  }
}

function getStringDetail(details: Record<string, unknown>, key: string) {
  const value = details[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function getStringArrayDetail(details: Record<string, unknown>, key: string) {
  const value = details[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function getFirstStringDetail(details: Record<string, unknown>, key: string) {
  return getStringArrayDetail(details, key)[0] ?? null;
}

function formatNumberDetail(
  details: Record<string, unknown>,
  key: string,
  fallback: string
) {
  const value = details[key];
  return typeof value === "number" ? String(value) : fallback;
}

function formatMissingAltText(issue: ReportIssue) {
  const missingAltCount = issue.details.missingAltCount;
  const totalImages = issue.details.totalImages;

  if (typeof missingAltCount === "number" && typeof totalImages === "number") {
    return `${missingAltCount} of ${totalImages} images missing alt text`;
  }

  return issue.message;
}

function formatH1Headings(issue: ReportIssue) {
  const h1Texts = getStringArrayDetail(issue.details, "h1Texts");

  if (h1Texts.length > 0) {
    return h1Texts.map((heading, index) => `H1 ${index + 1}: ${heading}`).join(" | ");
  }

  const h1Count = issue.details.h1Count;

  if (h1Count === 0) {
    return "No H1 heading found";
  }

  return formatNumberDetail(issue.details, "h1Count", issue.message);
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
      return "Write a clear title tag that includes the service, location, or main offer.";
    case "weak_meta_description":
      return "Add a short meta description that explains the page and gives people a reason to click.";
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
      return "Write a unique title tag for each affected page.";
    case "duplicate_meta_description":
      return "Write a unique meta description for each affected page.";
    default:
      return "Review this page and apply the recommended SEO improvement.";
  }
}

function getIssueBusinessImpact(issueType: string) {
  switch (issueType) {
    case "weak_page_title":
      return "The title tag is one of the strongest signals searchers see before clicking your page.";
    case "weak_meta_description":
      return "A weak meta description can reduce clicks because customers do not see a clear reason to visit.";
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
      return "Duplicate meta descriptions can make pages less compelling and harder to distinguish in Google.";
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
      return "Improve this title tag";
    case "weak_meta_description":
      return "Improve this meta description";
    case "missing_title":
      return "Give this page a clearer Google title";
    case "missing_meta_description":
      return "Give this page a better meta description";
    case "missing_h1":
      return "Give this page a clear main heading";
    case "bad_heading_structure":
      return "Fix main heading structure";
    case "missing_image_alt":
      return "Add image alt text";
    case "thin_content":
      return "Make this page more helpful for customers";
    case "noindex":
    case "blocked_from_indexing":
      return "Make sure this page can appear on Google";
    case "broken_internal_links":
    case "broken_internal_link":
      return "Remove the dead end on this page";
    case "missing_canonical":
      return "Add a canonical tag";
    case "canonical_points_elsewhere":
      return "Fix canonical tag";
    case "duplicate_page_title":
      return "Fix duplicate title tag";
    case "duplicate_meta_description":
      return "Fix duplicate meta description";
    default:
      return "Improve this page first";
  }
}

function getBeforeText(issueType: string) {
  switch (issueType) {
    case "missing_title":
    case "weak_page_title":
      return "The page is missing the title tag people usually see in Google.";
    case "missing_meta_description":
    case "weak_meta_description":
      return "The page is missing the meta description that can help people decide to click.";
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
      return "This page shares a meta description with another page.";
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
