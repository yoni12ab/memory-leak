import { takeHeapSnapshot } from '../snapshot.js';

main();

function main() {
  attachClick();
}

function attachClick() {
  document.querySelector('#startBtn').addEventListener('click', start);
}

async function start() {
  const srcFiles = [];
  const angularFoundStringsIndexes = {};
  const angularFoundStringsIndexesWithObjects = {};
  const results = await takeHeapSnapshot();
  console.log('start parsing results', results);
  for (const key in results.strings) {
    const value = results.strings[key].toLowerCase();
    if (value.startsWith('./src/app')) {
      srcFiles.push(value);
    }
    if (
      //value.includes('/src/app') ||
      //value.includes('component') ||
      //value.includes('service')
      value.endsWith('component') ||
      value.endsWith('service')
    ) {
      angularFoundStringsIndexes[key] = angularFoundStringsIndexes[key] || {
        string: results.strings[key],
        nodes: [],
        edges: []
      };
      //console.log(`angular: ${key} value: ${results.strings[key]}`);
    }
  }
  const stringsThatHasObject = {};
  //strings - skip 6 locations each loop
  for (let i = 0; i < results.nodes.length; i += 6) {
    const nodeIndexInStrings = results.nodes[i + 1]; // Index to the string representing the name of this node
    // if the node match one of the desire strings collect details on it
    if (angularFoundStringsIndexes[nodeIndexInStrings]) {
      const nodeType = results.nodes[i]; // Node's type
      const nodeTypeName = results.snapshot.meta.node_types[0][nodeType]; // Node's type
      const nodeId = results.nodes[i + 2]; // ID of this node
      const nodeSize = results.nodes[i + 3]; // Size of this node
      const nodeNumberOfChildren = results.nodes[i + 4]; // Number of children this node have
      const nodeUnknown = results.nodes[i + 5];

      const node = {
        nodeType,
        nodeTypeName,
        nodeIndexInStrings,
        nodeId,
        nodeSize,
        nodeNumberOfChildren,
        nodeUnknown
      };
      angularFoundStringsIndexes[nodeIndexInStrings].nodes.push(node);
      if (nodeTypeName === 'object') {
        angularFoundStringsIndexesWithObjects[
          nodeIndexInStrings
        ] = angularFoundStringsIndexesWithObjects[nodeIndexInStrings] || {
          objSnapShot: null,
          instances: []
        };

        angularFoundStringsIndexesWithObjects[nodeIndexInStrings].objSnapShot =
          angularFoundStringsIndexes[nodeIndexInStrings];
        angularFoundStringsIndexesWithObjects[
          nodeIndexInStrings
        ].instances.push(node);
      }
    }
  }

  //edges - skip 3 locations each loop
  for (let i = 0; i < results.edges.length; i += 3) {
    const edgeIndexOgEdgeOrIndexOfString = results.edges[i + 1]; //Can be a) index of this edge; b) index of the string name for this edge

    // if the node match one of the desire strings collect details on it
    if (angularFoundStringsIndexes[edgeIndexOgEdgeOrIndexOfString]) {
      const edgeType = results.edges[i]; // Edge's type
      const edgeTypeName = results.snapshot.meta.edge_types[0][edgeType]; // Node's type
      const edgePointToThisNodeId = results.edges[i + 2]; //ID of the node this edge points to
      angularFoundStringsIndexes[edgeIndexOgEdgeOrIndexOfString].edges.push({
        edgeType,
        edgePointToThisNodeId,
        edgeIndexOgEdgeOrIndexOfString,
        edgeTypeName
      });
    }
  }

  console.log('found ', angularFoundStringsIndexesWithObjects);
  console.log(srcFiles);
}
