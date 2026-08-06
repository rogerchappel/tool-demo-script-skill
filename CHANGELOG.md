# Changelog

## Unreleased

- Reject zero and negative runtime inputs instead of silently applying the default.
- Return the standard validation result for null and non-object fixture roots.
- Parse CLI options independently of fixture position and reject unknown or malformed arguments.
- Report fixture read and JSON errors without internal stack traces.
- Add explicit `--help` and `--version` CLI smoke coverage for release verification.
- Document the CLI option surface in the README.

## 0.1.0

- Initial pre-release package for generating concise tool demo scripts from repository metadata and safety notes.
- Includes the CLI, reusable skill instructions, fixtures, validation scripts, and package smoke coverage.
