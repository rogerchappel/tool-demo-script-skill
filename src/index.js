const fs = require('node:fs');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function compactList(items = [], fallback = 'local-first workflow') {
  return items.length ? items.join(', ') : fallback;
}

function makeScript(input, options = {}) {
  const minutes = Number(options.minutes || input.minutes || 3);
  const beats = [
    { label: 'hook', seconds: 20, line: 'Today I am showing ' + input.name + ': ' + input.oneLiner + '.' },
    { label: 'problem', seconds: 30, line: 'It helps when ' + (input.problem || 'an agent needs a repeatable workflow with evidence and safety checks') + '.' },
    { label: 'demo', seconds: Math.max(45, minutes * 30), line: 'Run ' + (input.command || 'the CLI against a fixture') + ' and inspect ' + compactList(input.outputs, 'the generated output') + '.' },
    { label: 'safety', seconds: 25, line: 'Side effects: ' + (input.sideEffects || 'dry-run by default; review before external writes') + '.' },
    { label: 'close', seconds: 20, line: 'Try it locally with ' + (input.quickstart || 'npm test && npm run smoke') + '.' }
  ];
  const checklist = [
    'verify fixture command works',
    'show generated artifact on screen',
    'state limitation plainly',
    'avoid live credentials or private data'
  ];
  return {
    title: input.name + ' demo script',
    runtimeMinutes: minutes,
    audience: input.audience || 'agent builders',
    beats,
    narration: beats.map((beat) => '[' + beat.label + '] ' + beat.line).join('\n'),
    shotList: input.shots || ['terminal command', 'fixture input', 'generated output', 'README quickstart'],
    checklist
  };
}

module.exports = { makeScript, readJson };
