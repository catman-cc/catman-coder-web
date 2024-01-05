import { Button, Popover } from "antd";
import { BasicSelectTypePanelProps } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel";
import { PeekTypeIcon } from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector/common.tsx";
import { useEffect, useState } from "react";
import TypeSelectorPanel from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector";
import { ComplexType } from "@/common/core.ts";
import { SimpleResourceView } from "@/components/Resource/Explorer/SimpleResourceView";

export const ReferTypeRender = (props: BasicSelectTypePanelProps) => {
  // 1. 从props中获取被引用的类型定义,泛型定义不需要展示,其将会作为子元素被渲染出来
  // 这里应该只是针对refer类型的渲染
  const [refer, setRefer] = useState(props.type.sortedAllItems[0]);
  const [selector, setSelector] = useState<Core.LabelSelector<unknown>>({
    match: "kind",
    kind: "Equals",
    value: "td",
  });

  useEffect(() => {
    setRefer(props.type.sortedAllItems[0]);
  }, [props]);
  return (
    <div className={"flex justify-between"}>
      <Popover
        trigger={"click"}
        content={
          <TypeSelectorPanel
            type={new ComplexType(props.type)}
            completeTheSelection={(t) => {
              props.updateType(t);
            }}
          />
        }
      >
        <Button
          size={"small"}
          type={"dashed"}
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
                const clickSchema =
                  resource.details as Core.TypeDefinitionSchema;
                if (clickSchema.definitions) {
                  for (const definitionsKey in clickSchema.definitions) {
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
                console.warn("update type", props.type);
                props.updateType(props.type);
              }}
            />
          </div>
        }
      >
        <Button size={"small"} type={"dashed"}>
          {refer ? props.schema.definitions[refer.itemId!]?.name : "未选择"}
        </Button>
      </Popover>
    </div>
  );
};
