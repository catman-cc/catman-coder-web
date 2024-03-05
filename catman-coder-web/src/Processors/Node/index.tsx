import { DockViewHttpProvider } from "@/components/Provider/http/DockView";
import { Card } from "antd";
import {
  TypeDefinitionEditor,
  TypeDefinitionEditorProps,
} from "@/components/TypeDefinitionEditor/EditorPanel";
import DEMO from "@/components/TypeDefinitionEditor/EditorPanel/demo.tsx";
import { useState } from "react";
import { TypeDefinitionSchemaEditor } from "@/components/TypeDefinitionEditor";

/**
 *   节点服务, 用于展示进而处理节点相关的逻辑
 *
 *   值得注意的是,节点服务注册在左侧面板中,不属于Resource的一部分
 *   其默认创建一个用于展示所有节点的操作面板
 */
export class NodeProcess implements Core.Processor {
  before(context: Core.ApplicationContext) {
    // const model = context.layoutContext?.model!;
    const modelConfig = context.layoutContext?.modelConfig!;
    // model.getBorderSet().getBorders().filter(b=>b.getLocation()==="left").forEach(b=>{
    //     // 注册一个节点服务
    //     b.getChildren().push({id:"core-node",type:"tab",name:"节点服务",component:"node-service"} as unknown as Node)
    // })
    // 获取配置文件中的左侧面板,并将节点服务添加到面板中
    const left = modelConfig.borders.find((b) => b.location === "left")!;
    left.children.push({
      type: "tab",
      id: "core-node",
      name: "节点服务",
      component: "node-service",
      floating: true,
      enableFloat: true,
      // enableDrag: false,
      helpText: "展示所有参数定义",
      enableClose: false,
      className: "TypeDefinitionMenuIcon",
      icon: "icon-social-instagram",
    });
    const componentRenderFactory =
      context.layoutContext?.componentRenderFactory;
    // 注册节点服务组件
    componentRenderFactory?.nameMatch("node-service", () => {
      const [a, setA] = useState({
        root: "02861d4e-71d8-487e-add7-46d30a94fe97",
        definitions: {
          "02861d4e-71d8-487e-add7-46d30a94fe97": {
            scope: "PUBLIC",
            limitedChanges: false,
            id: "02861d4e-71d8-487e-add7-46d30a94fe97",
            name: "asd",
            type: {
              typeName: "map",
              privateItems: {
                "02861d4e-71d8-487e-add7-46d30a94fe98": {
                  scope: "PRIVATE",
                  limitedChanges: false,
                  id: "02861d4e-71d8-487e-add7-46d30a94fe98",
                  name: "asd",
                  type: {
                    typeName: "map",
                    privateItems: {
                      "02861d4e-71d8-487e-add7-46d30a94fe99": {
                        scope: "PRIVATE",
                        limitedChanges: false,
                        id: "02861d4e-71d8-487e-add7-46d30a94fe99",
                        name: "asd",
                        type: {
                          typeName: "refer",
                          privateItems: {},
                          sortedAllItems: [
                            {
                              id: "02861d4e-71d8-487e-add7-46d30a94fe97",
                              name: "asd",
                              scope: "PUBLIC",
                            },
                          ],
                        },
                      },
                    },
                    sortedAllItems: [
                      {
                        id: "02861d4e-71d8-487e-add7-46d30a94fe99",
                        name: "asd",
                        scope: "PRIVATE",
                      },
                    ],
                  },
                },
              },
              sortedAllItems: [
                {
                  id: "02861d4e-71d8-487e-add7-46d30a94fe98",
                  name: "asd",
                  scope: "PRIVATE",
                },
              ],
              overwriteItems: [],
              definitionMap: {},
            },
          },
        },
        refs: {},
      });
      return (
        <TypeDefinitionSchemaEditor
          schema={a}
          onSave={(a) => {
            console.log("new schema", a);
          }}
        />
      );
    });
  }
}
