const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { makeScript, renderMarkdown, toPositiveMinutes, validateDemoInput } = require('../src');

test('builds a bounded demo script', () => {
  const script = makeScript({ name: 'Repo Tool', oneLiner: 'turns repos into launch notes', command: 'repo-tool fixtures/demo.json' });
  assert.equal(script.ok, true);
  assert.equal(script.runtimeMinutes, 3);
  assert.match(script.narration, /Repo Tool/);
  assert.ok(script.checklist.includes('avoid live credentials or private data'));
  assert.equal(script.beats[0].startSecond, 0);
  assert.ok(script.artifactPlan.some((item) => item.name === 'safety-note'));
});

test('honors requested runtime', () => {
  const script = makeScript({ name: 'Connector Tool', oneLiner: 'routes actions safely' }, { minutes: 5 });
  assert.equal(script.runtimeMinutes, 5);
});

test('validates required input', () => {
  assert.deepEqual(validateDemoInput({ name: 'Only Name' }), ['missing oneLiner']);
  const script = makeScript({ oneLiner: 'missing name' });
  assert.equal(script.ok, false);
  assert.match(script.errors.join('\n'), /missing name/);
});

test('bounds positive minutes', () => {
  assert.equal(toPositiveMinutes(99), 15);
  assert.equal(toPositiveMinutes(0.2), 1);
  assert.throws(() => toPositiveMinutes('never'), /positive number/);
});

test('renders markdown run of show', () => {
  const script = makeScript({ name: 'Connector Tool', oneLiner: 'routes actions safely' });
  const markdown = renderMarkdown(script);
  assert.match(markdown, /^# Connector Tool demo script/);
  assert.match(markdown, /## Run Of Show/);
});

test('cli emits script JSON', () => {
  const out = execFileSync(process.execPath, ['bin/tool-demo-script.js', 'fixtures/repo-card.json'], { cwd: process.cwd(), encoding: 'utf8' });
  const parsed = JSON.parse(out);
  assert.equal(parsed.ok, true);
  assert.match(parsed.title, /demo script/);
});

test('cli emits markdown and validation exit codes', () => {
  const out = execFileSync(process.execPath, ['bin/tool-demo-script.js', 'fixtures/connector-card.json', '--format=markdown'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.match(out, /## Shot List/);
  const result = spawnSync(process.execPath, ['bin/tool-demo-script.js', 'fixtures/invalid-card.json'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stdout, /missing oneLiner/);
});
