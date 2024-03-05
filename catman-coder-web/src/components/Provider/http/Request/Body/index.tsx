import { useEffect, useMemo, useState } from "react";
import { BodyDataItem } from "@/components/Provider/http/types.ts";
import { Button, Card, Input, Select, Table, Tabs, Tag, Upload } from "antd";
import { BodyDataEditor } from "@/components/Provider/http/Request/Body/BodyDataEditor";
import MonacoCodeEditor from "@/components/CodeEditor";
import { UploadOutlined } from "@ant-design/icons";
export interface BodyPanelProps {
  contentType: string;
  updateContentType?: (value: string) => void;
  editorValues: Record<string, string | BodyDataItem[]>;
  defaultActiveEditor?: EditorValueEnum;
  updateBodyValue?: (type: string, value: string) => void;
  onEditorChange?: (
    editorValues: Record<string, string | BodyDataItem[]>,
  ) => void;
  onValueChange?: (value: string) => void;
}

export enum EditorValueEnum {
  GeneralStructureEditor = "General-structure-editor",
  GeneralStructureEditorString = "General-structure-editor-string",
  Json = "json",
  FormData = "form-data",
  Binary = "binary",
  None = "none",
  Raw = "raw",
  XWwwFormUrlencoded = "x-www-form-urlencoded",
  GraphQL = "GraphQL",
}
export const BodyPanel = (props: BodyPanelProps) => {
  // 根据编辑器类型,保存编辑器对应的值
  const [editorValues, setEditorValues] = useState<
    Record<string, string | BodyDataItem[]>
  >(
    props.editorValues || {
      [EditorValueEnum.GeneralStructureEditor]: [],
      [EditorValueEnum.Json]: "",
      [EditorValueEnum.FormData]: "",
      [EditorValueEnum.Binary]: "",
      [EditorValueEnum.None]: "",
      [EditorValueEnum.Raw]: "",
      [EditorValueEnum.XWwwFormUrlencoded]: "",
      [EditorValueEnum.GraphQL]: "",
    },
  );
  const bodyData: BodyDataItem[] = useMemo(() => {
    console.log("editorValues", editorValues);
    return (editorValues[EditorValueEnum.GeneralStructureEditor] ||
      []) as BodyDataItem[];
  }, [editorValues]);
  // 记录当前激活的编辑器,
  const [activeEditor, setActiveEditor] = useState(
    EditorValueEnum.GeneralStructureEditor,
  );
  // 通过在多个子组件共享该数据,从而实现多面板之间的数据共享
  const [contentType, setContentType] = useState("application/json"); // 主要用于控制body的显示,比如json,form-data等
  const [body, setBody] = useState<string>(""); // 主要用于控制body的显示,比如json,form-data等

  useEffect(() => {
    setContentType(props.contentType);
  }, [props.contentType]);

  useEffect(() => {
    setEditorValues(props.editorValues || {});
  }, [props.editorValues]);

  useEffect(() => {
    props.updateContentType && props.updateContentType(contentType);
  }, [contentType]);

  const updateEditorValues = (type: string, value: string | BodyDataItem[]) => {
    if (props.updateBodyValue) {
      props.updateBodyValue(type, value as string);
    } else if (props.onEditorChange) {
      props.onEditorChange({ ...editorValues, [type]: value });
    } else {
      setEditorValues({
        ...editorValues,
        [type]: value,
      });
    }
  };
  return (
    <div>
      <div></div>
      <div>
        <Tabs
          defaultActiveKey={
            activeEditor || EditorValueEnum.GeneralStructureEditor
          }
          activeKey={activeEditor || EditorValueEnum.GeneralStructureEditor}
          onChange={(key) => {
            setActiveEditor(key as EditorValueEnum);
          }}
          size={"small"}
          items={[
            {
              key: EditorValueEnum.GeneralStructureEditor,
              label: "General structure editor",
              children: (
                <Card
                  title={
                    <div className={"toolbar"}>
                      <div>
                        通用编辑器
                        <span
                          style={{
                            color: "gray",
                            fontSize: "0.7em",
                          }}
                        >
                          {
                            "用于编辑复杂数据,比如json,xml等,会自动根据ContentType进行解析"
                          }
                        </span>
                      </div>
                      <div>
                        <Tag>ContentType:</Tag>
                        <Select
                          value={contentType}
                          popupMatchSelectWidth={false}
                          onChange={(value) => {
                            if (props.updateContentType) {
                              props.updateContentType(value);
                            } else {
                              setContentType(value);
                            }
                          }}
                          options={[
                            {
                              label: "application/json;charset=UTF-8",
                              value: "application/json;charset=UTF-8",
                            },
                            {
                              label:
                                "application/x-www-form-urlencoded;charset=UTF-8",
                              value:
                                "application/x-www-form-urlencoded;charset=UTF-8",
                            },
                            {
                              label: "multipart/form-data;charset=UTF-8",
                              value: "multipart/form-data;charset=UTF-8",
                            },
                            {
                              label: "text/plain;charset=UTF-8",
                              value: "text/plain;charset=UTF-8",
                            },
                            {
                              label: "application/json",
                              value: "application/json",
                            },
                            {
                              label: "application/x-www-form-urlencoded",
                              value: "application/x-www-form-urlencoded",
                            },
                            {
                              label: "multipart/form-data",
                              value: "multipart/form-data",
                            },
                            {
                              label: "text/plain",
                              value: "text/plain",
                            },
                          ]}
                        />
                      </div>
                    </div>
                  }
                >
                  <BodyDataEditor
                    rawBody={body}
                    onRawBodyChange={(value) => {
                      if (props.onValueChange) {
                        props.onValueChange(value);
                      }
                      setBody(value);
                    }}
                    bodyData={bodyData}
                    contentType={contentType}
                    updateBodyData={(b) => {
                      updateEditorValues(
                        EditorValueEnum.GeneralStructureEditor,
                        b,
                      );
                    }}
                    updateValue={(type, value) => {
                      updateEditorValues(type, value);
                    }}
                  />
                </Card>
              ),
            },
            {
              key: EditorValueEnum.Json,
              label: "JSON",
              children: (
                <MonacoCodeEditor
                  code={(editorValues[EditorValueEnum.Json] || "") as string}
                />
              ),
            },
            {
              key: EditorValueEnum.FormData,
              label: "Form Data",
              children: (
                <Table
                  columns={[
                    {
                      title: "参数名称",
                      dataIndex: "name",
                      key: "name",
                      width: 200,
                      render: (text) => <a>{text}</a>,
                    },
                    {
                      title: "类型",
                      dataIndex: "type",
                      key: "type",
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
                          }}
                        ></Input>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              key: EditorValueEnum.Binary,
              label: "Binary",
              children: (
                <div>
                  <Upload
                    name={"file"}
                    action={"https://www.mocky.io/v2/5cc8019d300000980a055e76"}
                    onChange={(info) => {}}
                    beforeUpload={(file, files) => {
                      console.log("beforeUpload", file, files);
                      if (files.length > 1) {
                        // 渲染成集合
                        const fs = files.map((item) => {
                          return {
                            name: item.name,
                            type: item.type,
                            uid: item.uid,
                            size: item.size,
                            lastModified: item.lastModified,
                            lastModifiedDate: item.lastModifiedDate,
                            webkitRelativePath: item.webkitRelativePath,
                            base64: btoa(
                              new Uint8Array(
                                item as unknown as ArrayBuffer,
                              ).reduce(
                                (data, byte) =>
                                  data + String.fromCharCode(byte),
                                "",
                              ),
                            ),
                          };
                        });
                        updateEditorValues(
                          EditorValueEnum.Binary,
                          JSON.stringify(fs),
                        );
                        return false;
                      }

                      // 上传文件之前,将文件转换为arrayBuffer,并且存储到上下文中
                      const reader = new FileReader();
                      reader.readAsArrayBuffer(file);
                      // 同步获取文件的arrayBuffer,并进行base64编码
                      reader.onload = (e) => {
                        const arrayBuffer = reader.result;
                        // 更新body数据

                        const fileBody = {
                          name: file.name,
                          type: file.type,
                          uid: file.uid,
                          size: file.size,
                          lastModified: file.lastModified,
                          lastModifiedDate: file.lastModifiedDate,
                          webkitRelativePath: file.webkitRelativePath,
                          base64: btoa(
                            new Uint8Array(arrayBuffer as ArrayBuffer).reduce(
                              (data, byte) => data + String.fromCharCode(byte),
                              "",
                            ),
                          ),
                        };
                        updateEditorValues(
                          EditorValueEnum.Binary,
                          JSON.stringify(fileBody),
                        );
                      };

                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </div>
              ),
            },
            {
              key: EditorValueEnum.None,
              label: "None",
              children: <MonacoCodeEditor code={""} />,
            },
            {
              key: EditorValueEnum.Raw,
              label: "Raw",
              children: <MonacoCodeEditor code={""} />,
            },
            {
              key: EditorValueEnum.XWwwFormUrlencoded,
              label: "x-www-form-urlencoded",
              children: <MonacoCodeEditor code={""} />,
            },
            {
              key: EditorValueEnum.GraphQL,
              label: "GraphQL",
              children: <MonacoCodeEditor code={""} />,
            },
          ]}
        />
      </div>
    </div>
  );
};
