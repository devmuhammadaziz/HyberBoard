export const AI_RESULT_SCHEMA = `{
  "title": string,
  "explanation": string,
  "latex": string | null,
  "steps": string[],
  "visualization": {
    "type": "graph" | "chart" | "3d" | "diagram" | "table" | "text",
    "data": object
  } | null
}`;
