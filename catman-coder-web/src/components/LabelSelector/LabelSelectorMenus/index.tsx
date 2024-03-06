import { Menu, Popover, Tag } from "antd";
export interface LabelSelectorMenus {
  children: React.ReactNode;
  defaultValue: string;
  onChange: (value: string) => void;
}
/**
 * 一个用于选择选择器类型的组件
 * @param props
 * @constructor
 */
export const LabelSelectorMenus = (props: LabelSelectorMenus) => {
  return (
    <Popover
      content={
        <div>
          <Menu
            defaultValue={props.defaultValue}
            onClick={(m) => {
              props.onChange?.(m.key.toString());
            }}
            getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
            items={menus.map((menu) => {
              return {
                label: menu.label,
                key: menu.key,
                // type: menu.type,
                children: menu.options.map((option) => {
                  return {
                    label: option.label,
                    key: option.key,
                    value: option.value,
                  };
                }),
              };
            })}
          />
          {/*<Select*/}
          {/*  style={{ backgroundColor: "#0127e3", color: "white" }}*/}
          {/*  size={"small"}*/}
          {/*  bordered={false}*/}
          {/*  options={menus}*/}
          {/*  maxTagCount={1}*/}
          {/*  // menuItemSelectedIcon={<div>123</div>}*/}
          {/*  popupMatchSelectWidth={false}*/}
          {/*  getPopupContainer={(targetNode) => targetNode.parentNode}*/}
          {/*  optionRender={(props) => {*/}
          {/*    return props.data.optionValue;*/}
          {/*  }}*/}
          {/*/>*/}
        </div>
      }
      trigger={"hover"}
    >
      {props.children}
    </Popover>
  );
};

const menus = [
  {
    key: "group",
    label: "组合",
    // type: "group",
    options: [
      { key: "All", label: "全部匹配", value: "All", optionValue: "全部匹配" },
      { key: "Any", label: "任意匹配", value: "Any", optionValue: "任意匹配" },
      { key: "None", label: "不匹配", value: "None", optionValue: "不匹配" },
    ],
  },
  {
    key: "text",
    label: "文本",
    // type: "group",
    options: [
      {
        key: "StartWith",
        label: "以...开始",
        value: "StartWith",
        optionValue: "以...开始",
      },
      {
        key: "EndWith",
        label: "以...结束",
        value: "EndWith",
        optionValue: "以...结束",
      },
      {
        key: "Regex",
        label: <Tag color={"#0012e3"}>匹配正则</Tag>,
        value: "Regex",
        optionValue: "正则",
      },
      { key: "Equals", label: "是", value: "Equals", optionValue: "是" },
      {
        key: "NotEquals",
        label: "不是",
        value: "NotEquals",
        optionValue: "不是",
      },
      { key: "Empty", label: "是空白", value: "Empty", optionValue: "是空白" },
      {
        key: "NotEmpty",
        label: "不是空白",
        value: "NotEmpty",
        optionValue: "不是空白",
      },
      {
        key: "Contains",
        label: "包含",
        value: "Contains",
        optionValue: "包含",
      },
    ],
  },
  {
    key: "number",
    label: "数字",
    // type: "group",
    options: [
      { key: "Equals", label: "等于", value: "Equals", optionValue: "等于" },
      { key: "Gt", label: "大于", value: "Gt", optionValue: "大于" },
      { key: "Lt", label: "小于", value: "Lt", optionValue: "小于" },
      { key: "Gte", label: "大于等于", value: "Gte", optionValue: "大于等于" },
      { key: "Lte", label: "小于等于", value: "Lte", optionValue: "小于等于" },
      {
        key: "NotEquals",
        label: "不等于",
        value: "NotEquals",
        optionValue: "不等于",
      },
    ],
  },
  {
    key: "collection",
    label: "集合",
    // type: "group",
    options: [
      {
        key: "In",
        label: "在...之内",
        value: "In",
      },
      {
        key: "NotEmpty",
        label: "不是空的",
        value: "NotEmpty",
        optionValue: "不是空的",
      },
      { key: "Empty", label: "是空的", value: "Empty", optionValue: "是空的" },
      {
        key: "Contains",
        label: "包含",
        value: "Contains",
        optionValue: "包含",
      },
      { key: "In", label: "在...之内", value: "In", optionValue: "在...之内" },
      {
        key: "NotIn",
        label: "不在...之内",
        value: "NotIn",
        optionValue: "不在...之内",
      },
    ],
  },
  {
    key: "common",
    label: "通用",
    // type: "group",
    options: [
      { key: "Exists", label: "存在", value: "Exists", optionValue: "存在" },
      {
        key: "NotExists",
        label: "不存在",
        value: "NotExists",
        optionValue: "不存在",
      },
      {
        key: "NotEmpty",
        label: "不是空的",
        value: "NotEmpty",
        optionValue: "不是空的",
      },
      { key: "Empty", label: "是空的", value: "Empty", optionValue: "是空的" },
    ],
  },
];
