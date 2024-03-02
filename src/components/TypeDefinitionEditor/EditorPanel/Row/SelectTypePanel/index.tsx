import { ComplexType } from "@/common/core.ts";
import { RawTypeRender } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel/RawTypeRender";
import { ReferTypeRender } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel/ReferTypeRender";
import TypeSelectorPanel, { TypeSelectorMenuItemFilter } from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector";
import { Popover } from "antd";
import { EnumTypeRender } from "./EnumTypeRender";

export type SelectTypePanelCreator = (
  _type: Core.Type,
  _update: (_type: Core.Type, schema?: Core.TypeDefinitionSchema) => void,
  _schema: Core.TypeDefinitionSchema,
  _factory: SelectTypePanelFactory,
  _disabled?: boolean,
  _filter?: TypeSelectorMenuItemFilter
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
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    };
    this.creators["number"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    };
    this.creators["boolean"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    };
    this.creators["slot"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    }
    this.creators["file"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    }
    this.creators["anonymous"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    };
    this.creators["any"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    };
    this.creators["array"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    };
    this.creators["map"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    };
    this.creators["struct"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <RawTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    };
    this.creators["refer"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <ReferTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    };
    this.creators["generic"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <ReferTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    }
    this.creators["enum"] = (
      type,
      update,
      schema: Core.TypeDefinitionSchema,
      _factory,
      disabled?: boolean,
      filter?: TypeSelectorMenuItemFilter
    ) => {
      return (
        <EnumTypeRender
          type={type}
          updateType={update}
          schema={schema}
          disabled={disabled}
          filter={filter}
        />
      );
    }
  }
  render(
    type: Core.Type,
    update: (type: Core.Type, schema?: Core.TypeDefinitionSchema) => void,
    schema: Core.TypeDefinitionSchema,
    disabled?: boolean,
    filter?: TypeSelectorMenuItemFilter
  ): JSX.Element {
    const creator = this.creators[type.typeName];
    if (creator) {
      if (disabled) {
        return creator(type, update, schema, this, disabled);
      }
      return (
        <Popover
          trigger={"click"}
          content={
            <TypeSelectorPanel
              type={new ComplexType(type)}
              completeTheSelection={(t, schema) => {
                type.typeName = t.typeName;
                update(t, schema);
              }}
              filter={filter}
            />
          }
        >
          {creator(type, update, schema, this, disabled, filter)}
        </Popover>
      );
    }
    return <div>暂不支持的类型:{type.typeName}</div>;
  }
}
export interface BasicSelectTypePanelProps {
  type: Core.Type;
  schema: Core.TypeDefinitionSchema;
  updateType: (_type: Core.Type, _schema?: Core.TypeDefinitionSchema) => void;
  disabled?: boolean;
  filter?: TypeSelectorMenuItemFilter
}
