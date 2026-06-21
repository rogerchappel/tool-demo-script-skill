const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { makeScript } = require('../src');

test('builds a bounded demo script', () => {
  const script = makeScript({ name: 'Repo Tool', oneLiner: 'turns repos into launch notes', command: 'repo-tool fixtures/demo.json' });
  assert.equal(script.runtimeMinutes, 3);
  assert.match(script.narration, /Repo Tool/);
  assert.ok(script.checklist.includes('avoid live credentials or private data'));
});

test('honors requested runtime', () => {
  const script = makeScript({ name: 'Connector Tool', oneLiner: 'routes actions safely' }, { minutes: 5 });
  assert.equal(script.runtimeMinutes, 5);
});

test('cli emits script JSON', () => {
  const out = execFileSync(process.execPath, ['bin/tool-demo-script.js', 'fixtures/repo-card.json'], { cwd: process.cwd(), encoding: 'utf8' });
  const parsed = JSON.parse(out);
  assert.match(parsed.title, /demo script/);
});
