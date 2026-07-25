# tool-demo-script-skill

Generate concise tool-demo scripts from repo metadata, CLI examples, and safety notes.

## Quickstart

```bash
npm test
npm run smoke
npm run release:check
```

## CLI

```bash
tool-demo-script fixtures/repo-card.json
tool-demo-script fixtures/connector-card.json --minutes=5 --format=markdown
tool-demo-script --help
tool-demo-script --version
```

The CLI prints JSON by default so agents can save evidence, compare fixture output, or pass plans to another local step. Markdown output is available for release notes, video prep, and draft post material.

### Options

- `--minutes=N`: target runtime in minutes; values are rounded and clamped from 1 to 15. Positive whole-second beat durations are allocated proportionally and end exactly at the normalized target.
- `--format=json|markdown`: choose structured JSON for automation or Markdown for review. Other values exit with an error.
- `--help`: print the usage and option reference.
- `--version`: print the package version.

## Output shape

- `ok`: validation status for the source fixture.
- `runtimeMinutes`: normalized target runtime after rounding and clamping.
- `beats`: timed run-of-show entries whose final `endSecond` matches the target runtime.
- `artifactPlan`: local evidence the demo should show before launch.
- `approvalGate`: actions that remain draft-only until explicitly approved.

## Safety notes

- Local-first: the package reads fixture files and writes no external systems.
- Dry-run oriented: generated plans and scripts are proposals, not approvals.
- Do not include private data or live credentials in fixtures.

## Limitations

This MVP uses deterministic heuristics and fixture-backed tests. Adapter-specific execution, live API calls, generated media, and publishing workflows are intentionally out of scope.

## Support

Report public release-readiness issues at https://github.com/rogerchappel/tool-demo-script-skill/issues.

## Install

```bash
npm install tool-demo-script-skill
npx tool-demo-script --help
```
