export const MVP_ISSUE_TYPES = [
  "missing_title",
  "missing_meta_description",
  "missing_h1",
  "thin_content",
  "noindex",
  "broken_internal_links"
] as const;

export type MvpIssueType = (typeof MVP_ISSUE_TYPES)[number];

export type SourceIssueType =
  | "weak_page_title"
  | "weak_meta_description"
  | "bad_heading_structure"
  | "blocked_from_indexing"
  | "thin_content"
  | "broken_internal_link";

export type ResolutionType =
  | "content"
  | "instructions"
  | "guided_workflow"
  | "investigation";

export type ResolutionStatus =
  | "ready_to_fix"
  | "needs_input"
  | "marked_done"
  | "verified"
  | "verification_failed"
  | "dismissed";

export type ResolutionOutputType = "explanation" | "suggested_fix" | "instructions";

export type ResolutionPriority = "critical" | "high" | "medium" | "low" | "very_low";

export type Difficulty = "easy" | "medium" | "hard";

export type Confidence = "high" | "medium" | "low";

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

export type ScanIssueRecord = {
  id: string;
  scan_id: string;
  page_url: string;
  issue_type: string;
  severity: "high" | "medium" | "low";
  message: string;
  priority: number | null;
  page_importance: number | null;
  business_impact: string | null;
  fix_difficulty: Difficulty | null;
  confidence: Confidence | null;
  estimated_impact: "high" | "medium" | "low" | null;
  exact_fix: string | null;
  priority_score: number | null;
  sort_score: number | null;
  details: Record<string, unknown>;
};

export type ScanPageRecord = {
  id: string;
  scan_id: string;
  url: string;
  title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  word_count: number | null;
  page_type: PageType | null;
  importance_score: number | null;
};

export type ResolutionDecisionInput = {
  issue: ScanIssueRecord;
  page?: ScanPageRecord;
};

export type PriorityScore = {
  score: number;
  label: ResolutionPriority;
  difficulty: Difficulty;
  confidence: Confidence;
  reasons: string[];
};

export type ResolutionPlan = {
  scanId: string;
  issueId: string;
  pageUrl: string;
  issueType: MvpIssueType;
  resolutionType: ResolutionType;
  status: ResolutionStatus;
  priority: ResolutionPriority;
  priorityScore: number;
  difficulty: Difficulty;
  confidence: Confidence;
  problemExplanation: string;
  businessImpact: string;
  recommendedAction: string;
  verificationStep: string;
  expectedOutcome: string;
  ruleId: string;
  reasons: string[];
};

export type ResolutionOutput = {
  outputType: ResolutionOutputType;
  title: string;
  body: string;
  content: Record<string, unknown>;
};
