# KairoFit Onboarding Flow - Full Specification

22 screens total. Email gate at screen 16 (after archetype reveal at screen 15).
FitBod gates at screen 31 and loses every drop-off between screens 18-31.

FIXES FROM CODE REVIEWS:
- Email gate is at screen 16. Not screen 17. The intro below and all screen references say 16.
- Archetype logic lives in src/lib/onboarding/archetypes.ts (not in kiro-voice.ts)
- Post-signup race condition documented in screen 22 notes
- total_steps is stored as number not a literal type in the Zustand store
- sleep_hours_range (not sleep_hours) is the field name in OnboardingState
- session_duration_preference stores range label ("20-30") not a bare integer

---

## Design Principles

1. Auto-advance on single-select (reduces friction, same as FitBod's best pattern)
2. Continue button for multi-select and multi-field screens
3. Progress indicator: "Step X of 22" alongside a progress bar
4. Dark theme throughout (#0A0A0B background)
5. Every interstitial uses at least 2 data points to personalize the message
6. No "How did you hear about us" mid-quiz - moved to post-signup settings

---

## Phase 1: Quick Profile (screens 1-5)

### Screen 1 - Fitness Goal (/onboarding/goal)
Question: "What brings you to KairoFit?"
Interaction: single select, auto-advance
Store key: goal
Options: Build muscle | Lose fat | Build strength | Improve fitness | Body recomposition
Note: Goal comes FIRST, before age. Immediately frames value.

### Screen 2 - Experience Level (/onboarding/experience)
Question: "How would you describe your training experience?"
Interaction: single select, auto-advance
Store key: experience_level
5 options with behavioral descriptions (not just labels):
  1 - Just starting out: "I'm new to strength training"
  2 - Getting comfortable: "I've trained on and off, not consistently"
  3 - Intermediate: "I train regularly and know the basics well"
  4 - Experienced: "I've been training consistently for 2+ years"
  5 - Advanced: "I follow structured programs and track performance closely"
Note: FitBod only has 3 levels. The intermediate gap causes the most churn.

### Screen 3 - Demographics (/onboarding/demographics)
Two fields on one screen to reduce total screen count:
- Age range: 18-23 | 24-29 | 30s | 40s | 50+
- Gender: Male | Female | Non-binary | Prefer not to say
Interaction: dual field, Continue button
Store keys: age_range, gender

### Screen 4 - Schedule (/onboarding/schedule)
Two fields:
- Days per week: 2 | 3 | 4 | 5 | 6
- Session duration: 20-30 min | 30-45 min | 45-60 min | 60+ min
Interaction: dual field, Continue button
Store keys: days_per_week, session_duration_preference
Note: Stores range label ("20-30") not a bare integer. "60+" and "60 minutes" are different.

### Screen 5 - Social Proof Interstitial (/onboarding/social-proof-1)
Type: interstitial (no input)
Content generated from goal + experience_level
Example: "Over 84,000 intermediate lifters targeting muscle gain have built measurable strength with evidence-based programming."

---

## Phase 2: Lifestyle and Context (screens 6-10)

### Screen 6 - Obstacle (/onboarding/obstacle)
Question: "What has been your biggest challenge?"
Interaction: single select, auto-advance
Store key: obstacle
Options: Not knowing what to do | Lack of motivation | Busy schedule | Injury concerns | Not seeing results | Getting back after a break
Note: "Injury concerns" and "Not seeing results" are options FitBod misses entirely.

### Screen 7 - Lifestyle (/onboarding/lifestyle)
Two fields:
- Work schedule: 9-5 | Shift work | Flexible | Retired/Not working
- Activity level: Mostly sitting | On my feet | Mix of both
Store keys: work_schedule, activity_level

### Screen 8 - Injury Screening (/onboarding/injuries)
FitBod NEVER asks this. This is KairoFit's most important differentiator.
Question: "Do you have any areas of pain or injury we should work around?"
Context: "We'll automatically exclude and modify exercises that could aggravate these areas."
Interaction: multi-select, Continue button
Store key: injuries
Options: None | Lower back | Knees | Shoulders | Wrists | Hips | Neck | Other

After submission (if injuries selected): show confirmation card:
"We'll automatically exclude and modify exercises that could aggravate those areas.
You can update this anytime in your profile settings."

### Screen 9 - Body Composition (/onboarding/body)
FitBod NEVER asks this.
Question: "Help us personalize your program"
Context: "Used for load recommendations and your transformation timeline. All data is encrypted."
Fields: Height (ft/in or cm toggle) | Weight (lbs or kg) | Body fat % (optional)
Interaction: multi-field, Continue button
Store keys: height_cm, weight_kg, body_fat_pct, units

### Screen 10 - Why Now (/onboarding/why-now)
FitBod NEVER asks this.
Question: "What made you decide to start now?"
Interaction: single select, auto-advance
Store key: why_now
Options: I want a fresh start | Upcoming event or deadline | My doctor suggested it | I've struggled with consistency | I'm back after a break | I just feel ready

---

## Phase 3: Psychographic Profile (screens 11-15)

### Screens 11-14 - Four Statements

Each statement uses a 5-point scale (not FitBod's binary Agree/Disagree).
Options: Strongly disagree | Disagree | Neutral | Agree | Strongly agree
Interaction: single select, auto-advance
Store key: psych_scores (updates index 0-3)

Screen 11 (/onboarding/psych-1): "Seeing my progress metrics each week keeps me motivated."
Screen 12 (/onboarding/psych-2): "I love when my workouts challenge me more each session."
Screen 13 (/onboarding/psych-3): "I prefer structure - knowing exactly what to do each day."
Screen 14 (/onboarding/psych-4): "Understanding why an exercise is here motivates me to do it well."

### Screen 15 - Archetype Reveal (/onboarding/archetype)
Type: archetype_reveal
Interaction: Continue only
Content: computed by assignArchetype(psych_scores) from src/lib/onboarding/archetypes.ts

The 8 archetypes (all implemented in archetypes.ts):
- System Builder: high structure + high understanding
- Milestone Chaser: progress-driven, numbers-motivated
- Explorer: values variety, low structure preference
- Pragmatist: efficiency-first, minimal overhead
- Comeback Kid: returning after a gap, needs confidence rebuilding
- Optimizer: experienced, wants advanced control
- Challenger: motivated by pushing limits
- Understander: deep "why" motivation, science-curious

Archetype logic: src/lib/onboarding/archetypes.ts
Do NOT look for this logic in kiro-voice.ts - it lives in archetypes.ts.

This is the emotional peak of the onboarding funnel.
Commitment forms here. The email gate fires immediately after.

---

## Phase 4: Email Gate (screen 16)

### Screen 16 - Email Gate (/onboarding/email-gate)
The email gate is at screen 16. Not screen 17. Screen 16.

Headline: "Your [archetype name] plan is ready."
Sub-copy: "Enter your email to unlock your personalized program."
Trust signals:
- "Your 7-day free trial starts now. No credit card required."
- "Join KairoFit users who follow evidence-based programs."
Legal: Privacy Policy + Terms, "KairoFit may send training-related emails. Unsubscribe anytime."

Store key: email
After submission: set email in store, begin auth creation in background

Background actions triggered on email submit:
1. Create Supabase auth account (magic link or Google OAuth)
2. Save all phase 1-4 data to profiles table
3. Start Stripe 7-day trial (even if PAYWALL_ENABLED=false)
4. Set auth_ready=false in store (will become true once Supabase session confirmed)
5. Continue to phase 5 screens while auth resolves in the background

CRITICAL: Screen 22 MUST await auth_ready=true before calling generateProgram().
If auth has not resolved by the time screen 22 renders, show a brief loading state
("Setting up your account...") for up to 5 seconds before showing an error.
This prevents the post-signup race condition where generateProgram() fires before
auth.uid() exists and silently fails.

After auth is confirmed: call clearEmailAfterAuth() on the store to remove the email
from client-side memory. Do not hold PII in Zustand past the auth confirmation.

---

## Phase 5: Training Setup (screens 17-21)

These screens run after the email gate while auth establishes in the background.
All interactions save directly to the Zustand store (not yet to Supabase - auth may not be ready).
The profile row is updated with phase 5 data as part of the program generation Server Action.

### Screen 17 - Equipment (/onboarding/equipment)
Question: "What equipment do you have access to?"
Context: "Your program will only include exercises you can actually do."
Interaction: multi-select, Continue button
Store key: equipment
Options: Dumbbells | Kettlebells | Barbells | Cables and machines | Pull-up bar | Resistance bands | Bench | Squat rack | Bodyweight only
Note: KairoFit separates dumbbells and kettlebells (FitBod groups them).
Note: KairoFit adds "Squat rack" as distinct from "Barbells".

### Screen 18 - Training Split (/onboarding/split)
Question: "Do you have a preferred training approach?"
Context: "If not sure, we'll build the optimal split for your schedule."
Interaction: single select, auto-advance
Store key: split_preference
Options: Push/Pull/Legs | Upper/Lower | Full Body | Not sure - let KairoFit decide

### Screen 19 - Workout Time (/onboarding/workout-time)
FitBod NEVER asks this.
Question: "When do you prefer to train?"
Context: "We'll use this for notification timing."
Interaction: single select, auto-advance
Store key: workout_time_preference
Options: Morning (6-9am) | Midday (11am-1pm) | Afternoon (3-6pm) | Evening (7-10pm) | No preference

### Screen 20 - Other Training (/onboarding/other-training)
Question: "Do you do any other types of training?"
Context: "We'll factor this into your weekly volume and recovery planning."
Interaction: multi-select, Continue button
Store key: other_training
Options: None | Running or cardio | Cycling | Swimming | Team sports | Yoga or Pilates | Martial arts

### Screen 21 - Sleep (/onboarding/sleep)
Question: "How much sleep do you typically get per night?"
Interaction: single select, auto-advance
Store key: sleep_hours_range (note: field name is sleep_hours_range, type is SleepRange)
Options: Less than 5 hours | 5-6 hours | 7-8 hours | More than 8 hours
Stored as: '<5' | '5-6' | '7-8' | '>8' (range labels, not bare numbers)

---

## Phase 5: Program Generation (screen 22)

### Screen 22 - Program Building (/onboarding/building)
This is NOT a fake loading screen. It shows the ACTUAL program being built.

CRITICAL: Before calling generateProgram(), check auth_ready === true in the store.
If auth_ready is false: show "Setting up your account..." for up to 5 seconds.
After 5 seconds with no auth: show an error state with a retry button.
Only when auth_ready === true: call the generateProgramAction Server Action.

Layout: split-screen with all three panels simultaneously
Left panel: Personalized research fact (from getLoadingFact() in archetypes.ts)
  Example: "Training each muscle 2x/week with 12-16 weekly sets produces optimal
  hypertrophy for intermediate lifters - that is exactly what your program does."
Center panel: Projected transformation timeline chart building live
  Example: "At 4 days/week with consistent progressive overload, expect 10-15%
  strength increases in 8-10 weeks."
Right panel: Exercise cards appearing in real time as Claude streams the program
  Cards appear one by one as generateProgram() streams the response.

On generation complete:
- Brief success animation
- Navigate to /dashboard
- Dashboard shows the completed program

---

## Post-Signup Actions

After screen 16 (email gate), running in background during screens 17-21:
1. Create Supabase auth account
2. Save phase 1-4 onboarding data to profiles table
3. Start Stripe 7-day trial
4. Set auth_ready=true in store once session is confirmed

After screen 22 (program generation):
1. Save generated program to programs table (is_active=true)
2. Create first workout_session record (status='in_progress')
3. Send "Your program is ready" push notification (if PWA installed)
4. Navigate to /dashboard
5. Trigger first day's recovery heatmap initialization

---

## Onboarding Data Schema

The OnboardingState type in src/types/index.ts.
Key fields to note:
- total_steps: number (not a literal type - A/B test flexibility)
- session_duration_preference: SessionDurationPreference (range label string, not integer)
- sleep_hours_range: SleepRange (range label string, not bare number)
- auth_ready: boolean (gates screen 22 program generation)
- email: string | null (cleared after auth confirmation - PII cleanup)
