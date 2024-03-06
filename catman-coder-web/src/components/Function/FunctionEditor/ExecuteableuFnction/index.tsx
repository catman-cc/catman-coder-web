import { Button, Card, Dropdown, Input, MenuProps } from "antd";
import IconCN from "@/components/Icon";
import {
  Handle,
  NodeToolbar,
  Position,
  useNodeId,
  useOnSelectionChange,
  useReactFlow,
} from "reactflow";
import "./index.less";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReactFlow } from "@/components/Function/FunctionEditor/typeings";
import { findEdge } from "@/components/Function/FunctionEditor/Helper";
import { useFunctionContext } from "@/components/Function/FunctionEditor/Provider";

export type ExecutableFunctionNodeBodyCreator = (
  _flow: ReactFlow.ReactFlowInstance,
  _node: ReactFlow.Node,
  _props: ExecutableFunctionNodeData,
) => React.ReactNode;

/**
 * 可执行函数节点的的数据信息
 */
export interface ExecutableFunctionNodeData {
  /**
   * 初始化方法,当节点初次创建时调用
   * @param flow 当前的flow实例
   * @param node 当前的节点
   */
  initFunction?: (
    _flow: ReactFlow.ReactFlowInstance,
    _node: ReactFlow.Node,
  ) => boolean;
  /**
   * 图标
   */
  icon?: React.ReactNode | string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 节点的主体部分
   * @param _flow 当前的flow实例
   * @param _node 当前的节点
   * @param _props 当前的节点属性
   */
  body?: React.ReactNode | string | ExecutableFunctionNodeBodyCreator;
  /**
   * 是否创建入口连接点
   */
  createEntryHandler?: boolean;
}
/**
 * 条件函数节点
 * 一个条件函数有四个部分:
 * - 入口连接点,用于接收上游节点的数据
 * - 条件判断部分,该部分通过调用另一个函数得到一个布尔值,用于判断是否执行true子节点或者false子节点
 * - true子节点,如果条件判断为true,则执行该子节点,可为空
 * - false子节点,如果条件判断为false,则执行该子节点,可为空
 *
 */
export const ExecutableFunctionNode = (props: ExecutableFunctionNodeData) => {
  // 初始化时,调用的方法
  const [init, setInit] = useState(false);
  const nid = useNodeId();
  const flow = useReactFlow();

  const container = useRef<HTMLDivElement>(null);
  const [showBody, setShowBody] = useState(true);

  const [nameHover, setNameHover] = useState(false);

  // const [cardHover, setCardHover] = useState(false);
  // const debounceCardHover = useDebounce(cardHover, { wait: 200 });
  // const [toolBarHover, setToolBarHover] = useState(false);
  // const debounceToolBarHover = useDebounce(toolBarHover, { wait: 200 });
  // const toolBarVisiable = debounceCardHover || debounceToolBarHover;

  const [toolBarShouldVisiable, setToolBarShouldVisiable] = useState(false);
  const fc = useFunctionContext();
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setToolBarShouldVisiable(nodes.some((n) => n.id === nid));

      fc.drawer = {};
    },
  });

  useEffect(() => {
    if (init) {
      return;
    }
    if (props.initFunction) {
      setInit(true);
      props.initFunction(flow, flow.getNode(nid!)!);
    }
  }, [flow, container, nid]);

  const createIcon = (icon?: React.ReactNode | string) => {
    if (!icon) {
      return <IconCN type={"icon-model-training"} />;
    }
    if (typeof icon === "string") {
      return <IconCN type={icon} />;
    }
    return icon;
  };

  const createName = (name?: string) => {
    if (!name) {
      return "未命名";
    }
    return name;
  };
  const createBody = (
    body?: React.ReactNode | string | ExecutableFunctionNodeBodyCreator,
  ) => {
    if (!body) {
      return "";
    }
    if (typeof body === "string") {
      return body;
    }
    if (typeof body === "function") {
      return body(flow, flow.getNode(nid!)!, props);
    }
    return body;
  };

  const moreOptions = useMemo<MenuProps["items"]>(() => {
    return [
      {
        key: "remove",
        label: (
          <div>
            <Button
              size={"small"}
              type={"text"}
              icon={<IconCN type={"icon-delete"} />}
              onClick={() => {
                // 获取当前节点以及和当前节点关联的边
                const node = flow.getNode(nid!);
                const edges = findEdge(flow, node!);
                // 移除当前节点和关联的边
                flow.deleteElements({
                  nodes: [node!],
                  edges,
                });
              }}
            >
              移除
            </Button>
          </div>
        ),
      },
      {
        key: "chow-child",
        label: (
          <div>
            <Button
              size={"small"}
              type={"text"}
              icon={<IconCN type={"icon-show2"} />}
              onClick={() => {
                // 获取当前节点以及和当前节点关联的边
                const node = flow.getNode(nid!);
                const edges = findEdge(flow, node!);
                // 移除当前节点和关联的边
                flow.deleteElements({
                  nodes: [node!],
                  edges,
                });
              }}
            >
              展示/隐藏子任务节点
            </Button>
          </div>
        ),
      },
    ] as MenuProps["items"];
  }, []);
  return (
    <Card
      ref={container}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/*  入口连接点*/}
          {props.createEntryHandler && (
            <Handle type={"target"} position={Position.Left} id={"entry"} />
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "auto",
              fontSize: "11px",
              lineHeight: "100%",
              paddingRight: "10px",
            }}
          >
            <Button
              size={"small"}
              type={"link"}
              icon={createIcon(props.icon)}
            />
            <Input
              variant={nameHover ? "outlined" : "borderless"}
              size={"small"}
              value={createName(props.name)}
              onMouseEnter={() => {
                setNameHover(true);
              }}
              onMouseLeave={() => {
                setNameHover(false);
              }}
            />
          </div>
          <div>
            <Button
              size={"small"}
              type={"text"}
              icon={
                <IconCN
                  type={
                    showBody ? "icon-Arrowbottomdown" : "icon-roundrightfill"
                  }
                />
              }
              onClick={() => setShowBody(!showBody)}
            />
          </div>
          <NodeToolbar
            position={Position.Top}
            align={"end"}
            isVisible={toolBarShouldVisiable}
          >
            <div>
              <Dropdown
                menu={{
                  items: moreOptions,
                }}
              >
                <Button
                  size={"small"}
                  type={"text"}
                  icon={<IconCN type={"icon-more2"} />}
                />
              </Dropdown>
              <Button
                size={"small"}
                type={"text"}
                icon={<IconCN type={"icon-job-execute"} />}
              />
              <Button
                size={"small"}
                type={"text"}
                icon={<IconCN type={"icon-debug3"} />}
              />
              {/*icon-roundrightfill*/}
            </div>
          </NodeToolbar>
        </div>
      }
    >
      {showBody && createBody(props.body)}
    </Card>
  );
};
