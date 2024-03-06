import "reactflow/dist/style.css";
import ReactFlow, {
  Controls,
  Background,
  Panel,
  updateEdge,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  addEdge,
  MarkerType,
  EdgeLabelRenderer,
  BaseEdge,
  getStraightPath,
  useReactFlow,
} from "reactflow";
import { useCallback, useMemo, useRef, useState } from "react";
import { CircleNode } from "@/components/Function/FunctionEditor/CircleNode";
import { Button, Card, Drawer, Input } from "antd";
import IconCN from "@/components/Icon";
import { IfFunctionNode } from "@/components/Function/FunctionEditor/IfFunctionNode";
import { SpELExpressionFunctionNode } from "@/components/Function/FunctionEditor/SpELExpressionFunctionNode";
import { PeekFunctionNode } from "@/components/Function/FunctionEditor/PeekFunctionNode";
import { ReactFlowDataWatcher } from "@/components/Function/FunctionEditor/ReactFlowDataWatcher";
import { SwitchFunctionNode } from "@/components/Function/FunctionEditor/SwitchFunctionNode";
import { FunctionRC } from "@/components/Function/FunctionEditor/Provider";

// 导入ReactFlow样式
// 配置容器大小
// 确保组件ID唯一
const initialNodes = [
  // {
  //   id: "1",
  //   type: "circleNode",
  //   data: { child: "Start" },
  //   position: { x: 220, y: 20 },
  // },
  {
    id: "2",
    type: "switchFunctionNode",
    data: { child: "Start" },
    position: { x: 300, y: 20 },
    // style: {
    //   backgroundColor: "rgb(40,147,211)",
    // },
  },
  {
    id: "3",
    type: "ifFunctionNode",
    data: { child: "Start" },
    position: { x: 300, y: 260 },
    // style: {
    //   backgroundColor: "rgb(40,147,211)",
    // },
  },
  // {
  //   id: "2-1",
  //   type: "peekFunctionNode",
  //   data: { child: "Start" },
  //   position: { x: 320, y: 20 },
  //   // style: {
  //   //   backgroundColor: "rgb(40,147,211)",
  //   // },
  // },
  // {
  //   id: "2-2",
  //   type: "peekFunctionNode",
  //   data: { child: "Start" },
  //   position: { x: 320, y: 80 },
  //   // style: {
  //   //   backgroundColor: "rgb(40,147,211)",
  //   // },
  // },
  // {
  //   id: "3",
  //   type: "spELExpressionFunctionNode",
  //   data: { child: "Start" },
  //   position: { x: 300, y: 20 },
  //   // style: {
  //   //   backgroundColor: "rgb(40,147,211)",
  //   // },
  // },
  // {
  //   id: "B-3",
  //   type: "ifFunctionNode",
  //   data: { label: "Child 3" },
  //   position: { x: 0, y: 50 },
  //   parentNode: "2",
  //   extent: "parent",
  //   draggable: false,
  //   style: {
  //     x: 0,
  //   },
  // },
];
const initialEdges = [
  {
    id: "2-1",
    source: "2",
    type: "customEdge",
    target: "3",
    sourceHandle: "1",
    targetHandle: "entry",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY }) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              size={"small"}
              type={"text"}
              icon={<IconCN type={"icon-delete"} />}
            ></Button>
            <Input size={"small"} />
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export interface FunctionFlowEditorProps {
  schema: FunctionInfoSchema;
}

/**
 * 基于ReactFlow实现的函数流程编辑器,用于实现函数流程的可视化编辑
 * 为了实现动态注册函数节点的能力,其nodeTypes属性应提升至ApplicationContext中.
 * 同时使用Processor在应用加载时完成函数节点的注册工作
 *
 * @constructor
 */
export const FunctionFlowEditor = () => {
  const [showDrawer, setShowDrawer] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      circleNode: CircleNode,
      ifFunctionNode: IfFunctionNode,
      spELExpressionFunctionNode: SpELExpressionFunctionNode,
      peekFunctionNode: PeekFunctionNode,
      switchFunctionNode: SwitchFunctionNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      customEdge: CustomEdge,
    }),
    []
  );

  // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  //
  // const onConnect = useCallback(
  //   (connection) => setEdges((eds) => addEdge(connection, eds)),
  //   [setEdges],
  // );
  // const edgeUpdateSuccessful = useRef(true);
  //
  // const onEdgeUpdateStart = useCallback(() => {
  //   edgeUpdateSuccessful.current = false;
  // }, []);
  //
  // const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
  //   edgeUpdateSuccessful.current = true;
  //   setEdges((els) => updateEdge(oldEdge, newConnection, els));
  // }, []);
  //
  // const onEdgeUpdateEnd = useCallback((_, edge) => {
  //   if (!edgeUpdateSuccessful.current) {
  //     setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  //   }
  //
  //   edgeUpdateSuccessful.current = true;
  // }, []);

  const edgeUpdateSuccessful = useRef(true);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onEdgeUpdateStart = useCallback((e, h, c, d) => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, []);
  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const [loopContext, setLoopContext] = useState({
    root: "1",
    loopContext: {} as LoopReferenceContext,
  });
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <FunctionRC value={loopContext} setValue={setLoopContext}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          snapToGrid
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          onConnect={onConnect}
          onError={(error) => console.error("error", error)}
          fitView
          attributionPosition="top-right"
        >
          <Controls />
          <Background />
          <Panel
            position="top-left"
            style={{
              height: "90%",
              width: "200px",
              // border: "1px solid #000",
              // borderRadius: "5px",
            }}
          >
            <Card
              size={"small"}
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <IconCN type={"icon-icon-function-cate-copy"} />
                    选择函数
                  </div>
                  <div>
                    <Button
                      size="small"
                      type="default"
                      icon={
                        <IconCN
                          type={"icon-settings"}
                          onClick={(e) => setShowDrawer(!showDrawer)}
                        />
                      }
                    ></Button>
                  </div>
                </div>
              }
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <Drawer
                title="任务配置"
                width={520}
                closable={false}
                onClose={() => {
                  setShowDrawer(false);
                }}
                open={showDrawer}
              >
                <ReactFlowDataWatcher />
              </Drawer>
            </Card>
          </Panel>
        </ReactFlow>
      </FunctionRC>
    </div>
  );

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          onConnect={onConnect}
          isValidConnection={(connection) => {
            // 验证是否可以连接两个节点,这里暂时不实现,后面应该会限制单链接
            return true;
          }}
          style={{ height: "100%", width: "100%" }}
        >
          <Panel
            position="top-left"
            style={{
              height: "90%",
              width: "200px",
              // border: "1px solid #000",
              // borderRadius: "5px",
            }}
          >
            <Card
              size={"small"}
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <IconCN type={"icon-icon-function-cate-copy"} />
                    选择函数
                  </div>
                  <div>
                    <Button
                      size="small"
                      type="default"
                      icon={<IconCN type={"icon-settings"} />}
                    ></Button>
                  </div>
                </div>
              }
              style={{
                width: "100%",
                height: "100%",
              }}
            ></Card>
          </Panel>
          <Controls />
          <Background />
          <Drawer
            title="任务配置"
            width={520}
            closable={false}
            onClose={() => {
              setShowDrawer(false);
            }}
            open={showDrawer}
          ></Drawer>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};
