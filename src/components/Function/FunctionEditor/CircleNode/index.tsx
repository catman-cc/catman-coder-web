import { ReactNode, useState } from "react";
import { Handle, NodeProps, NodeToolbar, Position } from "reactflow";
import "./index.less";
import { Button, Card, Divider, Popover } from "antd";
import IconCN from "@/components/Icon";
export interface CircleNodeData {
  child?: ReactNode;
}
export const CircleNode = ({ data }: NodeProps<CircleNodeData>) => {
  return (
    <Popover
      content={
        <Popover
          content={
            <div>
              <Card
                title={
                  <div
                    style={{
                      width: "200px",
                    }}
                  >
                    <IconCN type={"icon-icon-function-cate-copy"} />
                    选择函数
                  </div>
                }
              >
                <div>
                  <IconCN type={"icon-panduan1"} />
                  IF逻辑判断
                </div>
                <div>
                  <IconCN type={"icon-24gf-branches"} />
                  SWITCH逻辑判断
                </div>
                <div>
                  <IconCN type={"icon-Recycle"} />
                  循环
                </div>
                <div>
                  <IconCN type={"icon-HttpValueProviderQuicker"} />
                  HTTP请求
                </div>
                <div>
                  <IconCN type={"icon-resources"} />
                  SQL请求
                </div>
                <div>
                  <IconCN type={"icon-code2"} />
                  脚本语言
                </div>
              </Card>
            </div>
          }
        >
          <Button
            size={"small"}
            icon={<IconCN type={"icon-add3"} />}
            type={"text"}
          >
            链接子任务
          </Button>
        </Popover>
      }
      placement={"right"}
    >
      <div className={"circle"}>
        {data.child}
        <Handle type="source" position={Position.Right} id="a" />
      </div>
    </Popover>
  );
};
