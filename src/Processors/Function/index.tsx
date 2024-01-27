import { UniversalFunctionEditor } from "@/components/Function/UniversalFunctionEditor";
import IconCN from "@/components/Icon";
import { DefaultLayoutNode } from "@/core/Layout";
import { Constants } from "@/core/common";
import { CreationModal } from "@/core/component/CreationModel";

/**
 * 函数进行
 */
export default class FunctionProcessor implements Core.Processor {
    before(context: Core.ApplicationContext): void {
        // 注册菜单
        this.addMenu(context)
        // 创建菜单时
        this.register(context)
    }
    register(context: Core.ApplicationContext) {
        context.resourceContext?.register("function", {
            resourceViewer(): Core.ResourceViewer | Core.ResourceViewerFunction {
                return (
                    resource: Core.Resource,
                    _: Core.ApplicationContext,
                    layout: Core.LayoutContext,
                ) => {
                    const resourceDetails = resource as Core.ResourceDetails<unknown>;
                    const layoutNode = DefaultLayoutNode.ofResource(resourceDetails);
                    layoutNode.componentName = "function";
                    // 调用上下文展示资源
                    layoutNode.settings.tab = {
                        id: resourceDetails.id,
                        name: resourceDetails.name,
                        icon: `icon-${resourceDetails.kind}`,
                        component: "function",
                        enableFloat: true,
                    };
                    layoutNode.config = {
                        td: resourceDetails,
                    };
                    layout.createOrActive(layoutNode, "tab");
                };
            },
            componentCreator():
                | Core.ComponentCreatorFunction
                | Core.ComponentCreator {
                return (node: Core.LayoutNode<Core.Resource>) => {
                    return <UniversalFunctionEditor resource={node.data!} />;
                };
            },
        });
    }
    addMenu(context: Core.ApplicationContext) {
        const layoutContext = context.layoutContext!;
        const menuContext = context.resourceContext?.explorer?.menuContext;
        menuContext!.deep((m) => {
            if (m.id === Constants.Resource.explorer.menu.ids.create) {
                m?.children?.push(
                    ...([
                        {
                            id: "new-function",
                            type: "item",
                            label: (
                                <div className={"flex justify-between content-between"}>
                                    <div style={{ marginRight: "5px" }}>
                                        <IconCN type={"icon-icon-function-cate-copy"} />
                                    </div>
                                    <div>新建函数定义</div>
                                </div>
                            ),
                            onMenuClick: (
                                menu: Core.Menu<Core.Resource>,
                                resource: Core.Resource,
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
                                                    kind: "function",
                                                    name: info.name,
                                                    config: {},
                                                    previousId: resource.kind === "resource" ? null : resource.id
                                                } as unknown as Core.Resource)
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
                    ] as unknown as Core.Menu<Core.Resource>[]),
                );
                return false;
            }
            return true;
        });
    }
}