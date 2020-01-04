(() => {
  let output = [];
  let timeoutHandle = null;
  main();

  return;

  function main() {
    attachClick();
  }

  function attachClick() {
    document.querySelector('#startBtn').addEventListener('click', start);
  }

  function parseResults() {
    const angularFound = [];
    const results = JSON.parse(output.join(''));
    console.log('start parsing results', results);
    for (const key in results.strings) {
      const value = results.strings[key];
      if (value.includes('/src/app')) {
        angularFound.push(`angular: ${key} value: ${results.strings[key]}`);
      }
    }
    console.log('found ', angularFound);
  }
})();
