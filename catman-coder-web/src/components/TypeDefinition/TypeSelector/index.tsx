import { ComplexType } from "@/common/core.ts";
import { SettingOutlined } from "@ant-design/icons";
import { Menu, Space } from "antd";
import * as React from "react";
import { PeekTypeIcon } from "../common";

function getMenuItem(name: string, label: string) {
  return {
    key: name,
    icon: PeekTypeIcon(name),
    label: (
      <Space>
        {label}
        <SettingOutlined size={11} />
      </Space>
    ),
    value: name,
  };
}

const TypeMenu = [
  {
    key: "basic",
    label: "基础数据类型",
    type: "group",
    children: [
      getMenuItem("string", "字符串"),
      getMenuItem("number", "数值"),
      getMenuItem("boolean", "布尔"),
    ],
  },
  {
    key: "complex",
    label: "复合数据类型",
    type: "group",
    children: [
      getMenuItem("array", "集合"),
      getMenuItem("map", "对象"),
      getMenuItem("struct", "自定义对象"),
    ],
  },
  {
    key: "advanced",
    label: "高级数据类型",
    type: "group",
    children: [
      getMenuItem("refer", "引用"),
      getMenuItem("slot", "扩展点"),
      getMenuItem("enum", "枚举"),
      getMenuItem("generic", "泛型"),
      getMenuItem("anonymous", "匿名类型"),
    ],
  },
];

function buildComplexType(name: string) {
  const type = new ComplexType();
  type.typeName = name;
  return type;
}

type Props = {
  type: ComplexType; // 当前所使用的类型,不同的类型将对应着不同的处理逻辑
  completeTheSelection: (_type: ComplexType) => void; // 完成类型选择后,需要将选择的类型传递给父组件
};

type State = {
  type: ComplexType;
};

/**
 * 渲染类型处理面板,该面板用于展示类型定义
 */
export default class TypeSelectorPanel extends React.Component<Props, State> {
  constructor(props: Readonly<Props> | Props) {
    super(props);
  }
  render() {
    return (
      <div>
        <Menu
          //     onMouseLeave={()=>{
          //     this.props.completeTheSelection(this.state.type)
          // }}
          // onBlur={() => {
          //     this.props.completeTheSelection(this.state.type)
          // }}
          onSelect={({ key }) => {
            // 需要对扩展点进行特殊处理
            this.props.completeTheSelection(buildComplexType(key));
          }}
          onClick={({ key }) => {
            // 需要对扩展点进行特殊处理
            this.props.completeTheSelection(buildComplexType(key));
          }}
          style={{ fontSize: 13 }}
          activeKey={this.props.type.typeName}
          defaultSelectedKeys={[this.props.type.typeName]}
          defaultOpenKeys={[this.props.type.typeName]}
          mode="inline"
          items={TypeMenu}
        />
      </div>
    );
  }
}
