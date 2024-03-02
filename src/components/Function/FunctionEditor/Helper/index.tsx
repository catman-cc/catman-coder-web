import { MarkerType } from "reactflow";
import { ReactFlow } from "@/components/Function/FunctionEditor/typeings";
import { devWarn } from "@reactflow/core/dist/esm/utils";

export const HandlerNameHelper = {
  encode(belong: string, isSource: boolean, subname: string) {
    return belong + "-" + subname + "-" + (isSource ? "source" : "target");
  },
  decode(name: string) {
    const arr = name.split("-");
    return arr[0];
  },
};
export const NodeHelper = {
  encode(belong: string, subname: string) {
    return belong + "-" + subname;
  },
  decode(name: string) {
    const arr = name.split("-");
    return arr[0];
  },
};

/**
 * 添加边,所有的边都会做去重操作
 * @param flow flow实例
 * @param edges 边数组
 */
export const addSingleEdges = (
  flow: ReactFlow.ReactFlowInstance,
  edges: ReactFlow.Edge[],
) => {
  // 过滤掉edges中重复的边
  const filterEdges = edges.filter((edge, index, self) => {
    return (
      index ===
      self.findIndex(
        (t) => t.source === edge.source && t.target === edge.target,
      )
    );
  });

  // 过滤掉同id的边
  const filter = flow
    .getEdges()
    .filter(
      (existEdge) => !filterEdges.some((edge) => edge.id === existEdge.id),
    );
  flow.setEdges([...filter, ...edges]);
};

/**
 * 更新或者添加边
 * @param flow flow实例
 * @param edge 边
 */
export const updateEdge = (
  flow: ReactFlow.ReactFlowInstance,
  edge: ReactFlow.Edge,
) => {
  const edges = flow.getEdges();
  const index = edges.findIndex((item) => item.id === edge.id);
  if (index !== -1) {
    edges[index] = edge;
  } else {
    edges.push(edge);
  }
  flow.setEdges([...edges]);
};

export const findEdge = (
  flow: ReactFlow.ReactFlowInstance,
  node: ReactFlow.Node,
) => {
  const edges = flow.getEdges();
  return edges.filter(
    (edge) => edge.source === node.id || edge.target === node.id,
  );
};
