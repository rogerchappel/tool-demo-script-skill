# tool-demo-script-skill Skill

## When to use

Use when preparing a short demo video, launch post, or walkthrough script for a developer tool without overstating capabilities.

## Required inputs

- A JSON fixture that describes the request or repo card.
- Local shell access to run the CLI and tests.

## Side-effect boundaries

The skill is local-first. It must not call external APIs, send messages, publish posts, or mutate third-party systems. Treat every output as a draft until a human approves it.

## Approval requirements

External writes require explicit approval outside this package. For connector or launch workflows, capture the approver, target system, and exact action before executing elsewhere.

## Examples

```bash
npm run smoke
node bin/tool-demo-script.js fixtures/repo-card.json
node bin/tool-demo-script.js fixtures/connector-card.json --format=markdown
```

## Validation workflow

Run `npm test`, `npm run check`, `npm run build`, and `npm run smoke`. For release evidence, save both the JSON plan and a Markdown run of show, and confirm any invalid fixture exits nonzero before preparing a PR.
