import type { AiFeatureId, AiRequest, AiResponse } from "@smart-desk/types";
import { runStructuredAi } from "../openai";
import { AI_RESULT_SCHEMA } from "../schema";

type Structured = Omit<AiResponse, "featureId" | "raw">;

const PROMPTS: Record<string, string> = {
  "math.handwriting-latex":
    "Convert the input (handwriting transcription or math text) into clean LaTeX. If graphable, include visualization.type=graph with points or equation.",
  "math.step-solver":
    "Solve the equation/expression step-by-step. Put each pedagogical step in steps[]. Include final answer in latex.",
  "math.derivative-integral":
    "Differentiate and/or integrate. Shade area under curve conceptually via visualization chart/graph data (x,y samples).",
  "math.matrix-ops":
    "Perform matrix operations (det, inverse, multiply, eigenvalues). Show work in steps and latex.",
  "math.geometric-net-3d":
    "Describe folding a 2D net into a 3D solid. visualization.type=3d with solid name, faces, and fold sequence.",
  "math.theorem-proof":
    "Provide a clear theorem statement and structured proof. Prefer classic school/university theorems when applicable.",
  "math.word-problem":
    "Translate the word problem into variables, equations, and a solvable model. Include latex for the model.",
  "math.stats-curve":
    "Generate scatter + best-fit guidance. visualization.type=chart with points and fit equation.",
  "math.unit-circle":
    "Explain trig values on the unit circle. visualization.type=diagram with angle degrees/radians and coordinates.",
  "math.error-highlighter":
    "Find arithmetic/sign/algebra errors in the student's steps. List errors clearly and corrected steps.",
};

export async function runMathFeature(req: AiRequest): Promise<AiResponse> {
  const featurePrompt = PROMPTS[req.featureId];
  if (!featurePrompt) throw new Error(`Unknown math feature: ${req.featureId}`);

  const result = await runStructuredAi<Structured>({
    system: `You are a world-class mathematics educator. Feature: ${req.featureId}. ${featurePrompt}`,
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
