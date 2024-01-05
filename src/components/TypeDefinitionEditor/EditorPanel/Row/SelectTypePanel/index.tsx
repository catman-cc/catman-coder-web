import { RawTypeRender } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel/RawTypeRender";
import { ReferTypeRender } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel/ReferTypeRender";
import TypeSelectorPanel from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector";
import { ComplexType } from "@/common/core.ts";
import { Popover } from "antd";

export type SelectTypePanelCreator = (
  type: Core.Type,
  update: (type: Core.Type) => void,
  schema: Core.TypeDefinitionSchema,
  factory: SelectTypePanelFactory,
) => JSX.Element;

export class SelectTypePanelFactory {
  /**
   * 创建器,key值typeName
   */
  creators: {
    [index: string]: SelectTypePanelCreator;
  } = {};
  static create() {
    return new SelectTypePanelFactory();
  }
  constructor() {
    this.creators["string"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      factory,
    ) => {
      return <RawTypeRender type={type} updateType={update} schema={schema} />;
    };
    this.creators["number"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      factory,
    ) => {
      return <RawTypeRender type={type} updateType={update} schema={schema} />;
    };
    this.creators["boolean"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      factory,
    ) => {
      return <RawTypeRender type={type} updateType={update} schema={schema} />;
    };
    this.creators["array"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      factory,
    ) => {
      return <RawTypeRender type={type} updateType={update} schema={schema} />;
    };
    this.creators["map"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      factory,
    ) => {
      return <RawTypeRender type={type} updateType={update} schema={schema} />;
    };
    this.creators["struct"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      factory,
    ) => {
      return <RawTypeRender type={type} updateType={update} schema={schema} />;
    };
    this.creators["refer"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      factory,
    ) => {
      return (
        <ReferTypeRender type={type} updateType={update} schema={schema} />
      );
    };
  }
  render(
    type: Core.Type,
    update: (type: Core.Type) => void,
    schema: Core.TypeDefinitionSchema,
  ): JSX.Element {
    console.log("render type", type.privateItems, type);
    const creator = this.creators[type.typeName];
    if (creator) {
      return (
        <Popover
          trigger={"click"}
          content={
            <TypeSelectorPanel
              type={new ComplexType(type)}
              completeTheSelection={(t) => {
                type.typeName = t.typeName;
                update(t);
              }}
            />
          }
        >
          {creator(type, update, schema, this)}
        </Popover>
      );
    }
    return <div>暂不支持的类型</div>;
  }
}
export interface BasicSelectTypePanelProps {
  type: Core.Type;
  schema: Core.TypeDefinitionSchema;
  updateType: (type: Core.Type) => void;
}
