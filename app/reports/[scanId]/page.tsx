import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Flag,
  Gauge,
  Layers3,
  SearchCheck,
  TrendingUp,
  UsersRound,
  Wrench
} from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ResolutionFixes } from "@/components/resolution-fixes";
import {
  createSupabaseServerClient,
  hasSupabaseConfig
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ReportPageProps = {
  params: Promise<{
    scanId: string;
  }>;
};

type ScanRow = {
  id: string;
  website_url: string;
  normalized_url: string;
  status: string;
  created_at: string;
};

type ScanIssueRow = {
  id: string;
  page_url: string;
  issue_type: string;
  severity: "high" | "medium" | "low";
  message: string;
  business_impact: string | null;
  fix_difficulty: string | null;
  exact_fix: string | null;
  details: Record<string, unknown>;
  priority_score: number | null;
};

type ScanPageRow = {
  id: string;
  url: string;
  status: string;
  page_type: string | null;
  importance_score: number | null;
};

type ResolutionSummaryRow = {
  id: string;
  priority: string;
  priority_score: number;
  issue_type: string;
  page_url: string;
  status: string;
  difficulty: string;
  business_impact: string;
  recommended_action: string;
};

type IssueBreakdownItem = {
  label: string;
  count: number;
  tone: "critical" | "high" | "medium" | "low";
};

type PageImportanceItem = {
  label: string;
  description: string;
  pageTypes: string[];
};

const pageImportanceGroups: PageImportanceItem[] = [
  {
    label: "Homepage",
    description: "Usually the most important first impression.",
    pageTypes: ["homepage"]
  },
  {
    label: "Service pages",
    description: "Pages that explain what the business sells.",
    pageTypes: ["service"]
  },
  {
    label: "Product and pricing pages",
    description: "Pages close to a buying decision.",
    pageTypes: ["product", "pricing"]
  },
  {
    label: "Blog pages",
    description: "Helpful articles and educational pages.",
    pageTypes: ["blog"]
  },
  {
    label: "Legal pages",
    description: "Useful for trust, usually lower SEO priority.",
    pageTypes: ["legal"]
  }
];

export default async function ReportPage({ params }: ReportPageProps) {
  const { scanId } = await params;

  if (!hasSupabaseConfig()) {
    return (
      <main className="report-page">
        <div className="report-shell">
          <section className="report-empty">
            <p className="report-kicker">FixMySEO report</p>
            <h1>Reports need Supabase configuration.</h1>
            <p>
              Add the Supabase environment variables, then open this report
              again.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const supabase = createSupabaseServerClient();
  const [
    { data: scan, error: scanError },
    { data: pages, error: pagesError },
    { data: issues, error: issuesError },
    { data: resolutions, error: resolutionsError }
  ] = await Promise.all([
    supabase
      .from("scans")
      .select("id, website_url, normalized_url, status, created_at")
      .eq("id", scanId)
      .single(),
    supabase
      .from("scan_pages")
      .select("id, url, status, page_type, importance_score")
      .eq("scan_id", scanId)
      .order("importance_score", { ascending: false }),
    supabase
      .from("scan_issues")
      .select(
        "id, page_url, issue_type, severity, message, business_impact, fix_difficulty, exact_fix, details, priority_score"
      )
      .eq("scan_id", scanId)
      .order("priority_score", { ascending: false }),
    supabase
      .from("seo_resolutions")
      .select(
        "id, priority, priority_score, issue_type, page_url, status, difficulty, business_impact, recommended_action"
      )
      .eq("scan_id", scanId)
      .order("priority_score", { ascending: false })
  ]);

  if (scanError || !scan) {
    notFound();
  }

  if (pagesError || issuesError || resolutionsError) {
    throw new Error("Could not load report data.");
  }

  const scanRow = scan as ScanRow;
  const pageRows = (pages ?? []) as ScanPageRow[];
  const issueRows = (issues ?? []) as ScanIssueRow[];
  const resolutionRows = (resolutions ?? []) as ResolutionSummaryRow[];
  const host = getHostname(scanRow.normalized_url);
  const fetchedPages = pageRows.filter((page) => page.status === "fetched");
  const score = calculateHealthScore(issueRows, resolutionRows);
  const scoreLabel = getScoreLabel(score);
  const issueBreakdown = getIssueBreakdown(issueRows, resolutionRows);
  const pageImportance = getPageImportance(pageRows);
  const hasUrgentIssues = issueRows.length > 0 || resolutionRows.length > 0;
  const topResolution = resolutionRows[0];
  const diagnosis = getDiagnosisCopy(score, issueRows.length, resolutionRows.length);
  const scanStatus = scanRow.status === "completed" ? "Scan complete" : formatValue(scanRow.status);
  const topIssueLabel = topResolution
    ? formatResolutionTitle(topResolution.issue_type)
    : issueRows[0]
      ? formatIssueType(issueRows[0].issue_type)
      : "No urgent SEO fix found";

  return (
    <main className="report-page">
      <header className="report-topbar">
        <div className="report-topbar-inner">
          <Link className="report-brand" href="/">
            <span className="report-brand-mark">
              <SearchCheck aria-hidden="true" size={18} />
            </span>
            <span>
              <strong>FixMySEO</strong>
              <small>Your SEO report</small>
            </span>
          </Link>
          <div className="report-topbar-actions">
            <button className="report-secondary-action" type="button">
              <Download aria-hidden="true" size={16} />
              Save as PDF
            </button>
            <a className="report-primary-action" href="#top-fixes">
              <Wrench aria-hidden="true" size={16} />
              Fix my site
            </a>
          </div>
        </div>
      </header>

      <div className="report-shell">
        <div className="report-scan-meta">
          <span>
            <span className="report-status-dot" />
            {scanStatus}
          </span>
          <strong>{host}</strong>
          <span>{formatDate(scanRow.created_at)}</span>
          <span>{fetchedPages.length || pageRows.length} pages checked</span>
        </div>

        <section className="report-hero">
          <div>
            <p className="report-kicker">Here&apos;s what we found</p>
            <h1>{getHeroHeadline(score, issueRows.length, resolutionRows.length)}</h1>
            <p className="report-hero-copy">
              {getHeroBody(issueRows.length, resolutionRows.length)}
            </p>
            <div className="report-hero-divider" />
            <div className="report-hero-insights">
              <HeroInsight
                icon={<TrendingUp aria-hidden="true" size={17} />}
                label="What's wrong?"
                value={diagnosis.title}
              />
              <HeroInsight
                icon={<Wrench aria-hidden="true" size={17} />}
                label="What should I fix first?"
                value={topIssueLabel}
              />
              <HeroInsight
                icon={<UsersRound aria-hidden="true" size={17} />}
                label="Why does it matter?"
                value={getBusinessMeaning(issueRows.length, resolutionRows.length)}
              />
              <HeroInsight
                icon={<Clock3 aria-hidden="true" size={17} />}
                label="How hard is it?"
                value={getEffortSummary(topResolution)}
              />
            </div>
          </div>

          <div className="report-score-card">
            <div
              className="report-score-ring"
              style={{
                background: `conic-gradient(${getScoreColor(score)} ${score}%, #eef2f7 0)`
              }}
            >
              <div>
                <span>{score}</span>
                <small>out of 100</small>
              </div>
            </div>
            <h2>Website health</h2>
            <p className={`report-score-label report-score-${scoreLabel.tone}`}>
              {scoreLabel.label}
            </p>
            <p>
              Fix the issues below to move closer to the healthy range.
            </p>
          </div>
        </section>

        <section className="report-top-fixes-panel" id="top-fixes">
          <ResolutionFixes
            issues={issueRows.map((issue) => ({
              businessImpact: issue.business_impact,
              details: issue.details,
              exactFix: issue.exact_fix,
              fixDifficulty: issue.fix_difficulty,
              id: issue.id,
              issueType: issue.issue_type,
              message: issue.message,
              pageUrl: issue.page_url,
              priorityScore: issue.priority_score,
              severity: issue.severity
            }))}
            scanId={scanId}
          />
        </section>

        <section className="report-priority-section">
          <article className="report-priority-card">
            <div className="report-priority-copy">
              <span className="report-priority-chip">
                <Flag aria-hidden="true" size={15} />
                Fix this first
              </span>
              {topResolution ? (
                <>
                  <h2>{formatResolutionTitle(topResolution.issue_type)}</h2>
                  <p>{topResolution.business_impact}</p>
                  <a className="report-priority-action" href="#top-fixes">
                    {topResolution.recommended_action}
                    <ArrowRight aria-hidden="true" size={17} />
                  </a>
                </>
              ) : (
                <>
                  <h2>Your basic setup looks healthy.</h2>
                  <p>
                    We did not find an urgent first fix in this scan. Keep the
                    site updated and re-scan after your next content changes.
                  </p>
                </>
              )}
            </div>

            <div className="report-priority-stats">
              <PriorityStat
                icon={<TrendingUp aria-hidden="true" size={17} />}
                label="Impact"
                value={topResolution ? formatValue(topResolution.priority) : "Stable"}
              />
              <PriorityStat
                icon={<Clock3 aria-hidden="true" size={17} />}
                label="Effort"
                value={topResolution ? formatValue(topResolution.difficulty) : "No urgent fix"}
              />
              <div className="report-priority-effort">
                <span>Priority score</span>
                <strong>
                  {topResolution ? `${topResolution.priority_score}/100` : `${score}/100`}
                </strong>
              </div>
            </div>
          </article>
        </section>

        {!hasUrgentIssues ? (
          <section className="report-empty">
            <CheckCircle2 aria-hidden="true" size={24} />
            <h2>Good news - your basic SEO setup looks healthy.</h2>
            <p>
              Next, we&apos;ll look for improvement opportunities as the product
              gets deeper scanning.
            </p>
          </section>
        ) : null}

        <section className="report-grid-two">

          <div className="report-panel">
            <div className="report-section-heading">
              <FileText aria-hidden="true" size={18} />
              <div>
                <p className="report-kicker">Page importance</p>
                <h2>Pages that matter most</h2>
              </div>
            </div>
            <div className="report-page-importance-list">
              {pageImportance.map((item) => (
                <PageImportanceBar item={item} key={item.label} />
              ))}
            </div>
          </div>
        </section>

        <section className="report-summary-section" aria-label="Report summary">
          <div>
            <h2>The big picture</h2>
            <p>What fixing your site could mean for your business.</p>
          </div>
          <div className="report-summary-grid">
            <SummaryMetric
              icon={<Gauge aria-hidden="true" size={18} />}
              label="SEO health score"
              value={`${score}/100`}
              hint="Based on the basic SEO issues found in this scan."
            />
            <SummaryMetric
              icon={<Layers3 aria-hidden="true" size={18} />}
              label="Pages scanned"
              value={`${fetchedPages.length || pageRows.length}`}
              hint="Important pages checked for visible SEO problems."
            />
            <SummaryMetric
              icon={<AlertTriangle aria-hidden="true" size={18} />}
              label="Things to improve"
              value={`${issueRows.length}`}
              hint="Issues found across the pages we checked."
            />
            <SummaryMetric
              icon={<Wrench aria-hidden="true" size={18} />}
              label="Quick fixes"
              value={`${resolutionRows.length}`}
              hint="Prioritized fixes ready to review in order."
            />
          </div>
        </section>

        <section className="report-breakdown-section">
          <div className="report-panel">
            <div className="report-section-heading">
              <BarChart3 aria-hidden="true" size={18} />
              <div>
                <p className="report-kicker">Issue breakdown</p>
                <h2>Where your SEO needs attention</h2>
              </div>
            </div>
            <div className="report-breakdown-list">
              {issueBreakdown.map((item) => (
                <BreakdownBar
                  item={item}
                  key={item.label}
                  max={Math.max(...issueBreakdown.map((entry) => entry.count), 1)}
                />
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
  hint
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="report-metric-card">
      <div className="report-metric-icon">{icon}</div>
      <strong>{value}</strong>
      <p>{label}</p>
      <span>{hint}</span>
    </article>
  );
}

function PriorityStat({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="report-priority-stat">
      <span>
        {icon}
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function HeroInsight({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="report-hero-insight">
      <div className="report-hero-insight-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function BreakdownBar({
  item,
  max
}: {
  item: IssueBreakdownItem;
  max: number;
}) {
  const width = item.count === 0 ? 4 : Math.max((item.count / max) * 100, 12);

  return (
    <div className="report-breakdown-row">
      <div className="report-breakdown-label">
        <span>{item.label}</span>
        <strong>{item.count}</strong>
      </div>
      <div className="report-bar-track">
        <div
          className={`report-bar-fill report-bar-${item.tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function PageImportanceBar({
  item
}: {
  item: {
    label: string;
    description: string;
    count: number;
    score: number;
  };
}) {
  return (
    <article className="report-importance-card">
      <div>
        <div className="report-breakdown-label">
          <span>{item.label}</span>
          <strong>{item.count} pages</strong>
        </div>
        <p>{item.description}</p>
      </div>
      <div className="report-bar-track">
        <div
          className="report-bar-fill report-bar-importance"
          style={{ width: `${Math.max(item.score, 6)}%` }}
        />
      </div>
    </article>
  );
}

function getIssueBreakdown(
  issues: ScanIssueRow[],
  resolutions: ResolutionSummaryRow[]
): IssueBreakdownItem[] {
  return [
    {
      label: "Critical",
      count: resolutions.filter((resolution) => resolution.priority === "critical")
        .length,
      tone: "critical"
    },
    {
      label: "High",
      count: issues.filter((issue) => issue.severity === "high").length,
      tone: "high"
    },
    {
      label: "Medium",
      count: issues.filter((issue) => issue.severity === "medium").length,
      tone: "medium"
    },
    {
      label: "Low",
      count: issues.filter((issue) => issue.severity === "low").length,
      tone: "low"
    }
  ];
}

function getPageImportance(pages: ScanPageRow[]) {
  return pageImportanceGroups.map((group) => {
    const groupPages = pages.filter((page) =>
      group.pageTypes.includes(page.page_type ?? "unknown")
    );
    const score =
      groupPages.length === 0
        ? 0
        : Math.round(
            groupPages.reduce(
              (total, page) => total + (page.importance_score ?? 0),
              0
            ) / groupPages.length
          );

    return {
      label: group.label,
      description: group.description,
      count: groupPages.length,
      score
    };
  });
}

function calculateHealthScore(
  issues: ScanIssueRow[],
  resolutions: ResolutionSummaryRow[]
) {
  const high = issues.filter((issue) => issue.severity === "high").length;
  const medium = issues.filter((issue) => issue.severity === "medium").length;
  const low = issues.filter((issue) => issue.severity === "low").length;
  const critical = resolutions.filter(
    (resolution) => resolution.priority === "critical"
  ).length;
  const penalty = critical * 20 + high * 12 + medium * 7 + low * 3;

  return Math.max(0, Math.min(100, 100 - penalty));
}

function getDiagnosisCopy(score: number, issueCount: number, fixCount: number) {
  if (fixCount === 0 && issueCount === 0) {
    return {
      headline:
        "Your basic SEO setup looks healthy. The scan did not find urgent blockers in the pages checked.",
      title: "No urgent basic SEO blockers found",
      body:
        "This is a good starting point. The next layer of improvement would be better content depth, stronger page messaging, and more detailed opportunity checks.",
      detail:
        "For a small business website, this means the visible foundation is in place. Keep the site updated and review higher-value pages as the business grows."
    };
  }

  if (score >= 80) {
    return {
      headline:
        "Your website has a good SEO foundation, with a few quick fixes that can make it easier to understand in Google.",
      title: "Good foundation, clear quick wins",
      body:
        "The scan found issues that are fixable without a full SEO rebuild. Start with the highest-priority fix because it affects how customers understand your page before they click.",
      detail:
        "The opportunity here is clarity. Better titles, descriptions, headings, and page signals help visitors and Google understand what each important page is meant to do."
    };
  }

  if (score >= 55) {
    return {
      headline:
        "Your website needs focused SEO cleanup. The good news is the first fixes are specific and practical.",
      title: "Needs work, but the path is clear",
      body:
        "This report turns the scan into a short action plan. Fix the top items first so your most important pages are easier to find, understand, and trust.",
      detail:
        "A few basic gaps can make a business website look less clear in search results. The best next step is not more data, it is applying the highest-impact fixes in order."
    };
  }

  return {
    headline:
      "Your website has important SEO blockers that may be making it harder for customers to find you from Google.",
    title: "Important blockers need attention",
    body:
      "The scan found issues that can affect visibility and trust. Start with the first recommended fix, then work through the action plan one page at a time.",
    detail:
      "This does not mean the website is broken. It means the basic signals Google and customers rely on need cleanup before deeper SEO work will be worth much."
  };
}

function formatResolutionTitle(issueType: string) {
  switch (issueType) {
    case "missing_title":
      return "Add a clear Google title";
    case "missing_meta_description":
      return "Write a stronger Google description";
    case "missing_h1":
      return "Add a clear main heading";
    case "thin_content":
      return "Add more useful page content";
    case "noindex":
      return "Make sure this page can appear on Google";
    case "broken_internal_links":
      return "Fix the broken internal link";
    default:
      return "Apply the highest-priority SEO fix";
  }
}

function formatIssueType(issueType: string) {
  return issueType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getBusinessMeaning(issueCount: number, fixCount: number) {
  if (issueCount === 0 && fixCount === 0) {
    return "Your first SEO signals look stable in this scan.";
  }

  if (fixCount > 0) {
    return "Important pages can become easier for customers to find and trust.";
  }

  return "A few basic signals may be making your website harder to understand.";
}

function getHeroHeadline(score: number, issueCount: number, fixCount: number) {
  if (issueCount === 0 && fixCount === 0) {
    return "Your website looks healthy, with no urgent SEO blockers found.";
  }

  if (score >= 80) {
    return "Your website is in good shape, with a few fixable SEO issues.";
  }

  if (score >= 55) {
    return "Your website is healthy enough to grow, but a few fixable issues need attention.";
  }

  return "Your website has important SEO issues that need attention.";
}

function getHeroBody(issueCount: number, fixCount: number) {
  if (issueCount === 0 && fixCount === 0) {
    return "We checked your important pages and did not find urgent basic SEO problems. Keep improving your content and re-scan when you make changes.";
  }

  if (fixCount > 0) {
    return "We checked your important pages the way a search engine would. The good news: the main problems are specific, practical, and ready to work through below.";
  }

  return "We checked your important pages and found a few SEO signals worth cleaning up. Start with the clearest issue first, then work down the report.";
}

function getEffortSummary(resolution?: ResolutionSummaryRow) {
  if (!resolution) {
    return "No urgent fix needed from this scan.";
  }

  return `${formatValue(resolution.difficulty)} effort to start improving this.`;
}

function getScoreColor(score: number) {
  if (score >= 80) {
    return "#14a66a";
  }

  if (score >= 55) {
    return "#e58a1f";
  }

  return "#dc2f3d";
}

function formatValue(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getScoreLabel(score: number) {
  if (score >= 80) {
    return { label: "Good", tone: "good" };
  }

  if (score >= 55) {
    return { label: "Needs Work", tone: "needs-work" };
  }

  return { label: "Critical", tone: "critical" };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}
