# tool-demo-script-skill PRD

Status: in-progress

## Problem

Agents need reusable, local-first skills that turn ambiguous workflow requests into concrete, reviewable artifacts without performing hidden external actions.

## Users

- Agent builders preparing connector, content, or launch workflows.
- Maintainers who need fixture-backed evidence before trusting a skill.

## MVP

- Deterministic CLI and library API.
- Fixture-backed tests and smoke command.
- Skill instructions with side-effect and approval boundaries.
- Release-candidate notes and orchestration docs.

## Non-goals

- Live external account writes.
- Background daemons.
- Package publishing.
