export const EVENTS = {
  // ============================================================
  // ONBOARDING FUNNEL (critical for conversion tracking)
  // ============================================================
  ONBOARDING_STARTED: 'ONBOARDING_STARTED',
  ONBOARDING_STEP_COMPLETED: 'ONBOARDING_STEP_COMPLETED',
  ONBOARDING_STEP_SKIPPED: 'ONBOARDING_STEP_SKIPPED',
  EMAIL_GATE_REACHED: 'EMAIL_GATE_REACHED',
  EMAIL_GATE_SUBMITTED: 'EMAIL_GATE_SUBMITTED',
  EMAIL_GATE_ABANDONED: 'EMAIL_GATE_ABANDONED',
  ARCHETYPE_REVEALED: 'ARCHETYPE_REVEALED',
  ONBOARDING_COMPLETED: 'ONBOARDING_COMPLETED',

  // ============================================================
  // PROGRAM GENERATION
  // ============================================================
  PROGRAM_GENERATION_STARTED: 'PROGRAM_GENERATION_STARTED',
  PROGRAM_GENERATION_COMPLETED: 'PROGRAM_GENERATION_COMPLETED',
  PROGRAM_GENERATION_FAILED: 'PROGRAM_GENERATION_FAILED',
  PROGRAM_ADJUSTED: 'PROGRAM_ADJUSTED',
  EXERCISE_SWAPPED: 'EXERCISE_SWAPPED',

  // ============================================================
  // WORKOUT SESSIONS (most important retention signals)
  // ============================================================
  WORKOUT_STARTED: 'WORKOUT_STARTED',
  FIRST_WORKOUT_STARTED: 'FIRST_WORKOUT_STARTED',
  SET_LOGGED: 'SET_LOGGED',
  WORKOUT_COMPLETED: 'WORKOUT_COMPLETED',
  FIRST_WORKOUT_COMPLETED: 'FIRST_WORKOUT_COMPLETED',
  WORKOUT_ABANDONED: 'WORKOUT_ABANDONED',

  // ============================================================
  // KIRO AI INTERACTIONS
  // ============================================================
  AI_GENERATION_STARTED: 'AI_GENERATION_STARTED',
  AI_GENERATION_COMPLETED: 'AI_GENERATION_COMPLETED',
  AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  KIRO_DEBRIEF_VIEWED: 'KIRO_DEBRIEF_VIEWED',
  KIRO_DEBRIEF_DISMISSED: 'KIRO_DEBRIEF_DISMISSED',
  WORKOUT_RATED: 'WORKOUT_RATED',

  // ============================================================
  // RETENTION SIGNALS
  // ============================================================
  APP_OPENED: 'APP_OPENED',
  STREAK_MAINTAINED: 'STREAK_MAINTAINED',
  STREAK_BROKEN: 'STREAK_BROKEN',
  DELOAD_WEEK_STARTED: 'DELOAD_WEEK_STARTED',
  PERSONAL_RECORD_SET: 'PERSONAL_RECORD_SET',

  // ============================================================
  // PAYWALL (gated, fires when PAYWALL_ENABLED=true)
  // ============================================================
  PAYWALL_SHOWN: 'PAYWALL_SHOWN',
  PAYWALL_DISMISSED: 'PAYWALL_DISMISSED',
  SUBSCRIPTION_STARTED: 'SUBSCRIPTION_STARTED',
  SUBSCRIPTION_CANCELED: 'SUBSCRIPTION_CANCELED',
  TRIAL_EXPIRED: 'TRIAL_EXPIRED',

  // ============================================================
  // SOCIAL
  // ============================================================
  WORKOUT_SHARED: 'WORKOUT_SHARED',
  USER_FOLLOWED: 'USER_FOLLOWED',
  CHALLENGE_JOINED: 'CHALLENGE_JOINED',
} as const
