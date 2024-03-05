/**
 * BodyDataEditor编辑器,一个通用的请求体编辑器
 */
import {
  defaultBodyDataConversionStrategyFactory,
  readFileToFileDescriptor,
} from "@/components/Provider/http/Request/Body/common/BodyDataConvert";
import { JsonParse } from "@/components/Provider/http/Request/Body/BodyDataEditor/JsonParse";
import { RawBody } from "@/components/Provider/http/Request/Body/BodyDataEditor/RawBody";
import {
  DataSnapshot,
  SnapshotData,
} from "@/components/Provider/http/Request/Body/DataSnapshot";
import { useDockViewContext } from "@/components/Provider/http/DockView/Context";
import {
  BodyDataItem,
  EBodyDataType,
} from "@/components/Provider/http/types.ts";
import {
  DownOutlined,
  PlusCircleFilled,
  SettingFilled,
  UploadOutlined,
} from "@ant-design/icons";
import { Editor } from "@monaco-editor/react";
import {
  Button,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  List,
  Modal,
  Popover,
  Select,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Upload,
  message,
  Badge,
  Dropdown,
} from "antd";
import dayjs from "dayjs";
import { IDockviewPanelProps } from "dockview/dist/cjs/dockview/dockview";
import { useEffect, useMemo, useState } from "react";
import { AiTwotoneDelete } from "react-icons/ai";
import { GrCircleInformation, GrSubtractCircle } from "react-icons/gr";
import { VscEdit } from "react-icons/vsc";
import "./index.less";
import { useDebounceFn } from "ahooks";
import { ListSize } from "antd/es/list";
import { FormParse } from "@/components/Provider/http/Request/Body/BodyDataEditor/FormParser";
import IconCN from "@/components/Icon";
import {
  isFileDescriptor,
  parseXmlToBodyDataItem,
  parseYamlToBodyDataItem,
} from "@/components/Provider/http/Common";
import { EditorValueEnum } from "@/components/Provider/http/Request/Body";
import { RawStringParser } from "@/components/Provider/http/Request/Body/BodyDataEditor/YamlParser";

interface BodyDataEditorProps {
  bodyData: BodyDataItem[];
  rawBody?: string;
  onRawBodyChange?: (rawBody: string) => void;
  updateBodyData?: (bodyData: BodyDataItem[]) => void;
  updateValue?: (type: string, value: string) => void;
  lock?: boolean;
  hideHeader?: boolean;
  hideColumns?: string[];
  config?: BodyDataEditorAdvanceConfig;
  dockView?: IDockviewPanelProps;
  contentType?: string;
  uiConfig?: UIConfig;
  snapshotConfig?: {
    maxSnapshots: number;
  };
}
export interface UIConfig {
  size: "small" | "middle" | "large";
  tableFixed?: number;
  inPopover: boolean;
}
class BodyDataItemQuickAccessor {
  // 所有数据
  data: {
    [key: string]: BodyDataItem;
  };
  dataList: BodyDataItem[];
  // 父子关系
  parentChildMap: Map<string, string[]>;
  // 子父关系
  childParentMap: Map<string, string>;
  constructor(bodyData: BodyDataItem[]) {
    this.data = {};
    this.parentChildMap = new Map<string, string[]>();
    this.childParentMap = new Map<string, string>();
    this.dataList = bodyData;
    this.init(bodyData);
  }
  init(bodyData: BodyDataItem[]) {
    if (!bodyData) {
      return;
    }
    bodyData.forEach((item) => {
      this.data[item.key] = item;
      if (item.children) {
        this.parentChildMap.set(
          item.key,
          item.children.map((child) => child.key),
        );
        item.children.forEach((child) => {
          this.childParentMap.set(child.key, item.key);
        });
      }
    });
  }
}

