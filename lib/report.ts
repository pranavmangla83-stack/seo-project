import type { CrawledPage } from "@/lib/crawler";
import type { SeoIssue } from "@/lib/seo-checks";

export type ScanReport = {
  scan: {
    id: string;
    website_url: string;
    normalized_url: string;
    status: string;
    created_at: string;
  };
  pages: CrawledPage[];
  issues: SeoIssue[];
};

export function getSuggestedFix(issueType: SeoIssue["issueType"]) {
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
  }
}
