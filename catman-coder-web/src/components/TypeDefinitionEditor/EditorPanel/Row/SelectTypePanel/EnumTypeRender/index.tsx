import {
  ComplexType,
  LabelSelector,
  Scope,
  TypeDefinitionSchema,
} from "catman-coder-core";
import IconCN from "@/components/Icon";
import { SimpleResourceView } from "@/components/Resource/Explorer/SimpleResourceView";
import { BasicSelectTypePanelProps } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel";
import TypeSelectorPanel from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector";
import {
  PeekTypeColor,
  PeekTypeIcon,
} from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector/common.tsx";
import { Button, Popover, Tooltip } from "antd";
import { useEffect, useState } from "react";

export const EnumTypeRender = (props: BasicSelectTypePanelProps) => {
  // 1. 从props中获取被引用的类型定义,泛型定义不需要展示,其将会作为子元素被渲染出来
  // 这里应该只是针对refer类型的渲染
  const [isRefer, setIsRefer] = useState(false);
  const [selector, setSelector] = useState<LabelSelector<unknown>>({
    match: "kind",
    kind: "Equals",
    value: "td",
  });

  useEffect(() => {
    const items = props.type.sortedAllItems;
    if (items.length > 0) {
      setIsRefer(
        props.schema.definitions[items[0].itemId]?.scope === Scope.PUBLIC
      );
    } else {
      setIsRefer(false);
    }
  }, [props]);
  if (props.disabled) {
    return (
      <div className={"flex justify-between"}>
        <Button
          disabled={props.disabled}
          size={"small"}
          type={"dashed"}
          style={{
            color: PeekTypeColor(props.type.typeName),
          }}
          icon={PeekTypeIcon(props.type.typeName)}
        >
          {props.type.typeName}
        </Button>
        <Button size={"small"} type={"dashed"} disabled={props.disabled}>
          {isRefer
            ? props.schema.definitions[props.type.sortedAllItems[0].itemId]
                ?.name
            : "自定义"}
        </Button>
        {isRefer ? (
          <Tooltip title="清空引用">
            <Button
              disabled={props.disabled}
              size="small"
              type="text"
              style={{
                color: PeekTypeColor(props.type.typeName),
              }}
              icon={<IconCN type="icon-Remove" />}
              onClick={() => {
                props.type.sortedAllItems = [];
                props.type.privateItems = {};
                props.updateType(props.type);
              }}
            />
          </Tooltip>
        ) : null}
      </div>
    );
  }
  return (
    <div className={"flex justify-between"}>
      <Popover
        trigger={"click"}
        content={
          <TypeSelectorPanel
            type={new ComplexType(props.type)}
            completeTheSelection={(t, schema) => {
              props.updateType(t, schema);
            }}
            filter={props.filter}
          />
        }
      >
        <Button
          disabled={props.disabled}
          size={"small"}
          type={"dashed"}
          style={{
            color: PeekTypeColor(props.type.typeName),
          }}
          icon={PeekTypeIcon(props.type.typeName)}
        >
          {props.type.typeName}
        </Button>
      </Popover>
      <Popover
        trigger={"click"}
        content={
          <div>
            <SimpleResourceView
              selector={JSON.stringify(selector)}
              onSelectResource={(resource) => {
                const clickSchema = resource.details as TypeDefinitionSchema;
                if (clickSchema.definitions) {
                  for (const definitionsKey in clickSchema.definitions) {
                    if (props.schema.root === definitionsKey) {
                      // 禁止修改当前正在编辑的类型定义
                      continue;
                    }
                    props.schema.definitions[definitionsKey] =
                      clickSchema.definitions[definitionsKey];
                  }
                }

                // 当选中一个类型定义时,需要将其设置到type中
                if (props.type.sortedAllItems.length === 1) {
                  props.type.sortedAllItems[0].itemId = resource.details.root!;
                } else {
                  props.type.sortedAllItems = [];
                  props.type.sortedAllItems.push({
                    itemId: resource.details.root!,
                    name: resource.name,
                    scope: "PUBlIC",
                  });
                }
                props.updateType(props.type);
              }}
            />
          </div>
        }
      >
        <Button
          disabled={props.disabled}
          size={"small"}
          type={"dashed"}
          style={{
            color: PeekTypeColor(props.type.typeName),
          }}
        >
          {isRefer
            ? props.schema.definitions[props.type.sortedAllItems[0].itemId]
                ?.name
            : "自定义"}
        </Button>
      </Popover>
      {isRefer ? (
        <Tooltip title="清空引用">
          <Button
            size="small"
            type="text"
            icon={<IconCN type="icon-Remove" />}
            style={{
              color: PeekTypeColor(props.type.typeName),
            }}
            onClick={() => {
              props.type.sortedAllItems = [];
              props.type.privateItems = {};
              props.updateType(props.type);
            }}
          />
        </Tooltip>
      ) : null}
    </div>
  );
};
