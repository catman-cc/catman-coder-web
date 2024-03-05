import {
  BaseLabelSelectorProps,
  LabelSelector,
} from "@/components/LabelSelector";
import { Button, Card, Popover, Tooltip } from "antd";
import IconCN from "@/components/Icon";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";
export interface SelectorPanelProps extends BaseLabelSelectorProps {
  onApply?(selector: Core.LabelSelector<unknown>): void;
}
export const SelectorPanel = (props: SelectorPanelProps) => {
  const [editorError, setEditorError] = useState<string>("");
  const [checkError, setCheckError] = useState<string>("");
  return (
    <Card
      title={
        <div className={" flex justify-between"}>
          <div>
            <h2>查询构建器</h2>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button
              // size={"small"}
              // type={"link"}
              style={{
                marginRight: "10px",
              }}
              icon={<IconCN type={"icon-search6"} />}
              onClick={() => {
                props.onApply?.(props.selector);
              }}
            >
              应用
            </Button>
            <Popover
              trigger={"click"}
              placement={"rightBottom"}
              content={
                <div
                  style={{
                    width: "500px",
                    height: "400px",
                    position: "relative",
                  }}
                >
                  <Editor
                    width={"100%"}
                    height={"100%"}
                    value={JSON.stringify(props.selector, null, 2)}
                    onChange={(v) => {
                      try {
                        props.onChange(JSON.parse(v));
                        setEditorError("");
                      } catch (e) {
                        setEditorError(e.message);
                      }
                    }}
                    onValidate={(v) => {
                      if (v.length > 0) {
                        const marker = v[0];
                        setCheckError(
                          `${marker.message} at line ${marker.endLineNumber} column ${marker.endColumn}`,
                        );
                      } else {
                        setCheckError("");
                      }
                    }}
                    onMount={(editor, monaco) => {
                      const uri = monaco.Uri.parse(
                        "http://myserver/foo-schema.json",
                      );
                      let m = monaco.editor.getModel(uri);
                      if (m === null) {
                        m = monaco.editor.createModel(
                          JSON.stringify(props.selector, null, 2),
                          "json",
                          uri,
                        );
                      }
                      editor.setModel(m);
                    }}
                    beforeMount={(monaco) => {
                      const uri = monaco.Uri.parse(
                        "http://myserver/foo-schema.json",
                      );
                      let m = monaco.editor.getModel(uri);
                      if (m === null) {
                        m = monaco.editor.createModel(
                          JSON.stringify(props.selector, null, 2),
                          "json",
                          uri,
                        );
                      }
                      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                        validate: true,
                        schemas: [
                          {
                            fileMatch: [uri.toString()],
                            uri: "http://myserver/foo-schema.json", // id of the first schema
                            schema: {
                              type: "object",
                              properties: {
                                match: {
                                  type: "string",
                                },
                                kind: {
                                  type: "string",
                                },
                                value: {},
                                rules: {
                                  type: "array",
                                  items: {
                                    $ref: "#/definitions/LabelSelector",
                                  },
                                },
                              },
                              required: ["match", "kind", "value"],
                              definitions: {
                                LabelSelector: {
                                  type: "object",
                                  properties: {
                                    match: {
                                      type: "string",
                                    },
                                    kind: {
                                      type: "string",
                                    },
                                    value: {},
                                    rules: {
                                      type: "array",
                                      items: {
                                        $ref: "#/definitions/LabelSelector",
                                      },
                                    },
                                  },
                                  required: ["match", "kind", "value"],
                                },
                              },
                            },
                          },
                        ],
                      });
                    }}
                  />
                  {(editorError || checkError) && (
                    <div
                      style={{
                        color: "yellow",
                        width: "460px",
                        backgroundColor: "black",
                        borderRadius: "4px",
                        position: "absolute",
                        bottom: "10px",
                        left: "20px",
                        padding: "4px",
                      }}
                    >
                      {editorError || checkError}
                    </div>
                  )}
                </div>
              }
            >
              <Tooltip title={"使用monaco编辑器,编辑元数据"}>
                <Button icon={<IconCN type={"icon-code2"} />} />
              </Tooltip>
            </Popover>
          </div>
        </div>
      }
    >
      <div
        style={{
          maxWidth: "90vw",
          maxHeight: "60vh",
          minHeight: "300px",
          overflow: "auto",
        }}
      >
        <LabelSelector
          factory={props.factory}
          selector={props.selector}
          onChange={(v) => {
            props.onChange(v);
          }}
          keyAutoOptions={props.keyAutoOptions}
          valueAutoOptions={props.valueAutoOptions}
        />
      </div>
    </Card>
  );
};
