import { LabelSelector } from "@/components/LabelSelector";
import { LabelSelectFactory } from "@/components/LabelSelector/common";
import { EventBoard } from "@/components/Provider/Event";
import { BodyPanel } from "@/components/Provider/http/Request/Body";
import { HttpRequestHeader } from "@/components/Provider/http/Request/Header";
import { HttpMethod } from "@/components/Provider/http/Request/Method";
import { BodyDataItem } from "@/components/Provider/http/types.ts";
import { useApplicationContext } from "@/core";
import { TopicMessageMatcher } from "@/core/Socket";
import { WarningFilled } from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  FloatButton,
  Input,
  message,
  Popover,
  Switch,
  Table,
  Tabs,
  Tooltip
} from "antd";
import { IDockviewPanelProps } from "dockview/dist/cjs/dockview/dockview";
import { useEffect, useState } from "react";
import { HiCommandLine } from "react-icons/hi2";
import "./index.less";

export interface Request {
  version: string;
  url: string;
  method: string;
  headers: { [key: string]: string[] };
  body: string;
  timeout: number;
}

export interface Response {
  version: string;
  statusCode: number;
  uri: string;
  headers: { [key: string]: string[] };
  body: string;
}

export interface Certificate {
  publicEncoded: string;
  format: string;
  encoded: string;
  algorithm: string;
  type: string;
}

export interface SSL {
  peerHost: string;
  peerPort: number;
  protocol: string;
  lastAccessedTime: number;
  cipherSuite: string;
  creationTime: number;
  localCertificates: [Certificate];
  peerCertificates: [Certificate];
}

export interface Http {
  duration: number;
  request: Request;
  response: Response;
  ssl: SSL;
}

/**
 * http请求值提供器的参数定义
 */
export interface HttpValueProviderInformation {
  url?: string;
  method?: string;
  headers?: { [key: string]: string[] };
  body?: string;
  editorValues?: Record<string, string | BodyDataItem[]>;
  config?: unknown;
  extra?: {
    [index: string]: unknown;
  };
}

