#!/usr/bin/env node
const { makeScript, readJson, renderMarkdown } = require('../src');

function main(argv) {
  const file = argv[2];
  if (!file || argv.includes('--help')) {
    console.log('Usage: tool-demo-script <fixture.json> [--minutes=N] [--format=json|markdown]');
    process.exit(file ? 0 : 1);
  }
  const minutesArg = argv.find((arg) => arg.startsWith('--minutes='));
  const minutes = minutesArg ? minutesArg.split('=')[1] : undefined;
  const formatArg = argv.find((arg) => arg.startsWith('--format='));
  const format = formatArg ? formatArg.split('=')[1] : 'json';
  const result = makeScript(readJson(file), { minutes });
  if (format === 'markdown') {
    console.log(renderMarkdown(result));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(result.ok === false ? 2 : 0);
}

main(process.argv);
