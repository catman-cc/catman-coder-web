import { TypeDefinitionHierarchialSchema } from "@/components/HierarchicalSchema/TypeDefinitionSchemaParse";
import {
  createDefaultHierarchicalConfig,
  HierarchicalDnd,
} from "@/components/TypeDefinitionEditor/dnd";
import { Button, Divider, List } from "antd";
import { useState } from "react";
import "./index.less";

export interface FunctionArgsPanelProps {
  editable: boolean; // 是否可以编辑参数面板,有些内置函数是不可以编辑出入参
}
/**
 *  用于展示方法参数面板
 * @returns
 */
export const FunctionArgsPanel = () => {
  /**
   * 参数集合
   */
  const [schema, setSchema] = useState(
    TypeDefinitionHierarchialSchema.of(mockSchema()),
  );
  const [schemas, setSchemas] = useState<TypeDefinitionHierarchialSchema[]>([
    TypeDefinitionHierarchialSchema.of(mockSchema()),
    TypeDefinitionHierarchialSchema.of(mockSchema()),
  ]);

  schema.addWatcher((n) => {
    setSchema(n);
  });

  // const [showBadge, setShowBadge] = useState(true)
  const [lock, setLock] = useState(false);
  const renderArgs = (schema: TypeDefinitionHierarchialSchema) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div className="function-args-panel-type">
          {/* <div className="function-args-panel-type-header">
                    <Switch size="small"
                        checked={lock}
                        onChange={(e) => {
                            setLock(e)
                        }}
                    />
                </div> */}
          <HierarchicalDnd
            treeId={schema.registry.root}
            schema={schema}
            renderChildrenIfPublic
            config={{
              ...createDefaultHierarchicalConfig(),
              locked: lock,
            }}
          />
        </div>
        <div
          style={{
            width: "50px",
          }}
        >
          删除
        </div>
      </div>
    );
  };
  return (
    <List
      bordered
      dataSource={schemas}
      header={
        <Button
          size={"small"}
          onClick={() => {
            setSchemas([
              ...schemas,
              TypeDefinitionHierarchialSchema.of(mockSchema()),
            ]);
          }}
        >
          新建
        </Button>
      }
      renderItem={(item) => <List.Item>{renderArgs(item)}</List.Item>}
    />
  );
  // return <Badge.Ribbon
  //     text={<span>
  //         <Button
  //             size="small"
  //             type="text"
  //             shape="circle"
  //             style={{
  //                 color: "purple"
  //             }}
  //             icon={<IconCN type={showBadge ? "icon-psw-show" : "icon-psw-hide"} />}
  //             onClick={() => {
  //                 setShowBadge(!showBadge)
  //             }}
  //         />
  //         {showBadge ? <span>
  //             <Input
  //                 size="small"
  //                 value={schema.get(schema.registry.root).name}
  //             />
  //         </span> : null}
  //     </span>}
  //     placement="start"
  // >
  //     {renderArgs(schema)}
  // </Badge.Ribbon>
};

const mockSchema = () => {
  const schema = {
    root: "02861d4e-71d8-487e-add7-46d30a94fe97",
    definitions: {
      "02861d4e-71d8-487e-add7-46d30a94fe97": {
        scope: "PUBLIC",
        limitedChanges: false,
        id: "02861d4e-71d8-487e-add7-46d30a94fe97",
        name: "asd1111123",
        describe: "这是描述",
        type: {
          typeName: "map",
          privateItems: {
            KNuuLwLU62KwItoC8igJB: {
              scope: "PRIVATE",
              limitedChanges: false,
              id: "KNuuLwLU62KwItoC8igJB",
              name: "order_status",
              type: {
                typeName: "enum",
                privateItems: {
                  IWRkcaTI8YttcfIqBQrJ0: {
                    scope: "PRIVATE",
                    limitedChanges: false,
                    id: "IWRkcaTI8YttcfIqBQrJ0",
                    name: "ORDER_SUCCESS",
                    type: {
                      typeName: "string",
                      privateItems: {},
                      sortedAllItems: [],
                      defaultValue: "",
                    },
                  },
                },
                sortedAllItems: [
                  {
                    name: "ORDER_SUCCESS",
                    itemId: "IWRkcaTI8YttcfIqBQrJ0",
                    itemScope: "PRIVATE",
                  },
                ],
              },
            },
          },
          sortedAllItems: [
            {
              name: "order_status",
              itemId: "KNuuLwLU62KwItoC8igJB",
              itemScope: "PRIVATE",
            },
          ],
          overwriteItems: [],
          definitionMap: {},
        },
      },
    },
    refs: {
      "02861d4e-71d8-487e-add7-46d30a94fe97": ["KNuuLwLU62KwItoC8igJB"],
    },
  } as unknown as Core.TypeDefinitionSchema;
  schema.context = {
    typeDefinitions: schema.definitions,
    parameters: {},
    valueProviderDefinitions: {},
    functionInfos: {},
  };
  return schema;
};
