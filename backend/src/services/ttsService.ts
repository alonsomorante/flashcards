import { ElevenLabsClient } from 'elevenlabs';

function getClient(): ElevenLabsClient {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }
  return new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });
}

const MODEL_ID = 'eleven_multilingual_v2';
const OUTPUT_FORMAT = 'mp3_44100_128' as const;
const MAX_CACHE_SIZE = 100;

// Default voice used for all languages: "Brian" (American English).
// ElevenLabs Multilingual v2 works well across languages with the same voice.
// Override globally with ELEVENLABS_DEFAULT_VOICE_ID or per language with
// ELEVENLABS_VOICE_ID_<LANG> (ej. ELEVENLABS_VOICE_ID_FR para francés).
function getVoiceId(language: string): string {
  const prefix = language.toLowerCase().split('-').at(0)?.toUpperCase() ?? '';
  return (
    process.env[`ELEVENLABS_VOICE_ID_${prefix}`] ||
    process.env.ELEVENLABS_DEFAULT_VOICE_ID ||
    'nPczCjzI2devNBz1zQrb'
  );
}

const cache = new Map<string, Buffer>();

function getCacheKey(text: string, language: string): string {
  return `${language}:${text}`;
}

function getCached(key: string): Buffer | undefined {
  const value = cache.get(key);
  if (value) {
    // Move to end to implement simple LRU
    cache.delete(key);
    cache.set(key, value);
  }
  return value;
}

function setCached(key: string, buffer: Buffer): void {
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= MAX_CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, buffer);
}

export async function synthesizeSpeech(text: string, language: string): Promise<Buffer> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Text is required');
  }

  const key = getCacheKey(trimmed, language);
  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  const audioStream = await getClient().textToSpeech.convert(getVoiceId(language), {
    text: trimmed,
    model_id: MODEL_ID,
    output_format: OUTPUT_FORMAT,
  });

  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.from(chunk));
  }

  const buffer = Buffer.concat(chunks);
  setCached(key, buffer);
  return buffer;
}
