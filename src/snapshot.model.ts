export interface Meta {
  node_fields: string[];
  node_types: any[];
  edge_fields: string[];
  edge_types: any[];
  trace_function_info_fields: string[];
  trace_node_fields: string[];
  sample_fields: string[];
  location_fields: string[];
}

export interface Snapshot {
  meta: Meta;
  node_count: number;
  edge_count: number;
  trace_function_count: number;
}

export interface SnapshotRoot {
  snapshot: Snapshot;
  nodes: number[];
  edges: number[];
  trace_function_infos: any[];
  trace_tree: any[];
  samples: any[];
  locations: number[];
  strings: string[];
}