export const HttpValueProvider = (props: {
  data?: HttpValueProviderInformation;
  onSave?(data: HttpValueProviderInformation): void;
  onResponse?: (res: {
    statusCode: number;
    body: string;
    headers: { [key: string]: string[] };
    consumeTime: number;
  }) => void;
  onRequestDone?: (http: Http) => void;
  dockView?: IDockviewPanelProps;
}) => {
  // 请求地址
  const [url, setUrl] = useState("https://halo.p1n.top");
  // 请求方法
  const [method, setMethod] = useState("GET");
  // 请求的查询参数及其值定义
  const [queries, setQueries] = useState<
    { key: string; name: string; value: string }[]
  >([]);
  // 请求的路径参数及其值定义
  const [pathVariables, setPathVariables] = useState<
    { key: string; name: string; value: string }[]
  >([]);
  // 请求头定义
  const [headers, setHeaders] = useState<
    { key: string; name: string; value: string }[]
  >([]);
  const [realyHeaders, setRealyHeaders] = useState<Record<string, string[]>>(
    {},
  );
  // 原始请求体内容
  const [rawBody, setRawBody] = useState("");

  // 通过在多个子组件共享该数据,从而实现多面板之间的数据共享
  const [contentType, setContentType] = useState("application/json"); // 主要用于控制body的显示,比如json,form-data等

  // body编辑器中,不同编辑器的值
  const [editorValues, setEditorValues] = useState<
    Record<string, string | BodyDataItem[]>
  >({});

  useEffect(() => {
    if (!props.data) {
      return;
    }
    const data = props.data;
    setUrl(data.url || "");
    setMethod(data.method || "GET");
    // setQueries(
    //   (data.headers || []).map((item) => {
    //     return {
    //       key: Math.random().toString(36).substr(2),
    //       name: item.name,
    //       value: item.value,
    //     };
    //   }),
    // );
    const hds = Object.keys(data.headers || {}).map((key) => {
      return {
        key: Math.random().toString(36).substr(2),
        name: key,
        value: data.headers ? [key][0] : "",
      };
    });
    setHeaders(hds);
    setRawBody(data.body || "");
    setEditorValues(data.editorValues || {});
  }, [props.data]);

  const context = useApplicationContext();
  const [messageApi, contextHolder] = message.useMessage();

  const [sending, setSending] = useState(false);

  const [channel, setChannel] = useState<Core.Channel>();
  useEffect(() => {
    if (!channel) {
      setChannel(
        context.messageBus?.getOrCreateChannel("RunSimpleHttpValueProvider"),
      );
    }
  }, []);
  useEffect(() => {
    channel?.subscribe(TopicMessageMatcher.of("context-report"), (message) => {
      if (message.topic === "context-report") {
        if (message.payload.eventKind === "HTTP_REQUEST_DONE") {
          // 订阅http请求报告中的http请求事件,并且将http请求事件中的http请求数据存储到上下文中
          const httpPayLoad = message.payload.data as Http;
          props.onRequestDone?.(httpPayLoad);
          setSending(false);
        } else if (message.payload.eventKind === "HTTP_REQUEST_FAILED") {
          const error = message.payload.data.error;
          messageApi.error(error.message);
          setSending(false);
        }
      }
    });
  }, [channel]);
  useEffect(() => {
    if (headers.length === 0) {
      setRealyHeaders({});
      return;
    }
    // 查找Content-Type定义,忽略大小写
    const contentType = headers.find(
      (item) => item.name.toLowerCase() === "content-type",
    );
    setContentType(contentType?.value || "");
    // 将headers转换为map
    const realyHeaders: Record<string, string[]> = {};
    headers.forEach((item) => {
      // 考虑到headers中可能存在多个相同的key,所以这里需要使用数组来存储
      if (realyHeaders[item.name]) {
        realyHeaders[item.name].push(item.value);
      } else {
        realyHeaders[item.name] = [item.value];
      }
    });
    setRealyHeaders(realyHeaders);
  }, [headers]);

  useEffect(() => {
    // 获取url中被{{}}包裹的内容,但不包含{{}}
    const reg = /{{(.*?)}}/g;
    // 排除掉url中的查询参数,即?后面的内容
    const queryIndex = url.indexOf("?");
    const urlWithoutQuery =
      queryIndex === -1 ? url : url.substring(0, queryIndex);
    const matches = urlWithoutQuery.match(reg);
    matches?.forEach((item) => { });
    let index = -1;
    const newPathVariables = matches?.map((item) => {
      index++;
      // 去除{{}}
      const v = item.replace("{{", "").replace("}}", "");
      // 重新赋值时,按照原来的顺序进行赋值
      return {
        key: v,
        name: v,
        value: pathVariables[index]?.value || "",
      };
    });
    setPathVariables(newPathVariables || []);
  }, [url]);

  useEffect(() => {
    // 一定要注意,url和queries的变化会相互影响,所以需要在这里进行处理
    // 直接通过url来更新queries时,url的尾部可能会存在无意义的&符号,一定不要忽略,否则直接在url中更改查询参数时,会发生异常
    // 将queries中的数据转换为url参数
    // 截取url中第一个?之前的内容
    const index = url.indexOf("?");
    const oldUrl = index === -1 ? url : url.substring(0, index);

    // 拼接url参数
    const queriesString = queries
      // .filter((item) => item.name !== "")
      .map((item) => {
        return `${item.name}=${item.value}`;
      })
      .join("&");
    // 更新url,如果不存在查询参数,则不追加?
    if (queriesString === "") {
      setUrl(oldUrl);
      return;
    }
    console.log("queriesString", queriesString);
    setUrl(
      `${oldUrl}?${queriesString}${url.charAt(url.length - 1) === "&" ? "&" : ""
      }`,
    );
  }, [queries]);

  const [selector, setSelector] = useState<Core.LabelSelector<unknown>>({
    kind: "All",
    match: "",
    value: "",
  });

  return (
    <div className={"http-editor"}>
      {contextHolder}
      <div className={"title"}>
        <div>
          <Popover
            getTooltipContainer={(triggerNode) =>
              triggerNode.parentNode as HTMLElement
            }
            style={{ width: "200px" }}
            trigger={"click"}
            content={
              <LabelSelector
                factory={new LabelSelectFactory()}
                selector={selector}
                onChange={(v) => {
                  setSelector(v);
                }}
              />
            }
          >
            <Button>查询器</Button>
          </Popover>
        </div>
        <div className={"right"}>
          <Tooltip
            title={
              <Card>
                <WarningFilled /> 模式之间的切换会导致数据丢失
              </Card>
            }
          >
            <Switch checkedChildren="标准模式" unCheckedChildren="高级模式" />
          </Tooltip>
        </div>
      </div>
      <div className={"context-editor"}>
        {/*  上下文配置区域*/}
        {/*<Collapse items={[*/}
        {/*    {*/}
        {/*        key: '1',*/}
        {/*        label: '运行上下文变量配置',*/}
        {/*        children: <p>此处可以配置n多个card,引入不同的变量</p>,*/}
        {/*    },*/}
        {/*]} defaultActiveKey={['1']}/>*/}
      </div>
      <div className={"basic-info-header"}>
        <Input
          // size={"small"}
          addonBefore={
            <HttpMethod
              key={"method"}
              value={method}
              onChange={(v) => {
                setMethod(v);
              }}
            />
          }
          placeholder="请在此处输入url地址,通过{{value}}的方式可以从上下文获取值"
          value={url}
          onChange={(v) => {
            setUrl(v.target.value);
          }}
          addonAfter={
            <Dropdown.Button
              loading={sending}
              size={"small"}
              className={"send-button"}
              type={"primary"}
              onClick={() => {
                console.log("headers", headers, realyHeaders);
                setSending(true);
                channel?.publishAndWait(
                  {
                    topic: "executor/run",
                    type: "BROADCAST",
                    payload: {
                      valueProviderDefinition: {
                        name: "http",
                        kind: "http",
                        args: {
                          id: "@TMP-af8eeae9-b49d-4a8e-8c32-59d8bacfac10",
                          name: "args",
                          type: {
                            id: "18695fd2-47fe-41bc-b71c-34ca75e1192d",
                            name: "args",
                            type: {
                              typeName: "map",
                            },
                          },
                          value: {
                            name: "sameName",
                            kind: "sameName",
                            args: {
                              id: "@TMP-25fedc84-5aa8-4665-8c4f-cf7299be2bc7",
                              name: "name",
                              type: {
                                id: "8f384502-1b0e-40d1-adf0-cf7f6ab5e5e9",
                                name: "name",
                                type: {
                                  typeName: "string",
                                },
                              },
                            },
                          },
                          items: [
                            {
                              id: "@TMP-2b53ff2d-0ce2-42b2-8dca-d4248beb8117",
                              name: "url",
                              type: {
                                id: "fa63f315-9adb-40de-be6f-7d3363670f2d",
                                name: "url",
                                type: {
                                  typeName: "string",
                                  items: [],
                                },
                              },
                            },
                            {
                              id: "@TMP-0d044308-ad7c-4d3d-90eb-4bef7fbcbe23",
                              name: "method",
                              type: {
                                id: "53dd0039-703a-4b28-9c7a-b5b17fef1c4f",
                                name: "method",
                                type: {
                                  typeName: "string",
                                },
                              },
                            },
                            {
                              id: "@TMP-2bac6dec-8dda-46e9-88dc-c53c05e3e340",
                              name: "body",
                              type: {
                                id: "6dd6be0d-a189-48df-990c-4183389eec18",
                                name: "body",
                                type: {
                                  typeName: "string",
                                },
                              },
                            },
                            {
                              id: "@TMP-c4417427-d80c-4e6a-a207-6b36cb479957",
                              name: "headers",
                              type: {
                                id: "ea39b227-641b-4430-b69f-a670569508e9",
                                name: "headers",
                                type: {
                                  typeName: "map",
                                },
                              },
                            },
                            {
                              id: "@TMP-e6dec124-9405-46ea-b589-ea1c6511b04f",
                              name: "settings",
                              type: {
                                id: "eaf29eda-d764-4d1d-848d-180a13a10fde",
                                name: "settings",
                                type: {
                                  typeName: "map",
                                },
                              },
                            },
                          ],
                        },
                      },
                      batchId: "1Adkk-aakhh1F12g9",
                      variables: {
                        args: {
                          headers: realyHeaders,
                          url: url,
                          method: method,
                          body: "GET" === method.toLowerCase() ? "" : rawBody,
                        },
                      },
                    },
                  },
                  (msg) => {
                    if (props.onResponse) {
                      props.onResponse({
                        ...msg.payload,
                        consumeTime: msg.consumeTime,
                      });
                    }
                  },
                );
              }}
              menu={{
                items: [
                  {
                    key: "save",
                    label: "保存",
                    onClick: () => {
                      const hs: { [index: string]: string[] } = {};
                      headers.forEach((item) => {
                        if (hs[item.name]) {
                          hs[item.name].push(item.value);
                        } else {
                          hs[item.name] = [item.value];
                        }
                      });
                      props.onSave?.({
                        url: url,
                        method: method,
                        headers: hs,
                        body: rawBody,
                        editorValues: editorValues,
                      });
                    },
                  },
                ],
              }}
            >
              发送
            </Dropdown.Button>
          }
        />
      </div>
      {/*<div>*/}
      {/*  TODO,此处将共享请求头数据中的Content-Type,用户通过autoComplete的方式选择*/}
      {/*  默认通过Content-Type*/}
      {/*  value中的第一个值作为contentType,并根据contentType的值,自动切换body的编辑器*/}
      {/*  <br />*/}
      {/*  用户可以主动选择其他编辑器,来手动编辑数据,需要注意的是,当前生效的编辑器中产生的数据,才会作为最终的数据*/}
      {/*  <br />*/}
      {/*  因此body的编辑器支持将数据发送到其他编辑器中,比如json编辑器,form编辑器等,multipart/form-data编辑器以及raw编辑器*/}
      {/*  <br />*/}
      {/*  同时json编辑器,form编辑器,multipart/form-data编辑器也支持将数据发送到其他编辑器中,比如raw编辑器*/}
      {/*  只有raw编辑器不支持将数据发送到其他编辑器中*/}
      {/*</div>*/}
      <div className={"editor-tabs"}>
        <Tabs
          size={"small"}
          // type={"card"}
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Parameters",
              className: "parameter-editor",
              children: (
                <div>
                  <Card
                    size={"small"}
                    title={
                      <div className={"title"}>
                        <div className={"title-name"}>QueryParameter</div>
                        <div className={"title-tools"}>
                          <Button
                            shape={"circle"}
                            onClick={() => {
                              // 生成key值,直接使用uuid
                              const key = Math.random().toString(36).substr(2);
                              setQueries([
                                ...queries,
                                { key: key, name: "", value: "" },
                              ]);
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    }
                  >
                    <Table
                      size={"small"}
                      pagination={false}
                      columns={[
                        {
                          title: "参数名称",
                          dataIndex: "name",
                          key: "name",
                          width: 200,
                          render: (text, _, index) => (
                            <Input
                              defaultValue={text}
                              onChange={(e) => {
                                queries[index].name = e.target.value;
                                setQueries([...queries]);
                              }}
                            ></Input>
                          ),
                        },
                        {
                          title: "参数值",
                          dataIndex: "value",
                          key: "value",
                          render: (text, _, index) => (
                            <Input
                              defaultValue={text}
                              onChange={(e) => {
                                queries[index].value = e.target.value;
                                setQueries([...queries]);
                              }}
                            ></Input>
                          ),
                        },
                        {
                          title: "操作",
                          dataIndex: "action",
                          key: "action",
                          render: (_, record) => (
                            <Button
                              shape={"circle"}
                              onClick={() => {
                                const index = queries.findIndex(
                                  (item) => item.key === record.key,
                                );
                                queries.splice(index, 1);
                                setQueries([...queries]);
                              }}
                            >
                              X
                            </Button>
                          ),
                        },
                      ]}
                      dataSource={queries}
                    />
                  </Card>
                  <Card title={"PathParameters"}>
                    <Table
                      size={"small"}
                      pagination={false}
                      columns={[
                        {
                          title: "参数名称",
                          dataIndex: "name",
                          key: "name",
                          width: 200,
                          render: (text) => <a>{text}</a>,
                        },
                        {
                          title: "参数值",
                          dataIndex: "value",
                          key: "value",
                          render: (text, record, index) => (
                            <Input
                              defaultValue={text}
                              onChange={(e) => {
                                record.value = e.target.value;
                                pathVariables[index] = record;
                                setPathVariables([...pathVariables]);
                              }}
                            ></Input>
                          ),
                        },
                      ]}
                      dataSource={pathVariables}
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: "2",
              label: (
                <div>
                  <Tooltip title={"根据http协议,GET请求没有请求体"}>
                    Body
                  </Tooltip>
                </div>
              ),
              disabled: method === "GET",
              children: (
                <BodyPanel
                  editorValues={editorValues}
                  onEditorChange={(ev) => {
                    console.log("ev", ev);
                    setEditorValues({ ...ev });
                  }}
                  updateBodyValue={(type, value) => {
                    console.log("ev2", type, value, editorValues);
                    setEditorValues({ ...editorValues, [type]: value });
                  }}
                  contentType={contentType}
                  updateContentType={(contentType) => {
                    const head = headers.find(
                      (head) => head.name.toLowerCase() === "content-type",
                    );
                    if (head) {
                      head.value = contentType;
                    } else {
                      headers.push({
                        key: Math.random().toString(36).substr(2),
                        name: "Content-Type",
                        value: contentType,
                      });
                    }
                    setHeaders([...headers]);
                  }}
                  onValueChange={(value) => {
                    console.log("raw", value);
                    setRawBody(value);
                  }}
                />
              ),
            },
            {
              key: "3",
              label: "Headers",
              children: (
                <div>
                  <Card>
                    <HttpRequestHeader
                      headers={headers}
                      onChange={(headers) => {
                        setHeaders(headers);
                      }}
                      autoCompleteConfig={{
                        useAllValuesWhenNameIsEmpty: true,
                      }}
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: "4",
              label: "Authorization",
              children: "Content of Tab Pane 4",
            },
            {
              key: "5",
              label: "Pre Request Jobs",
              children: "Content of Tab Pane 5",
            },
            {
              key: "6",
              label: "Post Request Jobs",
              children: "Content of Tab Pane 6",
            },
            {
              key: "7",
              label: "Advanced Settings",
              children: (
                <div>
                  "Content of Tab Pane 7"
                  <pre>
                    {`
- 添加常用浏览器请求头,选择操作系统,浏览器,版本号,自动添加对应的请求头
- 比如:
- User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
- AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159
- Safari/537.36
- Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
- Accept-Encoding: gzip, deflate, br
- Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
- Cache-Control: no-cache
                  `}
                  </pre>
                </div>
              ),
            },
          ]}
        />
      </div>
      <Popover content={<EventBoard />}>
        <FloatButton
          icon={<HiCommandLine />}
          onClick={() => {
            // 因为上下文的交互采用的websocket,所以这里主要用来展示websocket的交互信息,可以理解为另一种形式的日志
          }}
        />
      </Popover>
    </div>
  );
};

/**
 * 计算两个字符串之间的编辑距离
 * @param a 字符串a
 * @param b 字符串b
 */
function levenshteinDistance(a, b) {
  const distanceMatrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    distanceMatrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1,
        distanceMatrix[j - 1][i] + 1,
        distanceMatrix[j - 1][i - 1] + indicator,
      );
    }
  }

  return distanceMatrix[b.length][a.length];
}
