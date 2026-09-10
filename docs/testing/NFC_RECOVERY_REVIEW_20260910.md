# NFC Recovery and Regression Review, 2026-09-10

## Scope

Review follows `dcaa844`. Upload and cleanup flags remain disabled; no migration,
provider upload/deletion or production activation was performed in this review.

ADR-012 records the remaining unregistered-upload recovery design. It explicitly
covers late provider completion, pinned storage destinations and retry identity.
This is not implemented recovery and is not sufficient to close Phase 23 S5.

## Full-Suite Attempt

The Node 22 full Vitest run was interrupted after reporting a Settings navigation
case lasting 18,392,559 ms and two media-editor failures. The run spanned a large
wall-clock gap and did not produce a final complete-suite result. It was explicitly
cancelled before running focused verification. Do not record it as passing.

## Focused Investigation

Running Settings and media-editor tests together reproduced only the media
insertion timeout (5 seconds): 16 tests passed and one failed. All 15 Settings
tests passed, including group navigation and saved Hero image restoration.
Existing-image layout editing also passed. No Settings runtime change was made.

The media insertion test now supplies the alt-text input with one change event
instead of simulating every character. The tested contract remains media selection,
required alt text, size/alignment controls, canonical JSON and generated HTML.
All assertions and the default timeout remain intact. This is a test setup change,
not evidence that real-browser typing performance has been evaluated.

The first post-change attempt did not execute any tests: the Vitest forks worker
failed to start within its response window (60.07 seconds). This is not a passing
or failing media assertion. The unusually slow scoped lint invocation was cancelled
without a result. A threads-pool diagnostic rerun is tracked separately; neither
the pool nor timeout is changed in repository configuration. The threads diagnostic
was also cancelled without a final test result because it remained unusually slow.
The test setup change is left local and uncommitted pending a verified rerun; no
passing result or production code fix is claimed for it.

## Remaining Gates

- Follow-up: the unchanged default forks-pool rerun completed successfully with
  both media tests passing. Total elapsed time was 247.68 seconds, of which
  224.39 seconds was module import and 6.45 seconds test execution. This verifies
  the test setup change, not an uninterrupted full-suite pass.
- Obtain an uninterrupted full-suite result on a stable runner.
- Implement and verify ADR-012 recovery before enabling private evidence uploads.
- Complete real-provider, authorization and device staging before rollout.

## Analytics Date Boundary Follow-up

The attraction entry/funnel timestamp upper bound was corrected to exclusive
next-day Bangkok midnight. PostgreSQL reproduced the microsecond omission; three
native Node calendar tests passed. Scoped ESLint covering the utility, repository,
native tests and media test passed. The full TypeScript process was explicitly
cancelled after prolonged execution without a result; it is not recorded as passing.
These changes are held in a local commit pending the remaining release check.
No SQL or feature flags changed. The disposable PostgreSQL container was stopped.

Follow-up: Node 22 TypeScript completed successfully with extended diagnostics
(6,080 files; 111.34 seconds compiler total; 49.62 seconds I/O read and 22.17
seconds checking). This closes the TypeScript hold on `23d8dd1`. It does not turn
the earlier interrupted full Vitest attempt into a pass. Subsequent changes need
their own validation checkpoint.