export const BodyDataEditor = ({
  rawBody,
  onRawBodyChange,
  bodyData,
  lock = false,
  hideHeader = false,
  hideColumns = [],
  contentType = "multipart/form-data",
  updateBodyData,
  updateValue,
  uiConfig = { size: "small", tableFixed: 300, inPopover: false },
  snapshotConfig = { maxSnapshots: 10 },
}: BodyDataEditorProps) => {
  const [body, doSetBody] = useState<string>("");
  const [data, doSetData] = useState<BodyDataItem[]>(bodyData || []);
  const [simpleContentType, setSimpleContentType] = useState<string>("json");
  const [configEditorModal, setConfigEditorModal] = useState<{
    visible: boolean;
    config: BodyDataEditorAdvanceConfig;
    applyConfig: (config: BodyDataEditorAdvanceConfig) => void;
    updateConfig: (config: BodyDataEditorAdvanceConfig) => void;
  }>({
    visible: false,
    config: { ...DefaultBodyDataEditorAdvanceConfig },
    applyConfig: () => {},
    updateConfig: () => {},
  });
  const [notSupportComplexType, setNotSupportComplexType] =
    useState<boolean>(false);
  const [limitedItems, setLimitedItems] = useState<Record<string, string>>({});

  const dataQuickAccessor = useMemo(() => {
    return new BodyDataItemQuickAccessor(data);
  }, [data]);

  const bodyDataConvert = defaultBodyDataConversionStrategyFactory;
  const [snapshotData, setSnapshotData] = useState<SnapshotData[]>([]);
  const dockViewContext = useDockViewContext();
  const up = useDebounceFn(
    () => {
      if (updateBodyData) {
        updateBodyData(data);
      }
    },
    {
      wait: 500,
    },
  );
  useEffect(() => {
    let simpleType = "raw";
    if (!contentType) {
      simpleType = "raw";
    } else {
      const ct = contentType.split(";")[0];
      if (ct.includes("application/json")) {
        simpleType = "json";
      } else if (ct.includes("application/x-www-form-urlencoded")) {
        simpleType = "form";
      } else if (ct.includes("multipart/form-data")) {
        simpleType = "multipart";
      }
    }

    setNotSupportComplexType(
      simpleType !== "multipart" && simpleType !== "json",
    );
    setSimpleContentType(simpleType);
  }, [contentType]);

  const setBody = (rawBody: string) => {
    if (onRawBodyChange) {
      onRawBodyChange(rawBody);
    } else {
      doSetBody(rawBody);
    }
  };
  useEffect(() => {
    if (rawBody) {
      doSetBody(rawBody);
    }
  }, [rawBody]);

  useEffect(() => {
    bodyDataConvert
      .createStrategy(simpleContentType!)
      .convert(data)
      .then((text) => {
        setBody(text);
      });
  }, [data, simpleContentType]);

  function setData(data: BodyDataItem[]) {
    if (updateBodyData) {
      updateBodyData(data);
    } else {
      doSetData(data);
    }
  }
  useEffect(() => {
    doSetData((bodyData || []) as BodyDataItem[]);
  }, [bodyData]);

  useEffect(() => {
    if (data) {
      const ss = [
        ...snapshotData,
        {
          id: Math.random().toString(),
          name: "未命名",
          value: data,
          reason: "mock",
          createTime: new Date().getTime(),
        },
      ];
      const length = ss.length;
      setSnapshotData(
        ss.slice(
          length > snapshotConfig?.maxSnapshots
            ? length - snapshotConfig?.maxSnapshots
            : 0,
        ),
      );
      up.run();
    }
  }, [data]);

  useEffect(() => {
    const limitedItems: Record<string, string> = {};
    if (dataQuickAccessor) {
      if (notSupportComplexType) {
        const deepFilter = (
          item: BodyDataItem,
          forceIgnored: boolean,
          parent?: BodyDataItem,
        ) => {
          const parentIgnored =
            (parent?.extra?.forceIngnored || "false") === "true";
          const ignored = forceIgnored || parentIgnored;
          if (ignored) {
            item.extra = {
              ...item.extra,
              will_ignore_when_parse: "true",
            };
            limitedItems[item.key] = item.name;
            if (item.children) {
              item.children!.forEach((child) => {
                deepFilter(child, true, item);
              });
            }
          } else {
            // 本身是复合类型,其内部的复合类型需要被过滤掉
            // 对象类型和文件类型是一定不支持的
            if (
              item.type === EBodyDataType.Object ||
              item.type === EBodyDataType.File
            ) {
              item.extra = {
                ...item.extra,
                will_ignore_when_parse: "true",
              };
              limitedItems[item.key] = item.name;
              if (item.children) {
                item.children!.forEach((child) => {
                  deepFilter(child, true, item);
                });
              }
            }
            // 如果是数组,则需要判断数组中的元素是否是复合类型,如果是复合类型,则需要过滤掉
            if (item.type === EBodyDataType.Array) {
              if (parent?.type === EBodyDataType.Array) {
                item.extra = {
                  ...item.extra,
                  will_ignore_when_parse: "true",
                };
                limitedItems[item.key] = item.name;
                if (item.children) {
                  item.children!.forEach((child) => {
                    deepFilter(child, true, item);
                  });
                }
              }
              if (item.children) {
                item.children!.forEach((child) => {
                  deepFilter(child, false, item);
                });
              }
            }
          }
        };
        // 过滤掉不支持的数据类型,比如数组,对象
        dataQuickAccessor.dataList.forEach((item) => {
          // 先处理自身,再处理子元素
          deepFilter(item, false);
        });
      }
    }
    setLimitedItems({ ...limitedItems });
  }, [data, notSupportComplexType]);

  useEffect(() => {
    dockViewContext?.getPanel("body-data-editor")?.api.updateParameters({
      snaps: snapshotData,
    });
  }, [snapshotData]);
  const handleOk = () => {
    configEditorModal?.applyConfig(configEditorModal.config);
    setConfigEditorModal({
      ...configEditorModal!,
      visible: false,
    });
  };

  const handleCancel = () => {
    setConfigEditorModal({
      ...configEditorModal!,
      visible: false,
    });
  };

  function renderValueEditor(item: BodyDataItem) {
    const cfg = item.extra ? item.extra["config"] : peekItemConfig();
    const config = (cfg || peekItemConfig()) as BodyDataEditorAdvanceConfig;
    if (item.type === EBodyDataType.String) {
      const str = item.value as string;
      if (config.generator.String.textEditor === "rich-text-editor") {
        const editorConfig = config.generator.String.richTextEditorConfig;
        const triggerLength = editorConfig.triggerLength;
        if (triggerLength === -1 || str.length > triggerLength) {
          const preview = editorConfig.preview;
          return (
            <Popover
              trigger={"click"}
              content={
                <div
                  style={{
                    width: "800px",
                    height: "400px",
                  }}
                >
                  <Editor
                    defaultValue={str}
                    language={editorConfig.contentType}
                    options={{
                      minimap: {
                        enabled: false,
                      },
                      readOnly: lock,
                    }}
                    onChange={(value) => {
                      item.value = value || "";
                      setData([...data]);
                    }}
                  />
                </div>
              }
            >
              <Button className={"flex"} icon={<VscEdit />}>
                {preview === "content" && (
                  <span>
                    {str.substring(0, str.length > 10 ? 10 : str.length)}
                  </span>
                )}
                {preview === "size" && <Tag>{computeStrSize(str)}</Tag>}
                {preview === "both" && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {str.substring(0, str.length > 10 ? 10 : str.length)}
                    </span>{" "}
                    <Tag
                      style={{
                        marginLeft: ".5em",
                      }}
                      color={"pink"}
                    >
                      {computeStrSize(str)}
                    </Tag>
                  </div>
                )}
              </Button>
            </Popover>
          );
        }
      }
      if (config.generator.String.textEditor === "textarea") {
        return (
          <Input.TextArea
            size={uiConfig.size}
            disabled={lock}
            value={str}
            onChange={(e) => {
              item.value = e.target.value;
              setData([...data]);
            }}
          />
        );
      }
      return (
        <Input
          size={uiConfig.size}
          disabled={lock}
          value={str}
          onChange={(e) => {
            item.value = e.target.value;
            setData([...data]);
          }}
        />
      );
    }
    if (item.type === EBodyDataType.Boolean) {
      if (config.generator.Boolean.useSwitch) {
        return <Switch defaultChecked={item.value as boolean} />;
      }
      return (
        <Select
          size={uiConfig.size}
          disabled={lock}
          popupMatchSelectWidth={false}
          defaultValue={item.value}
          value={item.value}
          onChange={(value) => {
            item.value = value as string;
            setData([...data]);
          }}
          options={[
            {
              label: "true",
              value: "true",
            },
            {
              label: "false",
              value: "false",
            },
          ]}
        />
      );
    }
    if (item.type === EBodyDataType.Date) {
      if (item.value === "") {
        item.value = dayjs().valueOf();
      }
      if (config.generator.Date.useTimePicker) {
        let d: dayjs.Dayjs;
        if (config.generator.Date.dateFormat.type === "date-format") {
          d = dayjs(
            item.value as string,
            config.generator.Date.dateFormat.format,
          );
        } else if (
          config.generator.Date.dateFormat.type === "millisecond-timestamp"
        ) {
          d = dayjs((item.value as number) / 1000);
        } else {
          d = dayjs(item.value as number);
        }
        return (
          <DatePicker
            size={uiConfig.size}
            showTime
            disabled={lock}
            onChange={(value) => {
              if (config.generator.Date.dateFormat.type === "date-format") {
                item.value = dayjs(value).format(
                  config.generator.Date.dateFormat.format,
                );
              } else if (
                config.generator.Date.dateFormat.type ===
                "millisecond-timestamp"
              ) {
                item.value = dayjs(value).valueOf() * 1000;
              } else {
                item.value = dayjs(value).valueOf();
              }
              setData([...data]);
            }}
            value={d}
          />
        );
      }
      // 如果此时日期数据属于毫秒值或者秒值,则需要转换为日期格式
      // 首先判断数据是否是数值
      if (typeof item.value === "number") {
        // 判断是否是毫秒值
        if (config.generator.Date.dateFormat.type === "millisecond-timestamp") {
          item.value = dayjs((item.value as number) / 1000).format(
            "YYYY-MM-DD HH:mm:ss",
          );
        } else if (
          config.generator.Date.dateFormat.type === "second-timestamp"
        ) {
          item.value = dayjs(item.value as number).format(
            "YYYY-MM-DD HH:mm:ss",
          );
        }
      }
      return (
        <Input
          size={uiConfig.size}
          disabled={lock}
          value={item.value as string}
          onChange={(e) => {
            item.value = e.target.value;
            setData([...data]);
          }}
        />
      );
    }
    if (item.type === EBodyDataType.Number) {
      return (
        <InputNumber
          size={uiConfig.size}
          disabled={lock}
          addonAfter={
            <Button
              size={uiConfig.size}
              disabled={lock}
              type={"link"}
              shape={"circle"}
              icon={<PlusCircleFilled />}
              onClick={() => {
                item.value = (item.value as number) + 1;
                setData([...data]);
              }}
            />
          }
          addonBefore={
            <Button
              size={uiConfig.size}
              disabled={lock}
              type={"link"}
              shape={"circle"}
              icon={<GrSubtractCircle />}
              onClick={() => {
                item.value = (item.value as number) - 1;
                setData([...data]);
              }}
            />
          }
          value={item.value as number}
          onChange={(value) => {
            item.value = value as number;
            setData([...data]);
          }}
        />
      );
    }
    if (item.type === EBodyDataType.File) {
      if (config.generator.File.useFileEditor) {
        return (
          <div>
            <Upload
              fileList={item.value ? [item.value as File] : []}
              beforeUpload={(file) => {
                item.value = file;
                setData([...data]);
                return false;
              }}
            >
              <Button
                size={uiConfig.size}
                disabled={lock}
                icon={<UploadOutlined />}
              >
                上传文件
              </Button>
            </Upload>
          </div>
        );
      }
      return (
        <Input
          size={uiConfig.size}
          disabled={lock}
          value={item.value as string}
          onChange={(e) => {
            item.value = e.target.value;
            setData([...data]);
          }}
        />
      );
    }
    if (item.type === EBodyDataType.Array) {
      if (!item.children) {
        item.children = [];
      }
      return (
        <Button
          size={uiConfig.size}
          disabled={lock}
          onClick={() => {
            item.children = item.children as BodyDataItem[];
            const type =
              item.children.length > 0
                ? item.children[0].type
                : EBodyDataType.String;
            const child = {
              key: Math.random().toString(),
              name: "",
              value: "",
              type: type,
              description: "",
              extra: {
                config: peekItemConfig(),
                isArrayElement: "true",
              },
            } as BodyDataItem;

            item.children.push(child);
            setData([...data]);
          }}
        >
          新增一行
        </Button>
      );
    }
    if (item.type === EBodyDataType.Object) {
      if (!item.children) {
        item.children = [];
      }
      return (
        <Button
          size={uiConfig.size}
          disabled={lock}
          onClick={() => {
            const child = {
              key: Math.random().toString(),
              name: "",
              value: "",
              type: EBodyDataType.String,
              description: "",
              extra: {
                config: peekItemConfig(),
              },
            } as BodyDataItem;
            item.children = item.children as [];
            item.children.push(child);
            setData([...data]);
          }}
        >
          新增子元素
        </Button>
      );
    }
  }

  function peekItemConfig(
    config?: BodyDataEditorAdvanceConfig,
  ): BodyDataEditorAdvanceConfig {
    // deep copy
    return JSON.parse(JSON.stringify(DefaultBodyDataEditorAdvanceConfig));
  }

  return (
    <div>
      {!hideHeader && (
        <div>
          <div className={"flex justify-between"}>
            <div>
              <Popover
                trigger={"click"}
                content={
                  <div
                    style={{
                      width: "800px",
                      height: "400px",
                    }}
                  >
                    <DataSnapshot data={snapshotData} />
                  </div>
                }
              >
                <Button>快照</Button>
              </Popover>
              <Popover
                trigger={"click"}
                content={
                  <div
                    style={{
                      width: "800px",
                      height: "400px",
                    }}
                  >
                    <RawBody body={body} contentType={contentType || "json"} />
                  </div>
                }
              >
                <Button>查看解析后的原始请求体</Button>
              </Popover>
              <Popover
                trigger={"click"}
                content={
                  <div>
                    <JsonParse
                      onSave={(items) => {
                        setData(items);
                      }}
                    />
                  </div>
                }
              >
                <Button>解析JSON</Button>
              </Popover>
              <Popover
                trigger={"click"}
                content={
                  <div>
                    <FormParse
                      onSave={(items) => {
                        setData(items);
                      }}
                    />
                  </div>
                }
              >
                <Button>解析表单</Button>
              </Popover>
              <Popover
                trigger={"click"}
                content={
                  <div>
                    <RawStringParser
                      name={"yaml"}
                      parse={(str) => {
                        return parseYamlToBodyDataItem(str);
                      }}
                      onSave={(items) => {
                        setData(items);
                      }}
                    />
                  </div>
                }
              >
                <Button>解析Yaml</Button>
              </Popover>
              <Popover
                trigger={"click"}
                content={
                  <div>
                    <RawStringParser
                      name={"xml"}
                      parse={(str) => {
                        return parseXmlToBodyDataItem(str);
                      }}
                      onSave={(items) => {
                        setData(items);
                      }}
                    />
                  </div>
                }
              >
                <Button>解析xml</Button>
              </Popover>
              <Button
                onClick={() => {
                  const panel = dockViewContext?.getPanel("body-data-editor");
                  if (panel) {
                    panel.api.setActive();
                  } else {
                    dockViewContext?.addPanel({
                      component: "snapshot",
                      title: "快照",
                      id: "body-data-editor",
                      tabComponent: "floatAble",
                      floating: {
                        width: 800,
                        height: 400,
                      },
                      params: {
                        snaps: snapshotData,
                      },
                    });
                  }
                }}
              >
                dock
              </Button>
            </div>
          </div>
          <div className={"flex justify-between"}>
            <div>
              <div>
                <div>
                  {simpleContentType === "raw" && (
                    <span style={{ color: "red" }}>
                      <IconCN type={"icon-warn"} />
                      当前数据类型
                      <Tag color={"yellow-inverse"} style={{ color: "black" }}>
                        {contentType}
                      </Tag>
                      不支持复杂数据结构,请使用JSON或者Multipart/form-data
                    </span>
                  )}
                </div>
                <div>
                  {simpleContentType !== "raw" && notSupportComplexType && (
                    <span style={{}}>
                      <IconCN type={"icon--warning"} />
                      数据类型
                      <Tag color={"yellow-inverse"} style={{ color: "black" }}>
                        {contentType}
                      </Tag>
                      , 不支持嵌套结构和文件类型
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className={"flex justify-end"}>
              <div
                style={{
                  marginLeft: "10px",
                }}
              >
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    onClick: (e) => {},
                    items: [
                      {
                        key: "json",
                        label: "JSON",
                        danger: true,
                        title: "JSON",
                        onClick: () => {
                          if (updateValue) {
                            bodyDataConvert
                              .createStrategy("json")
                              .convert(data)
                              .then((text) => {
                                updateValue(EditorValueEnum.Json, text);
                              });
                          }
                        },
                      },
                      {
                        key: "multipart/form-data",
                        label: "MULTIPART FORM DATA",
                        danger: true,
                        title: "MULTIPART FORM DATA",
                        onClick: () => {
                          if (updateValue) {
                            bodyDataConvert
                              .createStrategy("multipart")
                              .convert(data)
                              .then((text) => {
                                updateValue(EditorValueEnum.FormData, text);
                              });
                          }
                        },
                      },
                      {
                        key: "application/x-www-form-urlencoded",
                        label: "FORM URL ENCODED",
                        danger: true,
                        title: "FORM URL ENCODED",
                        onClick: () => {
                          if (updateValue) {
                            bodyDataConvert
                              .createStrategy("form")
                              .convert(data)
                              .then((text) => {
                                updateValue(EditorValueEnum.Raw, text);
                              });
                          }
                        },
                      },
                      {
                        key: "raw",
                        label: "RAW",
                        danger: true,
                        title: "RAW",
                        onClick: () => {
                          if (updateValue) {
                            bodyDataConvert
                              .createStrategy("raw")
                              .convert(data)
                              .then((text) => {
                                updateValue(EditorValueEnum.Raw, text);
                              });
                          }
                        },
                      },
                    ],
                  }}
                >
                  <div>
                    <Button onClick={(e) => e.preventDefault()}>
                      解析并应用到其他编辑器
                      <DownOutlined />
                    </Button>
                  </div>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      )}

      <Table
        indentSize={24}
        scroll={{ y: uiConfig.tableFixed! <= 0 ? 99999 : uiConfig!.tableFixed }}
        footer={() => {
          return (
            <div>
              <Button
                disabled={lock}
                className={"body-data-editor-footer"}
                onClick={() => {
                  const item = {
                    key: Math.random().toString(),
                    name: "",
                    value: "",
                    type: EBodyDataType.String,
                    description: "",
                    extra: {
                      config: peekItemConfig(),
                    },
                  } as BodyDataItem;
                  data.push(item);
                  setData([...data]);
                }}
              >
                新增一行{" "}
              </Button>
            </div>
          );
        }}
        size={uiConfig.size}
        sticky
        // scroll={{ y: 300 }}
        tableLayout={"fixed"}
        // showHeader={false}
        // virtual={true}
        bordered
        pagination={false}
        dataSource={data}
        columns={[
          {
            title: "名称",
            dataIndex: "name",
            key: "name",
            width: 100,
            render: (value: string, item: BodyDataItem, index) => {
              let isArrayElement = false;

              const pkey = dataQuickAccessor.childParentMap.get(item.key);
              if (pkey) {
                const parent = dataQuickAccessor.data[pkey];
                if (parent.type === EBodyDataType.Array) {
                  isArrayElement = true;
                }
              }
              const disabled =
                lock ||
                ((item.extra?.isArrayElement || false) as boolean) ||
                isArrayElement;

              return (
                <div className={"flex justify-between"}>
                  {limitedItems[item.key] !== undefined && (
                    <Tooltip
                      title={`${contentType}不支持复杂数据结构,当前数据在解析时,将被忽略`}
                    >
                      <IconCN type={"icon-Remove"} style={{ color: "red" }} />
                    </Tooltip>
                  )}
                  <div className={"body-data-editor-name"}>
                    {isArrayElement && (
                      <Badge.Ribbon
                        text={index}
                        color={"pink"}
                        children={
                          <Input
                            key={item.key}
                            size={uiConfig.size}
                            disabled={disabled}
                            value={value}
                            onChange={(e) => {
                              item.name = e.target.value;
                              setData([...data]);
                            }}
                          />
                        }
                      />
                    )}
                    {!isArrayElement && (
                      <Input
                        key={item.key}
                        size={uiConfig.size}
                        disabled={disabled}
                        value={value}
                        onChange={(e) => {
                          item.name = e.target.value;
                          setData([...data]);
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            },
          },
          {
            title: "值",
            dataIndex: "value",
            key: "value",
            width: 100,
            render: (_: string, item: BodyDataItem) => {
              return (
                <div className={"body-data-editor-value"}>
                  {renderValueEditor(item)}
                </div>
              );
            },
          },
          {
            title: "类型",
            dataIndex: "type",
            key: "type",
            width: 50,
            render: (value: EBodyDataType, item: BodyDataItem) => {
              return (
                <div className={"body-data-editor-type"}>
                  <Select
                    size={uiConfig.size}
                    disabled={lock}
                    value={value}
                    onChange={(e) => {
                      const ot = item.type;
                      const ov = item.value;
                      item.type = e;
                      switch (item.type) {
                        case EBodyDataType.Array:
                          if (!item.children) {
                            item.children = [];
                          }
                          if (ot === EBodyDataType.Object) {
                            item.children.foreach((child) => {
                              child.name = "";
                            });
                          }
                          break;
                        case EBodyDataType.Object:
                          if (!item.children) {
                            item.children = [];
                          }
                          if (ot === EBodyDataType.File) {
                            item.children = [];
                            if (ov !== "") {
                              readFileToFileDescriptor(ov as File).then(
                                (fd) => {
                                  Object.entries(fd).forEach(([key, value]) => {
                                    const child = {
                                      key: Math.random().toString(),
                                      name: key,
                                      value: value,
                                      type: EBodyDataType.String,
                                      description: "",
                                      extra: {
                                        config: peekItemConfig(),
                                      },
                                    } as BodyDataItem;
                                    item.children!.push(child);
                                  });
                                  setData([...data]);
                                },
                              );
                            }
                          }
                          break;
                        case EBodyDataType.File:
                          if (ot === EBodyDataType.Object) {
                            if (item.children) {
                              const fd = {};
                              item.children.forEach((child) => {
                                fd[child.name] = child.value;
                              });
                              if (isFileDescriptor(fd)) {
                                item.value = new File(
                                  [
                                    new Blob([btoa(fd.base64)], {
                                      type: fd.type,
                                    }),
                                  ],
                                  fd.name,
                                );
                              }
                              item.children = undefined;
                            }
                          }
                          break;
                        case EBodyDataType.String: {
                          item.children = undefined;
                          break;
                        }
                        case EBodyDataType.Boolean: {
                          const cfg = item.extra
                            ?.config as BodyDataEditorAdvanceConfig;
                          if (!cfg) {
                            item.value = ov === "true";
                          } else {
                            const ovs = ov as string;
                            item.value =
                              cfg.generator.Boolean.trueValues.find((exp) => {
                                switch (exp.type) {
                                  case "regex": {
                                    if (new RegExp(exp.value).test(ovs)) {
                                      return true;
                                    }
                                    break;
                                  }
                                  case "equal": {
                                    if (ovs === exp.value) {
                                      return true;
                                    }
                                    break;
                                  }
                                  case "start-with": {
                                    if (ovs.startsWith(exp.value)) {
                                      return true;
                                    }
                                    break;
                                  }
                                  case "end-with": {
                                    if (ovs.endsWith(exp.value)) {
                                      return true;
                                    }
                                    break;
                                  }
                                  case "contain": {
                                    if (ovs.includes(exp.value)) {
                                      return true;
                                    }
                                    break;
                                  }
                                  case "not-equal": {
                                    if (ovs !== exp.value) {
                                      return true;
                                    }
                                    break;
                                  }
                                  case "not-start-with": {
                                    if (!ovs.startsWith(exp.value)) {
                                      return true;
                                    }
                                    break;
                                  }
                                  case "not-end-with": {
                                    if (!ovs.endsWith(exp.value)) {
                                      return true;
                                    }
                                    break;
                                  }
                                  case "not-contain": {
                                    if (!ovs.includes(exp.value)) {
                                      return true;
                                    }
                                    break;
                                  }
                                  default:
                                    return false;
                                }
                              }) !== undefined;
                          }
                          item.children = undefined;
                          break;
                        }
                        case EBodyDataType.Number: {
                          item.value = Number(ov);
                          item.children = undefined;
                          break;
                        }
                        case EBodyDataType.Date: {
                          const cfg = item.extra
                            ?.config as BodyDataEditorAdvanceConfig;
                          if (!cfg) {
                            item.value = dayjs().valueOf();
                          } else {
                            if (
                              cfg.generator.Date.dateFormat.type ===
                              "date-format"
                            ) {
                              item.value = dayjs().format(
                                cfg.generator.Date.dateFormat.format,
                              );
                            } else if (
                              cfg.generator.Date.dateFormat.type ===
                              "millisecond-timestamp"
                            ) {
                              item.value = dayjs().valueOf() * 1000;
                            } else {
                              item.value = dayjs().valueOf();
                            }
                          }
                          item.children = undefined;
                          break;
                        }
                      }
                      setData([...data]);
                    }}
                    popupMatchSelectWidth={false}
                    getPopupContainer={(triggerNode) => {
                      return uiConfig?.inPopover
                        ? triggerNode.parentNode
                        : undefined;
                    }}
                    options={[
                      { label: "字符串", value: EBodyDataType.String },
                      { label: "文件", value: EBodyDataType.File },
                      { label: "Boolean", value: EBodyDataType.Boolean },
                      { label: "数字", value: EBodyDataType.Number },
                      { label: "数组", value: EBodyDataType.Array },
                      { label: "对象", value: EBodyDataType.Object },
                      { label: "时间", value: EBodyDataType.Date },
                    ].filter((item) => {
                      if (!notSupportComplexType) {
                        return true;
                      }
                      return !(
                        item.value === EBodyDataType.Array ||
                        item.value === EBodyDataType.Object ||
                        item.value === EBodyDataType.File
                      );
                    })}
                  />
                </div>
              );
            },
          },
          {
            title: "描述",
            dataIndex: "description",
            key: "description",
            width: 100,
            render: (value: string, item: BodyDataItem) => {
              return (
                <div className={"body-data-editor-description"}>
                  <Input
                    size={uiConfig.size}
                    disabled={lock}
                    value={value}
                    onChange={(e) => {
                      item.description = e.target.value;
                      setData([...data]);
                    }}
                  />
                </div>
              );
            },
          },
          {
            title: (
              <div
                className={"flex justify-between"}
                style={{
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    height: "100%",
                  }}
                >
                  操作
                </div>
                <div
                  style={{
                    height: "100%",
                  }}
                >
                  <Popover
                    trigger={"click"}
                    content={
                      <div>
                        <RawStringParser
                          name={"元数据编辑"}
                          title={"元数据编辑"}
                          language={"json"}
                          defaultValue={JSON.stringify(data)}
                          parse={(str) => {
                            return JSON.parse(str);
                          }}
                          onSave={(items) => {
                            setData([...items]);
                          }}
                        />
                      </div>
                    }
                  >
                    <Button icon={<IconCN type={"icon-code2"} />}>
                      编辑元数据
                    </Button>
                  </Popover>
                </div>
              </div>
            ),
            dataIndex: "action",
            key: "action",
            width: 100,
            render: (_: string, item: BodyDataItem) => {
              return (
                <div className={"body-data-editor-action"}>
                  <Tooltip title={"高级选项"}>
                    <Button
                      size={uiConfig.size}
                      disabled={lock}
                      type={"text"}
                      icon={<SettingFilled />}
                      onClick={() => {
                        if (!item.extra) {
                          item.extra = {};
                        }
                        const cfg = peekItemConfig(
                          item.extra["config"] as BodyDataEditorAdvanceConfig,
                        ) as BodyDataEditorAdvanceConfig;
                        setConfigEditorModal({
                          visible: true,
                          config: cfg,
                          applyConfig: (config) => {
                            item.extra!["config"] = config;
                            setData([...data]);
                          },
                          updateConfig: (config) => {
                            setConfigEditorModal({
                              ...configEditorModal!,
                              config: config,
                            });
                          },
                        });
                      }}
                    />
                  </Tooltip>
                </div>
              );
            },
          },
        ].filter((item) => {
          return !hideColumns?.includes(item.dataIndex as string);
        })}
      />
      <Modal
        title="参数设置"
        open={configEditorModal?.visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={"70%"}
      >
        <BodyDataEditorAdvance config={configEditorModal!.config} />
      </Modal>
    </div>
  );
};

interface BodyDataEditorAdvanceGeneratorConfig {
  /**
   * 当数据类型为string时,是否使用富文本编辑器编辑数据,
   * 提供多种模式,提供一个配置项,用于判断是否使用富文本编辑器,比如文本的内容长度超过多少时,使用富文本编辑器,当为-1时,表示直接使用富文本编辑器
   */
  String: {
    textEditor: "input" | "textarea" | "rich-text-editor"; // 长文本编辑器,当文本内容长度超过一定阈值时,使用长文本编辑器
    richTextEditorConfig: {
      triggerLength: number; // 触发富文本编辑器的长度
      contentType: string; // 富文本编辑器的内容
      preview: "content" | "size" | "both"; // 预览模式,内容预览,大小预览,内容+大小预览
      useToolTips: boolean; // 是否使用工具提示
      toolTipsPreview: "content" | "markdown" | "html" | "json"; // 工具提示预览模式,内容预览,markdown预览,html预览,json预览
      renderWhenSupport: boolean; // 如果富文本的内容支持渲染,是否渲染
    };
  };
  Boolean: {
    /**
     * 当数据类型为boolean值时,是否使用Switch组件
     */
    useSwitch: boolean;
    /**
     * 转换为boolean类型时返回true的数据
     */
    trueValues: {
      type:
        | "regex"
        | "equal"
        | "start-with"
        | "end-with"
        | "contain"
        | "not-equal"
        | "not-start-with"
        | "not-end-with"
        | "not-contain"
        | "not-regex";
      value: string;
    }[];
    /**
     * 转换为boolean类型时返回false的数据
     */
    falseValues: {
      type:
        | "regex"
        | "equal"
        | "start-with"
        | "end-with"
        | "contain"
        | "not-equal"
        | "not-start-with"
        | "not-end-with"
        | "not-contain"
        | "not-regex";
      value: string;
    }[];
  };
  Date: {
    /**
     * 当类型为Date时,是否使用Time Picker组件
     */
    useTimePicker: boolean;
    allowDate: boolean; // 是否允许选择日期
    allowTime: boolean; // 是否允许选择时间
    /**
     * 时间格式
     */
    dateFormat: {
      type: "second-timestamp" | "millisecond-timestamp" | "date-format";
      format: string;
    };
  };
  Number: {
    useNumberInput: boolean; // 是否使用数字输入框
  };
  File: {
    useFileEditor: boolean;
    customFileConvertScript: string; // 自定义文件转换脚本,要求必须返回一个合法的json对象或者json基本类型
  };
}

interface BodyDataEditorAdvanceConvertConfig {
  ToJson: {
    /**
     * 将文件转换为json数据时,针对文件类型的处理方式
     */
    fileConvertType: "base64" | "file-descriptor" | "script";
  };
  ToForm: {
    /**
     * 将MutiPart数据转换为www-form-urlencoded时,针对复合(array,object)数据的处理方式,比如,丢弃,序列化为json字符串,序列化为www-form-urlencoded
     */
    multiPartConvertType: "discard" | "json" | "www-form-urlencoded";
    jsonConvertType: "discard" | "json" | "www-form-urlencoded";
  };
}
interface BodyDataEditorSnapShotConfig {
  useSnapshot: boolean; // 是否启用快照功能
  defaultSnapshotEditorType: "json" | "table"; // 快照编辑器类型,表格或者json编辑器
  contentTypeConvert: {
    enable: boolean;
    trigger: "all" | "can-not-convert" | "none"; // 触发条件,当切换ContentType时,如果数据无法无损转换,将为其创建一份快照
  };
  dataItemConvert: {
    enable: boolean; // 是否启用数据项转换
    trigger: "all" | "can-not-convert" | "none"; // 触发条件,当切换数据项时,如果数据无法无损转换,将为其创建一份快照
  };
}
interface BodyDataEditorAdvanceConfig {
  generator: BodyDataEditorAdvanceGeneratorConfig;
  convert: BodyDataEditorAdvanceConvertConfig;
  snapshot: BodyDataEditorSnapShotConfig;
}

/**
 * BodyDataEditor选项的高级配置信息,用于编辑额外信息,额外信息可以控制一些默认行为
 *    高级选项,用于编辑额外信息,额外信息可以控制一些默认行为
 *    - 将文件转换为json数据时,是否将文件内容转换为base64编码,或者将其序列化为文件描述对象
 *    - 将MutiPart数据转换为www-form-urlencoded时,针对复合(array,object)数据的处理方式,比如,丢弃,序列化为json字符串,序列化为www-form-urlencoded
 */
export const BodyDataEditorAdvance = (props: {
  config: BodyDataEditorAdvanceConfig;
  updateConfig?: (config: BodyDataEditorAdvanceConfig) => void;
  uiConfig?: UIConfig;
}) => {
  const [config, setConfig] = useState(props.config);

  const [messageApi, contextHolder] = message.useMessage();
  const [uiConfig, setUiConfig] = useState<UIConfig>({
    size: props.uiConfig?.size || "middle",
  });

  useEffect(() => {
    setConfig(props.config);
  }, [props]);

  const checkBooleanConfig = () => {
    // 检查配置是否合法
    // 1. 检查boolean类型的trueValues和falseValues是否有重复的定义
    const trueValues = config.generator.Boolean.trueValues;
    const falseValues = config.generator.Boolean.falseValues;
    const trueValuesMap = new Map<string, string>();
    const falseValuesMap = new Map<string, string>();
    trueValues.forEach((item) => {
      if (item.type === "equal") {
        trueValuesMap.set(item.value, item.value);
      }
    });
    falseValues.forEach((item) => {
      if (item.type === "equal") {
        falseValuesMap.set(item.value, item.value);
      }
    });
    const trueValuesIntersection = new Set(
      [...trueValuesMap.keys()].filter((x) => falseValuesMap.has(x)),
    );
    const falseValuesIntersection = new Set(
      [...falseValuesMap.keys()].filter((x) => trueValuesMap.has(x)),
    );
    if (trueValuesIntersection.size > 0 || falseValuesIntersection.size > 0) {
      messageApi.error(
        <div>
          <div>
            请注意,boolean类型的trueValues和falseValues不允许有重复的定义
          </div>
          <div>重复的定义如下:</div>
          <div>trueValues: {Array.from(trueValuesIntersection).join(",")}</div>
          <div>
            falseValues: {Array.from(falseValuesIntersection).join(",")}
          </div>
        </div>,
      );
      return false;
    }
    return true;
  };

  const checkDateConfig = (config: BodyDataEditorAdvanceConfig) => {
    if (config.generator.Date.dateFormat.type === "date-format") {
      // 尝试使用dayjs格式化日期
      const date = new Date();
      const format = config.generator.Date.dateFormat.format;
      const formattedDate = dayjs(date).format(format);
      console.log("formattedDate", formattedDate);
      if (formattedDate === "Invalid Date") {
        messageApi.error(
          <div>
            <div>日期格式不合法,请检查格式是否正确</div>
            <div>日期格式: {format}</div>
          </div>,
        );
        return false;
      }
    }
  };

  // 当数据类型为string时,是否使用富文本编辑器编辑数据
  return (
    <div className={"body-data-editor-advance"}>
      {contextHolder}
      <Tabs
        defaultActiveKey={"0"}
        tabPosition={"left"}
        size={uiConfig.size}
        items={[
          {
            key: "0",
            label: "通用设置",
            children: (
              <div className={"common-config"}>
                <h2>字符串</h2>
                <Divider dashed />
                <div className={"flex justify-between"}>
                  <div>
                    <span>当类型为字符串时,选择合适的文本编辑器</span>
                    <Tooltip title={"当类型为字符串时,是否使用高级文本编辑器"}>
                      <GrCircleInformation />
                    </Tooltip>
                  </div>
                  <div>
                    <Select
                      popupMatchSelectWidth={false}
                      defaultValue={"input"}
                      value={config.generator.String.textEditor}
                      onChange={(value) => {
                        config.generator.String.textEditor = value as
                          | "input"
                          | "textarea"
                          | "rich-text-editor";
                        setConfig({ ...config });
                      }}
                      options={[
                        {
                          label: "Input",
                          value: "input",
                        },
                        {
                          label: "TextArea",
                          value: "textarea",
                        },
                        {
                          label: "RichTextEditor",
                          value: "rich-text-editor",
                        },
                      ]}
                    />
                  </div>
                </div>
                {config.generator.String.textEditor === "rich-text-editor" && (
                  <div>
                    <Divider />
                    <div className={"flex justify-between"}>
                      <div>
                        <span>触发富文本编辑器的阈值</span>
                        <Tooltip
                          title={
                            "当启用富文本编辑器时,设置触发富文本编辑器的阈值"
                          }
                        >
                          <GrCircleInformation />
                        </Tooltip>
                      </div>
                      <div>
                        <InputNumber
                          value={
                            config.generator.String.richTextEditorConfig
                              .triggerLength
                          }
                          onChange={(value) => {
                            config.generator.String.richTextEditorConfig.triggerLength =
                              value as number;
                            setConfig({ ...config });
                          }}
                          min={-1}
                          max={100000}
                          defaultValue={-1}
                        />
                      </div>
                    </div>
                    <Divider />
                    <div className={"flex justify-between"}>
                      <div>
                        <div>
                          <span>文本内容的格式</span>
                          <Tooltip
                            title={
                              "富文本编辑器将为其提供代码高亮和基本的代码提示能力"
                            }
                          >
                            <GrCircleInformation />
                          </Tooltip>
                        </div>
                        <div>
                          <span className={"tips"}>
                            富文本编辑器将为其提供代码高亮和基本的代码提示能力
                          </span>
                        </div>
                      </div>
                      <div>
                        <Select
                          popupMatchSelectWidth={false}
                          defaultValue={"markdown"}
                          value={
                            config.generator.String.richTextEditorConfig
                              .contentType
                          }
                          onChange={(value) => {
                            config.generator.String.richTextEditorConfig.contentType =
                              value as
                                | "unknown"
                                | "html"
                                | "json"
                                | "javascript";
                            setConfig({ ...config });
                          }}
                          options={[
                            {
                              label: "plain/text",
                              value: "unknown",
                            },
                            {
                              label: "html",
                              value: "html",
                            },
                            {
                              label: "json",
                              value: "json",
                            },
                            {
                              label: "javascript",
                              value: "javascript",
                            },
                          ]}
                        />
                      </div>
                    </div>
                    <div className={"flex justify-between"}>
                      <div>
                        <div>
                          <span>缩略展示</span>
                          <Tooltip
                            title={
                              "在富文本模式下,编辑器在表格中展示的数据内容"
                            }
                          >
                            <GrCircleInformation />
                          </Tooltip>
                        </div>
                        <div>
                          <span className={"tips"}>
                            在富文本模式下,编辑器在表格中展示的数据内容
                          </span>
                        </div>
                      </div>
                      <div>
                        <Select
                          popupMatchSelectWidth={false}
                          defaultValue={"both"}
                          value={
                            config.generator.String.richTextEditorConfig.preview
                          }
                          onChange={(value) => {
                            config.generator.String.richTextEditorConfig.preview =
                              value as "content" | "size" | "both";
                            setConfig({ ...config });
                          }}
                          options={[
                            {
                              label: "内容预览",
                              value: "content",
                            },
                            {
                              label: "大小预览",
                              value: "size",
                            },
                            {
                              label: "内容+大小预览",
                              value: "both",
                            },
                          ]}
                        />
                      </div>
                    </div>
                    <Divider />
                    <div className={"flex justify-between"}>
                      <div>
                        <div>
                          <span>启用悬浮预览</span>
                          <Tooltip
                            title={"当鼠标悬浮在缩略数据上时,是否展示预览界面"}
                          >
                            <GrCircleInformation />
                          </Tooltip>
                        </div>
                        <div>
                          <span className={"tips"}>
                            当鼠标悬浮在缩略数据上时,是否展示预览界面
                          </span>
                        </div>
                      </div>
                      <div>
                        <Switch
                          defaultChecked={
                            config.generator.String.richTextEditorConfig
                              .useToolTips
                          }
                          onChange={(checked) => {
                            config.generator.String.richTextEditorConfig.useToolTips =
                              checked;
                            setConfig({ ...config });
                          }}
                        />
                      </div>
                    </div>
                    <div className={"flex justify-between"}>
                      <div>
                        <div>
                          <span>悬浮预览模式</span>
                          <Tooltip
                            title={"当鼠标悬浮在缩略数据上时,展示的预览模式"}
                          >
                            <GrCircleInformation />
                          </Tooltip>
                        </div>
                        <div>
                          <span className={"tips"}>
                            当鼠标悬浮在缩略数据上时,展示的预览模式
                          </span>
                        </div>
                      </div>
                      <div>
                        <Select
                          popupMatchSelectWidth={false}
                          defaultValue={"markdown"}
                          value={
                            config.generator.String.richTextEditorConfig
                              .toolTipsPreview
                          }
                          onChange={(value) => {
                            config.generator.String.richTextEditorConfig.toolTipsPreview =
                              value as "content" | "markdown" | "html" | "json";
                            setConfig({ ...config });
                          }}
                          options={[
                            {
                              label: "原始内容预览",
                              value: "content",
                            },
                            {
                              label: "markdown预览",
                              value: "markdown",
                            },
                            {
                              label: "html预览",
                              value: "html",
                            },
                            {
                              label: "json预览",
                              value: "json",
                            },
                          ]}
                        />
                      </div>
                    </div>
                    <Divider />
                    <div className={"flex justify-between"}>
                      <div>
                        <div>
                          <span>渲染支持时,是否渲染</span>
                          <Tooltip title={"当富文本编辑器支持渲染时,是否渲染"}>
                            <GrCircleInformation />
                          </Tooltip>
                        </div>
                        <div>
                          <span className={"tips"}>
                            当富文本编辑器支持渲染时,是否渲染
                          </span>
                        </div>
                      </div>
                      <div>
                        <Switch
                          defaultChecked={
                            config.generator.String.richTextEditorConfig
                              .renderWhenSupport
                          }
                          onChange={(checked) => {
                            config.generator.String.richTextEditorConfig.renderWhenSupport =
                              checked;
                            setConfig({ ...config });
                          }}
                        />
                      </div>
                    </div>
                    <Divider />
                  </div>
                )}
                <h2>Boolean</h2>
                <Divider dashed />
                <div className={"flex justify-between"}>
                  <div>
                    <div>
                      <span>当类型为boolean值时,是否使用Switch组件</span>
                      <Tooltip
                        title={"针对boolean类型的数据,使用Switch组件进行处理"}
                      >
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>
                        针对boolean类型的数据,使用Switch组件进行处理
                      </span>
                    </div>
                  </div>
                  <div>
                    <Switch
                      defaultChecked={config.generator.Boolean.useSwitch}
                      onChange={(checked) => {
                        config.generator.Boolean.useSwitch = checked;
                        setConfig({ ...config });
                      }}
                    />
                  </div>
                </div>
                <div className={"flex justify-between"}>
                  <div>
                    <div>
                      <span>转换为boolean类型时返回true的数据</span>
                      <Tooltip
                        title={
                          <span>
                            转换为boolean类型时返回true的数据,多个数据使用
                            <code>,</code>分隔
                          </span>
                        }
                      >
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>
                        转换为boolean类型时返回true的数据,多个数据使用
                        <code>,</code>分隔
                      </span>
                    </div>
                  </div>
                  <div>
                    <List
                      size={uiConfig.size as ListSize}
                      dataSource={config.generator.Boolean.trueValues}
                      footer={
                        <div className={"flex justify-start"}>
                          <Button
                            onClick={() => {
                              const hasEmptyDefinition =
                                config.generator.Boolean.trueValues.find(
                                  (item) =>
                                    item.type === "equal" && item.value === "",
                                );
                              if (hasEmptyDefinition) {
                                // 如果已经存在空的定义,则不允许新增
                                messageApi.warning(
                                  <div>
                                    <div>已经存在空的定义,请优先使用空定义</div>
                                    <div>
                                      请注意,只有在equal(等于)模式下,空定义才具有实际意义
                                    </div>
                                  </div>,
                                );
                                return;
                              } else {
                                config.generator.Boolean.trueValues.push({
                                  type: "equal",
                                  value: "",
                                });
                                setConfig({ ...config });
                              }
                            }}
                            type={"dashed"}
                            style={{ width: "90%" }}
                          >
                            新增一行
                          </Button>
                        </div>
                      }
                      renderItem={(item, index) => {
                        return (
                          <div className={"flex justify-between"}>
                            <div>
                              <Select
                                popupMatchSelectWidth={false}
                                defaultValue={"equal"}
                                value={item.type}
                                onChange={(value) => {
                                  item.type = value as
                                    | "regex"
                                    | "equal"
                                    | "start-with"
                                    | "end-with"
                                    | "contain"
                                    | "not-equal"
                                    | "not-start-with"
                                    | "not-end-with"
                                    | "not-contain"
                                    | "not-regex";
                                  setConfig({ ...config });
                                }}
                                options={[
                                  {
                                    label: "正则表达式",
                                    value: "regex",
                                  },
                                  {
                                    label: "等于",
                                    value: "equal",
                                  },
                                  {
                                    label: "以...开始",
                                    value: "start-with",
                                  },
                                  {
                                    label: "以...结束",
                                    value: "end-with",
                                  },
                                  {
                                    label: "包含",
                                    value: "contain",
                                  },
                                  {
                                    label: "不等于",
                                    value: "not-equal",
                                  },
                                  {
                                    label: "不以...开始",
                                    value: "not-start-with",
                                  },
                                  {
                                    label: "不以...结束",
                                    value: "not-end-with",
                                  },
                                  {
                                    label: "不包含",
                                    value: "not-contain",
                                  },
                                  {
                                    label: "不匹配",
                                    value: "not-regex",
                                  },
                                ]}
                              />
                            </div>
                            <div>
                              <Input
                                value={item.value}
                                onChange={(e) => {
                                  item.value = e.target.value;
                                  setConfig({ ...config });
                                }}
                              />
                            </div>
                            <div>
                              <Button
                                style={{ color: "red" }}
                                icon={<AiTwotoneDelete />}
                                onClick={() => {
                                  config.generator.Boolean.falseValues.splice(
                                    index,
                                    1,
                                  );
                                  setConfig({ ...config });
                                }}
                                shape={"circle"}
                                type={"text"}
                              />
                            </div>
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>
                <Divider />
                <h2>日期</h2>
                <Divider dashed />
                <div className={"flex justify-between"}>
                  <div>
                    <div>
                      <span>当类型为Date时,是否使用Time Picker组件</span>
                      <Tooltip title={"当类型为Date时,是否使用Time Picker组件"}>
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>
                        当类型为Date时,是否使用Time Picker组件
                      </span>
                    </div>
                  </div>
                  <div>
                    <Switch
                      defaultChecked={config.generator.Date.useTimePicker}
                      onChange={(checked) => {
                        config.generator.Date.useTimePicker = checked;
                        setConfig({ ...config });
                      }}
                    />
                  </div>
                </div>
                <Divider />
                <div className={"flex justify-between"}>
                  <div>
                    <div>
                      <span>允许选择日期</span>
                      <Tooltip title={"允许选择日期"}>
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>允许选择日期</span>
                    </div>
                  </div>
                  <div>
                    <Switch
                      defaultChecked={config.generator.Date.allowDate}
                      onChange={(checked) => {
                        config.generator.Date.allowDate = checked;
                        setConfig({ ...config });
                      }}
                    />
                  </div>
                </div>
                <Divider />
                <div className={"flex justify-between"}>
                  <div>
                    <div>
                      <span>允许选择时间</span>
                      <Tooltip title={"允许选择时间"}>
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>允许选择时间</span>
                    </div>
                  </div>
                  <div>
                    <Switch
                      defaultChecked={config.generator.Date.allowTime}
                      onChange={(checked) => {
                        config.generator.Date.allowTime = checked;
                        setConfig({ ...config });
                      }}
                    />
                  </div>
                </div>
                <Divider />
                <div className={"flex justify-between"}>
                  <div>
                    <div>
                      <span>时间格式</span>
                      <Tooltip
                        title={
                          "日期组件返回的数据格式是: 毫秒时间戳,秒时间戳,特定日期格式,比如: yyyy-MM-dd HH:mm:ss +T"
                        }
                      >
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>日期组件返回的数据格式</span>
                    </div>
                  </div>

                  <div>
                    {/* 元素尾部对齐 */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Select
                        popupMatchSelectWidth={false}
                        defaultValue={"second-timestamp"}
                        value={config.generator.Date.dateFormat.type}
                        onChange={(value) => {
                          config.generator.Date.dateFormat.type = value as
                            | "second-timestamp"
                            | "millisecond-timestamp"
                            | "date-format";
                          setConfig({ ...config });
                        }}
                        options={[
                          {
                            label: "毫秒时间戳",
                            value: "second-timestamp",
                          },
                          {
                            label: "秒时间戳",
                            value: "millisecond-timestamp",
                          },
                          {
                            label: "特定日期格式",
                            value: "date-format",
                          },
                        ]}
                      />
                    </div>
                    {config.generator.Date.dateFormat.type ===
                      "date-format" && (
                      <div className={""}>
                        <Input
                          style={{ width: "100%" }}
                          defaultValue={"yyyy-MM-dd HH:mm:ss +T"}
                          value={config.generator.Date.dateFormat.format}
                          onBlur={() => {
                            checkBooleanConfig();
                          }}
                          onChange={(e) => {
                            config.generator.Date.dateFormat.format =
                              e.target.value;
                            checkDateConfig(config);
                            setConfig({ ...config });
                          }}
                        />
                        <div style={{ width: "100%" }}>
                          <span
                            className={"tips"}
                          >{`当前日期格式化结果: ${dayjs(new Date()).format(
                            config.generator.Date.dateFormat.format,
                          )}`}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Divider />
                <h2>数字</h2>
                <Divider dashed />
                <div className={"flex justify-between"}>
                  <div>
                    <div>
                      <span>当类型为数字时,是否使用数字输入框</span>
                      <Tooltip title={"当类型为数字时,是否使用数字输入框"}>
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>
                        当类型为数字时,是否使用数字输入框
                      </span>
                    </div>
                  </div>
                  <div>
                    <Switch
                      defaultChecked={config.generator.Number.useNumberInput}
                      onChange={(checked) => {
                        config.generator.Number.useNumberInput = checked;
                        setConfig({ ...config });
                      }}
                    />
                  </div>
                </div>
                <Divider />
                <h2>文件</h2>
                <Divider dashed />
                <div className={"flex justify-between"}>
                  <div>
                    <div>
                      <span>当类型为文件时,是否使用文件编辑器</span>
                      <Tooltip title={"当类型为文件时,是否使用文件编辑器"}>
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>
                        当类型为文件时,是否使用文件编辑器
                      </span>
                    </div>
                  </div>
                  <div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "1",
            label: "FORM TO JSON",
            children: (
              <div>
                <div className={"flex justify-between"}>
                  <div>
                    <div>
                      <span>Base64编码文件</span>
                      <Tooltip
                        title={
                          "将文件转换为json数据时,是否将文件内容转换为base64编码"
                        }
                      >
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>
                        将form表单转换为json数据,针对文件类型的处理方式
                      </span>
                    </div>
                  </div>
                  <div>
                    <Select
                      popupMatchSelectWidth={false}
                      defaultValue={"base64"}
                      options={[
                        {
                          label: "base64编码",
                          value: "base64",
                        },
                        {
                          label: "使用内置的文件描述对象",
                          value: "file-descriptor",
                        },
                      ]}
                    />
                  </div>
                </div>
                <Divider />
                <div className={"flex justify-around"}>
                  <div>
                    <div>
                      <span></span>
                      <Tooltip
                        title={
                          "将文件转换为json数据时,是否将文件内容转换为base64编码"
                        }
                      >
                        <GrCircleInformation />
                      </Tooltip>
                    </div>
                    <div>
                      <span className={"tips"}>
                        将form表单转换为json数据,针对文件类型的处理方式
                      </span>
                    </div>
                  </div>
                  <div>
                    <Select
                      popupMatchSelectWidth={false}
                      defaultValue={"base64"}
                      options={[
                        {
                          label: "base64编码",
                          value: "base64",
                        },
                        {
                          label: "使用内置的文件描述对象",
                          value: "file-descriptor",
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "2",
            label: "高级",
          },
        ]}
      />
    </div>
  );
};

export const DefaultBodyDataEditorAdvanceConfig: BodyDataEditorAdvanceConfig = {
  generator: {
    String: {
      textEditor: "input",
      richTextEditorConfig: {
        triggerLength: -1,
        contentType: "unknown",
        preview: "both",
        useToolTips: false,
        toolTipsPreview: "markdown",
        renderWhenSupport: false,
      },
    },
    Boolean: {
      useSwitch: true,
      trueValues: [
        {
          type: "equal",
          value: "true",
        },
        {
          type: "equal",
          value: "1",
        },
        {
          type: "equal",
          value: "T",
        },
      ],
      falseValues: [
        {
          type: "equal",
          value: "false",
        },
        {
          type: "equal",
          value: "0",
        },
      ],
    },
    Date: {
      useTimePicker: true,
      allowDate: true,
      allowTime: true,
      dateFormat: {
        type: "date-format",
        format: "YYYY-MM-DD HH:mm:ss SSS",
      },
    },
    Number: {
      useNumberInput: true,
    },
    File: {
      useFileEditor: true,
      customFileConvertScript: "",
    },
  },
  snapshot: {
    useSnapshot: true,
    defaultSnapshotEditorType: "json",
    contentTypeConvert: {
      enable: true,
      trigger: "can-not-convert",
    },
    dataItemConvert: {
      enable: true,
      trigger: "can-not-convert",
    },
  },
  convert: {
    ToJson: {
      fileConvertType: "base64",
    },
    ToForm: {
      multiPartConvertType: "discard",
      jsonConvertType: "discard",
    },
  },
};

/**
 * 计算字符串的大小,单位依次为: B,KB,MB,GB,TB
 * @param str
 */
function computeStrSize(str: string) {
  const size = str.length;
  if (size < 1024) {
    return `${size}B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)}MB`;
  }
  if (size < 1024 * 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
  }
  return `${(size / 1024 / 1024 / 1024 / 1024).toFixed(2)}TB`;
}
