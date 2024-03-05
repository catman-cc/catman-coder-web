import { AutoComplete, Button } from "antd";
import { LabelSelectorMenus } from "@/components/LabelSelector/LabelSelectorMenus";
import { BaseLabelSelectorProps } from "@/components/LabelSelector";
import { ReactNode, useEffect, useState } from "react";
import { levenshteinDistance } from "@/components/Provider/http/Request/Header/common.tsx";
export interface KeyValueSelectorProps extends BaseLabelSelectorProps {
  name: ReactNode;
  kind: string;
}

export const KeyValueSelector = (props: KeyValueSelectorProps) => {
  const [keyAutoOptions, setKeyAutoOptions] = useState<
    { key: string; value: string }[]
  >([]);
  const [valueAutoOptions, setValueAutoOptions] = useState<
    { key: string; value: string }[]
  >([]);

  useEffect(() => {
    if (!keyAutoOptions) {
      setKeyAutoOptions(props.keyAutoOptions || []);
    }
    if (!valueAutoOptions) {
      setValueAutoOptions(props.valueAutoOptions || []);
    }
  }, [props]);

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
        {/*<Input*/}
        {/*  style={{*/}
        {/*    width: "150px",*/}
        {/*    border: "1px solid #fc00c8",*/}
        {/*    borderRadius: "4px",*/}
        {/*  }}*/}
        {/*  size={"small"}*/}
        {/*  bordered={false}*/}
        {/*  value={props.selector.match}*/}
        {/*  onChange={(v) => {*/}
        {/*    props.onChange({*/}
        {/*      ...props.selector,*/}
        {/*      match: v.target.value,*/}
        {/*    });*/}
        {/*  }}*/}
        {/*/>*/}
        <AutoComplete
          size={"small"}
          style={{ width: 200 }}
          value={props.selector.match as string}
          options={keyAutoOptions}
          onChange={(v) => {
            props.onChange({
              ...props.selector,
              match: v,
            });
          }}
          onFocus={() => {
            setKeyAutoOptions(props.keyAutoOptions || []);
          }}
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
          popupMatchSelectWidth={false}
          placement={"bottomRight"}
          onSelect={(v) => {
            {
              props.onChange({
                ...props.selector,
                match: v,
              });
            }
          }}
          onSearch={(v) => {
            console.log(v, props.keyAutoOptions);
            setKeyAutoOptions(
              props.keyAutoOptions
                ?.filter((v) => {
                  return v.key.indexOf(v) > -1;
                })
                .sort((a, b) => {
                  return (
                    levenshteinDistance(a.value, v) -
                    levenshteinDistance(b.value, v)
                  );
                }) || [],
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
              {props.name}
            </Button>
          ) : (
            props.name
          )}
        </LabelSelectorMenus>
        {/* 符合正则被渲染成一个选择面板*/}
        <AutoComplete
          size={"small"}
          style={{ width: 200 }}
          value={props.selector.value as string}
          options={valueAutoOptions}
          placement={"bottomRight"}
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
          onChange={(v) => {
            props.onChange({
              ...props.selector,
              value: v,
            });
          }}
          onFocus={() => {
            setValueAutoOptions(props.valueAutoOptions || []);
          }}
          popupMatchSelectWidth={false}
          onSelect={(v) => {
            {
              props.onChange({
                ...props.selector,
                value: v,
              });
            }
          }}
          onSearch={(v) => {
            setValueAutoOptions(
              props.valueAutoOptions
                ?.filter((v) => {
                  return v.key.indexOf(v) > -1;
                })
                .sort((a, b) => {
                  return (
                    levenshteinDistance(a.value, v) -
                    levenshteinDistance(b.value, v)
                  );
                }) || [],
            );
          }}
        />
        {/*<Input*/}
        {/*  // addonBefore={"正则"}*/}
        {/*  size={"small"}*/}
        {/*  style={{*/}
        {/*    width: "150px",*/}
        {/*  }}*/}
        {/*  value={props.selector.value as string}*/}
        {/*  onChange={(v) => {*/}
        {/*    props.onChange({*/}
        {/*      ...props.selector,*/}
        {/*      value: v.target.value,*/}
        {/*    });*/}
        {/*  }}*/}
        {/*></Input>*/}
      </div>
    </div>
  );
};
