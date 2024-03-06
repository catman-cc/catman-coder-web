import IconCN from "@/components/Icon";
import { DockViewHttpProvider } from "@/components/Provider/http/DockView";
import {
  Constants,
  ResourceDetails,
  DefaultLayoutNode,
  CreationModal,
  Resource,
  Processor,
  IApplicationContext as ApplicationContext,
  ResourceViewer,
  ResourceViewerFunction,
  LayoutContext,
  ComponentCreatorFunction,
  ComponentCreator,
  LayoutNode,
  Menu,
} from "catman-coder-core";
import { ItemParams } from "react-contexify";

export class HttpRequest implements Processor {
  before(context: ApplicationContext) {
    // 添加一个新的右键菜单
    this.addMenu(context);
    // 添加duplicate的右键菜单
    this.addDuplicateMenu(context);
    // 注册http请求组件
    this.register(context);
    this.addResourceIconRender(context);
  }
  register(context: ApplicationContext) {
    context.resourceContext?.register("HttpValueProviderQuicker", {
      resourceViewer(): ResourceViewer | ResourceViewerFunction {
        return (
          resource: Resource,
          _: ApplicationContext,
          layout: LayoutContext,
        ) => {
          const resourceDetails = resource as ResourceDetails<unknown>;
          const layoutNode = DefaultLayoutNode.ofResource(resourceDetails);
          layoutNode.componentName = "HttpValueProviderQuicker";
          // 调用上下文展示资源
          layoutNode.settings.tab = {
            id: resourceDetails.id,
            name: resourceDetails.name,
            icon: `icon-${resourceDetails.kind}`,
            component: "HttpValueProviderQuicker",
            enableFloat: true,
          };
          layoutNode.config = {
            td: resourceDetails,
          };
          console.log("123", layoutNode);
          layout.createOrActive(layoutNode, "tab");
        };
      },
      componentCreator(): ComponentCreatorFunction | ComponentCreator {
        return (node: LayoutNode<Resource>) => {
          return <DockViewHttpProvider resource={node.data!} />;
        };
      },
    });
  }
  addMenu(context: ApplicationContext) {
    const layoutContext = context.layoutContext!;
    const menuContext = context.resourceContext?.explorer?.menuContext;
    menuContext!.deep((m) => {
      if (m.id === Constants.Resource.explorer.menu.ids.create) {
        m?.children?.push(
          ...([
            {
              id: "new-http-request",
              type: "item",
              label: (
                <div className={"flex justify-between content-between"}>
                  <div style={{ marginRight: "5px" }}>
                    <IconCN type={"icon-http1"} />
                  </div>
                  <div>新建HTTP快捷请求</div>
                </div>
              ),
              onMenuClick: (
                menu: Menu<Resource>,
                resource: Resource,
                itemParams: ItemParams,
              ) => {
                let group = resource;
                while (group.kind !== "resource") {
                  group =
                    context.resourceContext?.store?.resources[
                      resource.parentId
                    ];
                }

                // 弹出一个交互窗口,可以从现有资源选择,也可以直接输入名称
                // 直接通过前端或者调用后端生成一个类型定义都可以,此处选择调用后端接口创建资源
                context.resourceContext?.showModel(
                  <CreationModal
                    context={context}
                    onOk={(info) => {
                      context.resourceContext?.service
                        ?.create({
                          parentId: group.id,
                          kind: "HttpValueProviderQuicker",
                          name: info.name,
                          config: {},
                          previousId:
                            resource.kind === "resource" ? null : resource.id,
                        } as unknown as Resource)
                        .then((res) => {
                          const resourceDetails = res.data;
                          // 处理资源
                          context.events?.publish({
                            id: "resource-flush",
                            name: "resource-flush",
                            data: resourceDetails,
                          });
                          layoutContext.createOrActive(
                            DefaultLayoutNode.ofResource(resourceDetails),
                          );
                        });
                    }}
                  />,
                );
              },
            },
          ] as unknown as Menu<Resource>[]),
        );
        return false;
      }
      return true;
    });
  }

  addResourceIconRender(context: ApplicationContext) {
    const iconFactory =
      context.resourceContext?.explorer?.itemRenderFactory?.iconFactory;
    iconFactory?.registry({
      support(resource: Resource): boolean {
        return resource.kind === "HttpValueProviderQuicker";
      },
      render(resource: Resource): React.ReactNode {
        // 读取resource的类型定义
        try {
          const parse = JSON.parse(resource.extra || "{}");
          const method = parse.method || "UNKONWN";
          if (method === "GET") {
            return (
              <span
                style={{
                  height: "100%",
                  color: "#1890ff",
                  fontWeight: 300,
                  fontSize: ".7em",
                }}
              >
                GET
              </span>
            );
          }
          if (method === "POST") {
            return (
              <span
                style={{
                  height: "100%",
                  color: "#ff794f",
                  fontSize: ".7em",
                  marginRight: "5px",
                }}
              >
                POST
              </span>
            );
          }
          if (method === "PUT") {
            return (
              <span
                style={{
                  height: "100%",
                  color: "#227064",
                  fontSize: ".7em",
                  marginRight: "5px",
                }}
              >
                PUT
              </span>
            );
          }
          if (method === "DELETE") {
            return (
              <span
                style={{
                  height: "100%",
                  color: "#de3b08",
                  fontSize: ".7em",
                  marginRight: "5px",
                }}
              >
                DELETE
              </span>
            );
          }
        } catch (e) {
          // 忽略
        }
        console.log(resource);
        return <IconCN type={"icon-http1"} />;
      },
    });
  }

  private addDuplicateMenu(context: ApplicationContext) {
    const layoutContext = context.layoutContext!;
    const menuContext = context.resourceContext?.explorer?.menuContext;
    menuContext!.menus().children!.push(
      ...([
        {
          id: "snapshot-create",
          type: "item",
          label: (
            <div className={"flex justify-between content-between"}>
              <div style={{ marginRight: "5px" }}>
                <IconCN type={"icon-fuzhi"} />
              </div>
              <div>创建副本</div>
            </div>
          ),
          filter: (item: Resource): boolean => {
            return (
              item.kind === Constants.Resource.kind.httpValueProviderQuicker
            );
          },
          onMenuClick: (
            menu: Menu<Resource>,
            resource: Resource,
            itemParams: ItemParams,
          ) => {
            context.resourceContext?.service
              ?.create({
                ...resource,
                name: `副本-${resource.name}`,
                id: undefined,
                previousId: resource.kind === "resource" ? null : resource.id,
              } as unknown as Resource)
              .then((res) => {
                const resourceDetails = res.data;
                // 处理资源
                context.events?.publish({
                  id: "resource-flush",
                  name: "resource-flush",
                  data: resourceDetails,
                });
                layoutContext.createOrActive(
                  DefaultLayoutNode.ofResource(resourceDetails),
                );
              });
          },
        } as unknown as Menu<Resource>,
      ] as unknown as Menu<Resource>[]),
    );
  }
}
