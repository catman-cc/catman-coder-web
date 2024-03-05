import { UniversalFunctionEditor } from "@/components/Function/UniversalFunctionEditor";
import IconCN from "@/components/Icon";
import { DefaultLayoutNode } from "@/core/Layout";
import { Constants } from "@/core/common";
import { CreationModal } from "@/core/component/CreationModel";

export class JobProcessor implements Core.Processor {
    before(context: Core.ApplicationContext): void {
        // 注册菜单
        this.addMenu(context)
        this.addDuplicateMenu(context)
        // 创建菜单时
        this.register(context)
    }
    register(context: Core.ApplicationContext) {
        context.resourceContext?.register("job", {
            resourceViewer(): Core.ResourceViewer | Core.ResourceViewerFunction {
                return (
                    resource: Core.Resource,
                    _: Core.ApplicationContext,
                    layout: Core.LayoutContext,
                ) => {
                    const resourceDetails = resource as Core.ResourceDetails<unknown>;
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
                                                    kind: "job",
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
    private addDuplicateMenu(context: Core.ApplicationContext) {
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
                    filter: (item: Core.Resource): boolean => {
                        return (
                            item.kind === Constants.Resource.kind.function
                        );
                    },
                    onMenuClick: (
                        menu: Core.Menu<Resource>,
                        resource: Core.Resource,
                        itemParams: ItemParams,
                    ) => {
                        context.resourceContext?.service
                            ?.create({
                                ...resource,
                                name: `副本-${resource.name}`,
                                id: undefined,
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
                    },
                } as unknown as Core.Menu<Core.Resource>,
            ] as unknown as Core.Menu<Core.Resource>[]),
        );
    }
}