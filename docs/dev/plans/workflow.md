You are an autonomous AI developer operating in Claude Code. Execute exactly as defined in `workflow.md`. Follow the workflow sequentially using available skills, commads, agents highly useful and beneficials (determine which ones we should utilize).

# EXECUTION SEQUENCE

1. `/plan review` → Parse `workflow.md`, project context, and requirements. Summarize scope, architecture decisions, and boundaries before coding.
2. `/tdd setup` → Configure or validate the test runner. Scaffold test files, ensure baseline tests pass/fail as expected, and verify TDD tooling is ready.
3. Create a feature branch (`git checkout -b feat/phase-8-<feature>`). Implement test-first. Commit incrementally using Conventional Commits. Never merge to main in this phase.
4. Draft & push PR via `gh`. Include: detailed change description, testing coverage summary, breaking changes/migration notes. Push branch and open PR.
5. `/code-review` & `/verify` → Run linters, type checkers, test suites, and static analysis. Log findings, severity categories, and applied fixes.
6. Monitor CI/CD → Use `gh run list` and `gh run watch`. On failure: capture logs, diagnose root cause, patch, commit, push, and re-run until all checks pass.
7. `/update-docs` → Generate or update documentation reflecting all changes.
8. `/learn` → Capture insights, patterns, and process improvements.

# OUTPUT: DEVELOPMENT JOURNAL

After completing all steps, output a SINGLE markdown journal using EXACTLY this structure. Do not summarize; use real code snippets, file paths, CLI outputs, and metrics.

1. **Context & Planning**
   - Requirements extracted from `/plan review`
   - Architecture diagrams/decisions (Mermaid or structured text)
   - Scope boundaries
2. **Development Methodology**
   - TDD flow: test → fail → implement → pass → refactor (with examples)
   - Branching strategy & commit discipline
   - Integration points & dependencies
3. **Implementation Deep Dive**
   - File-by-file breakdown (created/modified)
   - Design patterns applied & rationale
   - Database schema changes (if any)
   - API endpoints or components exposed
4. **Quality Assurance**
   - `/code-review` findings (severity, category, fix)
   - `/verify` checklist results
   - Test coverage metrics (include exact command used)
   - Edge cases identified & handled
5. **CI/CD Pipeline**
   - GitHub Actions or Vercel configuration used
   - Required secrets/environment variables
   - Build failures: logs → root cause → fix → re-run result
   - Deployment steps
6. **Knowledge Artifacts**
   - Updated documentation references
   - `/learn` insights
   - Process improvements
   - Patterns to replicate
7. **Metrics & Retrospective**
   - Time breakdown per subphase
   - Issues found & resolved
   - Coverage percentage
   - Performance impact (if measured)
   - What to do differently
