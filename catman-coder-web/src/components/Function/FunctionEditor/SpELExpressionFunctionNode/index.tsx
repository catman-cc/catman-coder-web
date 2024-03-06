import { Button, Card, Input, List, Tag } from "antd";
import IconCN from "@/components/Icon";
import { Handle, Position } from "reactflow";
import "./index.less";

const InnerNode = ({
  prefix,
  value,
  color,
}: {
  prefix: string;
  value?: string;
  color: string;
}) => {
  return (
    <div className="custom-node__select">
      <div
        style={{
          height: "1em",
        }}
      >
        {/*{prefix}*/}
      </div>
      <div
        style={{
          position: "relative",
        }}
      >
        <Handle
          type={"source"}
          position={Position.Right}
          id={prefix + "b"}
          style={{
            width: "10px",
            height: "10px",
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
export const SpELExpressionFunctionNode = ({
  r,
  prefix,
}: {
  r?: boolean;
  prefix?: string;
}) => {
  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
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
            <IconCN type={"icon-biaodashi-zifuchuanshifoupipei"} />
            从jwt中提取token角色
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
      {/*<div>*/}
      {/*  <Button size={"small"}>新增分支</Button>*/}
      {/*  <Button size={"small"}>默认分支</Button>*/}
      {/*</div>*/}
      <Handle type={"target"} position={Position.Left} id={prefix + "aa"} />
      <div
        style={{
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
        // style={{
        //   display: "flex",
        //   justifyContent: "space-between",
        // }}
        >
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

          {/*<Input*/}
          {/*  size={"small"}*/}
          {/*  placeholder={"请输入条件"}*/}
          {/*  defaultValue={"{token.auth.isLogin}"}*/}
          {/*/>*/}
        </div>
        {/*<List*/}
        {/*  size={"small"}*/}
        {/*  dataSource={[true, false]}*/}
        {/*  renderItem={(item) => {*/}
        {/*    return (*/}
        {/*      <InnerNode*/}
        {/*        prefix={item + ""}*/}
        {/*        value={item + ""}*/}
        {/*        color={item ? "green" : "gray"}*/}
        {/*      />*/}
        {/*    );*/}
        {/*  }}*/}
        {/*/>*/}
      </div>
    </Card>
  );
};
