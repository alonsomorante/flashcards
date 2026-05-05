import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GenerateFromTextSchema = z.object({
  text: z.string().min(1),
});

const SYSTEM_PROMPT = `Eres un experto en crear flashcards de alta calidad para estudio académico. Analiza el texto proporcionado y extrae flashcards atómicas.

REGLAS DE EXTRACCIÓN:
1. UN HECHO POR CARD: Cada card debe evaluar exactamente un hecho, concepto o relación discreta. Nunca combines múltiples hechos.
2. ESPECÍFICO SOBRE GENERAL: Prefiere nombres propios, fechas exactas, instituciones y eventos específicos sobre generalizaciones vagas.
3. CONTEXTO CAUSAL: Cuando extraigas hechos, preserva las relaciones causales ("porque", "condujo a", "resultó de").
4. NOMBRES COMPLETOS: Usa nombre + apellido, no solo apellido.
5. FECHAS EXACTAS: Usa fechas específicas, no períodos vagos.
6. NOTAS: Usa "notes" para referencias de página, contexto fuente o detalles aclaratorios que no deben estar en la respuesta.
7. LENGUAJE: Crea cards en el mismo idioma que el texto fuente.
8. SIN AMBIGÜEDAD: Si un hecho requiere clarificación, inclúyela en notes.

FORMATO OUTPUT:
Devuelve SOLO un array JSON válido. Sin markdown, sin explicaciones, sin bloques de código.
Cada objeto debe tener exactamente estos campos:
- "front": string (pregunta/prompt)
- "back": string (respuesta)
- "notes": string (contexto opcional)

Ejemplo:
[
  {"front": "¿Quién firmó el Tratado de Tordesillas en 1494?", "back": "Los Reyes Católicos de España y Juan II de Portugal.", "notes": "Mediación papal de Alejandro VI"},
  {"front": "¿Qué consecuencia tuvo la epidemia de viruela en Tenochtitlán en 1520?", "back": "Debilitó la resistencia azteca durante el asedio de Cortés.", "notes": "Epidemia iniciada con la llegada de los españoles"}
]`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = GenerateFromTextSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request: provide text to analyze" },
        { status: 400 }
      );
    }

    const { text } = parsed.data;

    const res = await fetch(
      "https://ai-gateway.vercel.sh/v1/chat/completions",
      {
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
              content: `Analiza el siguiente texto y extrae flashcards atómicas de alta calidad:\n\n${text}` 
            },
          ],
          max_tokens: 4000,
          temperature: 0.2,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `AI Gateway error: ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content ?? "";

    // Extract JSON from the response
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse generated cards from AI response" },
        { status: 500 }
      );
    }

    let generatedCards: Array<{ front: string; back: string; notes?: string }>;
    try {
      generatedCards = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in AI response" },
        { status: 500 }
      );
    }

    // Validate structure
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

    return NextResponse.json({
      cards: validatedCards,
      deckId: Number(id),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate cards" },
      { status: 500 }
    );
  }
}
