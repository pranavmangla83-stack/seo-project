import type {
  Confidence,
  Difficulty,
  PriorityScore,
  ResolutionDecisionInput,
  ResolutionPriority
} from "@/resolution/types";

const SEVERITY_SCORE = {
  high: 80,
  medium: 50,
  low: 25
} as const;

const DIFFICULTY_SCORE = {
  easy: 100,
  medium: 60,
  hard: 30
} as const;

const CONFIDENCE_MULTIPLIER = {
  high: 1,
  medium: 0.85,
  low: 0.65
} as const;

export function scoreResolutionPriority(input: ResolutionDecisionInput): PriorityScore {
  const issue = input.issue;
  const pageImportance = clamp(issue.page_importance ?? input.page?.importance_score ?? 35);
  const severityScore = SEVERITY_SCORE[issue.severity];
  const difficulty = issue.fix_difficulty ?? getDefaultDifficulty(issue.issue_type);
  const difficultyScore = DIFFICULTY_SCORE[difficulty];
  const confidence = issue.confidence ?? getDefaultConfidence(issue.issue_type);
  const confidenceMultiplier = CONFIDENCE_MULTIPLIER[confidence];
  const businessImpactScore = getBusinessImpactScore(issue.issue_type, pageImportance);

  let score = Math.round(
    (severityScore * 0.35 +
      pageImportance * 0.25 +
      businessImpactScore * 0.25 +
      difficultyScore * 0.15) *
      confidenceMultiplier
  );

  const reasons = [
    `Severity: ${issue.severity}`,
    `Page importance: ${pageImportance}/100`,
    `Difficulty: ${difficulty}`,
    `Confidence: ${confidence}`
  ];

  if (issue.issue_type === "blocked_from_indexing" && pageImportance >= 80) {
    score = Math.max(score, 90);
    reasons.push("Important page is hidden from search.");
  }

  if ((input.page?.page_type ?? "") === "legal") {
    score = Math.min(score, 20);
    reasons.push("Legal pages rarely drive customer search traffic.");
  }

  score = clamp(score);

  return {
    score,
    label: getPriorityLabel(score),
    difficulty,
    confidence,
    reasons
  };
}

function getDefaultDifficulty(issueType: string): Difficulty {
  switch (issueType) {
    case "thin_content":
      return "medium";
    default:
      return "easy";
  }
}

function getDefaultConfidence(issueType: string): Confidence {
  switch (issueType) {
    case "broken_internal_link":
    case "thin_content":
      return "medium";
    default:
      return "high";
  }
}

function getBusinessImpactScore(issueType: string, pageImportance: number) {
  switch (issueType) {
    case "blocked_from_indexing":
      return pageImportance >= 80 ? 100 : 70;
    case "weak_page_title":
      return 85;
    case "weak_meta_description":
      return 65;
    case "bad_heading_structure":
      return 60;
    case "thin_content":
      return pageImportance >= 80 ? 85 : 60;
    case "broken_internal_link":
      return pageImportance >= 80 ? 75 : 55;
    default:
      return 50;
  }
}

function getPriorityLabel(score: number): ResolutionPriority {
  if (score >= 90) {
    return "critical";
  }

  if (score >= 70) {
    return "high";
  }

  if (score >= 45) {
    return "medium";
  }

  if (score >= 25) {
    return "low";
  }

  return "very_low";
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}
