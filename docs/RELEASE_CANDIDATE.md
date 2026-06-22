# Release Candidate

## Verification

- `npm test` - validates JSON, Markdown, and invalid-fixture exit behavior.
- `npm run check` - syntax checks the CommonJS entrypoints.
- `npm run build` - confirms package files are present.
- `npm run smoke` - emits the fixture-backed JSON demo plan.
- `node bin/tool-demo-script.js fixtures/connector-card.json --format=markdown` - emits release-note-friendly run of show.
- `bash scripts/validate.sh` - runs the combined release validation script.

## Classification

ship: useful local-first MVP with fixture tests and explicit safety boundaries.
