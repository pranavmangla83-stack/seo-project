import { scoreResolutionPriority } from "@/resolution/priority";
import type {
  MvpIssueType,
  ResolutionDecisionInput,
  ResolutionPlan,
  ResolutionType
} from "@/resolution/types";

type ResolutionRule = {
  id: string;
  matches: (input: ResolutionDecisionInput) => boolean;
  build: (input: ResolutionDecisionInput) => ResolutionPlan;
};

export function createResolutionPlan(input: ResolutionDecisionInput) {
  const rule = RESOLUTION_RULES.find((candidate) => candidate.matches(input));
  return rule?.build(input) ?? null;
}

const RESOLUTION_RULES: ResolutionRule[] = [
  {
    id: "missing-title-content-v1",
    matches: (input) =>
      input.issue.issue_type === "weak_page_title" &&
      getStringDetail(input, "title") === "",
    build: (input) =>
      basePlan(input, {
        issueType: "missing_title",
        resolutionType: "content",
        problemExplanation:
          "This page is missing the title people usually see in Google and browser tabs.",
        businessImpact:
          "A clear title helps customers understand the page before they click.",
        recommendedAction:
          input.issue.exact_fix ??
          "Write one clear page title that describes the page and includes the business name when useful.",
        verificationStep: "Check the page again and confirm it has a title tag.",
        expectedOutcome: "The page has a clearer search result title.",
        ruleId: "missing-title-content-v1"
      })
  },
  {
    id: "missing-meta-description-content-v1",
    matches: (input) =>
      input.issue.issue_type === "weak_meta_description" &&
      getStringDetail(input, "metaDescription") === "",
    build: (input) =>
      basePlan(input, {
        issueType: "missing_meta_description",
        resolutionType: "content",
        problemExplanation:
          "This page is missing the short description Google may show under the title.",
        businessImpact:
          "A helpful description can give customers a clearer reason to visit the page.",
        recommendedAction:
          input.issue.exact_fix ??
          "Write a short, natural page summary that explains what visitors will find.",
        verificationStep: "Check the page again and confirm it has a meta description.",
        expectedOutcome: "The page has a clearer search preview.",
        ruleId: "missing-meta-description-content-v1"
      })
  },
  {
    id: "weak-title-tag-content-v1",
    matches: (input) =>
      input.issue.issue_type === "weak_page_title" &&
      getStringDetail(input, "title") !== "",
    build: (input) =>
      basePlan(input, {
        issueType: "weak_page_title",
        resolutionType: "content",
        problemExplanation:
          "This page has a title tag, but it is too short, too long, or too generic.",
        businessImpact:
          "A specific title tag helps Google understand the page and helps customers decide whether to click.",
        recommendedAction:
          input.issue.exact_fix ??
          "Write one specific 50-60 character title tag that matches the page topic, search intent, and business offer.",
        verificationStep:
          "Check the page again and confirm the title tag is specific, unique, and 50-60 characters.",
        expectedOutcome:
          "The page has a clearer search result title that better matches what customers are looking for.",
        ruleId: "weak-title-tag-content-v1"
      })
  },
  {
    id: "weak-meta-description-content-v1",
    matches: (input) =>
      input.issue.issue_type === "weak_meta_description" &&
      getStringDetail(input, "metaDescription") !== "",
    build: (input) =>
      basePlan(input, {
        issueType: "weak_meta_description",
        resolutionType: "content",
        problemExplanation:
          "This page has a meta description, but it is too short, too long, or not clear enough.",
        businessImpact:
          "A useful meta description can make the search result clearer and give customers a stronger reason to visit.",
        recommendedAction:
          input.issue.exact_fix ??
          "Write one specific 120-155 character meta description that summarizes the page and gives a clear reason to click.",
        verificationStep:
          "Check the page again and confirm the meta description is specific, unique, and 120-155 characters.",
        expectedOutcome:
          "The page has a clearer search result description that better explains its value.",
        ruleId: "weak-meta-description-content-v1"
      })
  },
  {
    id: "missing-h1-content-v1",
    matches: (input) =>
      input.issue.issue_type === "bad_heading_structure" &&
      getNumberDetail(input, "h1Count") === 0,
    build: (input) =>
      basePlan(input, {
        issueType: "missing_h1",
        resolutionType: "content",
        problemExplanation: "This page does not have one clear main heading.",
        businessImpact:
          "A clear main heading helps visitors quickly understand what the page is about.",
        recommendedAction:
          input.issue.exact_fix ??
          "Add one main heading that clearly describes the page topic or offer.",
        verificationStep: "Check the page again and confirm it has exactly one H1 heading.",
        expectedOutcome: "Visitors see a clearer main message when they open the page.",
        ruleId: "missing-h1-content-v1"
      })
  },
  {
    id: "thin-content-instructions-v1",
    matches: (input) => input.issue.issue_type === "thin_content",
    build: (input) =>
      basePlan(input, {
        issueType: "thin_content",
        resolutionType: "instructions",
        problemExplanation: "This page may not give visitors enough useful information.",
        businessImpact:
          "Thin pages can make customers hesitate because they do not answer enough basic questions.",
        recommendedAction:
          input.issue.exact_fix ??
          "Add helpful details about the service, product, location, common questions, and next step.",
        verificationStep:
          "Check the page again and confirm the written content is more complete.",
        expectedOutcome:
          "The page better explains the offer and gives customers more reason to contact the business.",
        ruleId: "thin-content-instructions-v1"
      })
  },
  {
    id: "noindex-guided-review-v1",
    matches: (input) => input.issue.issue_type === "blocked_from_indexing",
    build: (input) =>
      basePlan(input, {
        issueType: "noindex",
        resolutionType: "guided_workflow",
        problemExplanation: "This page is telling Google not to show it in search.",
        businessImpact:
          "If this page should bring in customers, they may not be able to find it from Google.",
        recommendedAction:
          "Decide whether this page should appear on Google. If yes, remove the noindex setting in your website editor or SEO plugin.",
        verificationStep:
          "Check the page again and confirm the noindex instruction is gone.",
        expectedOutcome: "The page becomes eligible to appear in Google search results.",
        ruleId: "noindex-guided-review-v1"
      })
  },
  {
    id: "broken-internal-links-instructions-v1",
    matches: (input) => input.issue.issue_type === "broken_internal_link",
    build: (input) =>
      basePlan(input, {
        issueType: "broken_internal_links",
        resolutionType: "instructions",
        problemExplanation: "This page links to another page that does not work.",
        businessImpact:
          "Broken links create dead ends for customers and can make the website feel neglected.",
        recommendedAction:
          input.issue.exact_fix ??
          "Update the broken link to the right page, or remove it if there is no replacement.",
        verificationStep:
          "Check this page again and confirm the broken internal link is gone.",
        expectedOutcome: "Visitors can move through the website without hitting a dead end.",
        ruleId: "broken-internal-links-instructions-v1"
      })
  }
];

