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
```

The CLI prints JSON so agents can save evidence, compare fixture output, or pass plans to another local step.

## Safety notes

- Local-first: the package reads fixture files and writes no external systems.
- Dry-run oriented: generated plans and scripts are proposals, not approvals.
- Do not include private data or live credentials in fixtures.

## Limitations

This MVP uses deterministic heuristics and fixture-backed tests. Adapter-specific execution, live API calls, and publishing workflows are intentionally out of scope.
