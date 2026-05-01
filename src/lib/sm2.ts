export interface SM2State {
  repetitions: number;
  interval: number;
  easeFactor: number;
}

export interface SM2Result {
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReview: string;
}

export function sm2(quality: number, current: SM2State): SM2Result {
  let { repetitions, interval, easeFactor } = current;

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 0.5;
  }

  const now = new Date();
  const nextReview = new Date(
    now.getTime() + interval * 24 * 60 * 60 * 1000
  ).toISOString();

  return { repetitions, interval, easeFactor, nextReview };
}
