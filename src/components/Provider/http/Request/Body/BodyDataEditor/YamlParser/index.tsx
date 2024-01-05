import { BodyDataEditor } from "@/components/Provider/http/Request/Body/BodyDataEditor";
import { BodyDataItem } from "@/components/Provider/http/types.ts";
import { CheckCircleFilled, QuestionCircleOutlined } from "@ant-design/icons";
import { Editor } from "@monaco-editor/react";
import { Button, FloatButton, message } from "antd";
import { useEffect, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "./ResizeHandle";
import styles from "./styles.module.css";
interface RawStringParseProps {
  name: string;
  defaultValue?: string;
  title?: React.ReactNode;
  language?: string;
  tableFixed?: number;
  parse(str: string): BodyDataItem[];
  afterParse?: (items: BodyDataItem[]) => BodyDataItem[];
  onSave?: (items: BodyDataItem[]) => void;
}

export const RawStringParser = (props: RawStringParseProps) => {
  const [str, setStr] = useState(props.defaultValue || "");
  const [bodyData, setBodyData] = useState<BodyDataItem[]>([]);
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
              setBodyData([]);
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
                setBodyData(items);
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
            disabled={bodyData.length === 0}
            onClick={() => {
              props.onSave && props.onSave(bodyData);
            }}
          >
            应用
          </Button>
        </div>
      </div>
      <PanelGroup autoSaveId="json-parser" direction="horizontal">
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
                    setBodyData(items);
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
              <BodyDataEditor
                bodyData={bodyData}
                hideHeader={true}
                hideColumns={["description", "action"]}
                uiConfig={{
                  size: "small",
                  inPopover: true,
                  tableFixed: props.tableFixed || 300,
                }}
              />
            </div>
          </Panel>
        </div>
      </PanelGroup>
    </div>
  );
};
