import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CorrectTextSchema } from "../types";

const app = new Hono();

app.post("/", zValidator("json", CorrectTextSchema), async (c) => {
  const { text } = c.req.valid("json");

  const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a spelling and grammar corrector. Fix any grammar or spelling mistakes in the user's text. Return ONLY the corrected text, nothing else. Preserve the original language. Do not add any explanations or commentary. If the text is already correct, return it unchanged.",
        },
        { role: "user", content: text.trim() },
      ],
      max_tokens: 500,
      temperature: 0,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: `AI Gateway error: ${err}` }, res.status);
  }

  const data = await res.json();
  const corrected = data.choices?.[0]?.message?.content ?? text;
  return c.json({ corrected: corrected.trim() });
});

export default app;
