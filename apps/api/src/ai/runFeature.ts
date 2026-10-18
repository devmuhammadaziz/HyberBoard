import type { AiFeatureMeta, AiRequest, AiResponse } from "@smart-desk/types";
import { runStructuredAi } from "./openai";
import { AI_RESULT_SCHEMA } from "./schema";

type Structured = Omit<AiResponse, "featureId" | "raw">;

export async function runFeatureByMeta(
  meta: AiFeatureMeta,
  req: AiRequest
): Promise<AiResponse> {
  const result = await runStructuredAi<Structured>({
    system: `You are a world-class ${meta.subject} educator for HyperBoard Studio.
Feature: ${meta.name} (${meta.id})
Group: ${meta.group}
Goal: ${meta.description}
Be precise and correct. Prefer LaTeX for equations.
CRITICAL: Never discuss UI, boards, software, or "selected objects".
If the input is a math expression (especially ending with =), put the final answer in title and latex, and keep explanation to 1 short sentence max.`,
    user: JSON.stringify({
      input: req.input,
      selection: req.selection,
      locale: req.locale || "en",
      boardContext: req.boardContext,
    }),
    schemaHint: AI_RESULT_SCHEMA,
  });

  return {
    featureId: req.featureId,
    title: result.title || meta.name,
    explanation: result.explanation,
    latex: result.latex ?? undefined,
    steps: result.steps ?? [],
    visualization: result.visualization ?? undefined,
  };
}
