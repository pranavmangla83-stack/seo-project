import OpenAI from "openai";
import { RESOLUTION_PROMPTS } from "@/resolution/prompts";
import type {
  ResolutionDecisionInput,
  ResolutionOutput,
  ResolutionPlan
} from "@/resolution/types";

export function createDeterministicOutputs(plan: ResolutionPlan): ResolutionOutput[] {
  const fallback = createFallbackGeneratedFix(plan);

  return [
    {
      outputType: "explanation",
      title: "What we found",
      body: fallback.simpleExplanation,
      content: {
        simpleExplanation: fallback.simpleExplanation,
        businessImpact: plan.businessImpact,
        generatedBy: "deterministic"
      }
    },
    {
      outputType: "suggested_fix",
      title: "Suggested replacement",
      body: fallback.suggestedReplacement,
      content: {
        suggestedReplacement: fallback.suggestedReplacement,
        whyThisIsBetter: fallback.whyThisIsBetter,
        difficulty: plan.difficulty,
        priority: plan.priority,
        generatedBy: "deterministic"
      }
    },
    {
      outputType: "instructions",
      title: "How to finish",
      body: fallback.pasteLocation,
      content: {
        pasteLocation: fallback.pasteLocation,
        verificationStep: fallback.verificationStep,
        generatedBy: "deterministic"
      }
    }
  ];
}

type AiGeneratedFix = {
  simpleExplanation: string;
  suggestedReplacement: string;
  whyThisIsBetter: string;
  pasteLocation: string;
  verificationStep: string;
};

const fallbackModel = process.env.OPENAI_MODEL || "gpt-5.5";

export async function createResolutionOutputs(
  plan: ResolutionPlan,
  input: ResolutionDecisionInput
): Promise<ResolutionOutput[]> {
  if (!shouldGenerateWithAi(plan) || !process.env.OPENAI_API_KEY) {
    return createDeterministicOutputs(plan);
  }

  try {
    const generated = await generateAiFix(plan, input);
    return createAiOutputs(plan, generated);
  } catch {
    return createDeterministicOutputs(plan);
  }
}

function shouldGenerateWithAi(plan: ResolutionPlan) {
  return (
    plan.issueType === "missing_title" ||
    plan.issueType === "missing_meta_description" ||
    plan.issueType === "weak_page_title" ||
    plan.issueType === "weak_meta_description" ||
    plan.issueType === "missing_h1"
  );
}

async function generateAiFix(
  plan: ResolutionPlan,
  input: ResolutionDecisionInput
): Promise<AiGeneratedFix> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.responses.create({
    model: fallbackModel,
    instructions:
      "You help small business owners fix website SEO issues. Use friendly, plain language. Do not add technical jargon. Only generate the requested fix for the provided issue.",
    input: JSON.stringify({
      task: getTaskPrompt(plan),
      issue: {
        type: plan.issueType,
        sourceType: input.issue.issue_type,
        message: input.issue.message,
        pageUrl: input.issue.page_url,
        severity: input.issue.severity,
        details: input.issue.details
      },
      page: {
        url: input.page?.url ?? input.issue.page_url,
        pageType: input.page?.page_type ?? "unknown",
        currentTitle: input.page?.title,
        currentMetaDescription: input.page?.meta_description,
        wordCount: input.page?.word_count
      },
      constraints: getGenerationConstraints(plan)
    }),
    text: {
      format: {
        type: "json_schema",
        name: "seo_resolution_generated_fix",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            simpleExplanation: { type: "string" },
            suggestedReplacement: { type: "string" },
            whyThisIsBetter: { type: "string" },
            pasteLocation: { type: "string" },
            verificationStep: { type: "string" }
          },
          required: [
            "simpleExplanation",
            "suggestedReplacement",
            "whyThisIsBetter",
            "pasteLocation",
            "verificationStep"
          ]
        }
      }
    }
  });

  return JSON.parse(response.output_text) as AiGeneratedFix;
}

