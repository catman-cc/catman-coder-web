import { BaseLabelSelectorProps } from "@/components/LabelSelector";
import { Button, Input } from "antd";
import { LabelSelectorMenus } from "@/components/LabelSelector/LabelSelectorMenus";
import { ReactNode } from "react";

export interface TwoStagesSelectorProps extends BaseLabelSelectorProps {
  name: ReactNode;
  secondName: ReactNode;
  kind: string;
}

export const TwoStagesSelector = (props: TwoStagesSelectorProps) => {
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
        {/* 符合正则被渲染成一个选择面板*/}
        <Input
          // addonBefore={"正则"}
          size={"small"}
          style={{
            width: "150px",
          }}
          value={props.selector.value as string}
          onChange={(v) => {
            props.onChange({
              ...props.selector,
              value: v.target.value,
            });
          }}
        ></Input>
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
              {props.secondName}
            </Button>
          ) : (
            props.secondName
          )}
        </LabelSelectorMenus>
      </div>
    </div>
  );
};
