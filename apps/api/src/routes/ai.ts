import { Elysia, t } from "elysia";
import { getUserFromAuthHeader } from "../lib/auth";
import { listFeatures, runAiFeature } from "../ai/router";
import { isLocale, isSubject } from "../lib/schema";
import { getOpenAI } from "../ai/openai";
import { config } from "../config";

export const aiRoutes = new Elysia({ prefix: "/ai" })
  .get("/features", ({ query }) => {
    const subject = isSubject(query.subject) ? query.subject : undefined;
    return { features: listFeatures(subject) };
  })
  .post(
    "/solve",
    async ({ request, body, set }) => {
      const user = await getUserFromAuthHeader(request.headers.get("authorization"));
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const text = (body.text || "").trim();
      const imageBase64 = body.imageBase64?.replace(/^data:image\/\w+;base64,/, "") || null;

      if (!text && !imageBase64) {
        set.status = 400;
        return { error: "Nothing to solve" };
      }

      try {
        const openai = getOpenAI();
        const messages: Array<{
          role: "system" | "user";
          content:
            | string
            | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
        }> = [
          {
            role: "system",
            content: `You are HyperBoard Solve — like Apple Math Notes / iPhone Calculator Math Notes.
Read the handwritten or typed math and return ONLY a JSON object:
{
  "expression": string | null,
  "answer": string,
  "latex": string | null
}
Rules:
- If the input ends with "=", complete it (e.g. "7+3=" → answer "10").
- Prefer a short final answer (number or simplified expression).
- NEVER explain UI, boards, software, or "selected objects".
- NEVER return long essays. Answer only.`,
          },
        ];

        if (imageBase64) {
          messages.push({
            role: "user",
            content: [
              {
                type: "text",
                text:
                  text ||
                  "Solve the handwritten math in this board crop. If it ends with =, fill in the result.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                },
              },
            ],
          });
        } else {
          messages.push({
            role: "user",
            content: text,
          });
        }

        const completion = await openai.chat.completions.create({
          model: config.openaiModel,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: messages as never,
        });

        const raw = completion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(raw) as {
          expression?: string;
          answer?: string;
          latex?: string;
        };

        if (!parsed.answer) {
          set.status = 400;
          return { error: "Could not solve that yet" };
        }

        return {
          result: {
            expression: parsed.expression || text || null,
            answer: String(parsed.answer),
            latex: parsed.latex || null,
          },
        };
      } catch (err) {
        set.status = 400;
        return { error: err instanceof Error ? err.message : "Solve failed" };
      }
    },
    {
      body: t.Object({
        text: t.Optional(t.String()),
        imageBase64: t.Optional(t.String()),
        subject: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/plot",
    async ({ request, body, set }) => {
      const user = await getUserFromAuthHeader(request.headers.get("authorization"));
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const text = (body.text || "").trim();
      const imageBase64 = body.imageBase64?.replace(/^data:image\/\w+;base64,/, "") || null;

      if (!text && !imageBase64) {
        set.status = 400;
        return { error: "Nothing to plot" };
      }

      try {
        const openai = getOpenAI();
        const messages: Array<{
          role: "system" | "user";
          content:
            | string
            | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
        }> = [
          {
            role: "system",
            content: `You are HyperBoard Graph OCR. Extract math for client-side plotting.
NEVER return sampled (x,y) points for a function curve. NEVER invent SVG/paths/Béziers.
Return ONLY JSON:
{
  "mode": "2d" | "3d",
  "title": string,
  "rawLatex": string,
  "normalizedExpression": string,
  "variable": "x",
  "functionType": "polynomial" | "trigonometric" | "rational" | "exponential" | "implicit" | "vector" | "points" | "surface3d" | "unknown",
  "suggestedDomain": [number, number],
  "points": [{ "x": number, "y": number, "label"?: string }],
  "vectors": [{ "x": number, "y": number, "label"?: string, "from"?: { "x": number, "y": number } }]
}
Rules:
- y = f(x) → mode "2d", put RHS only in normalizedExpression (mathjs ASCII: x^2, 4*x, sin(x)). points/vectors must be [].
- z = f(x,y) → mode "3d", RHS in normalizedExpression.
- Explicit coordinates (x1,y1…) or column vectors → leave normalizedExpression "" and fill points/vectors only.
- suggestedDomain: center on key features (e.g. parabola vertex). Default [-10,10].
- No explanations.`,
          },
        ];

        if (imageBase64) {
          messages.push({
            role: "user",
            content: [
              {
                type: "text",
                text:
                  text ||
                  "OCR this handwriting into the JSON schema. For y=f(x) return normalizedExpression only — do NOT sample the curve.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${imageBase64}` },
              },
            ],
          });
        } else {
          messages.push({ role: "user", content: text });
        }

        const completion = await openai.chat.completions.create({
          model: config.openaiModel,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: messages as never,
        });

        const raw = completion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(raw) as {
          mode?: "2d" | "3d";
          title?: string;
          rawLatex?: string;
          normalizedExpression?: string | null;
          expression?: string | null;
          variable?: "x" | "y";
          functionType?: string;
          suggestedDomain?: [number, number] | null;
          points?: Array<{ x: number; y: number; label?: string }>;
          vectors?: Array<{
            x: number;
            y: number;
            label?: string;
            from?: { x: number; y: number };
          }>;
        };

        // Strip any hallucinated curve samples if a model sneaks them in
        const result = {
          mode: parsed.mode === "3d" ? "3d" : "2d",
          title: parsed.title,
          rawLatex: parsed.rawLatex,
          normalizedExpression:
            parsed.normalizedExpression || parsed.expression || "",
          variable: parsed.variable || "x",
          functionType: parsed.functionType || "unknown",
          suggestedDomain: parsed.suggestedDomain || undefined,
          // Only keep geometry when there is NO function expression
          points: parsed.normalizedExpression || parsed.expression
            ? []
            : parsed.points || [],
          vectors: parsed.normalizedExpression || parsed.expression
            ? []
            : parsed.vectors || [],
        };

        const hasExpr = Boolean(String(result.normalizedExpression || "").trim());
        const hasGeom = Boolean(result.points.length || result.vectors.length);

        if (!hasExpr && !hasGeom) {
          set.status = 400;
          return { error: "Could not find something to plot" };
        }

        return { result };
      } catch (err) {
        set.status = 400;
        return { error: err instanceof Error ? err.message : "Plot failed" };
      }
    },
    {
      body: t.Object({
        text: t.Optional(t.String()),
        imageBase64: t.Optional(t.String()),
        subject: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/run",
    async ({ request, body, set }) => {
      const user = await getUserFromAuthHeader(request.headers.get("authorization"));
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      if (!isSubject(body.subject)) {
        set.status = 400;
        return { error: "Invalid subject" };
      }
      try {
        const result = await runAiFeature({
          featureId: body.featureId as never,
          subject: body.subject,
          input: body.input,
          locale: isLocale(body.locale) ? body.locale : user.locale || "en",
          selection: body.selection,
          boardContext: body.boardContext,
        });
        return { result };
      } catch (err) {
        set.status = 400;
        return { error: err instanceof Error ? err.message : "AI request failed" };
      }
    },
    {
      body: t.Object({
        featureId: t.String(),
        subject: t.String(),
        input: t.String(),
        locale: t.Optional(t.String()),
        selection: t.Optional(
          t.Object({
            elementIds: t.Array(t.String()),
            text: t.Optional(t.String()),
            latex: t.Optional(t.String()),
          })
        ),
        boardContext: t.Optional(
          t.Object({
            boardId: t.Optional(t.String()),
            title: t.Optional(t.String()),
          })
        ),
      }),
    }
  );
