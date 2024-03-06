import { DefaultTypeDefinition, TypeDefinition } from "catman-coder-core";
import { Card, Space } from "antd";
import { useState } from "react";
import { Handle, HandleType, Position } from "reactflow";
import { PeekTypeIcon } from "../../common";

interface Props {
  data: {
    root: boolean;
    td: TypeDefinition;
    type?: HandleType | "all"; // 连接点类型}
  };
}
/**
 * 类型定义卡片
 */
const TypeDefinitionCard = (props: Props) => {
  const [td, setTd] = useState(DefaultTypeDefinition.ensure(props.data.td));
  const createChild = () => {
    const base = 60;
    let i = 0;
    return td.type.items.map((c) => {
      i++;
      return (
        <div>
          {PeekTypeIcon(c.type.typeName)}

          {/* <Avatar icon={PeekTypeIcon(c.type.typeName)} /> */}
          {c.name}
          <div>
            {!props.data.root && (
              <Handle
                type="target"
                position={Position.Left}
                id={c.id}
                style={{
                  top: base + i * 30,
                  // left: 10
                }}
              />
            )}
            {c.type.isComplex() && (
              <Handle
                type="source"
                position={Position.Right}
                id={c.id}
                style={{
                  top: base + i * 30,
                  // right: 10
                }}
              />
            )}
          </div>
        </div>
      );
    });
  };
  return td.type.isComplex() ? (
    <Space direction="vertical" size={16}>
      <Card
        title={
          <div>
            {PeekTypeIcon(td.type.typeName)}
            {/* <Avatar icon={PeekTypeIcon(td.type.typeName)} /> */}
            {td.name}
            {/* <Handle type="target" position={Position.Left} id={td.id} />
                            <Handle type="source" position={Position.Right} id={td.id} /> */}
          </div>
        }
        // extra={<a href="#">More</a>}
        // style={{ width: 300 }}
      >
        {/* 此处渲染参数定义,复合类型将拥有 */}
        <Space direction="vertical">{createChild()}</Space>
      </Card>
    </Space>
  ) : (
    <div
      style={{
        width: "100%",
      }}
    >
      <Card>
        {PeekTypeIcon(td.type.typeName)}
        {/* <Avatar icon={PeekTypeIcon(td.type.typeName)} /> */}
        {td.name}
        <Handle type="target" position={Position.Left} id="input" />
        <Handle type="source" position={Position.Right} id="output" />
      </Card>
    </div>
  );
  // <div className="t-d-card">
  //     <Handle type='target' position={Position.Top} ></Handle>
  // </div>
};
export default TypeDefinitionCard;
