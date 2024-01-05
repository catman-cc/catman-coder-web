import { BaseLabelSelectorProps } from "@/components/LabelSelector";
import { ReactNode } from "react";
import { Button, Input } from "antd";
import { LabelSelectorMenus } from "@/components/LabelSelector/LabelSelectorMenus";

export interface OnlyKeySelectorProps extends BaseLabelSelectorProps {
  name: ReactNode;
  kind: string;
}
export const OnlyKeySelector = (props: OnlyKeySelectorProps) => {
  if (props.selector.kind !== props.kind) {
    return props.factory.render(
      props.selector,
      props.onChange,
      props.keyAutoOptions,
      props.valueAutoOptions,
    );
  }
  return (
    <div>
      <div
        className={"flex justify-between"}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <Input
          style={{
            width: "150px",
            border: "1px solid #fc00c8",
            borderRadius: "4px",
          }}
          size={"small"}
          bordered={false}
          value={props.selector.match}
          onChange={(v) => {
            props.onChange({
              ...props.selector,
              match: v.target.value,
            });
          }}
        />
        <LabelSelectorMenus
          defaultValue={props.selector.kind as string}
          onChange={(v) => {
            props.onChange({
              ...props.selector,
              kind: v,
            });
          }}
        >
          {typeof props.name === "string" ? (
            <Button size={"small"} type={"primary"}>
              {props.name}
            </Button>
          ) : (
            props.name
          )}
        </LabelSelectorMenus>
      </div>
    </div>
  );
};
