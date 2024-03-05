import { useEffect, useMemo, useState } from "react";
import { AutoComplete, Button, Popover, Table, Tooltip } from "antd";
import {
  CandidateHeaders,
  commonRequestHeaders,
  commonRequestHeaderUsage,
  levenshteinDistance,
  mergeCandidateHeaders,
} from "@/components/Provider/http/Request/Header/common.tsx";
import { useDebounceFn } from "ahooks";
import IconCN from "@/components/Icon";
import {
  CookieEditor,
  parseCookie,
  stringifyCookie,
} from "@/components/Provider/http/Request/Header/CookieEditor";
import { UserAgentEditor } from "@/components/Provider/http/Request/Header/UserAgentEditor";
import { RawHeaderParser } from "@/components/Provider/http/Request/Header/HeadersPanel";
import * as curlconverter from "curlconverter";

export interface AutoCompleteConfig {
  useAllValuesWhenNameIsEmpty?: boolean;
}
export interface HttpRequestHeaderProps {
  headers: { key: string; name: string; value: string }[];
  onChange?: (headers: { key: string; name: string; value: string }[]) => void;
  extraCandidateHeaders?: CandidateHeaders;
  autoCompleteConfig?: AutoCompleteConfig;
}

/**
 * 有几个需要特殊处理的请求头,比如:
 * 1. User-Agent
 * 2. Cookie
 * 3. Referer
 * 4. Origin
 * 5. Host
 * 6. Content-Type
 * 这几个请求头在渲染的时候,除了可以手动输入之外,还可以通过配置面板进行配置
 * @param props
 * @constructor
 */
