"use client";

import { useState, useCallback, useRef } from "react";

type Language = "es-ES" | "en-US";

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState<Language>("es-ES");
  const recognitionRef = useRef<any>(null);

  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionAPI;

  const start = useCallback(
    (onResult: (text: string) => void) => {
      if (!SpeechRecognitionAPI) {
        setError("Speech recognition is not supported in this browser");
        return;
      }

      setError(null);

      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            onResult(finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === "no-speech") return;
          setError(event.error || "Recognition error");
          setListening(false);
        };

        recognition.onend = () => {
          setListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
      } catch {
        setError("Failed to start speech recognition");
      }
    },
    [SpeechRecognitionAPI, language]
  );

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  return {
    listening,
    error,
    language,
    isSupported,
    start,
    stop,
    setLanguage,
  };
}