function basePlan(
  input: ResolutionDecisionInput,
  details: {
    issueType: MvpIssueType;
    resolutionType: ResolutionType;
    problemExplanation: string;
    businessImpact: string;
    recommendedAction: string;
    verificationStep: string;
    expectedOutcome: string;
    ruleId: string;
  }
): ResolutionPlan {
  const priority = scoreResolutionPriority(input);

  return {
    scanId: input.issue.scan_id,
    issueId: input.issue.id,
    pageUrl: input.issue.page_url,
    issueType: details.issueType,
    resolutionType: details.resolutionType,
    status: "ready_to_fix",
    priority: priority.label,
    priorityScore: priority.score,
    difficulty: priority.difficulty,
    confidence: priority.confidence,
    problemExplanation: details.problemExplanation,
    businessImpact: input.issue.business_impact ?? details.businessImpact,
    recommendedAction: details.recommendedAction,
    verificationStep: details.verificationStep,
    expectedOutcome: details.expectedOutcome,
    ruleId: details.ruleId,
    reasons: priority.reasons
  };
}

function getStringDetail(input: ResolutionDecisionInput, key: string) {
  const value = input.issue.details?.[key];
  return typeof value === "string" ? value : "";
}

function getNumberDetail(input: ResolutionDecisionInput, key: string) {
  const value = input.issue.details?.[key];
  return typeof value === "number" ? value : null;
}