export const HttpRequestHeader = (props: HttpRequestHeaderProps) => {
  const [headers, setHeaders] = useState<
    { key: string; name: string; value: string }[]
  >([]);

  const [headerCandidateNames, setHeaderCandidateNames] = useState<
    { key: string; value: string }[]
  >([]);
  const [headerCandidateValues, setHeaderCandidateValues] = useState<
    { key: string; value: string }[]
  >([]);

  const [cookies, setCookies] = useState<{ name: string; value: string }[]>([]);
  const cookie = useMemo(() => {
    return stringifyCookie(cookies);
  }, [cookies]);

  const allCandidateHeaders = useMemo(() => {
    return mergeCandidateHeaders(
      commonRequestHeaders,
      props.extraCandidateHeaders,
    );
  }, [props.extraCandidateHeaders]);

  useEffect(() => {
    setHeaders(props.headers);
  }, [props]);

  const updateHeaders = useDebounceFn(
    () => {
      if (props.onChange) {
        props.onChange(headers);
      }
    },
    {
      wait: 500,
    },
  );
  useEffect(() => {
    updateHeaders.run();
    const cookieHeader = headers.find((header) => {
      return "cookie" === header.name?.trim().toLowerCase();
    });
    if (cookieHeader) {
      if (cookie === cookieHeader.value) {
        return;
      }
      const ck = parseCookie(cookieHeader.value || "");
      setCookies(ck);
    } else {
      setCookies([]);
    }
  }, [headers]);

  useEffect(() => {
    const cookieHeader = headers.find((header) => {
      return "cookie" === header.name?.trim().toLowerCase();
    });
    if (cookieHeader) {
      if (cookie === cookieHeader.value) {
        return;
      }
      cookieHeader.value = cookie;
      setHeaders([...headers]);
    } else {
      if (cookie) {
        headers.push({
          key: Math.random().toString(16).slice(2),
          name: "Cookie",
          value: cookie,
        });
        setHeaders([...headers]);
      }
    }
  }, [cookie]);

  return (
    <div>
      <div>
        <Table
          size={"small"}
          locale={{
            emptyText: (
              <Button
                style={{
                  width: "100%",
                }}
                icon={<IconCN type={"icon-add3"} />}
                onClick={() => {
                  headers.push({
                    key: Math.random().toString(16).slice(2),
                    name: "",
                    value: "",
                  });
                  setHeaders([...headers]);
                }}
              >
                新建一个请求头
              </Button>
            ),
          }}
          title={() => {
            return (
              <div className={"flex justify-end"}>
                <div>
                  <Popover
                    trigger={"click"}
                    content={
                      <div>
                        <CookieEditor
                          cookies={cookies}
                          onChange={(value) => {
                            setCookies(value);
                          }}
                        />
                      </div>
                    }
                  >
                    <Button icon={<IconCN type={"icon-cookie"} />}>
                      设置cookies
                    </Button>
                  </Popover>
                  <Button
                    icon={<IconCN type={"icon-CONTENTDELIVERY"} />}
                    onClick={() => {
                      headers.push({
                        key: Math.random().toString(16).slice(2),
                        name: "",
                        value: "",
                      });
                      setHeaders([...headers]);
                    }}
                  >
                    设置请求体内容格式
                  </Button>
                  <Popover
                    content={
                      <UserAgentEditor
                        onSelected={(v) => {
                          const userAgent = headers.find((header) => {
                            return (
                              "user-agent" === header.name?.trim().toLowerCase()
                            );
                          });
                          if (userAgent) {
                            userAgent.value = v;
                          } else {
                            headers.push({
                              key: Math.random().toString(16).slice(2),
                              name: "User-Agent",
                              value: v,
                            });
                          }
                          setHeaders([...headers]);
                        }}
                      />
                    }
                  >
                    <Button icon={<IconCN type={"icon-browser2"} />}>
                      设置浏览器标头
                    </Button>
                  </Popover>
                  <Popover
                    trigger={"click"}
                    content={
                      <div>
                        <RawHeaderParser
                          name={"curl"}
                          language={"shell"}
                          onSave={(items) => {
                            setHeaders(items);
                          }}
                          parse={(str) => {
                            const jsonString = curlconverter.toJsonString(str);
                            const json = JSON.parse(jsonString);
                            json.headers = json.headers || {};
                            const headers: {
                              key: string;
                              name: string;
                              value: string;
                            }[] = [];
                            Object.entries(json.headers).forEach(
                              ([key, value]) => {
                                headers.push({
                                  key: Math.random().toString(16).slice(2),
                                  name: key,
                                  value: value as string,
                                });
                              },
                            );
                            return headers;
                          }}
                        />
                      </div>
                    }
                  >
                    <Button icon={<IconCN type={"icon-import3"} />}>
                      从...导入
                    </Button>
                  </Popover>
                </div>
                <Button
                  icon={<IconCN type={"icon-add3"} />}
                  onClick={() => {
                    headers.push({
                      key: Math.random().toString(16).slice(2),
                      name: "",
                      value: "",
                    });
                    setHeaders([...headers]);
                  }}
                ></Button>
              </div>
            );
          }}
          pagination={false}
          dataSource={headers}
          showHeader={false}
          bordered
          footer={() => {
            return (
              <div
                style={{
                  width: "100%",
                }}
              >
                {/*<Button*/}
                {/*  icon={<IconCN type={"icon-add3"} />}*/}
                {/*  style={{*/}
                {/*    width: "100%",*/}
                {/*  }}*/}
                {/*  onClick={() => {*/}
                {/*    headers.push({*/}
                {/*      key: Math.random().toString(16).slice(2),*/}
                {/*      name: "",*/}
                {/*      value: "",*/}
                {/*    });*/}
                {/*    setHeaders([...headers]);*/}
                {/*  }}*/}
                {/*>*/}
                {/*  添加请求头*/}
                {/*</Button>*/}
              </div>
            );
          }}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              render: (_, record, index) => {
                return (
                  <div className={"flex justify-between"}>
                    <div>
                      <AutoComplete
                        value={record.name}
                        options={headerCandidateNames}
                        onFocus={() => {
                          const options = [];
                          for (const key in allCandidateHeaders) {
                            options.push({
                              label: key,
                              value: key,
                              key: key,
                            });
                          }
                          setHeaderCandidateNames(options);
                        }}
                        onSearch={(value) => {
                          const options = [];
                          for (const key in allCandidateHeaders) {
                            if (
                              key.toLowerCase().includes(value.toLowerCase())
                            ) {
                              options.push({
                                label: key,
                                value: key,
                                key: key,
                              });
                            }
                          }
                          setHeaderCandidateNames(
                            options.sort((a, b) => {
                              return (
                                levenshteinDistance(a.label, value) -
                                levenshteinDistance(b.label, value)
                              );
                            }),
                          );
                        }}
                        popupMatchSelectWidth={false}
                        style={{ width: 300 }}
                        onSelect={(v) => {
                          record.name = v;
                          headers[index] = record;
                          setHeaders([...headers]);
                        }}
                        onChange={(v) => {
                          record.name = v;
                          headers[index] = record;
                          setHeaders([...headers]);
                        }}
                      ></AutoComplete>
                    </div>
                    {commonRequestHeaderUsage[record.name?.toLowerCase()] !==
                      undefined && (
                      <div>
                        <Tooltip
                          title={
                            commonRequestHeaderUsage[
                              record.name?.toLowerCase()
                            ] as string
                          }
                        >
                          <IconCN
                            type={"icon-tips_fill"}
                            style={{ color: "blue" }}
                          />
                        </Tooltip>
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              title: "Value",
              dataIndex: "value",
              key: "value",
              width: "70%",
              render: (_, record, index) => {
                return (
                  <div>
                    <AutoComplete
                      value={record.value}
                      style={{ width: 300 }}
                      options={headerCandidateValues}
                      onFocus={() => {
                        const options = [];
                        const header = headers[index];
                        if (header.name) {
                          const values = allCandidateHeaders[header.name];
                          for (const item of values) {
                            options.push({
                              label: item,
                              value: item,
                              key: item,
                            });
                          }
                        } else {
                          if (
                            props.autoCompleteConfig
                              ?.useAllValuesWhenNameIsEmpty
                          ) {
                            for (const key in allCandidateHeaders) {
                              allCandidateHeaders[key].forEach((item) => {
                                options.push({
                                  label: item,
                                  value: item,
                                  key: item,
                                });
                              });
                            }
                          }
                        }
                        setHeaderCandidateValues(
                          options.reduce((acc, cur) => {
                            if (
                              acc.findIndex(
                                (item) => item.label === cur.label,
                              ) === -1
                            ) {
                              acc.push(cur);
                            }
                            return acc;
                          }, []),
                        );
                      }}
                      onSearch={(value) => {
                        const options = [];
                        const header = headers[index];
                        const values = allCandidateHeaders[header.name];
                        if (values) {
                          for (const item of values) {
                            if (item.indexOf(value) !== -1) {
                              options.push({
                                label: item,
                                value: item,
                                key: item,
                              });
                            }
                          }
                        }
                        setHeaderCandidateValues(
                          options.sort((a, b) => {
                            return (
                              levenshteinDistance(a.label, value) -
                              levenshteinDistance(b.label, value)
                            );
                          }),
                        );
                      }}
                      popupMatchSelectWidth={false}
                      onSelect={(v) => {
                        record.value = v;
                        headers[index] = record;
                        setHeaders([...headers]);
                      }}
                      onChange={(v) => {
                        record.value = v;
                        headers[index] = record;
                        setHeaders([...headers]);
                      }}
                    ></AutoComplete>
                    <Button
                      type={"text"}
                      shape={"circle"}
                      icon={<IconCN type={"icon-tablerowplusbefore"} />}
                      onClick={() => {
                        headers.splice(index, 0, {
                          key: Math.random().toString(16).slice(2),
                          name: "",
                          value: "",
                        });
                        setHeaders([...headers]);
                      }}
                    />
                    <Button
                      type={"text"}
                      shape={"circle"}
                      icon={<IconCN type={"icon-tablerowplusafter"} />}
                      onClick={() => {
                        headers.splice(index + 1, 0, {
                          key: Math.random().toString(16).slice(2),
                          name: "",
                          value: "",
                        });
                        setHeaders([...headers]);
                      }}
                    />
                    <Button
                      type={"text"}
                      shape={"circle"}
                      icon={<IconCN type={"icon-magic1"} />}
                    />
                    <Button
                      type={"text"}
                      shape={"circle"}
                      icon={
                        <IconCN
                          type={"icon-delete"}
                          onClick={() => {
                            headers.splice(index, 1);
                            setHeaders([...headers]);
                          }}
                        />
                      }
                    />
                  </div>
                );
              },
            },
          ]}
        />
      </div>
    </div>
  );
};
