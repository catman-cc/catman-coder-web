// 构建上下文对象
import { DefaultApplicationContext } from "@/core";
import { DefaultEventBusContext } from "@/core/Event";
import { DefaultLayoutContext } from "@/core/Layout";
import {
  DefaultResourceContext,
  DefaultResourceExplorerContext,
  DefaultResourceItemIconFactory,
  DefaultResourceItemIconRender,
  DefaultResourceItemRenderFactory,
  DefaultResourceMenuContext,
  DefaultResourceViewerFactory,
  KindMatchResourceItemRender,
} from "@/core/Resource/Explorer";
import { DefaultResourceService } from "@/services/resource";
import IconCN from "@/components/Icon";
import TypeDefinitionProcessor from "@/Processors/TypeDefinition";
import { Constants } from "@/core/common";
import {
  CacheableFactory,
  DefaultComponentFactory,
  RefuseNodeComponentFactory,
} from "@/core/Layout/Factory.tsx";
import { Button, Input, Popconfirm, Popover, Tag } from "antd";
import TypeDefinitionMenu from "@/components/TypeDefinition/Menu";
import ParameterMenu from "@/components/Parameter/menu";
import ParameterEditor from "@/components/Parameter/Editor";
import Menus from "@/components/Menus";
import Editor from "@/components/TypeDefinition/Editor";
import ReactJson from "react-json-view";
import MonacoCodeEditor from "@/components/CodeEditor";
import ResourceExplorer from "@/components/Resource/Explorer";
import global from "@/config";
import { AccessControlProcessor } from "@/Processors/AccessControl";
import { ResourceProcessor } from "@/Processors/Resource";
import { SnapshotProcessor } from "@/Processors/Snapshot";
import { ParameterProcessor } from "@/Processors/Parameter";
import { NodeProcess } from "@/Processors/Node";
import { MessageProcessor } from "@/Processors/Message";
import { HttpRequest } from "@/Processors/HttpRequest";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Item } from "react-contexify";
import React from "react";
import { QuickerCodeEditorProcessor } from "@/Processors/QuickerCodeEditor";

/**
 * 单独抽出来一个文件构建应用上下文
 */

export const applicationContext = new DefaultApplicationContext();

// 配置事件总线
applicationContext.setEventBusContext(new DefaultEventBusContext());

// 配置布局
const factory = RefuseNodeComponentFactory.of(
  CacheableFactory.of(
    DefaultComponentFactory.create()
      .nameMatch("button", (node) => {
        return <Button>{node.name}</Button>;
      })
      .nameMatch("TypeDefinitionMenu", (node) => {
        return (
          <TypeDefinitionMenu node={node} layoutRef={global.layout.ref!} />
        );
      })
      .nameMatch("ParameterMenu", () => {
        return <ParameterMenu />;
      })
      .nameMatch("ParameterEditor", (node) => {
        return (
          <ParameterEditor params={node.getConfig().data as Core.Parameter} />
        );
      })
      .nameMatch("menus", () => {
        return <Menus />;
      })
      // .nameMatch("TypeDefinitionTreePanel", (node: TabNode) => {
      //     return <TypeDefinitionTreePanel td={node.getExtraData().td} />
      // })
      .nameMatch("TypeDefinitionTreePanel", (node) => {
        return <Editor td={node.data.details} node={node.toFlexLayout()} />;
      })
      // .nameMatch("td", (node) => {
      //   return <Editor td={node.data.details} node={node.toFlexLayout()} />;
      // })
      .nameMatch("JsonView", (node) => {
        return <ReactJson src={node.settings.tab.getConfig().data} />;
      })
      .nameMatch("MonacoCodeEditor", (node) => {
        return (
          <MonacoCodeEditor
            code={node.settings.tab.getConfig().data as string}
          />
        );
      })
      .nameMatch("ResourceExplorer", () => {
        return <ResourceExplorer />;
      }),
  ),
);

applicationContext.setLayoutContext(
  new DefaultLayoutContext(factory, global.layout.model),
);

// 配置资源管理器
const resourceContext = new DefaultResourceContext();
resourceContext.setApplicationContext(applicationContext);
resourceContext.setResourceService(new DefaultResourceService());
const resourceExplorerContext = new DefaultResourceExplorerContext();
resourceExplorerContext.setResourceViewerFactory(
  new DefaultResourceViewerFactory(),
);
const defaultResourceItemRenderFactory = new DefaultResourceItemRenderFactory({
  support(): boolean {
    return true;
  },
  render: (res) => {
    return {
      key: res.id,
      title: res.name,
      kind: res.kind,
      resourceId: res.resourceId,
      isLeaf: res.isLeaf,
      icon: <IconCN type={"json"} />,
      children: [],
      resource: res,
    };
  },
});

