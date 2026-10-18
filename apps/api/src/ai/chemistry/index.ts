import type { AiFeatureId, AiRequest, AiResponse } from "@smart-desk/types";
import { runStructuredAi } from "../openai";
import { AI_RESULT_SCHEMA } from "../schema";

type Structured = Omit<AiResponse, "featureId" | "raw">;

const PROMPTS: Record<string, string> = {
  "chemistry.equation-balancer":
    "Balance the chemical equation. Show atom inventory before/after and balanced equation in latex/text.",
  "chemistry.molecule-3d":
    "Describe VSEPR geometry and ball-and-stick layout. visualization.type=3d with atoms and bonds.",
  "chemistry.stoichiometry":
    "Compute limiting reagent, theoretical yield, and mole ratios with clear steps.",
  "chemistry.periodic-table":
    "Extract key element properties (Z, mass, group, period, electronegativity, config).",
  "chemistry.titration":
    "Generate acid-base titration curve guidance and equivalence point notes. visualization=chart.",
  "chemistry.redox":
    "Split into oxidation/reduction half-reactions and balance in acid/base as appropriate.",
  "chemistry.functional-groups":
    "Identify organic functional groups and explain reactivity implications briefly.",
  "chemistry.molarity":
    "Solve concentration/dilution (C1V1=C2V2) and related molarity problems.",
  "chemistry.enthalpy":
    "Build exo/endothermic reaction energy profile. visualization=chart with reaction coordinate.",
  "chemistry.lewis-structure":
    "Draw Lewis structure conceptually: valence electrons, bonds, lone pairs, formal charges.",
};

export async function runChemistryFeature(req: AiRequest): Promise<AiResponse> {
  const featurePrompt = PROMPTS[req.featureId];
  if (!featurePrompt) throw new Error(`Unknown chemistry feature: ${req.featureId}`);

  const result = await runStructuredAi<Structured>({
    system: `You are a world-class chemistry educator. Feature: ${req.featureId}. ${featurePrompt}`,
    user: JSON.stringify({
      input: req.input,
      selection: req.selection,
      locale: req.locale || "en",
      boardContext: req.boardContext,
    }),
    schemaHint: AI_RESULT_SCHEMA,
  });

  return {
    featureId: req.featureId as AiFeatureId,
    title: result.title,
    explanation: result.explanation,
    latex: result.latex ?? undefined,
    steps: result.steps ?? [],
    visualization: result.visualization ?? undefined,
  };
}
