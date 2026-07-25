#!/usr/bin/env node
const { makeScript, readJson, renderMarkdown } = require('../src');
const { version } = require('../package.json');

function main(argv) {
  if (argv.includes('--version')) {
    console.log(version);
    process.exit(0);
  }

  const file = argv[2];
  if (!file || argv.includes('--help')) {
    console.log([
      'Usage: tool-demo-script <fixture.json> [--minutes=N] [--format=json|markdown]',
      '',
      'Options:',
      '  --minutes=N             Target runtime, clamped from 1 to 15 minutes',
      '  --format=json|markdown  Output JSON by default or Markdown for review',
      '  --version               Print the package version',
      '  --help                  Show this help'
    ].join('\n'));
    process.exit(file ? 0 : 1);
  }
  const minutesArg = argv.find((arg) => arg.startsWith('--minutes='));
  const minutes = minutesArg ? minutesArg.split('=')[1] : undefined;
  const formatArg = argv.find((arg) => arg.startsWith('--format='));
  const format = formatArg ? formatArg.split('=')[1] : 'json';
  if (!['json', 'markdown'].includes(format)) {
    console.error('Unsupported format "' + format + '". Use json or markdown.');
    process.exit(1);
  }
  const result = makeScript(readJson(file), { minutes });
  if (format === 'markdown') {
    console.log(renderMarkdown(result));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(result.ok === false ? 2 : 0);
}

main(process.argv);
