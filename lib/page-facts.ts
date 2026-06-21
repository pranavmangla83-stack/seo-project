import * as cheerio from "cheerio";

export type SeoPageFacts = {
  title: string;
  metaDescription: string;
  h1Count: number;
  h1Text: string;
  h1Texts: string[];
  canonicalUrl: string;
  robotsMeta: string;
  totalImages: number;
  missingAltCount: number;
  wordCount: number;
};

export function extractSeoPageFacts(html: string, pageUrl: string): SeoPageFacts {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1s = $("h1")
    .toArray()
    .map((element) => $(element).text().replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const images = $("img").toArray();
  const missingAltCount = images.filter((image) => {
    const alt = $(image).attr("alt");
    return alt === undefined || alt.trim() === "";
  }).length;
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const canonicalHref = $('link[rel="canonical"]').attr("href")?.trim() ?? "";

  return {
    title,
    metaDescription,
    h1Count: h1s.length,
    h1Text: h1s[0] ?? "",
    h1Texts: h1s,
    canonicalUrl: resolveCanonicalUrl(canonicalHref, pageUrl),
    robotsMeta: $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "",
    totalImages: images.length,
    missingAltCount,
    wordCount: bodyText ? bodyText.split(" ").filter(Boolean).length : 0
  };
}

function resolveCanonicalUrl(canonicalHref: string, pageUrl: string) {
  if (!canonicalHref) {
    return "";
  }

  try {
    const url = new URL(canonicalHref, pageUrl);
    url.hash = "";
    return url.toString();
  } catch {
    return canonicalHref;
  }
}
