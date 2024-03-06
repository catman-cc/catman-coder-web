import { GroupSelector } from "@/components/LabelSelector/GroupSelector";
import { KeyValueSelector } from "@/components/LabelSelector/KeyValueSelector";
import { Button } from "antd";
import { OnlyKeySelector } from "@/components/LabelSelector/OnlyKeySelector";
import { TwoStagesSelector } from "@/components/LabelSelector/TwoStagesSelector";
import { TwoStageKeyValueListSelector } from "@/components/LabelSelector/TowStageKeyValueListSelector";

export type LabelSelectorCreator = (
  selector: LabelSelector<unknown>,
  onChange: (selector: LabelSelector<unknown>) => void,
  keyAutoOptions?: { key: string; value: string }[],
  valueAutoOptions?: { key: string; value: string }[]
) => React.ReactNode;
export class LabelSelectFactory {
  creators: {
    [index: string]: LabelSelectorCreator;
  };
  static create() {
    return new LabelSelectFactory();
  }
  constructor() {
    this.creators = {
      All: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <GroupSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#036233",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                全部匹配
              </Button>
            }
            joinStr={"且"}
            kind={"All"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Any: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <GroupSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#175586",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                任意匹配
              </Button>
            }
            joinStr={"或"}
            kind={"Any"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      None: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <GroupSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#b72f1b",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                不匹配
              </Button>
            }
            joinStr={"且"}
            kind={"None"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Regex: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <KeyValueSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#ff794f",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                匹配正则
              </Button>
            }
            kind={"Regex"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Equals: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <KeyValueSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#227064",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                等于
              </Button>
            }
            kind={"Equals"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      NotEquals: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <KeyValueSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#ff3c00",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                不等于
              </Button>
            }
            kind={"NotEquals"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Empty: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <OnlyKeySelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#000000",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                是空的
              </Button>
            }
            kind={"Empty"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      NotEmpty: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <OnlyKeySelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "rgb(0,97,114)",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                不是空的
              </Button>
            }
            kind={"NotEmpty"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Contains: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <KeyValueSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#df5cff",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                包含
              </Button>
            }
            kind={"Contains"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      StartWith: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <TwoStagesSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#8e03d3",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                以
              </Button>
            }
            secondName={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#014d2b",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                开始
              </Button>
            }
            kind={"StartWith"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      EndWith: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <TwoStagesSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                以
              </Button>
            }
            secondName={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                结束
              </Button>
            }
            kind={"EndWith"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Gt: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <KeyValueSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                大于
              </Button>
            }
            kind={"Gt"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Lt: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <KeyValueSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                小于
              </Button>
            }
            kind={"Lt"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Gte: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <KeyValueSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                大于等于
              </Button>
            }
            kind={"Gte"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Lte: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <KeyValueSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                小于等于
              </Button>
            }
            kind={"Lte"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      In: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <TwoStageKeyValueListSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                在集合
              </Button>
            }
            secondName={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                中出现至少一次
              </Button>
            }
            kind={"In"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      NotIn: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <TwoStageKeyValueListSelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                }}
              >
                不在集合
              </Button>
            }
            secondName={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                }}
              >
                中出现
              </Button>
            }
            kind={"NotIn"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      Exists: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <OnlyKeySelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                }}
              >
                存在
              </Button>
            }
            kind={"Exists"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
      NotExists: (selector, onChange, keyAutoOptions, valueAutoOptions) => {
        return (
          <OnlyKeySelector
            name={
              <Button
                size={"small"}
                style={{
                  backgroundColor: "#9f4526",
                  color: "white",
                }}
              >
                不存在
              </Button>
            }
            kind={"NotExists"}
            selector={selector}
            factory={this}
            keyAutoOptions={keyAutoOptions}
            valueAutoOptions={valueAutoOptions}
            onChange={onChange}
          />
        );
      },
    };
  }
  render(
    selector: LabelSelector<unknown>,
    onChange: (selector: LabelSelector<unknown>) => void,
    keyAutoOptions?: { key: string; value: string }[],
    valueAutoOptions?: { key: string; value: string }[]
  ): React.ReactNode {
    if (this.creators[selector.kind]) {
      return this.creators[selector.kind](
        selector,
        onChange,
        keyAutoOptions,
        valueAutoOptions
      );
    }
    // 此处单纯就是为了避免死循环
    return <div>{selector.kind}</div>;
  }
}
export interface LabelSelectorInfo {
  kind: string;
  value: string;
  groups: string[];
}
// {
//     [index: string]: string;
//   };
export const LabelSelectors = [
  { label: "全部匹配", value: "All", groups: ["group"] },
  { label: "任意匹配", value: "Any", groups: ["group"] },
  { label: "不匹配", value: "None", groups: ["group"] },
  { label: "以...开始", value: "StartWith", groups: ["text"] },
  { label: "以...结束", value: "EndWith", groups: ["text"] },
  { label: "正则", value: "Regex", groups: ["text"] },
  { label: "是", value: "Equals", groups: ["text", "number"] },
  { label: "不是", value: "NotEquals", groups: ["text", "number"] },
  { label: "是空白", value: "Empty", groups: ["text", "number"] },
  { label: "不是空白", value: "NotEmpty", groups: ["text", "number"] },
  { label: "包含", value: "Contains", groups: ["text", "number"] },
  { label: "等于", value: "Equals", groups: ["text"] },
  { label: "大于", value: "Gt", groups: ["text"] },
  { label: "小于", value: "Lt", groups: ["text"] },
  { label: "大于等于", value: "Gte", groups: ["text"] },
  { label: "小于等于", value: "Lte", groups: ["text"] },
  { label: "不等于", value: "NotEquals", groups: ["text"] },
  { label: "在..内", value: "In", groups: ["collection"] },
  { label: "不是", value: "None", groups: ["collection"] },
  { label: "不是空的", value: "NotEmpty", groups: ["collection"] },
  { label: "是空的", value: "Empty", groups: ["collection"] },
  { label: "包含", value: "Contains", groups: ["collection"] },
  { label: "在...之内", value: "In", groups: ["collection"] },
  { label: "不在...之内", value: "NotIn", groups: ["collection"] },
  { label: "存在", value: "all" },
  { label: "不存在", value: "all" },
  { label: "不是空的", value: "all" },
  { label: "是空的", value: "all" },
];

export const LabelSelectors2 = [
  {
    label: "组合",
    options: [],
  },
  {
    label: "文本",
    options: [],
  },
  {
    label: "数字",
    options: [],
  },
  {
    label: "集合",
    options: [],
  },
  {
    label: "通用",
    options: [],
  },
];
