import { TypeDefinitionHierarchialSchema } from "@/components/HierarchicalSchema/TypeDefinitionSchemaParse";
import IconCN from "@/components/Icon";
import { HierarchicalDnd } from "@/components/TypeDefinitionEditor/dnd";
import { Badge, Button, Switch } from "antd";
import { useState } from "react";
import "./index.less";
export const FunctionResultPanel = () => {
  const [schema, setSchema] = useState(
    TypeDefinitionHierarchialSchema.of(mockSchema())
  );
  schema.addWatcher((n) => {
    setSchema(n);
  });

  const [showBadge, setShowBadge] = useState(true);

  const renderArgs = () => {
    return (
      <div className="function-args-panel-type">
        <div className="function-args-panel-type-header">
          <Switch size="small" />
        </div>
        <HierarchicalDnd
          treeId={schema.registry.root}
          schema={schema}
          renderChildrenIfPublic
        />
      </div>
    );
  };
  return (
    <Badge.Ribbon
      text={
        <span>
          <Button
            size="small"
            type="text"
            shape="circle"
            style={{
              color: "purple",
            }}
            icon={
              <IconCN type={showBadge ? "icon-psw-show" : "icon-psw-hide"} />
            }
            onClick={() => {
              setShowBadge(!showBadge);
            }}
          />
          {showBadge ? (
            <span>{schema.get(schema.registry.root).name}</span>
          ) : null}
        </span>
      }
      placement="start"
    >
      {renderArgs()}
    </Badge.Ribbon>
  );
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
  } as unknown as TypeDefinitionSchema;
  schema.context = {
    typeDefinitions: schema.definitions,
    parameters: {},
    valueProviderDefinitions: {},
    functionInfos: {},
  };
  return schema;
};
