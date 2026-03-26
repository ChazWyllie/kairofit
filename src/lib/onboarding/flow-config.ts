/**
 * Onboarding Flow Configuration
 *
 * Defines all 22 onboarding screens as a config array.
 * The UI reads this config to render the correct screen at each step.
 * A/B test different screen orders by modifying this config, not components.
 *
 * Full spec: docs/onboarding/FLOW.md
 * Email gate is at screen 16 (after archetype reveal at screen 15).
 *
 * TODO: Some screen configs are stubs (options array). Fill in options from FLOW.md.
 */

import type { OnboardingState } from '@/types'

// ============================================================
// SCREEN TYPES
// ============================================================

export type ScreenType =
  | 'question'           // User answers a question
  | 'interstitial'       // Social proof or trust-building (no input)
  | 'email_gate'         // Email capture
  | 'loading'            // Program generation with live preview
  | 'archetype_reveal'   // Shows the computed archetype

export type InteractionType =
  | 'single_select'      // One option, auto-advances immediately
  | 'multi_select'       // Multiple options, requires Continue button
  | 'numeric_input'      // Number fields, requires Continue
  | 'text_input'         // Free text, requires Continue
  | 'dual_field'         // Two fields on one screen, requires Continue
  | 'continue_only'      // No input, just a Continue button

export interface OnboardingOption {
  value: string
  label: string
  emoji?: string
  description?: string  // Shown below label for context
}

export interface OnboardingScreen {
  id: string                          // Unique slug, matches URL path segment
  step: number                        // 1-22
  phase: 1 | 2 | 3 | 4 | 5
  type: ScreenType
  title?: string                      // Header text
  question?: string                   // Primary question text
  context?: string                    // Sub-copy below question
  interaction: InteractionType
  options?: OnboardingOption[]
  store_key?: keyof OnboardingState   // Where to save the answer in Zustand
  // Set to true for single_select screens to advance without a Continue button
  auto_advance: boolean
  required: boolean
}

// ============================================================
// FLOW CONFIGURATION
// ============================================================

