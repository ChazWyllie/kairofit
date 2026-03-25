# KairoFit Injury Contraindications Reference

Maps injury zones to exercise exclusions and modifications.
This is the documentation reference. The implementation is in:
src/lib/utils/contraindications.ts

For each injury zone:
EXCLUDE: Never assign. Replace with substitute.
CAUTION: Assign with a modification_note. Flag in the UI.
RECOMMEND: Prioritize these as safer alternatives.

---

## Lower Back

Common causes: disc herniation, muscle strain, spondylolisthesis, chronic tightness

EXCLUDE (never assign):
- Good mornings (barbell or dumbbell)
- Hyperextensions and back extensions (weighted)
- Jefferson curls
- Stiff-leg deadlift under heavy load
- Loaded spinal flexion exercises

CAUTION (assign with modification note):
- Conventional deadlift: "Keep weight moderate, brace core throughout. Stop if you feel lower back strain."
- Romanian deadlift: "Monitor lower back fatigue. Do not push through pain."
- Barbell squat: "Reduce depth to just above parallel if needed. Ensure upright torso."
- Barbell row: "Keep back flat throughout. Do not round at any point."
- Leg press: "Do not go below 90 degrees. Keep lower back pressed against the pad."

RECOMMEND:
- Hip thrust, glute bridge
- Goblet squat (more upright than barbell squat)
- Single-leg exercises (split squat, step-up, lunge)
- Cable pull-through
- Lat pulldown, seated cable row (no spinal loading)
- Dumbbell Romanian deadlift (easier to control than barbell)

---

## Knees

Common causes: patellar tendinitis, ACL/MCL history, osteoarthritis, chondromalacia

EXCLUDE:
- Leg extension machine full-range (extreme patellar stress at lockout)
- Deep squats below parallel under load
- Box jumps and plyometric landings without progression

CAUTION:
- Barbell squat: "Limit depth to 90 degrees. Ensure knees track over toes."
- Walking lunge: "Keep front shin vertical. Do not let knee cave inward."
- Bulgarian split squat: "Start with bodyweight only. Monitor knee discomfort closely."
- Leg press: "Maximum 90 degree depth. Do not lock out completely."
- Step-up: "Use conservative box height. Drive through heel, not toe."

RECOMMEND:
- Hip thrust, glute bridge (minimal knee stress)
- Lying leg curl, seated leg curl
- Calf raises
- Single-leg deadlift (controlled, minimal knee flexion)
- Leg press (moderate depth only)

---

## Shoulders

Common causes: rotator cuff strain/tear, impingement, AC joint issues, labral damage

EXCLUDE:
- Upright rows (extreme internal rotation at impingement angle)
- Behind-neck press
- Behind-neck lat pulldown
- Dips (extreme shoulder extension angle)

CAUTION:
- Overhead press: "Use neutral grip dumbbells if possible. Stop if pain occurs at top of range."
- Barbell overhead press: "Consider landmine press or dumbbell press as alternative."
- Lateral raises: "Use light weight. Do not raise above shoulder height."
- Incline dumbbell press: "Use moderate incline (30-45 degrees). Do not flare elbows."
- Pull-up: "Avoid if overhead reach causes pain. Lat pulldown is the safer alternative."
- Front raises: "Keep weight very light. Do not raise above shoulder height."

RECOMMEND:
- Landmine press (natural shoulder path, neutral grip)
- Cable flye
- Lat pulldown (vs pull-up)
- Face pulls (excellent for rotator cuff health)
- Band pull-aparts
- Dumbbell row
- Rear delt flyes

---

## Wrists

Common causes: tendinitis, carpal tunnel, TFCC injury, sprains

EXCLUDE:
- Loaded wrist curls
- Behind-the-back barbell wrist curls

CAUTION:
- Barbell bench press: "Use wrist wraps if needed. Keep wrists neutral - not extended backward."
- Barbell curl: "Keep wrists neutral. Do not hyperextend at top. Consider EZ bar or dumbbells."
- Skull crusher: "Use EZ bar or neutral grip dumbbells. Avoid straight barbell."
- Push-up: "Elevate on fists or push-up handles to keep wrists neutral."

RECOMMEND:
- All dumbbell exercises (allow natural wrist rotation)
- Cable exercises (smooth resistance curve)
- Neutral grip pressing variations
- Machine pressing exercises

---

## Hips

Common causes: hip impingement (FAI), labral tear, hip flexor strain, bursitis

EXCLUDE:
- Deep squats below parallel (may aggravate FAI)
- Plyometric hip-dominant movements with heavy loading

CAUTION:
- Barbell squat: "Stay above parallel. Monitor for pinching sensation at the hip crease."
- Hip thrust: "Use full range only if pain-free. Partial range is acceptable."
- Leg press: "Do not bring knees too close to chest."
- Bulgarian split squat: "Monitor hip flexor stretch. Do not overextend rear leg."

RECOMMEND:
- Step-up
- Dumbbell deadlift variations (easier to adjust stance)
- Lying leg curl
- Calf raises
- Upper body dominant programming with reduced lower body intensity

---

## Neck

Common causes: cervical disc issues, muscle strain, whiplash, spondylosis

EXCLUDE:
- Behind-neck press
- Behind-neck lat pulldown
- Heavy neck isolation exercises

CAUTION:
- Barbell squat (bar on traps): "Use low bar, safety bar squat, or goblet squat to reduce cervical loading."
- Barbell overhead press: "Keep neck neutral throughout. Do not crane forward."
- Conventional deadlift: "Maintain neutral cervical spine. Do not look up aggressively."

RECOMMEND:
- Dumbbell or machine overhead press alternatives
- Trap bar deadlift (more upright position)
- All seated machine exercises (supported position)
- Goblet squat

---

## Implementation Notes

In workout-generator.ts:
Before generating exercises, call getExcludedExercises(injuries) to get the full
exclusion set and pass it as a constraint to Kiro.
Pass caution exercises with their modification notes as: "These may appear but must include this note."

In workout-validator.ts:
Post-generation: scan every exercise against the user's injury flags.
If any EXCLUDE exercise appears: reject the workout, log the violation, trigger regeneration.
If any CAUTION exercise appears without its modification note: add the standard note.

In the UI (exercise cards):
Show a yellow warning badge on caution exercises with the modification note visible below.
Allow users to swap any exercise by tapping "Change exercise" on the card.
