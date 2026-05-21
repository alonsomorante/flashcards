import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { GenerateFromTextSchema } from "../types";

const SYSTEM_PROMPT = `Eres un experto en crear flashcards de alta calidad para estudio académico. Analiza el texto proporcionado y extrae flashcards atómicas.

REGLAS DE EXTRACCIÓN:
1. UN HECHO POR CARD: Cada card debe evaluar exactamente UN solo hecho, concepto o relación discreta.
2. LARGO MÁXIMO - FRONT: La pregunta debe ser de UNA SOLA LÍNEA, máximo 10-12 palabras.
3. LARGO MÁXIMO - BACK: La respuesta debe ser UNA oración corta (máximo 15 palabras) o 2-3 bullets clave.
4. ESPECÍFICO SOBRE GENERAL: Prefiere nombres propios, fechas exactas e instituciones.
5. NOTAS: Usa "notes" SOLO para contexto aclaratorio.
6. LENGUAJE: Crea cards en el mismo idioma que el texto fuente.

FORMATO OUTPUT:
Devuelve SOLO un array JSON válido COMPLETO Y SIN TRUNCAR.
Sin markdown, sin explicaciones, sin bloques de código.
Cada objeto debe tener exactamente estos campos:
- "front": string
- "back": string
- "notes": string (opcional)`;

const app = new Hono();

app.post("/", zValidator("json", GenerateFromTextSchema), async (c) => {
  const { text } = c.req.valid("json");
  const maxTextLength = 15000;
  const truncatedText = text.length > maxTextLength ? text.substring(0, maxTextLength) + "..." : text;

  const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analiza el siguiente texto y extrae flashcards atómicas de alta calidad:\n\n${truncatedText}`,
        },
      ],
      max_tokens: 8000,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return c.json({ error: `AI Gateway error: ${err}` }, res.status);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content ?? "";

  const cleanedContent = rawContent
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let generatedCards: Array<{ front: string; back: string; notes?: string }>;

  try {
    generatedCards = JSON.parse(cleanedContent);
  } catch {
    const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return c.json({ error: "Failed to parse generated cards from AI response" }, 500);
    }

    let fixedJson = jsonMatch[0];
    const openBrackets = (fixedJson.match(/\{/g) || []).length;
    const closeBrackets = (fixedJson.match(/\}/g) || []).length;
    const openArrays = (fixedJson.match(/\[/g) || []).length;
    const closeArrays = (fixedJson.match(/\]/g) || []).length;

    for (let i = 0; i < openBrackets - closeBrackets; i++) fixedJson += "}";
    for (let i = 0; i < openArrays - closeArrays; i++) fixedJson += "]";
    fixedJson = fixedJson.replace(/,\s*([}\]])/g, "$1");

    try {
      generatedCards = JSON.parse(fixedJson);
    } catch {
      return c.json({ error: "Invalid JSON in AI response" }, 500);
    }
  }

  const validatedCards = generatedCards
    .filter(
      (c): c is { front: string; back: string; notes?: string } =>
        typeof c.front === "string" &&
        typeof c.back === "string" &&
        c.front.trim().length > 0 &&
        c.back.trim().length > 0
    )
    .map((c) => ({
      front: c.front.trim(),
      back: c.back.trim(),
      notes: c.notes?.trim() ?? "",
    }));

  return c.json({ cards: validatedCards });
});

export default app;
