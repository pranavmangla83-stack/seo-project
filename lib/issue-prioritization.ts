import type { CrawledPage } from "@/lib/crawler";
import type { SeoIssue } from "@/lib/seo-checks";

type IssuePriorityProfile = {
  impactWeight: number;
  fixDifficulty: "easy" | "medium" | "hard";
  confidence: "high" | "medium" | "low";
  businessImpact: string;
  exactFix: (issue: SeoIssue, page?: CrawledPage) => string;
};

export function prioritizeSeoIssues(issues: SeoIssue[], pages: CrawledPage[]) {
  const pageByUrl = new Map(pages.map((page) => [page.url, page]));

  return issues
    .map((issue) => {
      const page = pageByUrl.get(issue.pageUrl);
      const profile = getIssuePriorityProfile(issue);
      const severityWeight = getSeverityWeight(issue.severity);
      const pageImportance = page?.importanceScore ?? 35;
      const pageWeight = Math.round(pageImportance / 10);
      const difficultyWeight = getDifficultyWeight(profile.fixDifficulty);
      const priorityScore =
        profile.impactWeight * 12 + severityWeight * 10 + pageWeight - difficultyWeight;
      const priority = getPriority(priorityScore);

      return {
        ...issue,
        priority,
        pageImportance,
        businessImpact: profile.businessImpact,
        fixDifficulty: profile.fixDifficulty,
        confidence: profile.confidence,
        estimatedImpact: getEstimatedImpact(priorityScore),
        exactFix: profile.exactFix(issue, page),
        priorityScore,
        sortScore: priorityScore
      } satisfies SeoIssue;
    })
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
}

function getIssuePriorityProfile(issue: SeoIssue): IssuePriorityProfile {
  switch (issue.issueType) {
    case "blocked_from_indexing":
      return {
        impactWeight: 10,
        fixDifficulty: "easy",
        confidence: "high",
        businessImpact:
          "Google may be told not to show this page, so customers may never find it from search.",
        exactFix: () =>
          "Remove the noindex instruction from the page if this page should appear in Google. After publishing, request indexing in Google Search Console."
      };
    case "weak_page_title":
      return {
        impactWeight: 9,
        fixDifficulty: "easy",
        confidence: "high",
        businessImpact:
          "The title is one of the strongest signals searchers see before clicking your page.",
        exactFix: (item, page) =>
          `Write one clear 50-60 character title for this ${formatPageType(
            page
          )}. Include your main service, product, or location. Current title: "${
            getDetailString(item, "title") || "missing"
          }".`
      };
    case "duplicate_page_title":
      return {
        impactWeight: 8,
        fixDifficulty: "easy",
        confidence: "high",
        businessImpact:
          "Duplicate titles make different pages compete with each other and can make search results look generic.",
        exactFix: (item) =>
          `Give each affected page a unique title that matches its specific offer or topic. Start with these pages: ${formatAffectedPages(
            item
          )}.`
      };
    case "weak_meta_description":
      return {
        impactWeight: 7,
        fixDifficulty: "easy",
        confidence: "high",
        businessImpact:
          "A weak description can reduce clicks because customers do not see a clear reason to visit.",
        exactFix: (item) =>
          `Write a 120-155 character description that explains the page and gives a reason to click. Current description: "${
            getDetailString(item, "metaDescription") || "missing"
          }".`
      };
    case "duplicate_meta_description":
      return {
        impactWeight: 6,
        fixDifficulty: "easy",
        confidence: "high",
        businessImpact:
          "Repeated descriptions make pages look the same in search and can lower click-through from useful pages.",
        exactFix: (item) =>
          `Write a different description for each affected page. Start with these pages: ${formatAffectedPages(
            item
          )}.`
      };
    case "canonical_points_elsewhere":
      return {
        impactWeight: 7,
        fixDifficulty: "medium",
        confidence: "medium",
        businessImpact:
          "Search engines may treat another URL as the main version and ignore this page.",
        exactFix: (item) =>
          `Check whether this page should rank on its own. If yes, set its canonical URL to itself: ${item.pageUrl}. Current canonical: ${getDetailString(
            item,
            "canonicalUrl"
          )}.`
      };
    case "bad_heading_structure":
      return {
        impactWeight: 5,
        fixDifficulty: "easy",
        confidence: "high",
        businessImpact:
          "A clear H1 helps visitors and search engines understand the main topic quickly.",
        exactFix: (item) =>
          `Use exactly one H1 on this page. Make it describe the main offer or topic. Current H1 count: ${
            item.details?.h1Count ?? "unknown"
          }.`
      };
    case "thin_content":
      return {
        impactWeight: 6,
        fixDifficulty: "medium",
        confidence: "medium",
        businessImpact:
          "Thin pages often do not give Google or customers enough reason to trust and rank them.",
        exactFix: (item, page) =>
          `Expand this ${formatPageType(
            page
          )} with useful details: services offered, who it helps, location, pricing clues, FAQs, examples, and next steps. Aim for at least 250 helpful words.`
      };
    case "missing_canonical":
      return {
        impactWeight: 4,
        fixDifficulty: "medium",
        confidence: "high",
        businessImpact:
          "Without a canonical tag, Google has less guidance when duplicate URL versions exist.",
        exactFix: (item) =>
          `Add a canonical link in the page head pointing to the preferred URL: ${item.pageUrl}.`
      };
    case "missing_image_alt":
      return {
        impactWeight: 3,
        fixDifficulty: "easy",
        confidence: "high",
        businessImpact:
          "Missing image descriptions can hurt accessibility and image search relevance.",
        exactFix: (item) =>
          `Add short alt text to important images. Describe what each image shows, especially service, product, team, or location photos. Missing alt count: ${
            item.details?.missingAltCount ?? "unknown"
          }.`
      };
    case "broken_internal_link":
      return {
        impactWeight: 5,
        fixDifficulty: "easy",
        confidence: "medium",
        businessImpact:
          "Broken links create dead ends for customers and can make the site look neglected.",
        exactFix: (item) =>
          `Update or remove these broken internal links: ${formatBrokenLinks(item)}.`
      };
  }
}

