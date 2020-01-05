import { takeHeapSnapshot } from '../snapshot.js';

main();

function main() {
  attachClick();
}

function attachClick() {
  document.querySelector('#startBtn').addEventListener('click', start);
}

async function start() {
  const angularFound = [];
  const results = await takeHeapSnapshot();
  console.log('start parsing results', results);
  for (const key in results.strings) {
    const value = results.strings[key];
    if (value.includes('/src/app')) {
      angularFound.push(`angular: ${key} value: ${results.strings[key]}`);
    }
  }
  console.log('found ', angularFound);
}
