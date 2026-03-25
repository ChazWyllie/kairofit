#!/usr/bin/env node
/**
 * Kiro Voice Linter
 *
 * Scans all TypeScript and TSX files for voice violations:
 * - Em dashes (the most common violation)
 * - Banned motivational phrases
 *
 * Run: npm run lint:kiro
 * Also runs in CI as a separate quality check.
 */

const fs = require('fs')
const path = require('path')
const { globSync } = require('glob')

const RULES = [
  // Em dashes - hard rule, never use these
  // No g flag: per-line tests don't benefit from g and the lastIndex bug causes false negatives
  { pattern: /\u2014/, name: 'em-dash (unicode)', description: 'Use a regular dash (-) instead' },
  { pattern: /&mdash;/, name: 'em-dash (HTML entity)', description: 'Use a regular dash (-) instead' },

  // Banned motivational phrases in user-facing strings
  { pattern: /["'`].*Let'?s crush it.*["'`]/i, name: "banned phrase: \"Let's crush it\"", description: 'Kiro voice: no motivational fluff' },
  { pattern: /["'`].*You'?ve got this.*["'`]/i, name: "banned phrase: \"You've got this\"", description: 'Kiro voice: no motivational fluff' },
  { pattern: /["'`].*Amazing work.*["'`]/i, name: 'banned phrase: "Amazing work"', description: 'Kiro voice: no motivational fluff' },
  { pattern: /["'`].*Great job.*["'`]/i, name: 'banned phrase: "Great job"', description: 'Kiro voice: no motivational fluff' },
  { pattern: /["'`].*Keep it up.*["'`]/i, name: 'banned phrase: "Keep it up"', description: 'Kiro voice: no motivational fluff' },
  { pattern: /["'`].*You'?re doing awesome.*["'`]/i, name: "banned phrase: \"You're doing awesome\"", description: 'Kiro voice: no motivational fluff' },
]

// Files to scan
const files = globSync('src/**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '**/*.generated.ts', 'src/types/supabase.generated.ts'],
  cwd: path.join(__dirname, '..'),
})

let totalViolations = 0

for (const file of files) {
  const fullPath = path.join(__dirname, '..', file)
  const content = fs.readFileSync(fullPath, 'utf8')
  const lines = content.split('\n')

  for (const rule of RULES) {
    lines.forEach((line, lineIndex) => {
      if (rule.pattern.test(line)) {
        console.error(
          `\x1b[31mERROR\x1b[0m ${file}:${lineIndex + 1}: ${rule.name}\n` +
          `  ${line.trim()}\n` +
          `  \x1b[33mFix:\x1b[0m ${rule.description}\n`
        )
        totalViolations++
      }
    })
  }
}

if (totalViolations > 0) {
  console.error(`\x1b[31m${totalViolations} Kiro voice violation(s) found.\x1b[0m`)
  console.error('See skills/kiro-output-auditor/SKILL.md for voice rules.\n')
  process.exit(1)
}

console.log('\x1b[32mKiro voice check passed.\x1b[0m')
