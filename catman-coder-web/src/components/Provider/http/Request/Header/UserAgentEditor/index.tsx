/**
 * User-Agent的规范包括以下内容：
 *
 * 标识符: User-Agent以一个字符串标识浏览器和操作系统，通常包含厂商、产品、版本等信息。
 * 操作系统信息: 包括操作系统的名称和版本号。
 * 浏览器信息: 包括浏览器的名称和版本号。
 * 平台信息: 包括硬件平台或CPU架构的信息。
 * 附加信息: 可能包括其他细节，例如渲染引擎、语言偏好等。
 * User-Agent字符串的格式并没有统一标准，不同的浏览器和设备可能会以不同的方式组织这些信息。通常，User-Agent的格式大致如下：
 * User-Agent: <产品> / <版本> <附加信息>
 */
import { Select } from "antd";
import { UserAgents } from "@/components/Provider/http/Request/Header/UserAgentEditor/common.tsx";

export const UserAgentEditor = ({
  onSelected,
}: {
  onSelected: (value: string) => void;
}) => {
  return (
    <div>
      <div>请从下面选择一个常用的User-Agent，或者自定义一个User-Agent</div>
      <Select
        options={UserAgents}
        style={{ width: "100%" }}
        placeholder="请选择一个常用的User-Agent"
        allowClear
        showSearch
        optionFilterProp="label"
        filterOption={(input, option) => {
          return option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        popupMatchSelectWidth={false}
        optionRender={(props) => {
          return (
            <div>
              <div>{props.label}</div>
              <div style={{ color: "gray" }}>
                <small color={"gray"}>{props.value}</small>
              </div>
            </div>
          );
        }}
        tagRender={(props) => {
          return (
            <span>
              {props.label}
              {props.value}
            </span>
          );
        }}
        onSelect={(value, option) => {
          onSelected(option.value);
        }}
      />
    </div>
  );
};
