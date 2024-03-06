import { Button, Card, Input, List } from "antd";
import IconCN from "@/components/Icon";
import {
  Handle,
  MarkerType,
  Position,
  useNodeId,
  useReactFlow,
} from "reactflow";
import "./index.less";
import { useEffect, useRef, useState } from "react";
import {
  addSingleEdge,
  addSingleEdges,
  updateEdge,
} from "@/components/Function/FunctionEditor/Helper";

/**
 * 条件函数连接点,主要是提供true和false两个节点
 * @param id
 * @param value
 * @param color
 * @constructor
 */
const IfFunctionHandler = ({
  id,
  value,
  color,
}: {
  id: string;
  value?: string;
  color: string;
}) => {
  return (
    <div className="custom-node__select">
      <div
        style={{
          height: "1em",
        }}
      ></div>
      <div
        style={{
          position: "relative",
        }}
      >
        <Handle
          type={"source"}
          position={Position.Right}
          id={value}
          style={{
            width: "10px",
            height: "10px",
            right: "-40px",
            backgroundColor: color,
          }}
        >
          <div
            style={{
              position: "relative",
              top: "50%",
              right: "-20px",
              transform: "translate(-50%, -50%)",
            }}
          >
            {value}
          </div>
        </Handle>
      </div>
    </div>
  );
};

/**
 * 条件函数节点
 * 一个条件函数有四个部分:
 * - 入口连接点,用于接收上游节点的数据
 * - 条件判断部分,该部分通过调用另一个函数得到一个布尔值,用于判断是否执行true子节点或者false子节点
 * - true子节点,如果条件判断为true,则执行该子节点,可为空
 * - false子节点,如果条件判断为false,则执行该子节点,可为空
 *
 * @param r
 * @param prefix
 * @constructor
 */
export const IfFunctionNode = ({}: { r?: boolean; prefix?: string }) => {
  const [init, setInit] = useState(false);
  const nid = useNodeId();
  const flow = useReactFlow();
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (init) {
      return;
    }
    // 节点初次创建时,根据需要判断是否添加true子节点和false子节点
    if (flow && container && nid) {
      setInit(true);
      // 获取当前节点的位置,用于计算true和false节点的位置
      const node = flow.getNode(nid!);
      const position = node!.position!;
      const nw = container.current?.clientWidth;
      const nh = container.current?.clientHeight;
      const baseX = position?.x + nw!;
      const baseY = position?.y + nh! / 2;

      // 理论上此处应该使用随机数作为ID,但是react会调用两次渲染,会导致生成两组节点,所以,这里使用nodeId+true/false作为ID
      const trueNodeId = nid + "@true-peek";
      const falseNodeId = nid + "@false-peek";

      flow.addNodes([
        {
          id: trueNodeId,
          type: "peekFunctionNode",
          draggable: true,
          data: { child: "true" },
          position: { x: baseX + 40, y: baseY - 40 },
        },
        {
          id: falseNodeId,
          type: "peekFunctionNode",
          draggable: true,
          data: { child: "false" },
          position: { x: baseX + 40, y: baseY + 20 },
        },
      ]);
      // 和node一样的道理
      const trueEdgeID = trueNodeId + "-edge";
      const falseEdgeID = falseNodeId + "-edge";

      addSingleEdges(flow, [
        {
          id: trueEdgeID,
          source: nid!,
          target: trueNodeId,
          sourceHandle: "true",
          targetHandle: "entry",
          markerEnd: { type: MarkerType.ArrowClosed },
          updatable: "target",
        },
        {
          id: falseEdgeID,
          source: nid!,
          target: falseNodeId,
          sourceHandle: "false",
          targetHandle: "entry",
          markerEnd: { type: MarkerType.ArrowClosed },
          updatable: "target",
        },
      ]);
    }
  }, [flow, container, nid]);

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
          <Handle type={"target"} position={Position.Left} id={"entry"} />
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
            <IconCN type={"icon-panduanjiedian"} />
            判断用户权限
          </div>
          <div>
            <Button
              size={"small"}
              type={"text"}
              icon={<IconCN type={"icon-more2"} />}
            />
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
          </div>
        </div>
      }
    >
      <div
        style={{
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              paddingLeft: "10px",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <Button
              size={"small"}
              type={"dashed"}
              icon={<IconCN type={"icon-biaodashi-zifuchuanshifoupipei"} />}
            />
            <Input defaultValue={"{token.auth.isLogin}"} size={"small"} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingLeft: "10px",
            }}
          >
            <Button
              size={"small"}
              type={"dashed"}
              icon={<IconCN type={"icon-editor2"} />}
            />
            <Button
              size={"small"}
              type={"dashed"}
              icon={<IconCN type={"icon-file-word-fill"} />}
            />
            <Button
              size={"small"}
              type={"dashed"}
              icon={<IconCN type={"icon-tips2"} />}
            />
            <Button
              size={"small"}
              type={"dashed"}
              icon={<IconCN type={"icon-Share"} />}
            />
            <Button
              size={"small"}
              type={"dashed"}
              icon={<IconCN type={"icon-settings4"} />}
            />
            <Button
              size={"small"}
              type={"text"}
              icon={<IconCN type={"icon-show_zhediezhankai_xiangshang"} />}
            />
          </div>
        </div>
        <List
          size={"small"}
          dataSource={[true, false]}
          renderItem={(item) => {
            return (
              <IfFunctionHandler
                id={nid!}
                value={item + ""}
                color={item ? "green" : "gray"}
              />
            );
          }}
        />
      </div>
    </Card>
  );
};