function getPriority(sortScore: number) {
  if (sortScore >= 125) {
    return 1;
  }

  if (sortScore >= 105) {
    return 2;
  }

  if (sortScore >= 82) {
    return 3;
  }

  if (sortScore >= 58) {
    return 4;
  }

  return 5;
}

function getEstimatedImpact(sortScore: number): "high" | "medium" | "low" {
  if (sortScore >= 105) {
    return "high";
  }

  if (sortScore >= 70) {
    return "medium";
  }

  return "low";
}

function getSeverityWeight(severity: SeoIssue["severity"]) {
  switch (severity) {
    case "high":
      return 5;
    case "medium":
      return 3;
    case "low":
      return 1;
  }
}

function getDifficultyWeight(difficulty: SeoIssue["fixDifficulty"]) {
  switch (difficulty) {
    case "hard":
      return 8;
    case "medium":
      return 4;
    case "easy":
    default:
      return 0;
  }
}

function getDetailString(issue: SeoIssue, key: string) {
  const value = issue.details?.[key];
  return typeof value === "string" ? value : "";
}

function formatAffectedPages(issue: SeoIssue) {
  const pages = issue.details?.affectedPages;

  if (!Array.isArray(pages)) {
    return issue.pageUrl;
  }

  return pages.filter((page): page is string => typeof page === "string").join(", ");
}

function formatBrokenLinks(issue: SeoIssue) {
  const links = issue.details?.brokenLinks;

  if (!Array.isArray(links)) {
    return "the links listed in the scan details";
  }

  return links.filter((link): link is string => typeof link === "string").join(", ");
}

function formatPageType(page?: CrawledPage) {
  return page?.pageType && page.pageType !== "unknown" ? page.pageType : "page";
}
