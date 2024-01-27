import { ComplexType } from "@/common/core.ts";
import { BasicSelectTypePanelProps } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel";
import TypeSelectorPanel from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector";
import { PeekTypeColor, PeekTypeIcon } from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector/common.tsx";
import { Button, Popover } from "antd";

export const RawTypeRender = (props: BasicSelectTypePanelProps) => {
  if (props.disabled) {
    return (
      <Button
        style={{
          color: PeekTypeColor(props.type.typeName)
        }}
        disabled={props.disabled}
        size={"small"}
        type={"dashed"}
        icon={PeekTypeIcon(props.type.typeName)}
      >
        {props.type.typeName}
      </Button>
    );
  }
  return (
    <Popover
      trigger={"click"}
      content={
        <TypeSelectorPanel
          type={new ComplexType(props.type)}
          completeTheSelection={(t) => {
            console.log("completeTheSelection", t);
            props.updateType(t);
          }}
          filter={props.filter}
        />
      }
    >
      <Button
        size={"small"}
        type={"dashed"}
        style={{
          color: PeekTypeColor(props.type.typeName)
        }}
        icon={PeekTypeIcon(props.type.typeName)}
      >
        {props.type.typeName}
      </Button>
    </Popover>
  );
};