function createAiOutputs(
  plan: ResolutionPlan,
  generated: AiGeneratedFix
): ResolutionOutput[] {
  return [
    {
      outputType: "explanation",
      title: "What we found",
      body: generated.simpleExplanation,
      content: {
        simpleExplanation: generated.simpleExplanation,
        businessImpact: plan.businessImpact,
        generatedBy: "ai"
      }
    },
    {
      outputType: "suggested_fix",
      title: "Suggested replacement",
      body: generated.suggestedReplacement,
      content: {
        suggestedReplacement: generated.suggestedReplacement,
        whyThisIsBetter: generated.whyThisIsBetter,
        difficulty: plan.difficulty,
        priority: plan.priority,
        generatedBy: "ai"
      }
    },
    {
      outputType: "instructions",
      title: "How to finish",
      body: generated.pasteLocation,
      content: {
        pasteLocation: generated.pasteLocation,
        verificationStep: generated.verificationStep || plan.verificationStep,
        generatedBy: "ai"
      }
    }
  ];
}

function getTaskPrompt(plan: ResolutionPlan) {
  switch (plan.issueType) {
    case "missing_title":
    case "weak_page_title":
      return RESOLUTION_PROMPTS.titleSuggestion;
    case "missing_meta_description":
    case "weak_meta_description":
      return RESOLUTION_PROMPTS.metaDescriptionSuggestion;
    case "missing_h1":
      return RESOLUTION_PROMPTS.h1Suggestion;
    default:
      return plan.recommendedAction;
  }
}

function getGenerationConstraints(plan: ResolutionPlan) {
  switch (plan.issueType) {
    case "missing_title":
    case "weak_page_title":
      return [
        "Return one suggestedReplacement only.",
        "Aim for 50 to 60 characters when possible.",
        "Make it specific to this exact page, not the whole website.",
        "Use the page topic, likely customer search intent, and the main service/product/course keyword.",
        "Include the business location or brand name only when it sounds natural and useful.",
        "Avoid generic titles like Home, About Us, Default Title, Services, or Blog.",
        "Do not keyword stuff.",
        "pasteLocation should say: Paste this into the page title, SEO title, or title tag field."
      ];
    case "missing_meta_description":
    case "weak_meta_description":
      return [
        "Return one suggestedReplacement only.",
        "Aim for 120 to 155 characters when possible.",
        "Summarize this exact page in plain language.",
        "Match likely customer search intent and include the main offer naturally.",
        "Give customers a clear reason to click.",
        "Make it unique compared with other pages.",
        "Do not use spammy sales language.",
        "pasteLocation should say: Paste this into the meta description or SEO description field."
      ];
    case "missing_h1":
      return [
        "Return one suggestedReplacement only.",
        "Make it a concise main heading.",
        "Do not make it sound like an ad.",
        "pasteLocation should say: Paste this as the main heading at the top of the page."
      ];
    default:
      return [];
  }
}

function createFallbackGeneratedFix(plan: ResolutionPlan): AiGeneratedFix {
  return {
    simpleExplanation: plan.problemExplanation,
    suggestedReplacement: getFallbackReplacement(plan),
    whyThisIsBetter: plan.expectedOutcome,
    pasteLocation: getPasteLocation(plan),
    verificationStep: plan.verificationStep
  };
}

function getFallbackReplacement(plan: ResolutionPlan) {
  switch (plan.issueType) {
    case "missing_title":
    case "weak_page_title":
      return "Write a clear 50-60 character title tag for this page.";
    case "missing_meta_description":
    case "weak_meta_description":
      return "Write a clear 120-155 character meta description for this page.";
    case "missing_h1":
      return "Add one clear main heading for this page.";
    default:
      return plan.recommendedAction;
  }
}

function getPasteLocation(plan: ResolutionPlan) {
  switch (plan.issueType) {
    case "missing_title":
    case "weak_page_title":
      return "Paste this into the page title, SEO title, or title tag field.";
    case "missing_meta_description":
    case "weak_meta_description":
      return "Paste this into the meta description or SEO description field.";
    case "missing_h1":
      return "Paste this as the main heading at the top of the page.";
    default:
      return "Make the change on your website, mark it done, then run verification.";
  }
}
