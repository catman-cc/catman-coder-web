import { UniversalFunctionEditor } from "@/components/Function/UniversalFunctionEditor";
import IconCN from "@/components/Icon";
import {
  DefaultLayoutNode,
  Constants,
  CreationModal,
  Processor,
  IApplicationContext as ApplicationContext,
  ResourceViewer,
  ResourceViewerFunction,
  Resource,
  LayoutContext,
  ResourceDetails,
  ComponentCreatorFunction,
  ComponentCreator,
  LayoutNode,
  Menu,
} from "catman-coder-core";
import { ItemParams } from "react-contexify";

export class JobProcessor implements Processor {
  before(context: ApplicationContext): void {
    // 注册菜单
    this.addMenu(context);
    this.addDuplicateMenu(context);
    // 创建菜单时
    this.register(context);
  }
  register(context: ApplicationContext) {
    context.resourceContext?.register("job", {
      resourceViewer(): ResourceViewer | ResourceViewerFunction {
        return (
          resource: Resource,
          _: ApplicationContext,
          layout: LayoutContext,
        ) => {
          const resourceDetails = resource as ResourceDetails<unknown>;
          const layoutNode = DefaultLayoutNode.ofResource(resourceDetails);
          layoutNode.componentName = "job";
          // 调用上下文展示资源
          layoutNode.settings.tab = {
            id: resourceDetails.id,
            name: resourceDetails.name,
            icon: `icon-${resourceDetails.kind}`,
            component: "job",
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
          return <UniversalFunctionEditor resource={node.data!} />;
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
              id: "new-job",
              type: "item",
              label: (
                <div className={"flex justify-between content-between"}>
                  <div style={{ marginRight: "5px" }}>
                    <IconCN type={"icon-i_execute"} />
                  </div>
                  <div>新建任务</div>
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
                          kind: "job",
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
              <div>由此创建任务</div>
            </div>
          ),
          filter: (item: Resource): boolean => {
            return item.kind === Constants.Resource.kind.function;
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
