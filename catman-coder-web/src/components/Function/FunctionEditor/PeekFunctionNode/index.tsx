import "./index.less";
import { Button, List, Popover } from "antd";
import IconCN from "@/components/Icon";
import {
  Handle,
  NodeProps,
  Position,
  useNodeId,
  useReactFlow,
} from "reactflow";

export interface PeekFunctionNodeData {
  id: string;
}
/**
 * 提供一个按钮,用于选择函数节点
 * @constructor
 */
export const PeekFunctionNode = (props: NodeProps<PeekFunctionNodeData>) => {
  const flow = useReactFlow();
  const nodeId = useNodeId();

  const replaceSelfToAnotherNode = (node: unknown) => {
    // 获取当前节点的数据,主要操作是保留id的同时更新指向自己的节点,同时移除由自身指向其他节点的edge
    // 处理边,比如保留指向自己的边,移除由自己指向其他节点的边
    const releationEdges = flow
      .getEdges()
      .filter((edge) => edge.source === nodeId || edge.target === nodeId);
    // 处理当前节点相关的边,移除所有从当前节点指向其他节点的边,即移除所有source为当前节点的边
    flow.setEdges(releationEdges.filter((edge) => edge.source !== nodeId));

    // 更新节点数据
    flow.setNodes(
      flow.getNodes().map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            type: "ifFunctionNode",
          };
        }
        return n;
      }),
    );
  };

  return (
    <div className={"peek-function-node-container"}>
      <Popover
        trigger={"click"}
        content={
          <div>
            <List
              header={<div>选择函数</div>}
              dataSource={[
                "IF逻辑判断",
                "SWITCH逻辑判断",
                "循环",
                "HTTP请求",
                "SQL请求",
                "脚本语言",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Button
                    type={"text"}
                    icon={<IconCN type={"icon-add3"} />}
                    onClick={() => {
                      replaceSelfToAnotherNode({});
                    }}
                  >
                    {item}
                  </Button>
                </List.Item>
              )}
            />
          </div>
        }
      >
        <Button
          type={"dashed"}
          icon={<IconCN type={"icon-add3"} />}
          onClick={() => {}}
        />
      </Popover>
      <Handle type={"target"} position={Position.Left} id={"entry"} />
    </div>
  );
};
