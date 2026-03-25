# KairoFit Exercise Science Programming Rules

Canonical reference for all programming decisions.
All rules enforced by src/lib/ai/workout-validator.ts.
The AI (Kiro) cannot override these rules - they are hardcoded constraints.

FIXES FROM CODE REVIEWS:
- Volume hard cap: level-specific, NOT a universal 25. See table below.
- Compound rest minimum: 120 seconds (was 90). Corrected across all docs and code.
- Deload frequency: exactly 5 weeks for intermediate (not "5-6 weeks" - documented decision).

Sources: Schoenfeld (2017, 2019), Israetel (RP Volume Landmarks), Helms (3DMJ Pyramid),
Plotkin et al. (2022), Baz-Valle et al. (2022), Pelland et al. (2025), NSCA Guidelines.

---

## Volume: Sets Per Muscle Per Week

Volume is the primary hypertrophy driver. Clear dose-response relationship.
The hard cap is level-specific. The global maximum is 25 but ONLY for level 5.
Any document or code that states "hard cap: 25 sets" as universal is WRONG.

| Level | Label | Minimum Effective | Maximum Adaptive | Hard Cap |
|---|---|---|---|---|
| 1 | Beginner | 4-6 sets/week | 10-12 sets/week | 16 sets |
| 2 | Early intermediate | 4-8 sets/week | 12-14 sets/week | 16 sets |
| 3 | Intermediate | 8-10 sets/week | 14-16 sets/week | 20 sets |
| 4 | Experienced | 10-14 sets/week | 16-20 sets/week | 24 sets |
| 5 | Advanced | 12-16 sets/week | 18-22 sets/week | 25 sets |

Definition: a "set" is one working set taken to within 1-3 reps of failure.
Warm-up sets do not count.

Algorithm behavior: start at MEV, add 1-2 sets per muscle per week until MAV.
Auto-trigger deload before hitting MRV. Never assign above the hard cap.

---

## Rep Ranges

Hypertrophy occurs across 5-30+ reps when taken close to failure.
Proximity to failure (1-3 RIR) matters more than the specific rep range.

| Goal | Primary Range | Secondary Range | Effort |
|---|---|---|---|
| Strength | 1-5 reps | 3-6 reps | 85-100% 1RM |
| Strength + Hypertrophy | 4-8 reps | 6-10 reps | 75-90% 1RM |
| Hypertrophy | 6-12 reps | 8-15 reps | 60-80% 1RM |
| Hypertrophy + Endurance | 12-20 reps | 15-25 reps | 50-70% 1RM |
| General Fitness | 8-12 reps | 10-15 reps | 60-75% 1RM |

Hard limits: never below 1 rep, never above 50 reps.

---

## Rest Periods

Research: Schoenfeld (2016) found 3-minute rest produced 13.1% quad growth vs 6.8% with 1-minute rest.
Singer, Wolf, Schoenfeld (2024): rest >60 seconds shows consistent hypertrophy benefits.

| Exercise Type | Minimum | Recommended | Maximum |
|---|---|---|---|
| Heavy compounds (squat, deadlift, bench, OHP, barbell row) | 120 seconds | 2-3 minutes | 5 minutes |
| Moderate compounds (dumbbell compounds, split squats) | 90 seconds | 90-120 seconds | 3 minutes |
| Isolation exercises | 60 seconds | 60-90 seconds | 2 minutes |
| Supersets (between exercises) | 45 seconds | 60 seconds | 90 seconds |

COMPOUND MINIMUM IS 120 SECONDS. Not 90. 120.
This was corrected across all docs and code files after review.
If any file says compound_min: 90, it is wrong.

Absolute minimum: 30 seconds for any exercise.
Absolute maximum: 5 minutes (beyond this, muscle temperature drops).

---

## Training Frequency Per Muscle

Minimum: 2x/week per muscle group for hypertrophy.
Higher frequency is a volume distribution tool, not a multiplier.

| Level | Minimum | Optimal | Maximum productive |
|---|---|---|---|
| Beginner | 2x/week | 2-3x/week | 3x/week |
| Intermediate | 2x/week | 2-3x/week | 4x/week |
| Advanced | 2x/week | 3-4x/week | 5x/week |

Recovery windows (minimum hours between same-muscle sessions):
- Small muscles (biceps, triceps, calves, side delts): 48 hours
- Medium muscles (chest, shoulders, lats): 48-72 hours
- Large muscles (quads, hamstrings, glutes): 72 hours
- Heavy compound pattern (deadlift): 96-120 hours

---

## Progressive Overload Methods by Level

### Linear Progression (levels 1-2)
Add weight every session when target reps are hit.
Upper body: +2.5 kg per session. Lower body: +5 kg per session.
Imperial: +5 lbs upper, +10 lbs lower.
When to stop: 2 consecutive sessions failing to hit target reps at same weight.
Transition: move to double progression.

### Double Progression (level 3)
Keep weight constant. Increase reps until all sets hit the top of the range.
When all sets hit reps_max: increase weight ~5%, reset to reps_min.
Example: 3x8-12 @ 60kg
- Session 1: 60kg x 8, 8, 7 - keep weight, add reps
- Session 4: 60kg x 12, 12, 12 - ready to increase
- Session 5: 62.5kg x 8, 8, 8 - weight increased, reps reset

