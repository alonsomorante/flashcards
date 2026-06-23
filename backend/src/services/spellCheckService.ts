import { generateText } from 'ai';

export async function correctText(text: string): Promise<string> {
  const result = await generateText({
    model: 'openai/gpt-4o-mini',
    system:
      'Corrige únicamente ortografía, puntuación y uso de mayúsculas del texto. No cambies el significado, no añadas explicaciones y no uses comillas alrededor del resultado. Responde únicamente con el texto corregido.',
    prompt: text,
  });

  return result.text.trim();
}
