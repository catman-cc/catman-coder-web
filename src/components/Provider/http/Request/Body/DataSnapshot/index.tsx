import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, List, Select, Tag } from "antd";
import { VscEdit } from "react-icons/vsc";
import { Editor } from "@monaco-editor/react";
import "./index.less";
import { GiConfirmed } from "react-icons/gi";
import dayjs from "dayjs";
import {
  BodyDataItem,
  EBodyDataType,
} from "@/components/Provider/http/types.ts";
import { BodyDataEditor } from "@/components/Provider/http/Request/Body/BodyDataEditor";
import { IDockviewPanelProps } from "dockview/dist/cjs/dockview/dockview";
export interface SnapshotData {
  id: string;
  name: string;
  value: BodyDataItem[];
  reason: string;
  createTime: number;
}

export interface DataSnapshotProps {
  data: SnapshotData[];
  defaultEdit?: "json" | "table";
  onRecover?: (data: SnapshotData) => void;
  onRemove?: (data: SnapshotData) => void;
  onChange?: (data: SnapshotData) => void;
  dockview?: IDockviewPanelProps;
}

/**
 * 一个数据快照组件
 * @constructor
 */
export const DataSnapshot = (props: DataSnapshotProps) => {
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const [currentEdit, setCurrentEdit] = useState<"json" | "table">(
    props.defaultEdit || "json",
  );
  const [currentSnapshot, setCurrentSnapshot] = useState<SnapshotData>();
  const [editing, setEditing] = useState<{
    [index: string]: {
      name: boolean;
    };
  }>({});

  useEffect(() => {
    setSnapshots(props.data);
    if (!currentSnapshot) {
      setCurrentSnapshot(props.data[0]);
    }
    setCurrentEdit(props.defaultEdit || "json");
  }, [props]);
  // 分为左右两栏，左边是快照列表，右边是快照详情
  // 左边的快照列表，可以点击查看详情
  // 右边的快照详情，分为上下两栏，上面是快照的基本信息和操作，下面是快照的内容
  return (
    <div className={"snapshot-panel"}>
      <div className={"snapshot-list"}>
        <List
          itemLayout="horizontal"
          dataSource={snapshots}
          renderItem={(item, index) => (
            <Badge.Ribbon text={index + 1} style={{ marginRight: "10px" }}>
              <Card
                className={"snapshot-card"}
                hoverable
                onClick={() => {
                  setCurrentSnapshot(item);
                }}
                title={
                  <div className={"snapshot-card-title"}>
                    <div className={"snapshot-card-title-name"}>
                      <div>
                        <Input
                          defaultValue={item.name || "未命名"}
                          value={item.name || "未命名"}
                          disabled={!editing[item.id]?.name}
                          onChange={(e) => {
                            item.name = e.target.value;
                            setSnapshots([...snapshots]);
                          }}
                        />
                      </div>
                      <div>
                        {editing[item.id]?.name ? (
                          <Button
                            type={"text"}
                            shape={"circle"}
                            style={{ color: "green" }}
                            icon={<GiConfirmed />}
                            onClick={() => {
                              props.onChange ? item : null;
                              setEditing({
                                ...editing,
                                [item.id]: {
                                  name: false,
                                },
                              });
                            }}
                          />
                        ) : (
                          <Button
                            type={"text"}
                            shape={"circle"}
                            icon={<VscEdit />}
                            onClick={() => {
                              setEditing({
                                ...editing,
                                [item.id]: {
                                  name: true,
                                },
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                }
              >
                <div className={"snapshot-card-content"}>
                  <div className={"snapshot-card-content-info"}>
                    <div className={"snapshot-card-content-info-item"}>
                      <span className={"snapshot-card-content-info-item-label"}>
                        创建时间：
                      </span>
                      <span className={"snapshot-card-content-info-item-value"}>
                        {dayjs(new Date(item.createTime)).format(
                          "YYYY-MM-DD HH:mm:ss",
                        )}
                      </span>
                    </div>
                    <div className={"snapshot-card-content-info-item"}>
                      <span className={"snapshot-card-content-info-item-label"}>
                        原因：
                      </span>
                      <span className={"snapshot-card-content-info-item-value"}>
                        {item.reason}
                      </span>
                    </div>
                  </div>
                  {/*<div className={"snapshot-card-content-data"}>*/}
                  {/*    <div className={"snapshot-card-content-data-item"}>*/}
                  {/*        <span className={"snapshot-card-content-data-item-label"}>数据：</span>*/}
                  {/*        <span className={"snapshot-card-content-data-item-value"}>{item.value}</span>*/}
                  {/*    </div>*/}
                  {/*</div>*/}
                </div>
              </Card>
            </Badge.Ribbon>
          )}
        />
      </div>
      <div className={"snapshot-details"}>
        <div className={"snapshot-details-header"}>
          <div className={"snapshot-details-header-title"}>
            <Tag>{currentSnapshot?.name}</Tag>
          </div>
          <div className={"snapshot-details-header-actions"}>
            <Button
              onClick={() => {
                // 询问是否恢复,如果恢复则调用props.onRecover
              }}
            >
              恢复
            </Button>
            <Button>删除</Button>
            <Select
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              defaultValue={currentEdit}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onSelect={(value) => {
                setCurrentEdit(value);
              }}
              options={[
                {
                  label: "JSON",
                  value: "json",
                },
                {
                  label: "表格",
                  value: "table",
                },
              ]}
            />
          </div>
        </div>
        <div className={"snapshot-details-content"}>
          <div className={"snapshot-details-content-data"}>
            {currentEdit === "json" ? (
              <Editor
                value={JSON.stringify(currentSnapshot?.value)}
                options={{
                  minimap: {
                    enabled: false,
                  },
                  readOnly: true,
                }}
                height={"100%"}
                width={"100%"}
                defaultLanguage="json"
              />
            ) : (
              <BodyDataEditor
                bodyData={{
                  key: "root", // key
                  name: "root", // 名称
                  type: EBodyDataType.Object, // 类型
                  value: "", // 值
                  children: currentSnapshot?.value as BodyDataItem[], // 子节点
                }}
                hideHeader={true}
                hideColumns={["action"]}
                lock={true}
                dockView={props.dockview}
                uiConfig={{
                  size: "small",
                  tableFixed: 200,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