### RPE-Based Autoregulation (levels 4-5)
Target RPE 7-9 (1-3 reps in reserve) for all working sets.
RPE < 7: increase weight ~2.5%
RPE 7-9: maintain weight, maintain reps
RPE > 9: reduce weight ~5%, consider whether a deload is needed

### Daily Undulating Periodization (levels 4-5, especially Explorer archetype)
Vary volume and intensity within the week.
Example: Monday strength (4-6 reps), Wednesday hypertrophy (8-12 reps), Friday volume (12-15 reps).
Same exercises across sessions allows direct performance comparison.

---

## Deload Protocols

Deloads are mandatory. They are not rest weeks. They are lower-volume training weeks.

### Scheduled Frequency (documented decisions, not ranges)
- Level 1-2 (beginner): every 6 weeks
- Level 3 (intermediate): every 5 weeks
- Level 4-5 (advanced): every 4 weeks

The intermediate value is 5 weeks. Not "5-6 weeks". 5 weeks. This is a documented product decision.
If your recovery data suggests you need it earlier, the performance trigger below catches that.

### Performance Trigger
Trigger a deload when: 2 consecutive sessions where main compound lifts perform below
the previous session at the same RPE.

### Deload Execution
Reduce volume 40-50% (remove sets, not exercises).
Maintain intensity: do NOT reduce weight. Neural adaptations are maintained by keeping load the same.
Duration: 1 week.
Post-deload: resume at MEV for the next mesocycle. Expect a performance rebound.

### Week-0 Guard
The shouldDeload() function must guard against weekNumber <= 0.
A deload cannot be triggered before any training has occurred.

---

## Workout Splits by Days Available

Research: Ramos-Campo et al. (2024) found no significant difference between split types
when volume is equated. Split choice is a scheduling preference, not a training philosophy.

| Days/Week | Recommended Split | Frequency Per Muscle |
|---|---|---|
| 2 | Full Body x2 | 2x/week |
| 3 | Full Body x3 | 2-3x/week |
| 4 | Upper/Lower x2 | 2x/week |
| 5 | PPLUL Hybrid | 2-3x/week |
| 6 | PPL x2 | 2x/week |

Maximum day_number in the schema: 6 (not 7 - PPL x2 is the maximum supported split).

---

## Exercise Selection Hierarchy

For each movement pattern, try to assign exercises in priority order based on available equipment.

Horizontal Push: Barbell bench press > Dumbbell bench press > Machine chest press > Push-up
Vertical Push: Barbell overhead press > Dumbbell shoulder press > Machine press > Pike push-up
Horizontal Pull: Barbell row > Dumbbell row > Cable row > Machine row > Band row
Vertical Pull: Pull-up > Lat pulldown > Cable pullover > Band pulldown
Quad Dominant: Barbell squat > Goblet squat > Bulgarian split squat > Leg press > Lunge
Hip Dominant: Barbell deadlift > Romanian deadlift > Hip thrust > Kettlebell swing > Glute bridge
Elbow Flexion: Barbell curl > Dumbbell curl > Incline dumbbell curl > Cable curl
Elbow Extension: Close-grip bench > Tricep pushdown > Skull crusher > Overhead tricep

Exercise Order Within Session:
1. CNS-demanding compound movements first (squat, deadlift, bench, overhead press)
2. Moderate compounds (rows, lunges, split squats)
3. Isolation work (curls, extensions, lateral raises)
4. Core work at end

### Dangerous Same-Day Pairings (never schedule these together)
- Heavy squat + heavy deadlift: excessive lumbar fatigue
- Heavy bench press + heavy overhead press: excessive shoulder fatigue
- Conventional deadlift + Romanian deadlift: same posterior chain pattern, excessive cumulative fatigue
- Barbell overhead press + incline bench: combined shoulder volume exceeds single-session recovery

---

## Warm-Up Protocol

Always include warm-up sets for the first compound lift of each session.
Do NOT add warm-up sets to accessories.

Warm-up structure (working weight = X):
- Set 1: 40% of X x 10 reps
- Set 2: 60% of X x 5 reps
- Set 3: 80% of X x 3 reps
- Working sets begin

---

## AI Output Validation Checklist

Every AI-generated program must pass this before saving to the database:

VOLUME:
- Total sets per muscle per week within level-appropriate limits
- No single session exceeds 8 sets for any one muscle group

EXERCISE SELECTION:
- All exercises available with user's equipment
- No exercises flagged in user's injury contraindications
- At least one compound exercise per session (using broadened compound detection, not barbell-only)

REPS:
- reps_min and reps_max specified on all exercises
- Values between 1 and 50
- reps_min does not exceed reps_max

REST:
- rest_seconds specified on all exercises
- Heavy compounds have minimum 120 seconds (not 90)
- No rest below 30 seconds

SAFETY:
- Heavy squat + heavy deadlift NOT on the same day
- Heavy bench + heavy overhead press NOT on the same day
- Deadlift + Romanian deadlift NOT on the same day
- No contraindicated exercises for user's injury flags

PROGRESSION:
- Progression scheme appropriate for user's experience level
- Deload week scheduled within mesocycle
- Deload triggered only if weekNumber > 0

RATIONALE:
- Every exercise has a rationale string (minimum 10 characters)
- Program has an ai_rationale paragraph (minimum 3 sentences)
