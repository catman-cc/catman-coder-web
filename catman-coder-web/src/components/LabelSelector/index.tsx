import { Button } from "antd";
import "./index.less";
import { SettingOutlined } from "@ant-design/icons";
import { LabelSelectFactory } from "@/components/LabelSelector/common";
export interface BaseLabelSelectorProps {
  selector: Core.LabelSelector<unknown>;
  onChange(selector: Core.LabelSelector<unknown>): void;
  factory: LabelSelectFactory;
  keyAutoOptions?: { key: string; value: string }[];
  valueAutoOptions?: { key: string; value: string }[];
}
export const LabelSelector = (props: BaseLabelSelectorProps) => {
  return (
    <div
      className={"flex justify-between label-selector-root"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Button size={"small"} icon={<SettingOutlined />} />
      {/* 根据类型进行选择,组合类型的渲染一个集合 ,普通类型渲染一个编辑框*/}
      {/*{renderSelectorPanel(selector.kind)}*/}
      {props.factory.render(
        props.selector,
        (v) => {
          props.onChange(v);
        },
        props.keyAutoOptions,
        props.valueAutoOptions,
      )}
    </div>
  );
};
