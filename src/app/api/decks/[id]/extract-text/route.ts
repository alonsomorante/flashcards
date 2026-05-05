import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExtractTextSchema = z.object({
  images: z.array(z.string()).min(1).max(5),
});

const OCR_PROMPT = `Extrae TODO el texto verbatim de las siguientes imágenes de páginas de libro.

REGLAS:
1. Extrae el texto EXACTAMENTE como aparece, palabra por palabra
2. Preserva párrafos, saltos de línea y estructura
3. NO omitas ninguna palabra
4. Mantén nombres propios, fechas, números exactos
5. Si hay tablas/listas, preserva su estructura
6. Incluye notas al pie y referencias
7. NO resumas, NO interpretes, NO agregues análisis
8. Preserva el idioma original

OUTPUT: Devuelve SOLO el texto extraído, sin comentarios ni markdown.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = ExtractTextSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request: provide 1-5 base64 images" },
        { status: 400 }
      );
    }

    const { images } = parsed.data;

    // Build multimodal content array for Gemini
    const content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [
      {
        type: "text",
        text: OCR_PROMPT,
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
          model: "google/gemini-2.0-flash",
          messages: [
            { role: "user", content },
          ],
          max_tokens: 8000,
          temperature: 0.1,
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
    const extractedText = data.choices?.[0]?.message?.content ?? "";

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No text could be extracted from the images" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text: extractedText.trim(),
      deckId: Number(id),
      pages: images.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to extract text" },
      { status: 500 }
    );
  }
}
