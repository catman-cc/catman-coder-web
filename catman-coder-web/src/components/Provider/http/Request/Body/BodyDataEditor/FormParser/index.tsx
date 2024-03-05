import { BodyDataEditor } from "@/components/Provider/http/Request/Body/BodyDataEditor";
import { parseMultipartFormData } from "@/components/Provider/http/Common";
import { BodyDataItem } from "@/components/Provider/http/types.ts";
import { CheckCircleFilled, QuestionCircleOutlined } from "@ant-design/icons";
import { Editor } from "@monaco-editor/react";
import { Button, FloatButton } from "antd";
import { useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "./ResizeHandle";
import styles from "./styles.module.css";
import useMessage from "antd/es/message/useMessage";
interface FormParseProps {
  formContent?: string;
  afterParse?: (items: BodyDataItem[]) => BodyDataItem[];
  onSave?: (items: BodyDataItem[]) => void;
}

export const FormParse = (props: FormParseProps) => {
  const [formStr, setFormStr] = useState("");
  const [bodyData, setBodyData] = useState<BodyDataItem[]>([]);
  const [parseStatus, setParseStatus] = useState<
    "empty" | "unparse" | "parsed"
  >("unparse");
  const [message, messageContext] = useMessage();
  return (
    <div
      style={{
        width: "1000px",
      }}
    >
      {{ ...messageContext }}
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
              支持标准的multipart/form-data格式的请求体，点击右下角按钮解析为表格格式
            </span>
          </div>
          <div></div>
        </div>
        <div className={styles.ButtonGroup}>
          <Button
            type={"dashed"}
            onClick={() => {
              setParseStatus("unparse");
              setFormStr("");
              setBodyData([]);
            }}
          >
            重置编辑器
          </Button>
          <Button
            type={"default"}
            onClick={() => {
              setParseStatus("unparse");
              try {
                let items = parseMultipartFormData(formStr);
                console.log("items", items);
                items = props.afterParse ? items : items;
                setBodyData(items);
                setParseStatus("parsed");
              } catch (e) {
                message.warning(e.message);
                setParseStatus("unparse");
              }
            }}
          >
            解析
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
      <PanelGroup autoSaveId="form-parser" direction="horizontal">
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
                value={formStr}
                language={"text"}
                onChange={(value) => {
                  setFormStr(value || "");
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
                  console.log(
                    "asddadada",
                    parseMultipartFormData(formStr),
                    // parse(new TextEncoder().encode(formStr)),
                  );
                  // const items = parseMultipartFormData(formStr);
                  //
                  // setBodyData(items);
                  // setParseStatus("parsed");
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
              />
            </div>
          </Panel>
        </div>
      </PanelGroup>
    </div>
  );
};
