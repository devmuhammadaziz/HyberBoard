import OpenAI from "openai";
import { config } from "../config";

let client: OpenAI | null = null;

export function getOpenAI() {
  if (!config.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!client) {
    client = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return client;
}

export async function runStructuredAi<T>(opts: {
  system: string;
  user: string;
  schemaHint: string;
}): Promise<T> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: config.openaiModel,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${opts.system}

You are an expert STEM teaching assistant for HyperBoard Studio.
Be precise, pedagogically clear, and mathematically/chemically/physically correct.
Always respond with a single JSON object matching this shape:
${opts.schemaHint}`,
      },
      { role: "user", content: opts.user },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(raw) as T;
}
