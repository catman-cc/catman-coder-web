import { CheckCircleFilled, QuestionCircleOutlined } from "@ant-design/icons";
import { Editor } from "@monaco-editor/react";
import { Button, FloatButton, message, Table } from "antd";
import { useEffect, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "./ResizeHandle";
import styles from "./styles.module.css";
interface RawHeaderParserProps {
  name: string;
  defaultValue?: string;
  title?: React.ReactNode;
  language?: string;
  tableFixed?: number;
  parse(str: string): { key: string; name: string; value: string }[];
  afterParse?: (
    items: { key: string; name: string; value: string }[],
  ) => { key: string; name: string; value: string }[];
  onSave?: (items: { key: string; name: string; value: string }[]) => void;
}

export const RawHeaderParser = (props: RawHeaderParserProps) => {
  const [str, setStr] = useState(props.defaultValue || "");
  const [headers, setHeaders] = useState<
    { key: string; name: string; value: string }[]
  >([]);
  const [parseStatus, setParseStatus] = useState<
    "empty" | "unparse" | "parsed"
  >("unparse");
  useEffect(() => {
    setStr(props.defaultValue || str || "");
  }, [props]);
  return (
    <div
      style={{
        width: "1000px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            width: "50%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <QuestionCircleOutlined style={{ marginRight: "10px" }} />
            <span>
              {props.title ||
                `支持${props.name}格式的请求体，点击右下角按钮解析为表格格式`}
            </span>
          </div>
          <div></div>
        </div>
        <div className={styles.ButtonGroup}>
          <Button
            type={"dashed"}
            onClick={() => {
              setParseStatus("unparse");
              setStr("");
              setHeaders([]);
            }}
          >
            重置{props.name}编辑器
          </Button>
          <Button
            type={"default"}
            onClick={() => {
              setParseStatus("unparse");
              try {
                let items = props.parse(str);
                items = props.afterParse ? items : items;
                setHeaders(items);
                setParseStatus("parsed");
              } catch (e) {
                message.error(
                  `${props.name}解析失败，请检查${props.name}格式是否正确: ${e.message}`,
                );
              }
            }}
          >
            解析{props.name}
          </Button>
          <Button
            type={"primary"}
            disabled={headers.length === 0}
            onClick={() => {
              props.onSave && props.onSave(headers);
            }}
          >
            应用
          </Button>
        </div>
      </div>
      <PanelGroup autoSaveId="header-parser" direction="horizontal">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "98vw",
          }}
        >
          <Panel collapsible={true} order={1}>
            <div
              style={{
                // width: "50%",
                height: "100%",
                position: "relative",
                borderRight: "2px solid #e8e8e8",
              }}
            >
              <Editor
                value={str}
                defaultValue={`# 这里有一个curl命令示例,你可以将你的curl命令粘贴到这里
# 然后点击[解析按钮]将数据解析为表格格式,然后点击[应用]按钮将数据应用到请求头中
# 或者你也可以直接在表格中编辑数据,然后点击[应用]按钮将数据应用到请求头中
# 请不要以空白行开头
curl 'https://accounts.google.com/RotateCookies' \\
  -H 'authority: accounts.google.com' \\
  -H 'accept: */*' \\
  -H 'accept-language: zh-CN,zh;q=0.9' \\
  -H 'content-type: application/json' \\
  -H 'cookie: ACCOUNT_CHOOSER=a.b.c; HSID=c-e-d; SSID=AADE-asd-; APISID=bX7aD-ICbCi/AkN6wZ21yOjWq_ucW; SAPISID=MH3dSaISaIfGGAs_m6UU/AGKCVI2UhATi5oUH9; __Secure-1PAPISID=MH3dSVI2UhATi5oUU/AGKCVI2UhATi5oUH9; __Secure-3PAPISID=MH3UhATi5oUTi5oU6U/AGKCVYMySKYcah3FsSr9; __Secure-ENID=14.SE=kSI7hATi5kYo; LSOLH=_SVI_EKux7YzJNU1plOA_:123123131:0dc0; LSID=o.chromewebstore.google.com|o.domains.google.com|o.lens.google.com|o.mail.google.com|o.myaccount.google.com|o.myactivity.google.com|o.play.google.com|s.JP|s.blogger|s.youtube:dwiYH7p6l5g.; __Host-1PLSID=o.chromewebstore.google.com|o.domains.google.com|o.lens.google.com|o.mail.google.com|o.myaccount.google.com|o.myactivity.google.com|o.play.google.com|s.JP|s.blogger|s.youtube:dGQ87i1vgmoiGGQ87i1vQYA.; __Host-3PLSID=o.chromewebstore.google.com|o.domains.google.com|o.lens.google.com|o.mail.google.com|o.myaccount.google.com|o.myactivity.google.com|o.play.google.com|s.JP|s.blogger|s.youtube:dZ1RMI4xzJy0BJmYLuw.; __Host-GAPS=1:OUSOJG5Z1RMI4xzJyCJ; SID=eAiGtWh_H2kDnLKLKJx4SBoLYA.; __Secure-1PSID=_H2kDnLKJx4T4geK30t_J_VCIYh2Uk9hLe5.; __Secure-3PSID=1SNvKBhSzUUyPRWuAPEl_hOV.; SEARCH_SAMESITE=CgQI_JkB; AEC=AIdmp2nEW90wGHclXgvD0; 1P_JAR=2023-12-28-20; NID=511=CjEBPVxjSnKvzWYo91-DCzH94qDW6xkWQEY_4QiXledfFM2PceCIB; __Secure-1PSIDTS=sidts-CjEBPVxjSnKvzWYo91-o8h9_d7CObefXJhEAA; __Secure-3PSIDTS=sidts-CdfFM2PceCIBAA; SIDCC=WhQGnmAu-SywGXT9GW; __Secure-1PSIDCC=ABTY13GodD7; __Secure-3PSIDCC=31swlfDABTWhQGY' \\
  -H 'origin: https://accounts.google.com' \\
  -H 'referer: https://accounts.google.com/RotateCookiesPage?og_pid=1&rot=3&origin=https%3A%2F%2Fwww.google.com&exp_id=3701177' \\
  -H 'sec-ch-ua: "Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'sec-ch-ua-platform: "macOS"' \\
  -H 'sec-fetch-dest: empty' \\
  -H 'sec-fetch-mode: same-origin' \\
  -H 'sec-fetch-site: same-origin' \\
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' \\
  -H 'x-chrome-id-consistency-request: version=1,client_id=77185425430.apps.googleusercontent.com,device_id=15c4f118-a3f5-403d-b76f-df9b33f4d3fb,sync_account_id=110133584911469421960,signin_mode=all_accounts,signout_mode=show_confirmation' \\
  -H 'x-client-data: gotentJAQipncrcooBCNTvygEIlqHCIu2yQEIogleusenorbLAQiGn6s0B' \\
  --data-raw '[1,"-8933932139611034368"]' \\
  --compressed`}
                options={{
                  minimap: {
                    enabled: false,
                  },
                }}
                language={props.language || "json"}
                onChange={(value) => {
                  setStr(value || "");
                  setParseStatus(value ? "unparse" : "empty");
                }}
              />
              <FloatButton
                style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "20px",
                }}
                icon={
                  <CheckCircleFilled
                    style={{
                      color:
                        parseStatus === "unparse"
                          ? "black"
                          : parseStatus === "parsed"
                            ? "blue"
                            : "gray",
                    }}
                  />
                }
                type="default"
                onClick={() => {
                  try {
                    const items = props.parse(str);
                    setHeaders(items);
                    setParseStatus("parsed");
                  } catch (e) {
                    message.error(
                      `${props.name}解析失败，请检查JSON格式是否正确:${e.message}`,
                    );
                  }
                }}
              />
            </div>
          </Panel>
          <ResizeHandle />
          <Panel collapsible={true} order={2}>
            <div
              style={{
                height: "100%",
                position: "relative",
                borderLeft: "2px solid #e8e8e8",
              }}
            >
              <Table
                size={"small"}
                pagination={false}
                dataSource={headers}
                columns={[
                  {
                    title: "Name",
                    dataIndex: "name",
                    key: "name",
                    width: "40%",
                  },
                  {
                    title: "Value",
                    dataIndex: "value",
                    key: "value",
                    width: "40%",
                  },
                  {
                    title: "操作",
                    dataIndex: "operation",
                    key: "operation",
                    render: (text, record, index) => (
                      <Button
                        type={"link"}
                        onClick={() => {
                          const newHeaders = [...headers];
                          newHeaders.splice(index, 1);
                          setHeaders(newHeaders);
                        }}
                      >
                        删除
                      </Button>
                    ),
                  },
                ]}
                scroll={{
                  y: props.tableFixed || 300,
                }}
              />
            </div>
          </Panel>
        </div>
      </PanelGroup>
    </div>
  );
};
