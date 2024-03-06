import { RawTypeRender } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel/RawTypeRender";
import { ReferTypeRender } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel/ReferTypeRender";
import TypeSelectorPanel, {
  TypeSelectorMenuItemFilter,
} from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector";
import { Popover } from "antd";
import { EnumTypeRender } from "./EnumTypeRender";
import { ComplexType, TypeDefinitionSchema, Type } from "catman-coder-core";

export type SelectTypePanelCreator = (
  _type: Type,
  _update: (_type: Type, schema?: TypeDefinitionSchema) => void,
  _schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
    this.creators["file"] = (
      type,
      update,
      schema: TypeDefinitionSchema,
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
    this.creators["anonymous"] = (
      type,
      update,
      schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
      schema: TypeDefinitionSchema,
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
    this.creators["enum"] = (
      type,
      update,
      schema: TypeDefinitionSchema,
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
    };
  }
  render(
    type: Type,
    update: (type: Type, schema?: TypeDefinitionSchema) => void,
    schema: TypeDefinitionSchema,
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
  type: Type;
  schema: TypeDefinitionSchema;
  updateType: (_type: Type, _schema?: TypeDefinitionSchema) => void;
  disabled?: boolean;
  filter?: TypeSelectorMenuItemFilter;
}
