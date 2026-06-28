// Parse-check all source files with the real Babel + Expo preset.
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

const root = path.join(__dirname, '..');
const files = [
  ...walk(path.join(root, 'src')),
  path.join(root, 'App.js'),
  path.join(root, 'index.js'),
];

let failed = 0;
for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  try {
    babel.transformSync(code, {
      filename: f,
      presets: ['babel-preset-expo'],
      babelrc: false,
      configFile: false,
    });
  } catch (e) {
    failed++;
    console.log('FAIL ' + path.relative(root, f));
    console.log('     ' + e.message.split('\n')[0]);
  }
}
console.log(failed ? `\n${failed} file(s) failed.` : 'ALL FILES PARSE OK');
process.exit(failed ? 1 : 0);
