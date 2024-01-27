import { Http } from "@/components/Provider/http";
import { EventConsole } from "@/components/Provider/http/Response/Event";
import HtmlEditor from "@/components/Provider/http/Response/HtmlEditor";
import { RawHttpPanel } from "@/components/Provider/http/Response/RawHttpPanel";
import { Render } from "@/components/Provider/http/Response/Render";
import { SSLPanel } from "@/components/Provider/http/Response/SSLPanel";
import { computeStrSize } from "@/core/common/utils";
import { Card, Space, Table, Tabs } from "antd";
import { useEffect, useState } from "react";

export interface ResponseViewProps {
  http: Http;
}
export const ResponseView = (props: ResponseViewProps) => {
  const [response, setResponse] = useState(props.http.response);
  const [http, setHttp] = useState(props.http);
  const [headerData, setHeaderData] = useState<
    { key: string; value: string[] }[]
  >([]);
  const [statusColor, setStatusColor] = useState<
    "gray" | "green" | "red" | "orange"
  >("green");
  const [timeColor, setTimeColor] = useState<"green" | "red" | "orange">(
    "green",
  );
  const [bodySize, setBodySize] = useState<string | null>(null)
  const [bodySizeColor, setBodySizeColor] = useState<"gray" | "green" | "red" | "orange">("green")

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!props.http) {
      return;
    }
    console.log("response view", props.http);
    const response = props.http.response;
    if (props.http.duration > 1000) {
      setTimeColor("red");
    } else if (props.http.duration > 100) {
      setTimeColor("orange");
    } else {
      setTimeColor("green");
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      setStatusColor("green");
    } else if (response.statusCode >= 300 && response.statusCode < 400) {
      setStatusColor("orange");
    } else if (response.statusCode >= 400) {
      setStatusColor("red");
    } else {
      setStatusColor("gray");
    }

    setStatusColor(
      response.statusCode >= 200 && response.statusCode < 300 ? "green" : "red",
    );
    const data: { key: string; value: string[] }[] = [];
    for (const key in response?.headers) {
      data.push({
        key: key,
        value: response?.headers[key],
      });
    }
    if (response.body) {
      setBodySize(computeStrSize(response.body))
      const length = response.body.length
      if (length < 1024) {
        setBodySizeColor("green")
      } else if (length / 1024 < 25) {
        setBodySizeColor("gray")
      } else if (length / 1024 <= 100) {
        setBodySizeColor("orange")
      } else {
        setBodySizeColor("red")
      }
    } else {
      setBodySize(null)
      setBodySizeColor("green")
    }

    setHeaderData([...data]);
    setResponse({ ...response });
    setHttp({ ...props.http });
  }, [props]);

  return (
    <Card
      size={"small"}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Tabs
        tabBarExtraContent={
          <div>
            <Space>
              status:
              <div style={{ textAlign: "center", color: statusColor }}>
                {response?.statusCode}
              </div>
              耗时:
              <div style={{ textAlign: "center", color: timeColor }}>
                {http.duration}ms
              </div>
              {bodySize && (
                <>
                  响应体大小:
                  <div style={{ textAlign: "center", color: bodySizeColor }}>
                    {bodySize}
                  </div>
                </>
              )}
            </Space>
          </div>
        }
        defaultActiveKey={"响应体"}
        items={[
          {
            key: "raw",
            label: "基础信息",
            children: (
              <div>
                <RawHttpPanel http={http} />{" "}
              </div>
            ),
          },
          {
            key: "响应头",
            label: "响应头",
            children: (
              <div>
                <Table
                  size={"small"}
                  pagination={false}
                  columns={[
                    {
                      title: "响应头",
                      dataIndex: "key",
                      render: (value: string) => {
                        return <div>{value}</div>;
                      },
                    },
                    {
                      title: "值",
                      dataIndex: "value",
                      render: (value: string[]) => {
                        return (
                          <div>
                            {value.map((item, index) => {
                              return <div key={index}>{item}</div>;
                            })}
                          </div>
                        );
                      },
                    },
                  ]}
                  dataSource={headerData}
                />
              </div>
            ),
          },
          {
            key: "响应体",
            label: "响应体",
            children: (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <HtmlEditor
                  code={response?.body}
                  contentType={
                    response.headers[
                    Object.keys(response?.headers).find(
                      (head) => head.toLowerCase() === "content-type",
                    ) || ""
                    ]?.[0]
                  }
                />
              </div>
            ),
          },
          {
            key: "耗时",
            label: "耗时",
            children: <div>耗时:{http.duration}ms</div>,
          },
          {
            key: "事件面板",
            label: "事件面板",
            children: (
              <div>
                <EventConsole logs={logs} />
              </div>
            ),
          },
          {
            key: "证书",
            label: "证书",
            children: (
              <div>
                <SSLPanel ssl={http.ssl}></SSLPanel>
              </div>
            ),
          },
          {
            key: "虚拟渲染",
            label: "虚拟渲染",
            children: (
              <Render
                content={response?.body}
                contentType={
                  response.headers[
                  Object.keys(response?.headers).find(
                    (head) => head.toLowerCase() === "content-type",
                  ) || ""
                  ]?.[0]
                }
                http={http}
              />
            ),
          },
        ]}
      />
    </Card>
  );
};
