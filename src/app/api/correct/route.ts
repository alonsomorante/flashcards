import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
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
    const corrected = data.choices?.[0]?.message?.content ?? text;

    return NextResponse.json({ corrected: corrected.trim() });
  } catch {
    return NextResponse.json(
      { error: "Failed to correct text" },
      { status: 500 }
    );
  }
}
