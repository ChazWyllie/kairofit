---
name: exercise-science-grounding
description: >
  Enforces evidence-based exercise science rules in every workout generation prompt for KairoFit.
  Use this skill whenever generating, reviewing, or modifying workout programs, exercise selections,
  rep schemes, rest periods, or training splits. Also triggers when evaluating if a proposed program
  change is scientifically sound. If the user mentions sets, reps, rest times, periodization,
  progressive overload, deloads, or training frequency, use this skill to ensure all outputs
  align with current research.
---

# Exercise Science Grounding Skill

Enforces KairoFit's evidence-based programming rules in every AI-generated output.
Read docs/science/PROGRAMMING_RULES.md for the full rationale and sources.

---

## Volume (sets per muscle per week)

Level-specific caps. NOT a universal 25. The global maximum is 25 but ONLY for level 5.

| Level                  | Minimum Effective | Maximum Adaptive | Hard Cap |
| ---------------------- | ----------------- | ---------------- | -------- |
| 1 (beginner)           | 4-6               | 10-12            | 16       |
| 2 (early intermediate) | 4-8               | 12-14            | 16       |
| 3 (intermediate)       | 8-10              | 14-16            | 20       |
| 4 (experienced)        | 10-14             | 16-20            | 24       |
| 5 (advanced)           | 12-16             | 18-22            | 25       |

Start at MEV. Add 1-2 sets per muscle per week. Never exceed the hard cap.

---

## Rep Ranges

| Goal            | Primary Range | Notes                     |
| --------------- | ------------- | ------------------------- |
| Strength        | 1-6 reps      | 80-100% 1RM, long rest    |
| Hypertrophy     | 6-15 reps     | 60-80% 1RM, moderate rest |
| Endurance       | 15-30 reps    | 40-60% 1RM, shorter rest  |
| General fitness | 8-12 reps     | Default                   |

Absolute limits: never below 1 rep, never above 50 reps.
Proximity to failure matters more than the specific rep range.

---

## Rest Periods

COMPOUND MINIMUM IS 120 SECONDS. Not 90. Two minutes.

| Exercise Type                                         | Minimum     | Recommended    | Maximum    |
| ----------------------------------------------------- | ----------- | -------------- | ---------- |
| Heavy compounds (squat, deadlift, bench, OHP)         | 120 seconds | 2-3 minutes    | 5 minutes  |
| Moderate compounds (dumbbell compounds, split squats) | 90 seconds  | 90-120 seconds | 3 minutes  |
| Isolation exercises                                   | 60 seconds  | 60-90 seconds  | 2 minutes  |
| Supersets (between exercises)                         | 45 seconds  | 60 seconds     | 90 seconds |

Absolute minimum: 30 seconds. Absolute maximum: 5 minutes.

---

## Frequency and Recovery

Minimum 2x/week per muscle for hypertrophy. Higher frequency = volume distribution tool.

Recovery windows:

- Small muscles (biceps, triceps, calves, side delts): 48 hours
- Medium muscles (chest, shoulders, lats): 48-72 hours
- Large muscles (quads, hamstrings, glutes): 72 hours
- Heavy compound SRA (deadlift): 96-120 hours

---

## Progressive Overload by Level

| Level            | Method             | Description                                                          |
| ---------------- | ------------------ | -------------------------------------------------------------------- |
| 1-2 (beginner)   | Linear progression | Add weight every session when target reps are hit                    |
| 3 (intermediate) | Double progression | Add reps first, then increase weight when all sets hit reps_max      |
| 4-5 (advanced)   | RPE-based or DUP   | Autoregulate by daily performance, or vary intensity across the week |

---

## Deload Protocol

Scheduled frequency (documented decisions, not ranges):

- Beginner (1-2): every 6 weeks
- Intermediate (3): every 5 weeks
- Advanced (4-5): every 4 weeks

Performance trigger: 2 consecutive sessions below baseline at same RPE.
Execution: reduce volume 40-50%, MAINTAIN intensity (keep weight the same).
Duration: 1 week. Post-deload: expect performance rebound.

Never trigger a deload on weekNumber <= 0 (before any training has started).

---

## Splits by Days Available

| Days | Split          | Muscle Frequency |
| ---- | -------------- | ---------------- |
| 2    | Full Body x2   | 2x/week          |
| 3    | Full Body x3   | 2-3x/week        |
| 4    | Upper/Lower x2 | 2x/week          |
| 5    | PPLUL Hybrid   | 2-3x/week        |
| 6    | PPL x2         | 2x/week          |

Maximum day_number is 6 (schema CHECK constraint).

---

## Dangerous Same-Day Pairings (never combine)

- Heavy squat + heavy deadlift: excessive lumbar fatigue
- Heavy bench press + heavy overhead press: excessive shoulder fatigue
- Conventional deadlift + Romanian deadlift: same posterior chain, excessive cumulative fatigue
- Barbell overhead press + incline bench press: combined shoulder volume too high

---

## Injury Contraindications (quick reference)

Lower back: exclude good mornings, hyperextensions, jefferson curls
Knees: exclude leg extensions full ROM, deep squats under load
Shoulders: exclude upright rows, behind-neck press, dips
Wrists: exclude loaded wrist curls
Full map: docs/science/CONTRAINDICATIONS.md and src/lib/utils/contraindications.ts

---

## Validation Checklist

Before finalizing any generated program:

VOLUME: [ ] All muscles within level-appropriate caps
EXERCISE: [ ] Equipment matches user's setup [ ] No contraindicated exercises [ ] At least one compound per session
REPS: [ ] All within 1-50 range [ ] Goal-appropriate [ ] reps_min <= reps_max
REST: [ ] Heavy compounds: minimum 120s [ ] No rest below 30s
RECOVERY: [ ] No same-muscle session within minimum window
PROGRESSION: [ ] Scheme appropriate for experience level [ ] Deload scheduled, week > 0
DANGEROUS PAIRS: [ ] No squat + deadlift same day [ ] No bench + OHP same day

---

## Writing Rationale (Kiro's voice, no em dashes)

Layer 1 (one line): "Primary horizontal push compound. Leads the session while CNS is fresh."
Layer 2 (program overview): "We chose Upper/Lower for your 4 days/week because it trains each muscle twice weekly - the minimum effective frequency for hypertrophy - while keeping sessions under 60 minutes."
Layer 3 (expandable): "Rest periods of 2-3 minutes between compound sets produce significantly more hypertrophy than 1-minute rest. We default to 2 minutes here to balance gains and session efficiency."

Research citations in Kiro's system prompt are for internal grounding only.
Do NOT propagate citation text into output shown to users.