export const ONBOARDING_FLOW: OnboardingScreen[] = [
  // ============================================================
  // PHASE 1: Quick Profile (screens 1-5)
  // ============================================================
  {
    id: 'goal',
    step: 1,
    phase: 1,
    type: 'question',
    question: 'What brings you to KairoFit?',
    context: "We'll build your program around this goal.",
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    store_key: 'goal',
    options: [
      { value: 'muscle', label: 'Build muscle', emoji: '💪' },
      { value: 'fat_loss', label: 'Lose fat', emoji: '🔥' },
      { value: 'strength', label: 'Build strength', emoji: '🏋️' },
      { value: 'fitness', label: 'Improve fitness', emoji: '🏃' },
      { value: 'recomposition', label: 'Recompose body', emoji: '⚡' },
    ],
  },
  {
    id: 'experience',
    step: 2,
    phase: 1,
    type: 'question',
    question: 'How would you describe your training experience?',
    context: "We'll tailor the complexity and explanation depth to match.",
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    store_key: 'experience_level',
    options: [
      { value: '1', label: 'Just starting out', description: "I'm new to strength training" },
      { value: '2', label: 'Getting comfortable', description: "I've trained on and off, not consistently" },
      { value: '3', label: 'Intermediate', description: 'I train regularly and know the basics well' },
      { value: '4', label: 'Experienced', description: "I've been training consistently for 2+ years" },
      { value: '5', label: 'Advanced', description: 'I follow structured programs and track performance' },
    ],
  },
  {
    id: 'demographics',
    step: 3,
    phase: 1,
    type: 'question',
    question: 'A bit about you',
    interaction: 'dual_field',
    auto_advance: false,
    required: true,
    // Saves both age_range and gender via custom handler in the screen component
  },
  {
    id: 'schedule',
    step: 4,
    phase: 1,
    type: 'question',
    question: 'How much time can you commit?',
    interaction: 'dual_field',
    auto_advance: false,
    required: true,
    // Saves both days_per_week and session_duration_preference
  },
  {
    id: 'social-proof-1',
    step: 5,
    phase: 1,
    type: 'interstitial',
    interaction: 'continue_only',
    auto_advance: false,
    required: false,
    // Content generated dynamically from goal + experience level
  },

  // ============================================================
  // PHASE 2: Lifestyle and Context (screens 6-10)
  // ============================================================
  {
    id: 'obstacle',
    step: 6,
    phase: 2,
    type: 'question',
    question: "What's been your biggest challenge?",
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    store_key: 'obstacle',
    options: [
      { value: 'not_knowing', label: 'Not knowing what to do', emoji: '❓' },
      { value: 'motivation', label: 'Lack of motivation', emoji: '😴' },
      { value: 'busy', label: 'Too busy', emoji: '📅' },
      { value: 'injury', label: 'Injury concerns', emoji: '🩹' },
      { value: 'no_results', label: "Not seeing results", emoji: '📊' },
      { value: 'returning', label: 'Getting back after a break', emoji: '🔄' },
    ],
  },
  {
    // Training recency - distinct from experience level.
    // A level-3 user who has not trained in 8 months needs a different program
    // than one who trained last week. This is how Comeback Kid archetype triggers
    // on actual training gap, not just low psychographic scores.
    id: 'training-recency',
    step: 7,
    phase: 2,
    type: 'question',
    question: 'When did you last train consistently?',
    context: 'Helps us set the right starting volume and progression speed.',
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    store_key: 'training_recency_months',
    options: [
      { value: '0', label: 'Currently training', description: 'Active right now' },
      { value: '1', label: 'Last month' },
      { value: '3', label: '1-3 months ago' },
      { value: '6', label: '3-6 months ago' },
      { value: '12', label: '6-12 months ago' },
      { value: '24', label: 'More than a year ago' },
    ],
  },
  {
    id: 'lifestyle',
    step: 8,
    phase: 2,
    type: 'question',
    question: 'Tell us about your daily routine',
    interaction: 'dual_field',
    auto_advance: false,
    required: true,
    // Saves work_schedule and activity_level
  },
  {
    // FitBod never asks this - core KairoFit differentiator
    id: 'injuries',
    step: 9,
    phase: 2,
    type: 'question',
    question: 'Any areas of pain or injury we should work around?',
    context: "We'll automatically exclude and modify exercises that could aggravate these areas.",
    interaction: 'multi_select',
    auto_advance: false,
    required: true,
    store_key: 'injuries',
    options: [
      { value: 'none', label: 'None', description: 'No injuries or limitations' },
      { value: 'lower_back', label: 'Lower back' },
      { value: 'knees', label: 'Knees' },
      { value: 'shoulders', label: 'Shoulders' },
      { value: 'wrists', label: 'Wrists' },
      { value: 'hips', label: 'Hips' },
      { value: 'neck', label: 'Neck' },
      { value: 'other', label: 'Other', description: "I'll describe it" },
    ],
  },
  {
    // FitBod never asks this - core KairoFit differentiator
    id: 'body-composition',
    step: 10,
    phase: 2,
    type: 'question',
    question: 'Help us personalize your program',
    context: 'Used for load recommendations and your transformation timeline. All data is encrypted.',
    interaction: 'dual_field',
    auto_advance: false,
    required: true,
    // Saves height_cm and weight_kg (body_fat_pct optional)
  },
  {
    // FitBod never asks this - core KairoFit differentiator
    id: 'why-now',
    step: 11,
    phase: 2,
    type: 'question',
    question: 'What made you decide to start now?',
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    store_key: 'why_now',
    options: [
      { value: 'fresh_start', label: 'I want a fresh start' },
      { value: 'upcoming_event', label: 'Upcoming event or deadline' },
      { value: 'doctor', label: "My doctor suggested it" },
      { value: 'consistency', label: "I've struggled with consistency" },
      { value: 'returning', label: "I'm back after a break" },
      { value: 'ready', label: 'I just feel ready' },
    ],
  },

  // ============================================================
  // PHASE 3: Psychographic Profile (screens 11-15)
  // ============================================================
  {
    id: 'psych-1',
    step: 12,
    phase: 3,
    type: 'question',
    question: 'Seeing my progress metrics each week keeps me motivated.',
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    options: [
      { value: '1', label: 'Strongly disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly agree' },
    ],
  },
  {
    id: 'psych-2',
    step: 13,
    phase: 3,
    type: 'question',
    question: 'I love when my workouts challenge me more each session.',
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    options: [
      { value: '1', label: 'Strongly disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly agree' },
    ],
  },
  {
    id: 'psych-3',
    step: 14,
    phase: 3,
    type: 'question',
    question: 'I prefer structure - knowing exactly what to do each day.',
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    options: [
      { value: '1', label: 'Strongly disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly agree' },
    ],
  },
  {
    id: 'psych-4',
    step: 15,
    phase: 3,
    type: 'question',
    question: "Understanding why an exercise is in my program motivates me to do it well.",
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    options: [
      { value: '1', label: 'Strongly disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly agree' },
    ],
  },
  {
    id: 'archetype-reveal',
    step: 16,
    phase: 3,
    type: 'archetype_reveal',
    interaction: 'continue_only',
    auto_advance: false,
    required: false,
    // Content generated from psych_scores via assignArchetype() in archetypes.ts
  },

  // ============================================================
  // PHASE 4: Email Gate (screen 16)
  // Email gate MUST be at screen 16 - after the archetype reveal (screen 15)
  // FitBod puts it at screen 31 and loses all drop-offs between 18-31
  // ============================================================
  {
    id: 'email-gate',
    step: 17,
    phase: 4,
    type: 'email_gate',
    question: 'Your [archetype] plan is ready.',
    context: 'Enter your email to unlock your personalized program.',
    interaction: 'text_input',
    auto_advance: false,
    required: true,
    store_key: 'email',
    // After submission:
    // 1. Create Supabase auth account
    // 2. Insert profile row with all phase 1-3 data
    // 3. Start Stripe 7-day trial (even if PAYWALL_ENABLED=false)
    // 4. Set auth_ready=false in store (will become true once session confirmed)
    // 5. Continue to phase 5 screens while auth resolves in background
    // CRITICAL: Screen 22 MUST await auth_ready=true before generating program
  },

  // ============================================================
  // PHASE 5: Training Setup (screens 17-21)
  // These run after email gate while auth establishes in the background
  // ============================================================
  {
    id: 'equipment',
    step: 18,
    phase: 5,
    type: 'question',
    question: 'What equipment do you have access to?',
    context: 'Your program will only include exercises you can actually do.',
    interaction: 'multi_select',
    auto_advance: false,
    required: true,
    store_key: 'equipment',
    options: [
      { value: 'dumbbells', label: 'Dumbbells' },
      { value: 'kettlebells', label: 'Kettlebells' },
      { value: 'barbells', label: 'Barbells' },
      { value: 'cables_machines', label: 'Cables and machines' },
      { value: 'pull_up_bar', label: 'Pull-up bar' },
      { value: 'resistance_bands', label: 'Resistance bands' },
      { value: 'bench', label: 'Bench' },
      { value: 'squat_rack', label: 'Squat rack' },
      { value: 'bodyweight', label: 'Bodyweight only' },
    ],
  },
  {
    id: 'split-preference',
    step: 19,
    phase: 5,
    type: 'question',
    question: 'Do you have a preferred training approach?',
    context: "If not sure, we'll build the optimal split for your schedule.",
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    store_key: 'split_preference',
    options: [
      { value: 'ppl', label: 'Push / Pull / Legs' },
      { value: 'upper_lower', label: 'Upper / Lower' },
      { value: 'full_body', label: 'Full Body' },
      { value: 'not_sure', label: "Not sure - let KairoFit decide" },
    ],
  },
  {
    // FitBod never asks this
    id: 'workout-time',
    step: 20,
    phase: 5,
    type: 'question',
    question: 'When do you prefer to train?',
    context: "We'll use this for smart notification timing.",
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    store_key: 'workout_time_preference',
    options: [
      { value: 'morning', label: 'Morning', description: '6-9am' },
      { value: 'midday', label: 'Midday', description: '11am-1pm' },
      { value: 'afternoon', label: 'Afternoon', description: '3-6pm' },
      { value: 'evening', label: 'Evening', description: '7-10pm' },
      { value: 'no_preference', label: 'No preference' },
    ],
  },
  {
    id: 'other-training',
    step: 21,
    phase: 5,
    type: 'question',
    question: 'Do you do any other types of training?',
    context: "We'll factor this into your weekly volume and recovery planning.",
    interaction: 'multi_select',
    auto_advance: false,
    required: true,
    store_key: 'other_training',
    options: [
      { value: 'none', label: 'None - just strength training' },
      { value: 'running', label: 'Running or cardio' },
      { value: 'cycling', label: 'Cycling' },
      { value: 'swimming', label: 'Swimming' },
      { value: 'sports', label: 'Team sports' },
      { value: 'yoga_pilates', label: 'Yoga or Pilates' },
      { value: 'martial_arts', label: 'Martial arts' },
    ],
  },
  {
    id: 'sleep',
    step: 22,
    phase: 5,
    type: 'question',
    question: 'How much sleep do you typically get per night?',
    interaction: 'single_select',
    auto_advance: true,
    required: true,
    store_key: 'sleep_hours_range',
    options: [
      { value: '<5', label: 'Less than 5 hours' },
      { value: '5-6', label: '5-6 hours' },
      { value: '7-8', label: '7-8 hours' },
      { value: '>8', label: 'More than 8 hours' },
    ],
  },

  // ============================================================
  // PHASE 5: Program Generation (screen 22)
  // CRITICAL: This screen MUST wait for auth_ready=true before starting generation
  // See docs/onboarding/FLOW.md for the auth coordination mechanism
  // ============================================================
  {
    id: 'program-building',
    step: 23,
    phase: 5,
    type: 'loading',
    interaction: 'continue_only',
    auto_advance: true,  // Auto-advances when generation completes
    required: false,
    // Split-screen layout:
    // Left: personalized research fact (from getLoadingFact() in archetypes.ts)
    // Center: projected transformation timeline chart building live
    // Right: exercise cards appearing in real time as Claude streams the program
    //
    // MUST check auth_ready=true before calling generateProgram()
    // If auth_ready=false: show "Setting up your account..." for up to 5 seconds
    // If still not ready after 5 seconds: show error and retry button
  },
]

// ============================================================
// HELPERS
// ============================================================

export function getScreenByStep(step: number): OnboardingScreen | undefined {
  return ONBOARDING_FLOW.find((screen) => screen.step === step)
}

export function getScreenById(id: string): OnboardingScreen | undefined {
  return ONBOARDING_FLOW.find((screen) => screen.id === id)
}

export const TOTAL_STEPS = ONBOARDING_FLOW.length  // 23 (added training recency screen)
