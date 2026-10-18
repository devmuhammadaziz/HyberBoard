import { AI_FEATURES, type AiRequest, type AiResponse, type Subject } from "@smart-desk/types";
import { runFeatureByMeta } from "./runFeature";

export function listFeatures(subject?: Subject) {
  if (!subject) return AI_FEATURES;
  return AI_FEATURES.filter((f) => f.subject === subject);
}

export async function runAiFeature(req: AiRequest): Promise<AiResponse> {
  const meta = AI_FEATURES.find((f) => f.id === req.featureId);
  if (!meta) throw new Error(`Unknown feature: ${req.featureId}`);
  if (meta.subject !== req.subject) {
    throw new Error(`Feature ${req.featureId} does not belong to subject ${req.subject}`);
  }
  if (!req.input?.trim() && !req.selection?.text && !req.selection?.latex) {
    throw new Error("Provide input or a selection for the AI feature");
  }

  const normalized: AiRequest = {
    ...req,
    input:
      req.input?.trim() ||
      req.selection?.latex ||
      req.selection?.text ||
      "",
  };

  return runFeatureByMeta(meta, normalized);
}
