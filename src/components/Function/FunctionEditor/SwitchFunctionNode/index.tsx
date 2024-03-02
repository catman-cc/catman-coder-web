import {
  Handle,
  NodeProps,
  Position,
  useNodeId,
  useReactFlow,
  useUpdateNodeInternals,
} from "reactflow";
import { ExecutableFunctionNode } from "@/components/Function/FunctionEditor/ExecuteableuFnction";
import { useState } from "react";
import { Badge, Button, Input, List } from "antd";
import "./index.less";
import IconCN from "@/components/Icon";

export interface SwitchFunctionNodeData {}

export const SwitchFunctionNode = (
  props: NodeProps<SwitchFunctionNodeData>,
) => {
  return (
    <div>
      <ExecutableFunctionNode
        {...{
          icon: "icon-24gf-branches",
          name: "Switch",
          body: <SwitchFunctionNodeBody />,
        }}
      />
    </div>
  );
};

interface Item {
  id: string;
  text: string;
}

interface SwitchConditionConfig {
  [key: string]: {
    showHandler: boolean;
  };
}
/**
 * Switch语句需要一个表达式,以及多个case,每个case都是一个条件函数节点
 * @constructor
 */
export const SwitchFunctionNodeBody = () => {
  const flow = useReactFlow();
  const nodeId = useNodeId();
  const updateNodeInternals = useUpdateNodeInternals();

  /**
   * 用于判断是否有默认的case
   */
  const [hasDefault, setHasDefault] = useState(false);
  const [conditionConfig, setConditionConfig] = useState<SwitchConditionConfig>(
    {
      1: {
        showHandler: true,
      },
      2: {
        showHandler: true,
      },
      3: {
        showHandler: true,
      },
    },
  );

  const revertShowHandler = (id: string) => {
    conditionConfig[id].showHandler = !conditionConfig[id].showHandler;
    setConditionConfig(conditionConfig);
    updateNodeInternals(nodeId!);
    const zoom = flow.getZoom();
    // const node = flow.getNode(nodeId!);
    flow.setNodes((nodes) => {
      return nodes.map((item) => {
        if (item.id === nodeId) {
          return {
            ...item,
            position: {
              ...item.position,
              x: item.position.x + 1,
            },
          };
        }
        return item;
      });
    });
    flow.setNodes((nodes) => {
      return nodes.map((item) => {
        if (item.id === nodeId) {
          return {
            ...item,
            position: {
              ...item.position,
              x: item.position.x - 1,
            },
          };
        }
        return item;
      });
    });
    flow.zoomTo(zoom + 0.01);
    flow.zoomTo(zoom);
  };

  const [list, setList] = useState<Item[]>([
    { id: "1", text: "value=='admin'" },
    { id: "2", text: "value=='user'" },
    { id: "3", text: 'value=="guest"' },
  ]);
  return (
    <div className={"plaint-text main-container"}>
      条件:
      <div className={"flex justify-between"}>
        <Button
          size={"small"}
          type={"dashed"}
          icon={<IconCN type={"icon-icon-function-cate-copy"} />}
        />
        <Input size={"small"} />
      </div>
      <List
        size={"small"}
        dataSource={list}
        header={"分支:"}
        className={"plaint-text main-container"}
        renderItem={(item) => (
          <List.Item className={"plaint-text"}>
            <div>
              <Badge count={"满足"} color={"green"} className={"plaint-text"} />
            </div>
            <div>
              <Input
                size={"small"}
                value={item.text}
                addonBefore={<IconCN type={"icon-icon-function-cate-copy"} />}
              />
            </div>
            <div>
              <Button
                size={"small"}
                type={"dashed"}
                icon={<IconCN type={"icon-ico-show"} />}
                onClick={() => revertShowHandler(item.id)}
              />
            </div>

            {conditionConfig[item.id].showHandler && (
              <Handle
                id={item.id}
                type={"source"}
                position={Position.Right}
                className={"switch-condition-handler"}
              />
            )}
          </List.Item>
        )}
      />
    </div>
  );
};
