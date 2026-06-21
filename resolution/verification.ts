import type { MvpIssueType } from "@/resolution/types";

export type VerificationExpectation = {
  issueType: MvpIssueType;
  pageUrl: string;
  expected: string;
};

export function createVerificationExpectation(
  issueType: MvpIssueType,
  pageUrl: string
): VerificationExpectation {
  return {
    issueType,
    pageUrl,
    expected: getExpectedCondition(issueType)
  };
}

function getExpectedCondition(issueType: MvpIssueType) {
  switch (issueType) {
    case "missing_title":
      return "Page has a non-empty title tag.";
    case "weak_page_title":
      return "Page has a specific, unique title tag around 50-60 characters.";
    case "missing_meta_description":
      return "Page has a non-empty meta description.";
    case "weak_meta_description":
      return "Page has a specific, unique meta description around 120-155 characters.";
    case "missing_h1":
      return "Page has exactly one H1 heading.";
    case "thin_content":
      return "Page has enough useful written content for visitors.";
    case "noindex":
      return "Page no longer contains a noindex instruction.";
    case "broken_internal_links":
      return "Previously broken internal links no longer return errors.";
  }
}
