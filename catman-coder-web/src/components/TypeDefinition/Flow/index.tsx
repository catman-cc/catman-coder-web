import dagre from "dagre";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  Position,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";

import { Switch } from "antd";
import "reactflow/dist/style.css";
import MonacoCodeEditor from "../../CodeEditor";
import TypeDefinitionCard from "./TypeDefinition";
import {
  FlowInfo,
  anotherConvert,
  convert,
} from "./TypeDefinition/TypeDefinionHandler";

interface Props {
  td: TypeDefinition;
}
const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));

export default function FlowExample(props: Props) {
  // 不要随意调整下面参数的位置,初始化时拥有依赖性
  const nodeTypes = useMemo(() => ({ td: TypeDefinitionCard }), []);
  const [expand, setExpand] = useState(false);
  const [source, setSouce] = useState(false);

  const nodeWidth = useCallback(() => {
    return expand ? 150 : 150;
  }, [expand]);
  const nodeHeight = useCallback(() => {
    return expand ? 50 : 120;
  }, [expand]);

  const getLayoutedElements = (
    { nodes, edges }: FlowInfo,
    direction = "LR"
  ): FlowInfo => {
    const isHorizontal = direction === "LR"; // LR|TB
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth(), height: nodeHeight() });
      // dagreGraph.setNode(node.id, { width: nodeWidth(), height: (node.data.td?.type.items || 1) * 40 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);
    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? Position.Left : Position.Top;
      node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth() / 2,
        y: nodeWithPosition.y - nodeHeight() / 2,
      };

      return node;
    });

    return { nodes, edges };
  };

  const [flowInfo, setFlowInfo] = useState<FlowInfo>(
    getLayoutedElements(expand ? convert(props.td) : anotherConvert(props.td))
  );
  const [flowJson, setFlowJson] = useState(JSON.stringify(flowInfo));
  const [nodes, setNodes] = useState<Node[]>(flowInfo?.nodes || []);
  const [edges, setEdges] = useState<Edge[]>(flowInfo?.edges || []);

  // const [flowInfo, setFlowInfo] = useState<FlowInfo>()
  useEffect(() => {
    const fi = getLayoutedElements(
      expand ? convert(props.td) : anotherConvert(props.td)
    );
    setFlowInfo(getLayoutedElements(fi));
    setFlowJson(JSON.stringify(fi));
    setNodes(fi.nodes);
    setEdges(fi.edges);
  }, [expand, props.td]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // useEffect(() => {
  //     setFlowInfo(getLayoutedElements(expand ? convert(props.td) : anotherConvert(props.td)))
  // }, [props, expand])

  // useEffect(() => {

  //     if (flowInfo) {
  //         setNodes(flowInfo.nodes)
  //         setEdges(flowInfo.edges)
  //         setFlowJson(JSON.stringify(flowInfo))
  //     }

  // }, [flowInfo])

  // const onConnect = useCallback(
  //     (params) =>
  //         setEdges((eds) =>
  //             addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
  //         ),
  //     []
  // );
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="space-y-2" style={{ width: "100%", height: "100%" }}>
      <div className="space-x-3 ">
        <Switch
          checked={source}
          checkedChildren="源码"
          unCheckedChildren="源码"
          onChange={() => {
            setSouce(!source);
          }}
        />
        <Switch
          // style={source ? {
          //     display: "none"
          // } : {}}
          checked={expand}
          checkedChildren="展开节点"
          unCheckedChildren="展开节点"
          onChange={() => {
            setExpand(!expand);
          }}
        />
      </div>
      {!source ? (
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={() => {}}
          fitView
        >
          <Controls />
          <MiniMap />
          {/* <Controls /> */}
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      ) : (
        <MonacoCodeEditor
          code={flowJson}
          config={{
            height: "80vh",
          }}
        />
      )}
    </div>
  );
}
