const fs = require('node:fs');
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/package-check.txt', 'tool-demo-script-skill build ok\n');
console.log('built tool-demo-script-skill');
