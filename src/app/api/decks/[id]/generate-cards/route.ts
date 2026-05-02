import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GenerateCardsSchema = z.object({
  images: z.array(z.string()).min(1).max(5),
});

const SYSTEM_PROMPT = `You are an expert flashcard creator specializing in academic and historical texts. Your task is to extract high-quality, atomic flashcards from the provided images of book pages.

RULES FOR CARD CREATION:
1. ONE FACT PER CARD: Each card must test exactly one discrete fact, concept, or relationship. Never combine multiple facts.
2. SPECIFIC OVER GENERAL: Prefer proper names, dates, institutions, and specific events over vague generalizations.
3. CAUSAL CONTEXT: When extracting facts, preserve causal relationships ("because", "led to", "resulted from").
4. CLEAR QUESTIONS: The "front" must be an unambiguous question or prompt.
5. CONCISE ANSWERS: The "back" should be brief but complete.
6. NOTES FOR CONTEXT: Use "notes" for page references, source context, or clarifying details that shouldn't be in the answer.
7. LANGUAGE: Create cards in the same language as the source text.
8. NO AMBIGUITY: If a fact requires clarification, include it in the notes.

OUTPUT FORMAT:
Return ONLY a valid JSON array. No markdown, no explanations, no code blocks.
Each object must have exactly these fields:
- "front": string (question/prompt)
- "back": string (answer)
- "notes": string (optional context/source)

Example output:
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
    const parsed = GenerateCardsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request: provide 1-5 base64 images" },
        { status: 400 }
      );
    }

    const { images } = parsed.data;

    // Build multimodal content array
    const content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [
      {
        type: "text",
        text: `Extract flashcards from the following ${images.length} image(s) of book pages. Follow the system instructions carefully.`,
      },
    ];

    for (const base64Image of images) {
      content.push({
        type: "image_url",
        image_url: { url: base64Image },
      });
    }

    const res = await fetch(
      "https://ai-gateway.vercel.sh/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content },
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

    // Extract JSON from the response (handle potential markdown wrapping)
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
