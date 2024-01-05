import { ColorPicker, Input, Select, Tag } from "antd";
import { useEffect, useState } from "react";
import { levenshteinDistance } from "@/components/Provider/http/Request/Header/common.tsx";
import "./index.less";
export interface HttpMethodProps {
  value?: string;
  onChange?: (value: string) => void;
  customMethods?: { value: string; label: JSX.Element }[];
  updateCustomMethods?: (
    methods: { value: string; label: JSX.Element }[],
  ) => void;
}
// http协议支持的方法,参考:https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods,
// 同时为了美观,使用了antd的Tag组件,参考:https://ant.design/components/tag-cn/
// 并未每一个method都提供一个独一无二的的颜色 颜色参考:https://ant.design/docs/spec/colors-cn
const httpMethods = [
  { value: "GET", label: <Tag color={"#2db7f5"}>GET</Tag> },
  { value: "POST", label: <Tag color={"#f50"}>POST</Tag> },
  { value: "PUT", label: <Tag color={"#87d068"}>PUT</Tag> },
  { value: "DELETE", label: <Tag color={"#108ee9"}>DELETE</Tag> },
  { value: "PATCH", label: <Tag color={"#b4e5be"}>PATCH</Tag> },
  { value: "HEAD", label: <Tag color={"#de3b08"}>HEAD</Tag> },
  { value: "OPTIONS", label: <Tag color={"#51e5e1"}>OPTIONS</Tag> },
  { value: "TRACE", label: <Tag color={"#0038a8"}>TRACE</Tag> },
  { value: "COPY", label: <Tag color={"#ff794f"}>COPY</Tag> },
  { value: "LINK", label: <Tag color={"#606388"}>LINK</Tag> },
  { value: "UNLINK", label: <Tag color={"#003869"}>UNLINK</Tag> },
  { value: "PURGE", label: <Tag color={"#00fa6d"}>PURGE</Tag> },
  { value: "LOCK", label: <Tag color={"#4fffd6"}>LOCK</Tag> },
  { value: "UNLOCK", label: <Tag color={"#ef0527"}>UNLOCK</Tag> },
  { value: "PROPFIND", label: <Tag color={"#66acf6"}>PROPFIND</Tag> },
  { value: "VIEW", label: <Tag color={"#fc5723"}>VIEW</Tag> },
  { value: "REPORT", label: <Tag color={"#a62600"}>REPORT</Tag> },
  { value: "MKACTIVITY", label: <Tag color={"#8593ea"}>MKACTIVITY</Tag> },
  { value: "CHECKOUT", label: <Tag color={"#3d0050"}>CHECKOUT</Tag> },
  { value: "MERGE", label: <Tag color={"#fcaea8"}>MERGE</Tag> },
  { value: "MSEARCH", label: <Tag color={"#ff4f4f"}>MSEARCH</Tag> },
  { value: "NOTIFY", label: <Tag color={"#c53bd5"}>NOTIFY</Tag> },
  { value: "SUBSCRIBE", label: <Tag color={"#9f4526"}>SUBSCRIBE</Tag> },
  { value: "UNSUBSCRIBE", label: <Tag color={"#8d0055"}>UNSUBSCRIBE</Tag> },
  { value: "SEARCH", label: <Tag color={"#ff4f4f"}>SEARCH</Tag> },
  {
    value: "CONNECT",
    label: <Tag color={"rgba(255,79,146,0.95)"}>CONNECT</Tag>,
  },
  { value: "BIND", label: <Tag color={"#0d011a"}>BIND</Tag> },
  { value: "REBIND", label: <Tag color={"#227064"}>REBIND</Tag> },
  { value: "UNBIND", label: <Tag color={"#c30ade"}>UNBIND</Tag> },
];

export const HttpMethod = (props: HttpMethodProps) => {
  const [conditions, setConditions] = useState<
    { value: string; label: JSX.Element }[]
  >([
    ...httpMethods,
    ...(props.customMethods || []),
    {
      value: "自定义方法",
      label: (
        <div>
          <Input
            placeholder={"请在此处输出自定义方法名称"}
            addonAfter={<ColorPicker />}
          />
        </div>
      ),
    },
  ]);

  const [method, setMethod] = useState(props.value || "GET");

  useEffect(() => {
    setMethod(props.value || "POST");
  }, [props.value]);
  return (
    <div>
      <Select
        showSearch
        allowClear={true}
        size={"small"}
        value={method}
        style={{
          minWidth: "90px",
        }}
        popupMatchSelectWidth={false}
        options={conditions}
        onClear={() => {
          setConditions([...httpMethods, ...(props.customMethods || [])]);
        }}
        onSearch={(value) => {
          if (value === "") {
            setConditions([...httpMethods, ...(props.customMethods || [])]);
            return;
          }
          let findFullMatch = false;
          const cs = httpMethods
            .filter((item) => {
              if (item.value.toLowerCase() === value.toLowerCase()) {
                findFullMatch = true;
                return true;
              }
              return item.value.toLowerCase().includes(value.toLowerCase());
            })
            .sort((a, b) => {
              return (
                levenshteinDistance(a.value, value) -
                levenshteinDistance(b.value, value)
              );
            });
          if (findFullMatch) {
            setConditions([...cs]);
          } else {
            setConditions([
              { value: value, label: <Tag color={"#f601c2"}>{value}</Tag> },
              ...cs,
            ]);
          }
        }}
        onSelect={(value) => {
          setMethod(value);
          props.onChange?.(value);
        }}
        onChange={(value) => {
          {
            setMethod(value);
            props.onChange?.(value);
          }
        }}
      />
    </div>
  );
};
