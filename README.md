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
```

The CLI prints JSON by default so agents can save evidence, compare fixture output, or pass plans to another local step. Markdown output is available for release notes, video prep, and draft post material.

## Output shape

- `ok`: validation status for the source fixture.
- `beats`: timed run-of-show entries with start and end seconds.
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
