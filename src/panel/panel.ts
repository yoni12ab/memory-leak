(() => {
  let output = [];
  let timeoutHandle = null;
  let tab;
  main();

  return;

  function main() {
    registerChromeToEvents();
    attachClick();
  }

  function attachClick() {
    document.querySelector('#startBtn').addEventListener('click', () => {
      if (tab) {
        start(tab);
      }
    });
  }

  function registerChromeToEvents() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      tab = tabs[0];
    });
  }

  function start(tab) {
    if (tab && tab.id) {
      output = [];
      var debugId = { tabId: tab.id };
      chrome.debugger.attach(debugId, '1.0', function() {
        chrome.debugger.sendCommand(debugId, 'Debugger.enable', {}, function() {
          chrome.debugger.onEvent.addListener(headerListener);
          chrome.debugger.sendCommand(debugId, 'HeapProfiler.takeHeapSnapshot');
        });
      });
    }
  }

  function headerListener(source, name, data) {
    if (data.chunk) {
      output.push(data.chunk);
      clearTimeout(timeoutHandle);
      timeoutHandle = setTimeout(function() {
        parseResults();
      }, 3000);
    }
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
