"use client";

import { useRef, useEffect, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  currentValue: string;
}

export function VoiceInput({ onTranscript, currentValue }: VoiceInputProps) {
  const { listening, language, isSupported, start, stop, setLanguage } =
    useSpeechRecognition();

  const prevValueRef = useRef(currentValue);

  const handleToggle = useCallback(() => {
    if (listening) {
      stop();
    } else {
      start((newText) => {
        onTranscript((prevValueRef.current + " " + newText).trim());
        prevValueRef.current = prevValueRef.current + " " + newText;
      });
      prevValueRef.current = currentValue;
    }
  }, [listening, start, stop, onTranscript, currentValue]);

  useEffect(() => {
    if (!listening) {
      prevValueRef.current = currentValue;
    }
  }, [currentValue, listening]);

  if (!isSupported) return null;

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleToggle}
        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          listening
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        }`}
        title={listening ? "Stop recording" : "Start voice input"}
      >
        {listening ? <Mic size={14} /> : <Mic size={14} />}
        {listening && (
          <span className="absolute inset-0 animate-ping rounded-full bg-zinc-900/20 dark:bg-white/20" />
        )}
      </button>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "es-ES" | "en-US")}
        className="h-6 rounded border-none bg-transparent text-[10px] font-medium uppercase tracking-wide text-zinc-400 focus:outline-none dark:text-zinc-500"
      >
        <option value="es-ES">ES</option>
        <option value="en-US">EN</option>
      </select>
    </div>
  );
}
