type Tab = chrome.tabs.Tab;
type Debuggee = chrome.debugger.Debuggee;

const SEND_DEBUGGER_COMMAND_METHOD_ENABLE = 'Debugger.enable';
const SEND_DEBUGGER_COMMAND_METHOD_TAKE_HEAP_SNAPSHOT =
  'HeapProfiler.takeHeapSnapshot'; //https://gist.github.com/mmarchini/303b1699d936d3649a09714be21e1263

function getActiveTab(): Promise<Tab> {
  return new Promise<any>((sucsses, faild) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) =>
      sucsses(activeTab)
    );
  });
}

function attahToDebugger(debuggee: Debuggee): Promise<any> {
  return new Promise<any>((sucsses, faild) => {
    chrome.debugger.attach(debuggee, '1.0', sucsses);
  });
}

function debuggerSendCommand(debuggee: Debuggee, method: string): Promise<any> {
  return new Promise<any>((sucsses, faild) => {
    chrome.debugger.sendCommand(debuggee, method, sucsses);
  });
}

function listenToDebuggerEvents(): Promise<any> {
  let output = [];
  let timeoutHandle = null;
  return new Promise<any>((success, fail) => {
    chrome.debugger.onEvent.addListener((source, name, data: any) => {
      if (data.chunk) {
        this.output.push(data.chunk);
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = setTimeout(function() {
          success(output);
        }, 3000);
      }
    });
  });
}

export class HeapSnapshot {
  static async start() {
    const tab = await getActiveTab();
    const debuggee: Debuggee = { tabId: tab.id };
    await attahToDebugger(debuggee);
    await debuggerSendCommand(debuggee, SEND_DEBUGGER_COMMAND_METHOD_ENABLE);
    listenToDebuggerEvents();
    await debuggerSendCommand(
      debuggee,
      SEND_DEBUGGER_COMMAND_METHOD_TAKE_HEAP_SNAPSHOT
    );
  }
}
