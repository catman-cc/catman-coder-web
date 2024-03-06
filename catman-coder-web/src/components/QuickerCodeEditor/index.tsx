import "./index.less";
import { Editor } from "@monaco-editor/react";
import { AutoComplete, Card } from "antd";
import { useEffect, useState } from "react";
import IconCN from "@/components/Icon";
import { editor } from "monaco-editor";
export interface QuickerCodeEditorProps {
  language?: string;
  value?: string;
  onChange?: (value: string) => void;
}
export const QuickerCodeEditor = (props: QuickerCodeEditorProps) => {
  const [language, setLanguage] = useState("json");
  useEffect(() => {
    if (props.language) {
      setLanguage(props.language);
    }
  }, [props]);

  return (
    <div className={"quicker-code-editor"}>
      <Card
        size={"small"}
        className={"code-editor"}
        title={
          <div className={"flex justify-between code-editor-title"}>
            <div>
              <IconCN type={"icon-code2"} />
              快速代码编辑器
            </div>
            <div>
              语言类型:
              <AutoComplete
                size={"small"}
                style={{ width: 100 }}
                value={language}
                popupMatchSelectWidth={false}
                options={[
                  {
                    label: "json",
                    value: "json",
                  },
                  {
                    label: "javascript",
                    value: "javascript",
                  },
                  {
                    label: "typescript",
                    value: "typescript",
                  },
                  {
                    label: "html",
                    value: "html",
                  },
                  {},
                ]}
                onChange={(v) => {
                  setLanguage(v);
                }}
              />
            </div>
          </div>
        }
        bordered={false}
      >
        <div className={"code-editor"}>
          <Editor
            width={"100%"}
            height={"100%"}
            className={"code-editor-content"}
            language={language}
            defaultValue={props.value}
            onChange={(value) => {
              {
                if (props.onChange) {
                  props.onChange(value || "");
                }
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
};
