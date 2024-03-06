// 处理类型,复合类型的TD,默认为一组,type: 'group',
// 普通类型的渲染为普通节点
import { Edge, Node } from "reactflow";

import { DefaultTypeDefinition, TypeDefinition } from "catman-coder-core";

/**
 * 存放流程信息
 */
export interface FlowInfo {
  nodes: Node[];
  edges: Edge[];
}

/**
 *  将类型定义转换为节点定义,同时根据需求在左侧(输入)或者右侧(输出)生成handle
 * @param td 类型定义
 * @returns  节点集合
 */
export const convert = (td: TypeDefinition): FlowInfo => {
  const dtd = DefaultTypeDefinition.ensure(td);
  const flowInfo: FlowInfo = {
    nodes: [],
    edges: [],
  };

  flowInfo.nodes.push({
    id: dtd.id,
    // type: dtd.type.isComplex() ? 'group' : "input",
    type: "input",
    data: { label: dtd.name },
    position: { x: 0, y: 0 },
    // style: {
    //     width: 40,
    //     height: 60,
    // },
  });

  dtd.recursionChildWithCallback((c, p) => {
    flowInfo.nodes.push({
      id: c.id,
      // type: c.type.isComplex() ? 'group' : "input",
      // type: "input",
      data: { label: c.name },
      position: { x: 0, y: 0 },
      // style: {
      //     width: 40,
      //     height: 60,
      // },
      // parentNode: p.id,
      // ...(p.type.isComplex() ? { extent: "parent" } : {})
    });

    flowInfo.edges.push({
      id: `${p.id}@${c.id}`,
      source: p.id,
      target: c.id,
      type: "edgeType",
      animated: true,
    });
  });

  return flowInfo;
};

export const anotherConvert = (td: TypeDefinition): FlowInfo => {
  const dtd = DefaultTypeDefinition.ensure(td);
  const flowInfo: FlowInfo = {
    nodes: [],
    edges: [],
  };

  flowInfo.nodes.push({
    id: dtd.id,

    // type: dtd.type.isComplex() ? 'group' : "input",
    type: "td",
    data: { td: dtd, root: true },
    position: { x: 0, y: 0 },
    // style: {
    //     width: 40,
    //     height: 60,
    // },
  });

  dtd.recursionChildWithCallback((c, p) => {
    if (c.type.isComplex()) {
      flowInfo.nodes.push({
        id: c.id,
        // type: c.type.isComplex() ? 'group' : "input",
        type: "td",
        data: { td: c, root: false },
        position: { x: 0, y: 0 },
        // style: {
        //     width: 40,
        //     height: 60,
        // },
        // parentNode: p.id,
        // ...(p.type.isComplex() ? { extent: "parent" } : {})
      });

      flowInfo.edges.push({
        id: `${p.id}@${c.id}`,
        source: p.id,
        target: c.id,
        type: "edgeType",
        animated: true,
        sourceHandle: c.id,
        // targetHandle: c.id
      });
    }
  });

  return flowInfo;
};
