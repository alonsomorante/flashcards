import { generateText } from 'ai';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'inglés americano (General American)',
  fr: 'francés',
  de: 'alemán',
  it: 'italiano',
  pt: 'portugués',
  ja: 'japonés',
  ko: 'coreano',
  zh: 'chino (mandarín)',
};

function getLanguageName(languageCode: string): string {
  const prefix = languageCode.toLowerCase().split('-').at(0) ?? '';
  return LANGUAGE_NAMES[prefix] ?? languageCode;
}

export async function generatePronunciation(
  text: string,
  languageCode: string
): Promise<string> {
  const languageName = getLanguageName(languageCode);

  const result = await generateText({
    model: 'openai/gpt-4o-mini',
    system: [
      `Eres un experto en pronunciación del idioma ${languageName} para hispanohablantes.`,
      `Dado un texto en ${languageName}, devuelve una guía de pronunciación respelling usando ortografía española.`,
      'Reglas:',
      '- Escribe la guía en MAYÚSCULAS (ej: HI → JAI, WATER → WORER).',
      '- Marca la sílaba tónica (estrés) de cada palabra con tilde ´ sobre la vocal tónica (ej: WÓRER, IMPORTANT → IMPÓRTANT).',
      '- Refleja la pronunciación nativa estándar del idioma, no una versión anglicizada.',
      '- Si el texto es una frase, refleja el habla natural nativa: contracciones, linking, liaisons o reducciones típicas del idioma (ej en inglés: GOING TO → GÓNA, WANT TO → WÓNA).',
      '- Responde únicamente con la guía de pronunciación, sin explicaciones, sin comillas y sin el texto original.',
    ].join('\n'),
    prompt: text,
  });

  return result.text.trim();
}
