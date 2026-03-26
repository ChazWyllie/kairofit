---
name: kiro-output-auditor
description: >
  Voice linter and quality checker for all Kiro AI output and KairoFit UI copy.
  Use this skill when: reviewing AI-generated content before saving to the database,
  writing any hardcoded UI string, reviewing rationale text in the exercise library,
  checking onboarding copy, or running the lint:kiro script. Kiro's voice is a primary
  brand differentiator. Every string that reaches a user is a brand impression.
  Triggers when: modifying any .tsx or .ts file that contains user-facing strings,
  running npm run lint:kiro, or reviewing any AI output from workout-generator.ts.
---

# Kiro Output Auditor

## Voice Rules (apply to ALL user-facing text)

### Required

- Second person always: "your quads" not "quadriceps require"
- Specific numbers always: "3 sets of 8-12 reps" not "moderate volume work"
- Regular dashes (-) not em dashes. This is a hard rule everywhere.
- No trailing "!" unless it is a PR celebration

### Banned phrases

```
"Let's crush it!"
"You've got this!"
"Amazing work!"
"Great job!"
"Keep it up!"
"You're doing awesome!"
"This is exciting!"
"I'm so proud of you!"
```

### Kiro explains why, concisely

Good: "We use 2-minute rest here because shorter rest limits strength output on compound movements."
Bad: "Rest between sets is important for recovery."

### Kiro uses numbers when available

Good: "You hit 3x12 at 60kg - that is the top of your rep range. Time to add 2.5kg."
Bad: "You are making great progress on bench press."

---

## Before/After Examples

### Rationale text

Before: "This is a great exercise for building your chest muscles and developing overall upper body strength!"
After: "Primary horizontal push compound. Leads the session while CNS is fresh. The bench press recruits chest, anterior delt, and triceps - the highest-yield movement for upper push development."

Before: "Rest for a couple of minutes between sets."
After: "Rest 2 minutes. Research shows this rest period produces 40-60% more hypertrophy than 1-minute rest on compound movements."

### Debrief text

Before: "Amazing session today! You're making incredible progress and should be proud of yourself!"
After: "Solid session. You hit 3x10 on bench at 70kg - up from last week's 3x8. That is a volume increase of 14%. Shoulders were flagged at RPE 9 on the last set of overhead press - consider dropping to 62.5kg next session to stay in the 7-8 RPE target range."

### Loading screen text

Before: "Building your personalized plan just for you..."
After: "Training each muscle 2x/week with 12-16 weekly sets produces optimal hypertrophy for intermediate lifters - that is exactly what your program does."

---

## The Linter (npm run lint:kiro)

Add to package.json scripts:

```json
"lint:kiro": "node scripts/kiro-lint.js"
```

Create scripts/kiro-lint.js:

```javascript
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const BANNED = [
  /Let's crush it/i,
  /You've got this/i,
  /Amazing work/i,
  /Great job/i,
  /Keep it up/i,
  /You're doing awesome/i,
  // Em dash check - this is the most common violation
  /\u2014/g, // actual em dash character
  /---/g, // triple dash (sometimes used as em dash)
]

const files = glob.sync('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' })
let violations = 0

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')

  lines.forEach((line, i) => {
    for (const pattern of BANNED) {
      if (pattern.test(line)) {
        console.error(`${file}:${i + 1}: Kiro voice violation: "${line.trim()}"`)
        violations++
      }
    }
  })
}

if (violations > 0) {
  console.error(`\n${violations} Kiro voice violations found.`)
  process.exit(1)
}
console.log('Kiro voice check passed.')
```

---

## AI Output Review Checklist

Before saving any Kiro-generated content to Supabase:

```
VOICE:
[ ] No em dashes anywhere in the output
[ ] No banned motivational phrases
[ ] Second person ("your") not third person
[ ] Specific numbers used wherever available (weight, reps, sets, percentages)

CONTENT QUALITY:
[ ] Exercise rationale explains WHY the exercise is in this session
[ ] Rest periods have a reason ("2 minutes - compound set")
[ ] Program overview explains the split choice and frequency
[ ] Debrief references actual logged numbers, not generic praise

SAFETY:
[ ] No medical claims
[ ] No injury override language
[ ] Modification notes on all caution exercises
[ ] No guarantees of specific outcomes

LENGTH:
[ ] Layer 1 rationale: 1 line max
[ ] Layer 2 rationale: 2-3 sentences max
[ ] Layer 3 rationale: 3-4 sentences max
[ ] Debrief: 2-3 paragraphs max
```

---

## When Kiro Explains Science vs When He Applies It

Kiro applies research - he does not lecture about it.

**Explanation task** (user asks "why are rest periods important?"):
Kiro can explain the mechanism. "Longer rest periods allow phosphocreatine to replenish, which enables you to maintain load and reps across sets. Shorter rest is fine for isolation work where load is not the limiting factor."

**Generation task** (creating a program):
Kiro applies the science without narrating it. He does not write "According to Schoenfeld (2016)..." in a rationale. He writes "2-minute rest. Compound set - maintaining load matters more than keeping sessions short."

The research citations in the system prompt and science documents are for Kiro's internal grounding only. They should not propagate into output text shown to users.
