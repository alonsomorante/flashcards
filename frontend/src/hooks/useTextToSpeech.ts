import { useCallback, useRef, useState } from 'react';
import { api } from '../api/client';

type TtsState = 'idle' | 'loading' | 'playing';

export function useTextToSpeech() {
  const [state, setState] = useState<TtsState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setState('idle');
  }, []);

  const speak = useCallback(async (text: string, language: string) => {
    if (!text.trim()) return;

    // If already playing the same text, stop it
    stop();

    setState('loading');
    abortRef.current = new AbortController();

    try {
      const blob = await api.textToSpeech(text.trim(), language);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setState('idle');
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setState('idle');
      });

      await audio.play();
      setState('playing');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('TTS error:', error);
      setState('idle');
    }
  }, [stop]);

  const toggle = useCallback(
    (text: string, language: string) => {
      if (state === 'playing' || state === 'loading') {
        stop();
      } else {
        void speak(text, language);
      }
    },
    [state, stop, speak]
  );

  return {
    state,
    isPlaying: state === 'playing',
    isLoading: state === 'loading',
    speak,
    stop,
    toggle,
  };
}