defaultResourceItemRenderFactory
  .registry(
    KindMatchResourceItemRender.of("td", (res) => {
      return {
        key: res.id,
        title: res.name,
        kind: res.kind,
        resourceId: res.resourceId,
        isLeaf: res.isLeaf,
        icon: <IconCN type={"json"} />,
        children: [],
        resource: res,
      };
    }),
  )
  .registry(
    KindMatchResourceItemRender.of("resource", (res) => {
      return {
        key: res.id,
        title: res.name,
        kind: res.kind,
        resourceId: res.resourceId,
        isLeaf: res.isLeaf,
        icon: <IconCN type={"&#xe61c;"} />,
        children: [],
        resource: res,
      };
    }),
  );

defaultResourceItemRenderFactory.setIconFactory(
  new DefaultResourceItemIconFactory(new DefaultResourceItemIconRender()),
);

resourceExplorerContext.setResourceItemRenderFactory(
  defaultResourceItemRenderFactory,
);
resourceExplorerContext.setResourceMenuContext(
  new DefaultResourceMenuContext({
    id: "new-type-definition",
    type: "menu",
    children: [
      {
        id: Constants.Resource.explorer.menu.ids.create,
        type: "submenu",
        label: "新建",
        children: [],
      } as unknown as Core.Menu<Core.Resource>,
      {
        id: Constants.Resource.explorer.menu.ids.rename,
        type: "item",
        label: "重命名",
        renderMenuItem: (menu: Core.Menu<unknown>, resource: Core.Resource) => {
          return (
            <Popover
              trigger={"click"}
              getPopupContainer={(triggerNode) =>
                triggerNode.parentNode as HTMLElement
              }
              title={
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      // 禁用空格
                      e.stopPropagation();
                    }
                  }}
                >
                  <Input
                    defaultValue={resource.name}
                    autoFocus
                    showCount
                    onPressEnter={(e) => {
                      resourceContext.service
                        ?.rename(resource.id, e.currentTarget.value)
                        .then((res) => {
                          if (res.data) {
                            applicationContext.events?.publish({
                              id: "resource-flush",
                              name: "resource-flush",
                              data: res.data,
                            });
                          }
                        });
                    }}
                  />
                </div>
              }
            >
              <Item key={menu.id} id={menu.id} data={menu.data}>
                {typeof menu.label === "function"
                  ? menu.label(menu, resource)
                  : menu.label}
              </Item>
            </Popover>
          );
        },
        children: [],
      } as unknown as Core.Menu<Core.Resource>,
      {
        id: Constants.Resource.explorer.menu.ids.delete,
        type: "item",
        label: "删除",
        renderMenuItem: (menu: Core.Menu<unknown>, resource: Core.Resource) => {
          return (
            <Popconfirm
              title={
                <div>
                  😱
                  <strong>要删除</strong>
                  <Tag color={"red"}> {resource.name}</Tag>吗?
                </div>
              }
              placement={"right"}
              okText={"确定"}
              cancelText={"取消"}
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              onConfirm={() => {
                {
                  resourceContext.service?.delete(resource).then((res) => {
                    if (res.data) {
                      // 处理资源
                      applicationContext.events?.publish({
                        id: "resource-remove",
                        name: "resource-remove",
                        data: resource,
                      });
                    }
                  });
                }
              }}
            >
              <Item key={menu.id} id={menu.id} data={menu.data}>
                {typeof menu.label === "function"
                  ? menu.label(menu, resource)
                  : menu.label}
              </Item>
            </Popconfirm>
          );
        },
        children: [],
        onMenuClick: (_menu, resource) => {},
      } as unknown as Core.Menu<Core.Resource>,
    ],
  } as unknown as Core.Menu<Core.Resource>),
);

resourceContext.setResourceExplorerContext(resourceExplorerContext);
applicationContext.setResourceContext(resourceContext);

applicationContext.addProcessor({
  run(context: Core.ApplicationContext) {
    context.events!.watchByName("new-type-definition", (event, eventBus) => {
      // 调用后端服务,新建一个类型定义
      eventBus.publish({
        name: "",
        data: {
          callBack: (name: string) => {
            // 将类型定义添加到资源树中
            context
              .resourceContext!.service!.save({
                children: [],
                id: "",
                isLeaf: false,
                kind: "",
                name: "",
                parentId: "",
                resourceId: "",
              })
              .then((res) => {
                const td = res.data;
                // 继续推送事件, // 添加到布局中
              });
          },
        },
      });
    });
  },
});

applicationContext.addProcessor(new MessageProcessor());
applicationContext.addProcessor(new ResourceProcessor());
applicationContext.addProcessor(new TypeDefinitionProcessor());
applicationContext.addProcessor(new ParameterProcessor());
applicationContext.addProcessor(new SnapshotProcessor());
applicationContext.addProcessor(new AccessControlProcessor());
// applicationContext.addProcessor(new NodeProcess());
applicationContext.addProcessor(new HttpRequest());
applicationContext.addProcessor(new QuickerCodeEditorProcessor());
export default applicationContext;
