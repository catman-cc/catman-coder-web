import { BaseLabelSelectorProps } from "@/components/LabelSelector";
import { ReactNode } from "react";
import { Button, Input, List } from "antd";
import { LabelSelectorMenus } from "@/components/LabelSelector/LabelSelectorMenus";

export interface TwoStageKeyValueListSelectorProps
  extends BaseLabelSelectorProps {
  name: ReactNode;
  secondName: ReactNode;
  kind: string;
}

export const TwoStageKeyValueListSelector = (
  props: TwoStageKeyValueListSelectorProps,
) => {
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
        <List
          dataSource={
            Array.isArray(props.selector.value)
              ? props.selector.value
              : [props.selector.value]
          }
          renderItem={(item, index) => {
            return (
              <div
                style={{
                  margin: 0,
                }}
              >
                <Input
                  size={"small"}
                  style={{
                    width: "150px",
                  }}
                  value={item}
                  onChange={(e) => {
                    const arr = Array.isArray(props.selector.value)
                      ? props.selector.value
                      : [props.selector.value];
                    arr[index] = e.target.value;
                    props.onChange({
                      ...props.selector,
                      value: [...arr],
                    });
                  }}
                ></Input>
                <Button
                  size={"small"}
                  style={{
                    backgroundColor: "#00a28b",
                    color: "white",
                    borderRadius: "4px",
                  }}
                  onClick={() => {
                    const arr = Array.isArray(props.selector.value)
                      ? props.selector.value
                      : [props.selector.value];
                    arr.splice(index + 1, 0, "");
                    props.onChange({
                      ...props.selector,
                      value: [...arr],
                    });
                  }}
                >
                  +
                </Button>
                {index > 0 && (
                  <Button
                    size={"small"}
                    style={{
                      backgroundColor: "#fa0000",
                      color: "white",
                      borderRadius: "4px",
                    }}
                    onClick={() => {
                      const arr = Array.isArray(props.selector.value)
                        ? props.selector.value
                        : [props.selector.value];
                      if (arr.length > 1) {
                        arr.splice(index, 1);
                      }
                      props.onChange({
                        ...props.selector,
                        value: [...arr],
                      });
                    }}
                  >
                    -
                  </Button>
                )}
              </div>
            );
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
