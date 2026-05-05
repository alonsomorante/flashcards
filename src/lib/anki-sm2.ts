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

// Learning steps in minutes
const LEARNING_STEPS = [1, 6, 10]; // 1m -> 6m -> 10m
const GRADUATING_INTERVAL = 1; // 1 day after graduating from learning
const EASY_STARTING_INTERVAL = 1; // 1 day (skips learning)
const MIN_EASE_FACTOR = 1.3;

export function ankiSM2(quality: number, current: AnkiState): AnkiResult {
  let { state, learningStep, interval, easeFactor, repetitions } = current;

  // Calculate new ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

  if (state === "new") {
    // New cards enter learning
    if (quality === 5) {
      // Easy - skip learning, go directly to review
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
      // Good - advance to last learning step
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
      // Hard - advance to second learning step
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
      // Again - first learning step
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
      // Again - reset to first step
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
      // Hard - repeat current step (but with longer interval)
      return {
        state,
        learningStep,
        dueMinutes: LEARNING_STEPS[learningStep] * 1.2, // Slightly longer
        interval: 0,
        easeFactor,
        nextReview: null,
        repetitions: 0,
      };
    } else if (quality === 3) {
      // Good - advance to next step or graduate
      learningStep++;
      if (learningStep >= LEARNING_STEPS.length) {
        // Graduate to review
        state = state === "relearning" ? "review" : "review";
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
      // Easy - graduate immediately with bonus
      state = "review";
      interval = GRADUATING_INTERVAL * 1.3; // 1.3 days
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

  // Review state
  if (quality === 1) {
    // Again - enter relearning
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
    // Hard - small interval increase
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
    // Good - normal SM-2 interval
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
    // Easy - larger interval
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
