import type { AiFeatureId, AiRequest, AiResponse } from "@smart-desk/types";
import { runStructuredAi } from "../openai";
import { AI_RESULT_SCHEMA } from "../schema";

type Structured = Omit<AiResponse, "featureId" | "raw">;

const PROMPTS: Record<string, string> = {
  "physics.force-decomposition":
    "Decompose forces into Fx/Fy. Include magnitudes, angles, and vector components in latex + diagram data.",
  "physics.trajectory":
    "Predict projectile trajectory. Include with/without air resistance if data allows. Provide sample (t,x,y) points.",
  "physics.circuit-sim":
    "Interpret a circuit description, fix schematic mistakes, and estimate currents/voltages. visualization=diagram.",
  "physics.pendulum":
    "Model pendulum / SHM: period, angular displacement samples, energy notes.",
  "physics.ray-optics":
    "Trace rays for lenses/mirrors. Provide focal points and image properties.",
  "physics.collision":
    "Simulate elastic/inelastic collisions. Show conservation checks and final velocities.",
  "physics.energy-bars":
    "Produce kinetic vs potential energy breakdown. visualization.type=chart with series.",
  "physics.free-body":
    "Generate a free-body diagram description: forces, directions, labels.",
  "physics.coulomb-field":
    "Map electric field from point charges qualitatively + quantitatively when possible.",
  "physics.hookes-law":
    "Apply Hooke's law: F=-kx, period for mass-spring, oscillation samples.",
};

export async function runPhysicsFeature(req: AiRequest): Promise<AiResponse> {
  const featurePrompt = PROMPTS[req.featureId];
  if (!featurePrompt) throw new Error(`Unknown physics feature: ${req.featureId}`);

  const result = await runStructuredAi<Structured>({
    system: `You are a world-class physics educator. Feature: ${req.featureId}. ${featurePrompt}`,
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
