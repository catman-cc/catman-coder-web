import { DefaultTypeDefinition } from "@/common/core";
import { PeekTypeIcon } from "@/components/TypeDefinition/common";
import { useState } from "react";
import { Handle, Position } from "reactflow";

// 用于渲染表格中的一行数据
interface Props {
  params: Parameter;
}
interface Value {
  id: string;
  type: DefaultTypeDefinition;
  value: string; // 暂时string
}
const ParameterTableLine = (props: Props) => {
  const [parameter, setParameter] = useState(props.params);
  return (
    <div>
      {/* 类型icon */}
      {PeekTypeIcon(parameter.type.type.typeName)}
      {/* 参数名称 */}
      {parameter.type.name}
      {/* 参数值 */}
      {parameter.name}
      {/* 连接点 1. 输入, 2. 输出*/}
      <Handle type="source" position={Position.Left} id={parameter.id} />
      <Handle type="source" position={Position.Right} id={parameter.id} />
    </div>
  );
};

export default ParameterTableLine;
