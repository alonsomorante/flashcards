import { useState, useCallback } from 'react';
import type { Flashcard, ReviewLevel } from '../types/index';
import { useReviewFlashcard } from '../hooks/useStudy';

interface UseStudySessionReturn {
  currentIndex: number;
  isFlipped: boolean;
  isFinished: boolean;
  sessionResults: Record<ReviewLevel, number>;
  studiedCount: number;
  flip: () => void;
  markLevel: (card: Flashcard, level: ReviewLevel) => void;
  next: () => void;
  finish: () => void;
  reset: () => void;
}

export function useStudySession(_cards: Flashcard[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [studiedIds, setStudiedIds] = useState<Set<string>>(new Set());
  const [sessionResults, setSessionResults] = useState<Record<ReviewLevel, number>>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  });

  const reviewFlashcard = useReviewFlashcard();

  const flip = useCallback(() => setIsFlipped((v) => !v), []);

  const markLevel = useCallback(
    (card: Flashcard, level: ReviewLevel) => {
      reviewFlashcard.mutate({ id: card.id, level });
      setSessionResults((prev) => ({ ...prev, [level]: prev[level] + 1 }));
      setStudiedIds((prev) => new Set(prev).add(card.id));
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    },
    [reviewFlashcard]
  );

  const next = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
  }, []);

  const finish = useCallback(() => {
    setIsFinished(true);
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setStudiedIds(new Set());
    setSessionResults({ 0: 0, 1: 0, 2: 0, 3: 0 });
  }, []);

  return {
    currentIndex,
    isFlipped,
    isFinished,
    sessionResults,
    studiedCount: studiedIds.size,
    flip,
    markLevel,
    next,
    finish,
    reset,
  } satisfies UseStudySessionReturn;
}
