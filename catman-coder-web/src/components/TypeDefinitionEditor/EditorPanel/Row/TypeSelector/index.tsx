import {
  ComplexType,
  ID,
  Scope,
  TypeDefinition,
  TypeDefinitionSchema,
} from "catman-coder-core";
import { TypeDefinitionSelect } from "@/components/TypeDefinitionEditor/EditorPanel/TypeDefinitionSelect";
import { SettingOutlined } from "@ant-design/icons";
import { Menu, Popover, Space } from "antd";
import * as React from "react";
import { PeekTypeIcon } from "./common";

export interface TypeSelectorMenuItem {
  key: string;
  icon: JSX.Element;
  label: JSX.Element;
  value: string;
}

function getMenuItem(name: string, label: string): TypeSelectorMenuItem {
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

function getRefferItem(name: string, label: string): TypeSelectorMenuItem {
  return {
    key: name,
    icon: PeekTypeIcon(name),
    label: (
      <Popover
        trigger={"click"}
        placement={"right"}
        content={
          <div>
            <TypeDefinitionSelect
              onSelect={(value) => {
                console.log(value);
              }}
            />
          </div>
        }
      >
        <Space>
          {label}
          <SettingOutlined size={11} />
        </Space>
      </Popover>
    ),
    value: name,
  };
}

// const TypeMenu = [
//   {
//     key: "basic",
//     label: "基础数据类型",
//     type: "group",
//     children: [
//       getMenuItem("string", "字符串"),
//       getMenuItem("number", "数值"),
//       getMenuItem("boolean", "布尔"),
//       getMenuItem("file", "文件"),
//     ],
//   },
//   {
//     key: "complex",
//     label: "复合数据类型",
//     type: "submenu",
//     children: [
//       getMenuItem("array", "集合"),
//       getMenuItem("map", "对象"),
//       getMenuItem("struct", "固定对象"),
//     ],
//   },
//   {
//     key: "advanced",
//     label: "高级数据类型",
//     type: "submenu",
//     children: [
//       getRefferItem("refer", "引用"),
//       getMenuItem("slot", "扩展点"),
//       getMenuItem("enum", "枚举"),
//       getMenuItem("generic", "泛型"),
//       getMenuItem("anonymous", "匿名类型"),
//     ],
//   },
// ];

export type TypeSelectorMenuItemFilter = (
  item: TypeSelectorMenuItem
) => boolean;

const TypeMenu: TypeSelectorMenuItem[] = [
  getMenuItem("string", "字符串"),
  getMenuItem("number", "数值"),
  getMenuItem("boolean", "布尔"),
  getMenuItem("file", "文件"),
  getMenuItem("array", "集合"),
  getMenuItem("map", "对象"),
  getMenuItem("struct", "固定对象"),
  getRefferItem("refer", "引用"),
  getMenuItem("slot", "扩展点"),
  getMenuItem("enum", "枚举"),
  getMenuItem("generic", "泛型"),
  getMenuItem("anonymous", "匿名类型"),
];

function buildComplexType(name: string): [ComplexType, TypeDefinitionSchema?] {
  const type = new ComplexType();
  const schema = {
    root: "",
    context: {},
    definitions: {},
  } as TypeDefinitionSchema;
  schema.context.typeDefinitions = schema.definitions;

  type.typeName = name;
  if (name === "array") {
    const itemId = ID();
    // 如果是集合类型,则为其添加一个默认元素elements
    type.sortedAllItems.push({
      itemId: itemId,
      name: "elements",
      scope: Scope.PRIVATE,
    });
    schema.definitions[itemId] = {
      id: itemId,
      name: "elements",
      scope: Scope.PRIVATE,
      type: ComplexType.ofType("string"),
    } as unknown as TypeDefinition;
  }
  return [type, schema];
}

type Props = {
  type: ComplexType; // 当前所使用的类型,不同的类型将对应着不同的处理逻辑
  completeTheSelection: (
    _type: ComplexType,
    _schema?: TypeDefinitionSchema
  ) => void; // 完成类型选择后,需要将选择的类型传递给父组件
  filter?: TypeSelectorMenuItemFilter;
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
    const menus = TypeMenu.filter((item) => {
      if (this.props.filter) {
        return this.props.filter(item);
      }
      return true;
    });
    return (
      <div>
        <Menu
          mode="vertical"
          onSelect={({ key }) => {
            // 需要对扩展点进行特殊处理
            console.log("select", key);
            this.props.completeTheSelection(...buildComplexType(key));
          }}
          onClick={({ key }) => {
            // if (key === "slot") {
            //   findAllSimples().then((res) => {
            //     console.log(res);
            //   });
            // }
            // console.log("select233", key);
            // // 需要对扩展点进行特殊处理
            // this.props.completeTheSelection(buildComplexType(key));
          }}
          style={{ fontSize: 13 }}
          activeKey={this.props.type.typeName}
          defaultSelectedKeys={[this.props.type.typeName]}
          defaultOpenKeys={[this.props.type.typeName]}
          items={menus}
        />
      </div>
    );
  }
}
