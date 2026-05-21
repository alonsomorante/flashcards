export interface AnkiState {
  state: "new" | "learning" | "review" | "relearning";
  learningStep: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface AnkiResult {
  state: "new" | "learning" | "review" | "relearning";
  learningStep: number;
  dueMinutes: number | null;
  interval: number;
  easeFactor: number;
  nextReview: string | null;
  repetitions: number;
}

const LEARNING_STEPS = [1, 6, 10];
const GRADUATING_INTERVAL = 1;
const EASY_STARTING_INTERVAL = 1;
const MIN_EASE_FACTOR = 1.3;

export function ankiSM2(quality: number, current: AnkiState): AnkiResult {
  let { state, learningStep, interval, easeFactor, repetitions } = current;

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

  if (state === "new") {
    if (quality === 5) {
      state = "review";
      interval = EASY_STARTING_INTERVAL;
      repetitions = 1;
      return {
        state,
        learningStep: 0,
        dueMinutes: null,
        interval,
        easeFactor,
        nextReview: addDays(interval),
        repetitions,
      };
    } else if (quality === 3) {
      state = "learning";
      learningStep = LEARNING_STEPS.length - 1;
      return {
        state,
        learningStep,
        dueMinutes: LEARNING_STEPS[learningStep],
        interval: 0,
        easeFactor,
        nextReview: null,
        repetitions: 0,
      };
    } else if (quality === 2) {
      state = "learning";
      learningStep = 1;
      return {
        state,
        learningStep,
        dueMinutes: LEARNING_STEPS[learningStep],
        interval: 0,
        easeFactor,
        nextReview: null,
        repetitions: 0,
      };
    } else {
      state = "learning";
      learningStep = 0;
      return {
        state,
        learningStep,
        dueMinutes: LEARNING_STEPS[learningStep],
        interval: 0,
        easeFactor,
        nextReview: null,
        repetitions: 0,
      };
    }
  }

  if (state === "learning" || state === "relearning") {
    if (quality === 1) {
      learningStep = 0;
      return {
        state,
        learningStep,
        dueMinutes: LEARNING_STEPS[learningStep],
        interval: 0,
        easeFactor,
        nextReview: null,
        repetitions: 0,
      };
    } else if (quality === 2) {
      return {
        state,
        learningStep,
        dueMinutes: LEARNING_STEPS[learningStep] * 1.2,
        interval: 0,
        easeFactor,
        nextReview: null,
        repetitions: 0,
      };
    } else if (quality === 3) {
      learningStep++;
      if (learningStep >= LEARNING_STEPS.length) {
        state = "review";
        interval = GRADUATING_INTERVAL;
        repetitions = 1;
        return {
          state,
          learningStep: 0,
          dueMinutes: null,
          interval,
          easeFactor,
          nextReview: addDays(interval),
          repetitions,
        };
      } else {
        return {
          state,
          learningStep,
          dueMinutes: LEARNING_STEPS[learningStep],
          interval: 0,
          easeFactor,
          nextReview: null,
          repetitions: 0,
        };
      }
    } else {
      state = "review";
      interval = GRADUATING_INTERVAL * 1.3;
      repetitions = 1;
      return {
        state,
        learningStep: 0,
        dueMinutes: null,
        interval,
        easeFactor,
        nextReview: addDays(interval),
        repetitions,
      };
    }
  }

  if (quality === 1) {
    state = "relearning";
    learningStep = 0;
    repetitions = 0;
    return {
      state,
      learningStep,
      dueMinutes: LEARNING_STEPS[learningStep],
      interval: 0,
      easeFactor: Math.max(easeFactor - 0.2, MIN_EASE_FACTOR),
      nextReview: null,
      repetitions,
    };
  } else if (quality === 2) {
    interval = interval * 1.2;
    repetitions++;
    return {
      state: "review",
      learningStep: 0,
      dueMinutes: null,
      interval,
      easeFactor,
      nextReview: addDays(interval),
      repetitions,
    };
  } else if (quality === 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
    return {
      state: "review",
      learningStep: 0,
      dueMinutes: null,
      interval,
      easeFactor,
      nextReview: addDays(interval),
      repetitions,
    };
  } else {
    if (repetitions === 0) {
      interval = 4;
    } else if (repetitions === 1) {
      interval = 8;
    } else {
      interval = Math.round(interval * easeFactor * 1.3);
    }
    repetitions++;
    return {
      state: "review",
      learningStep: 0,
      dueMinutes: null,
      interval,
      easeFactor: easeFactor + 0.15,
      nextReview: addDays(interval),
      repetitions,
    };
  }
}

function addDays(days: number): string {
  const now = new Date();
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() + ms).toISOString();
}
