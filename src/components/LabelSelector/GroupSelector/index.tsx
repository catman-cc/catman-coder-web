import { ReactNode } from "react";
import { Button, List, Tag } from "antd";
import {
  BaseLabelSelectorProps,
  LabelSelector,
} from "@/components/LabelSelector";
import { LabelSelectorMenus } from "@/components/LabelSelector/LabelSelectorMenus";
export interface GroupLabelSelectorProps extends BaseLabelSelectorProps {
  name: ReactNode;
  kind: string;
  joinStr: string;
}
export const GroupSelector = (props: GroupLabelSelectorProps) => {
  if (props.selector.kind !== props.selector.kind) {
    return props.factory.render(
      props.selector,
      props.onChange,
      props.keyAutoOptions,
      props.valueAutoOptions,
    );
  }
  return (
    <div>
      <div className={"flex justify-start"}>
        <div>
          <LabelSelectorMenus
            defaultValue={props.selector.kind}
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
        <div>
          <Button
            size={"small"}
            type={"link"}
            onClick={() => {
              props.onChange({
                ...props.selector,
                rules: [
                  ...props.selector.rules!,
                  {
                    kind: "Equals",
                    match: "",
                    value: "",
                  },
                ],
              });
            }}
          >
            添加子规则
          </Button>
          <Button
            size={"small"}
            type={"link"}
            onClick={() => {
              props.onChange({
                ...props.selector,
                rules: [],
              });
            }}
          >
            清空子规则
          </Button>
        </div>
      </div>

      <div
        style={{
          marginLeft: "40px",
          border: "1px dashed gray",
          padding: "10px",
        }}
      >
        <List
          dataSource={props.selector.rules || []}
          locale={{
            emptyText: (
              <div
                style={{
                  width: "300px",
                }}
              >
                没有规则,
                <a
                  onClick={() => {
                    props.onChange({
                      ...(props.selector as Core.LabelSelector<string>),
                      rules: [
                        {
                          kind: "Equals",
                          match: "",
                          value: "",
                        },
                      ],
                    });
                  }}
                >
                  创建
                </a>
                一个吧😁
              </div>
            ),
          }}
          renderItem={(item, index) => {
            return (
              <div
                className={"flex"}
                style={{
                  marginTop: "10px",
                }}
              >
                {index > 0 ? (
                  <LabelSelectorMenus
                    defaultValue={props.selector.kind}
                    onChange={(v) => {
                      props.onChange({
                        ...props.selector,
                        kind: v,
                      });
                    }}
                  >
                    <Button size={"small"} type={"primary"}>
                      {props.joinStr}
                    </Button>
                  </LabelSelectorMenus>
                ) : (
                  <div
                    style={{
                      width: "2em",
                    }}
                  ></div>
                )}
                <LabelSelector
                  selector={item}
                  factory={props.factory}
                  onChange={(v) => {
                    props.selector.rules![index] = v;
                    props.onChange({
                      ...props.selector,
                    });
                  }}
                  keyAutoOptions={props.keyAutoOptions}
                  valueAutoOptions={props.valueAutoOptions}
                />
                <Tag
                  color={"#346403"}
                  style={{
                    maxWidth: "20px",
                    maxHeight: "20px",
                  }}
                  onClick={() => {
                    props.onChange({
                      ...props.selector,
                      rules: [
                        ...props.selector.rules!,
                        {
                          kind: "Equals",
                          match: "",
                          value: "",
                        },
                      ],
                    });
                  }}
                >
                  +
                </Tag>
                <Tag
                  style={{
                    maxWidth: "20px",
                    maxHeight: "20px",
                  }}
                  color={"#de3b08"}
                  onClick={() => {
                    props.selector.rules?.splice(index, 1);
                    props.onChange({
                      ...props.selector,
                    });
                  }}
                >
                  -
                </Tag>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};
