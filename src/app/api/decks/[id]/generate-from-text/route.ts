import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GenerateFromTextSchema = z.object({
  text: z.string().min(1),
});

const SYSTEM_PROMPT = `Eres un experto en crear flashcards de alta calidad para estudio académico. Analiza el texto proporcionado y extrae flashcards atómicas.

REGLAS DE EXTRACCIÓN:
1. UN HECHO POR CARD: Cada card debe evaluar exactamente UN solo hecho, concepto o relación discreta. Nunca combines múltiples ideas.
2. LARGO MÁXIMO - FRONT: La pregunta debe ser de UNA SOLA LÍNEA, máximo 10-12 palabras. Sin comillas incrustadas ni contexto excesivo.
3. LARGO MÁXIMO - BACK: La respuesta debe ser UNA oración corta (máximo 15 palabras) o 2-3 bullets clave. Nunca un párrafo.
4. ESPECÍFICO SOBRE GENERAL: Prefiere nombres propios, fechas exactas e instituciones sobre generalizaciones.
5. CONTEXTO CAUSAL: Preserva relaciones causales ("condujo a", "resultó de") pero en oraciones cortas.
6. NOMBRES COMPLETOS: Usa nombre + apellido, no solo apellido.
7. FECHAS EXACTAS: Usa fechas específicas, no períodos vagos.
8. NOTAS: Usa "notes" SOLO para contexto aclaratorio (ej. "evento previo a la independencia"). NUNCA uses notes para referencias de página solas.
9. LENGUAJE: Crea cards en el mismo idioma que el texto fuente.
10. SIN AMBIGÜEDAD: Si un hecho requiere clarificación, inclúyela en notes, no en el back.

FORMATO OUTPUT:
Devuelve SOLO un array JSON válido COMPLETO Y SIN TRUNCAR. Asegúrate de cerrar todos los corchetes y llaves.
Sin markdown, sin explicaciones, sin bloques de código.
Cada objeto debe tener exactamente estos campos:
- "front": string (pregunta/prompt)
- "back": string (respuesta)
- "notes": string (contexto opcional)

REGLAS DE FORMATO:
- El JSON debe estar COMPLETO, con todos los corchetes de cierre ]
- No trunques la respuesta por falta de espacio
- Si hay muchos hechos, prioriza los más importantes pero mantén el JSON válido

Ejemplo:
[
  {"front": "¿Quién firmó el Tratado de Tordesillas en 1494?", "back": "Los Reyes Católicos de España y Juan II de Portugal.", "notes": "Mediación papal"},
  {"front": "¿Qué efecto tuvo la viruela en Tenochtitlán en 1520?", "back": "Debilitó la resistencia azteca durante el asedio.", "notes": "Iniciada con la llegada de los españoles"}
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

    // Truncate text if too long for the model
    const maxTextLength = 15000;
    const truncatedText = text.length > maxTextLength ? text.substring(0, maxTextLength) + "..." : text;

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
              content: `Analiza el siguiente texto y extrae flashcards atómicas de alta calidad:\n\n${truncatedText}` 
            },
          ],
          max_tokens: 8000,
          temperature: 0.2,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[generate-from-text] AI Gateway error:", err);
      return NextResponse.json(
        { error: `AI Gateway error: ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content ?? "";

    // Clean markdown code blocks (```json ... ```)
    const cleanedContent = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Try to parse JSON directly first
    let generatedCards: Array<{ front: string; back: string; notes?: string }>;
    
    try {
      generatedCards = JSON.parse(cleanedContent);
    } catch {
      // If direct parsing fails, try to find the JSON array
      const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("[generate-from-text] No JSON array found in response");
        console.error("[generate-from-text] Cleaned content:", cleanedContent.substring(0, 500));
        return NextResponse.json(
          { error: "Failed to parse generated cards from AI response" },
          { status: 500 }
        );
      }

      try {
        generatedCards = JSON.parse(jsonMatch[0]);
      } catch {
        // Try to fix truncated JSON by adding missing closing brackets
        let fixedJson = jsonMatch[0];
        
        // Count opening and closing brackets
        const openBrackets = (fixedJson.match(/\{/g) || []).length;
        const closeBrackets = (fixedJson.match(/\}/g) || []).length;
        const openArrays = (fixedJson.match(/\[/g) || []).length;
        const closeArrays = (fixedJson.match(/\]/g) || []).length;
        
        // Add missing closing brackets
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          fixedJson += '}';
        }
        // Add missing closing arrays
        for (let i = 0; i < openArrays - closeArrays; i++) {
          fixedJson += ']';
        }
        
        // Remove trailing commas before closing brackets
        fixedJson = fixedJson.replace(/,\s*([}\]])/g, '$1');
        
        try {
          generatedCards = JSON.parse(fixedJson);
        } catch {
          console.error("[generate-from-text] Could not fix truncated JSON");
          return NextResponse.json(
            { error: "Invalid JSON in AI response" },
            { status: 500 }
          );
        }
      }
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
  } catch (err) {
    console.error("[generate-from-text] Unhandled error:", err);
    return NextResponse.json(
      { error: "Failed to generate cards" },
      { status: 500 }
    );
  }
}
