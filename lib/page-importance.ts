import type { SeoPageFacts } from "@/lib/page-facts";

export type DiscoverySource = "manual_start_url" | "homepage_link" | "sitemap";

export type PageType =
  | "homepage"
  | "service"
  | "product"
  | "pricing"
  | "contact"
  | "about"
  | "blog"
  | "legal"
  | "unknown";

export type PageImportance = {
  pageType: PageType;
  importanceScore: number;
  importanceReason: string;
};

export function classifyPageImportance(
  pageUrl: string,
  discoverySource: DiscoverySource,
  facts?: Partial<SeoPageFacts>
): PageImportance {
  const path = getPath(pageUrl);
  const pageType = getPageType(path, facts);
  const baseScore = getBaseScore(pageType);
  const sourceBonus = discoverySource === "homepage_link" ? 5 : 0;
  const score = Math.min(100, baseScore + sourceBonus);

  return {
    pageType,
    importanceScore: score,
    importanceReason: getImportanceReason(pageType, discoverySource)
  };
}

export function getDiscoveryPriority(pageUrl: string, source: DiscoverySource) {
  const importance = classifyPageImportance(pageUrl, source);
  const sourceWeight = source === "homepage_link" ? 0 : 8;
  return 100 - importance.importanceScore + sourceWeight;
}

function getPath(pageUrl: string) {
  try {
    return new URL(pageUrl).pathname.toLowerCase();
  } catch {
    return "/";
  }
}

function getPageType(path: string, facts?: Partial<SeoPageFacts>): PageType {
  const text = `${facts?.title ?? ""} ${facts?.h1Text ?? ""}`.toLowerCase();

  if (path === "/" || path === "") {
    return "homepage";
  }

  if (/\/(privacy|terms|refund|cookie|legal)/i.test(path)) {
    return "legal";
  }

  if (/\/(services?|solutions?|service-area)\b/i.test(path) || text.includes("service")) {
    return "service";
  }

  if (/\/(products?|shop)\b/i.test(path) || text.includes("product")) {
    return "product";
  }

  if (/\/pricing\b/i.test(path)) {
    return "pricing";
  }

  if (/\/contact\b/i.test(path)) {
    return "contact";
  }

  if (/\/about\b/i.test(path)) {
    return "about";
  }

  if (/\/(blog|articles?|news)\b/i.test(path)) {
    return "blog";
  }

  return "unknown";
}

function getBaseScore(pageType: PageType) {
  switch (pageType) {
    case "homepage":
      return 100;
    case "service":
    case "product":
      return 90;
    case "pricing":
      return 80;
    case "contact":
      return 75;
    case "about":
      return 55;
    case "blog":
      return 45;
    case "legal":
      return 10;
    case "unknown":
      return 35;
  }
}

function getImportanceReason(pageType: PageType, discoverySource: DiscoverySource) {
  const sourceNote =
    discoverySource === "sitemap"
      ? " Found in the sitemap."
      : discoverySource === "homepage_link"
        ? " Linked from the homepage."
        : "";

  switch (pageType) {
    case "homepage":
      return `Homepage usually carries the strongest first impression and brand search value.${sourceNote}`;
    case "service":
      return `Service pages often target buyer-intent searches from potential customers.${sourceNote}`;
    case "product":
      return `Product pages are close to revenue and should be easy to find in search.${sourceNote}`;
    case "pricing":
      return `Pricing pages help visitors compare and decide, so search clarity matters.${sourceNote}`;
    case "contact":
      return `Contact pages support local and conversion-focused searches.${sourceNote}`;
    case "about":
      return `About pages build trust, but usually have less direct search impact.${sourceNote}`;
    case "blog":
      return `Blog pages can bring informational traffic, but are usually secondary for SMB leads.${sourceNote}`;
    case "legal":
      return `Legal pages rarely drive customer search traffic.${sourceNote}`;
    case "unknown":
      return `This page may matter, but its business role is not clear from the URL.${sourceNote}`;
  }
}
