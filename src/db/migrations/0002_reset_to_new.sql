-- Reset all cards to new state for Anki-style learning
UPDATE cards SET
  state = 'new',
  learning_step = 0,
  due_minutes = NULL,
  repetitions = 0,
  interval = 0,
  ease_factor = 2.5,
  next_review = NULL,
  last_reviewed = NULL,
  last_rating = NULL;
