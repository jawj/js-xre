#!/usr/bin/env node

// npm run update-docs

// script that clumsily processes README to insert logged values as comments 
// at marked locations

const [fs, intercept] = ['fs', 'intercept-stdout'].map(lib => require(lib));

const marker = /\/\*\*\//g;
const jsSections = /```\s*js\b([\s\S]+?)```/gi;
const separator = '--- 39e8e56c-1e57-4bb8-aee0-3df80b1a9fc6 ---';
const source = fs.readFileSync('README.source.md', 'utf-8');
const linePrefix = '// ';

const target = source.replace(jsSections, (match, js) => {
  let sections = [''];
  let instrumentedJs = js.replace(marker, `; console.log("${separator}");`);

  const unintercept = intercept(line => {
    if (line == separator + '\n') sections.push('');
    else sections[sections.length - 1] += line.replace(/^(?!$)/gm, linePrefix);
  });
  eval(instrumentedJs);
  unintercept();

  let substitutedJS = js.replace(marker, () => sections.shift().trimRight());
  return '```js' + substitutedJS + '```';
});

fs.writeFileSync('README.md', target);