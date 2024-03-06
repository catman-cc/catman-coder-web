import { Http } from "@/components/Provider/http";
import { Card, Collapse, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { InfoCircleFilled } from "@ant-design/icons";
import { FaTable } from "react-icons/fa";
import MonacoEditor from "react-monaco-editor/lib/editor";
import { Editor } from "@monaco-editor/react";

interface RawHttpPanelProps {
  http: Http;
}
export const RawHttpPanel = (props: RawHttpPanelProps) => {
  const [http, setHttp] = useState<Http>(props.http);
  const [requestHeaderData, setRequestHeaderData] = useState<
    { key: string; value: string[] }[]
  >([]);
  const [general, setGeneral] = useState<{ key: string; value: string[] }[]>(
    [],
  );
  const [responseHeaderData, setResponseHeaderData] = useState<
    { key: string; value: string[] }[]
  >([]);

  useEffect(() => {
    if (!props.http) {
      return;
    }
    const reqHeaders: { key: string; value: string[] }[] = [];
    for (const key in props.http.request.headers) {
      reqHeaders.push({
        key: key,
        value: props.http.request.headers[key],
      });
    }
    setGeneral([
      {
        key: "Request URL",
        value: [props.http.request.url],
      },
      {
        key: "Request Method",
        value: [props.http.request.method],
      },
      {
        key: "Status Code",
        value: [props.http.response.statusCode.toString()],
      },
      {
        key: "Remote Address",
        value: [props.http.ssl?.peerHost + ":" + props.http.ssl?.peerPort],
      },
    ]);
    const respHeaders: { key: string; value: string[] }[] = [];
    for (const key in props.http.response.headers) {
      respHeaders.push({
        key: key,
        value: props.http.response.headers[key],
      });
    }
    setResponseHeaderData([...respHeaders]);
    setRequestHeaderData([...reqHeaders]);
    setHttp({ ...props.http });
  }, [props]);

  useEffect(() => {
    console.log("http", http);
  }, [http]);
  return (
    <Card size={"small"}>
      {/*   请求信息 */}
      {/*    请求方法,请求地址 */}
      {/*    请求头 */}
      {/*    请求体 */}
      {/*   响应信息 */}
      {/*    响应状态码 */}
      {/*    响应头 */}
      {/*    响应体 */}
      <Collapse
        defaultActiveKey={[
          "General",
          "response",
          "Request Headers",
          "Request Body",
          "Response Body",
        ]}
        bordered={false}
        ghost={true}
        items={[
          {
            key: "General",
            label: (
              <div>
                <InfoCircleFilled /> General
              </div>
            ),
            children: (
              <div>
                <Table
                  showHeader={false}
                  size={"small"}
                  pagination={false}
                  columns={[
                    {
                      title: "请求头",
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
                  dataSource={general}
                />
              </div>
            ),
          },
          {
            key: "response",
            label: (
              <div>
                <FaTable /> Response Headers
              </div>
            ),
            children: (
              <div>
                <Table
                  showHeader={false}
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
                  dataSource={responseHeaderData}
                />
              </div>
            ),
          },
          {
            key: "Request Headers",
            label: (
              <div>
                <FaTable /> Request Headers
              </div>
            ),
            children: (
              <div>
                {Object.entries(requestHeaderData).length > 0 ? (
                  <Table
                    showHeader={false}
                    size={"small"}
                    pagination={false}
                    columns={[
                      {
                        title: "请求头",
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
                    dataSource={requestHeaderData}
                  />
                ) : (
                  <Tag color={"yellow"}>
                    There is no request header for this request.
                  </Tag>
                )}
              </div>
            ),
          },
          {
            key: "Request Body",
            label: (
              <div>
                <FaTable /> Request Body
              </div>
            ),
            children: (
              <div
                style={{
                  // height: "150px",
                  border: "1px solid #d9d9d9",
                }}
              >
                {http.request.body.length > 0 ? (
                  <MonacoEditor
                    value={http.request.body}
                    height={"150px"}
                    width={"100%"}
                    language={"html"}
                    options={{
                      readOnly: true,
                      minimap: {
                        enabled: false,
                      },
                    }}
                  />
                ) : (
                  <Tag color={"yellow"}>
                    There is no request body for this request.
                  </Tag>
                )}
              </div>
            ),
          },
          {
            key: "Response Body",
            label: (
              <div>
                <FaTable /> Response Body
              </div>
            ),
            children: (
              <div
                style={{
                  // height: "150px",
                  border: "1px solid #d9d9d9",
                }}
              >
                {http.response.body.length > 0 ? (
                  <MonacoEditor
                    value={http.response.body}
                    height={"150px"}
                    width={"100%"}
                    language={"html"}
                    options={{
                      readOnly: true,
                      minimap: {
                        enabled: false,
                      },
                    }}
                  />
                ) : (
                  <Tag color={"yellow"}>
                    There is no response body for this request.
                  </Tag>
                )}
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
};
