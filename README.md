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
tool-demo-script --format=markdown --minutes=5 fixtures/connector-card.json
tool-demo-script --help
tool-demo-script --version
```

The CLI prints JSON by default so agents can save evidence, compare fixture output, or pass plans to another local step. Markdown output is available for release notes, video prep, and draft post material.
Options may appear before or after the single fixture path. Unknown options,
missing option values, extra positional arguments, and fixture read or JSON
errors produce a concise diagnostic on stderr and exit with status 1.

Fixtures must contain a JSON object. A null, array, or primitive root produces
the standard validation result (`ok: false` with an `errors` array) and exits
with status 2. Runtime values supplied by either the fixture or `--minutes`
must be positive; zero and negative values are rejected with status 1.

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

The package is not currently published to the npm registry. Build a tarball from a
fresh clone, then install that artifact into your project:

```bash
git clone https://github.com/rogerchappel/tool-demo-script-skill.git
cd tool-demo-script-skill
npm pack
cd /path/to/your/project
npm install /path/to/tool-demo-script-skill/tool-demo-script-skill-0.1.0.tgz
npx --no-install tool-demo-script --help
npx --no-install tool-demo-script --version
```

The tarball name includes the version from `package.json`. `npm run
package:smoke` performs the same pack, clean-project install, and CLI checks
without modifying the repository.
