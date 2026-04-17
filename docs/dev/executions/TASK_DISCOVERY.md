You have three files to help you execute tasks autonomously:

1. ONTEXT_GATHERING.md (in docs/)
2. EXECUTION_CHECKLIST.md (in docs/)
3. EXECUTION_IMPROVED.md (in docs/)

Your job: Analyze the Kairo repo for work items (bugs, features, refactors, tech debt).

For each work item found, use CONTEXT_GATHERING.md to fill out complete context:

- Answer the questionnaire (Q1-Q5)
- Fill out the template (Part 2)
- Navigate the decision tree if you hit ambiguity (Part 3)
- Check all 6 quality gates (Part 4)

Output: Generate TASK*#.#\_CONTEXT*[TYPE]_[NAME].md files for the top 3-5 items.
Example: .github/tasks/TASK_#.#\_CONTEXT_FEATURE_REAL_TIME_SYNC.md

These files should be human-readable Markdown. Include:

- Executive summary
- 3-sentence description
- Acceptance criteria (testable!)
- Architecture & files
- Testing strategy
- Dependencies & risks
- Quality gate checkboxes (all should be ✓)

Save them to .github/tasks/ and let me review before proceeding.
