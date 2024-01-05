import { Button, Popover } from "antd";
import { BasicSelectTypePanelProps } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel";
import { PeekTypeIcon } from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector/common.tsx";
import TypeSelectorPanel from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector";
import { ComplexType } from "@/common/core.ts";

export const RawTypeRender = (props: BasicSelectTypePanelProps) => {
  if (props.disabled) {
    return (
      <Button
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
  );
};
