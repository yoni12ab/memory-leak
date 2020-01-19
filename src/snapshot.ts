import { SnapshotRoot } from './snapshot.model';

type Tab = chrome.tabs.Tab;
type Debuggee = chrome.debugger.Debuggee;

const SEND_DEBUGGER_COMMAND_METHOD_ENABLE = 'Debugger.enable';
const SEND_DEBUGGER_COMMAND_METHOD_TAKE_HEAP_SNAPSHOT =
  'HeapProfiler.takeHeapSnapshot';
//https://gist.github.com/mmarchini/303b1699d936d3649a09714be21e1263
//https://chromedevtools.github.io/source-docs/source/front_end/heap_snapshot_worker/AllocationProfile.js.src.html
//https://github.com/ChromeDevTools/source-docs

export async function takeHeapSnapshot(): Promise<SnapshotRoot> {
  // get active tab
  const tab = await getActiveTab();
  // to send commands to debugger we need to use debuggee object
  const debuggee: Debuggee = { tabId: tab.id };
  // to start snapshot need to attach to debugger and send debugger enable command
  await attachToDebugger(debuggee);
  // send command to enable debugger
  await debuggerSendCommand(debuggee, SEND_DEBUGGER_COMMAND_METHOD_ENABLE);
  // register to debugger events and get the heap in chunks of strings
  const allHeapChunks = await startTheSnapshotAndGetAllHeapChunks(debuggee);
  // concat all string chunks to json object
  return JSON.parse(allHeapChunks.join(''));
}

function getActiveTab(): Promise<Tab> {
  return new Promise<any>((success, failed) => {
    chrome.tabs.getSelected(activeTab => success(activeTab));
  });
}

function attachToDebugger(debuggee: Debuggee): Promise<any> {
  return new Promise<any>((success, faild) => {
    chrome.debugger.attach(debuggee, '1.0', success);
  });
}

function debuggerSendCommand(debuggee: Debuggee, method: string): Promise<any> {
  return new Promise<any>((success, faild) => {
    chrome.debugger.sendCommand(debuggee, method, success);
  });
}

function startTheSnapshotAndGetAllHeapChunks(
  debuggee: Debuggee
): Promise<string[]> {
  let allChunksOfTheHeap = [];
  let timeoutHandle = null;

  return new Promise<any>(async (success, fail) => {
    //register to debugger events
    chrome.debugger.onEvent.addListener((source, name, data: any) => {
      if (data.chunk) {
        allChunksOfTheHeap.push(data.chunk);

        //enter every event clear the last timeout and register to new one
        //after 3 seconds of no event assume that the snapshot completed
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => {
          success(allChunksOfTheHeap);
        }, 3000);
      }
    });

    //send command to the debugger to take heap snapshot
    await debuggerSendCommand(
      debuggee,
      SEND_DEBUGGER_COMMAND_METHOD_TAKE_HEAP_SNAPSHOT
    );
  });
}
