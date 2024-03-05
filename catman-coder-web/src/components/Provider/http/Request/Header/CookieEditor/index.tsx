import { useEffect, useState } from "react";
import { Button, Table } from "antd";
import TextArea from "antd/es/input/TextArea";

export interface CookieEditorProps {
  /**
   * 当前的 Cookie 值
   */
  cookies: { name: string; value: string }[];
  /**
   * 当前的 Cookie 值发生变化时触发
   */
  onChange: (cookies: { name: string; value: string }[]) => void;
}
/**
 * 一个用于编辑 Cookie 的组件,根据规范,Cookie 的格式为:
 * - `Cookie: <cookie-name>=<cookie-value>; <cookie-name>=<cookie-value>`
 * 所以这里的编辑器应该是一个表格,每一行代表一个 Cookie,每一行有两个输入框,一个是 name,一个是 value
 * 一个按钮用于添加新的 Cookie值,一个按钮用于删除当前行
 * @constructor
 */
export const CookieEditor = (props: CookieEditorProps) => {
  const [cookies, setCookies] = useState<{ name: string; value: string }[]>(
    props.cookies || [],
  );
  useEffect(() => {
    setCookies(props.cookies);
  }, [props]);

  return (
    <Table
      style={{ width: "600px" }}
      pagination={false}
      dataSource={cookies}
      title={() => {
        return (
          <div>
            <Button
              onClick={() => {
                const newCookies = [...cookies];
                newCookies.push({ name: "", value: "" });
                setCookies(newCookies);
              }}
            >
              新建
            </Button>
            <Button
              onClick={() => {
                setCookies([]);
              }}
            >
              清空
            </Button>
            {/*<Popover*/}
            {/*  content={*/}
            {/*    <div*/}
            {/*      style={{*/}
            {/*        display: "flex",*/}
            {/*        flexDirection: "column",*/}
            {/*        alignItems: "center",*/}
            {/*        width: 300,*/}
            {/*        height: 200,*/}
            {/*      }}*/}
            {/*    >*/}
            {/*      <TextArea*/}
            {/*        style={{ width: 300, height: 200 }}*/}
            {/*        placeholder={*/}
            {/*          "请输入要解析的Cookie,比如:username=John Doe; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/"*/}
            {/*        }*/}
            {/*        onChange={(e) => {*/}
            {/*          props.onChange(parseCookie(e.target.value));*/}
            {/*        }}*/}
            {/*        autoSize*/}
            {/*      />*/}
            {/*      <Button*/}
            {/*        onClick={() => {*/}
            {/*          updateCookie.run();*/}
            {/*        }}*/}
            {/*      >*/}
            {/*        解析*/}
            {/*      </Button>*/}
            {/*    </div>*/}
            {/*  }*/}
            {/*>*/}
            {/*  <Button>导入</Button>*/}
            {/*</Popover>*/}
            {/*<Button*/}
          </div>
        );
      }}
      columns={[
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (text, record, index) => {
            return (
              <TextArea
                value={text}
                autoSize
                onChange={(e) => {
                  const newCookies = [...cookies];
                  newCookies[index].name = e.target.value;
                  props.onChange(newCookies);
                }}
              />
            );
          },
        },
        {
          title: "Value",
          dataIndex: "value",
          key: "value",
          render: (text, record, index) => {
            return (
              <TextArea
                value={text}
                autoSize
                onChange={(e) => {
                  const newCookies = [...cookies];
                  newCookies[index].value = e.target.value;
                  props.onChange(newCookies);
                }}
              />
            );
          },
        },
        {
          title: "Action",
          key: "action",
          width: 100,
          render: (text, record, index) => {
            return (
              <a
                onClick={() => {
                  const newCookies = [...cookies];
                  newCookies.splice(index, 1);
                  props.onChange(newCookies);
                }}
              >
                Delete
              </a>
            );
          },
        },
      ]}
      locale={{
        emptyText: (
          <div>
            No Cookie,😁
            <a
              onClick={() => {
                const newCookies = [...cookies];
                newCookies.push({ name: "", value: "" });
                props.onChange(newCookies);
              }}
            >
              新建
            </a>
            一个?
          </div>
        ),
      }}
      tableLayout={"fixed"}
      scroll={{ y: 300 }}
    />
  );
};

export function parseCookie(cookie: string) {
  // 不能直接使用 cookie.split(";").map((item) => item.split("=")) 这样会导致被转义的;无法正确解析
  // 应该使用正则表达式: https://stackoverflow.com/questions/3393854/get-and-set-a-single-cookie-with-node-js-http-server
  // cookie中如果需要包含特殊符号;
  const regExp = /([^;=\s]*)=([^;]*)/g;
  const result = [];
  let match;
  while ((match = regExp.exec(cookie))) {
    result.push({ name: match[1], value: match[2] });
  }
  return result;
}

export function stringifyCookie(cookies: { name: string; value: string }[]) {
  // 根据 RFC 6265，Cookie 名称不应为空,如果设置了同名的 Cookie，则后一个会覆盖前一个，只有一个 Cookie 会被保留
  const effectiveCookies = cookies.filter((item) => item.name !== "");
  if (effectiveCookies.length === 0) {
    return "";
  }
  return effectiveCookies.map((item) => `${item.name}=${item.value}`).join(";");
}
