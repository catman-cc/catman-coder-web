import IconCN from "@/components/Icon";
import { Constants } from "@/core/common";
import { Input, InputRef, Modal, Space } from "antd";
import React from "react";
import { ItemParams } from "react-contexify";

interface ResourceCreationModalProps {
    context: Core.ApplicationContext
    onOk: (info: {
        name: string,
    }) => void
}

interface ResourceCreationModalState {
    open: boolean
    type: string
}
class ResourceCreationModal extends React.Component<ResourceCreationModalProps, ResourceCreationModalState>{
    nameInput: InputRef | undefined
    constructor(props: Readonly<ResourceCreationModalProps> | ResourceCreationModalState) {
        super(props);
        this.state = {
            open: true,
            type: "string"
        }
    }

    componentDidMount() {
        this.nameInput?.focus();
    }
    render() {
        return <Modal
            rootClassName={"resource-model"}
            style={{
                maxWidth: 300
            }}
            title={"新建资源组"}
            footer={<></>}
            open={this.state.open}
            maskClosable={true}
            onCancel={() => {
                this.setState({ open: false })
            }}
            closable={false}
            destroyOnClose
            afterClose={() => {
                this.props.context.resourceContext?.closeModel()
            }}
        >
            <Space>
                <Input
                    ref={(input) => {
                        this.nameInput = input
                    }}
                    defaultChecked
                    autoFocus onPressEnter={(e) => {
                        this.setState({ open: false })
                        this.props.onOk({
                            name: e.target.value,
                        })
                    }}>
                </Input>

            </Space>
        </Modal>
    }
}

export class ResourceProcessor implements Core.Processor {

    before(context: Core.ApplicationContext) {
        const layoutContext = context.layoutContext!;
        const menuContext = context.resourceContext?.explorer?.menuContext;
        menuContext?.deep((m) => {
            if (m.id === Constants.Resource.explorer.menu.ids.create) {
                m?.children?.push(...[
                    {
                        id: "new-resource-group",
                        type: "item",
                        label: (
                            <div className={"flex justify-between content-between"}>
                                <div style={{ marginRight: "5px" }}>
                                    <IconCN type={"icon-resource"} />
                                </div>
                                <div>
                                    新建资源组
                                </div>
                            </div>
                        ),
                        onMenuClick: (menu: Core.Menu<Resource>, resource: Core.Resource, itemParams: ItemParams) => {
                            let group = resource
                            while (group.kind !== "resource") {
                                group = context.resourceContext?.store?.resources[resource.parentId]
                            }
                            // 弹出一个交互窗口,可以从现有资源选择,也可以直接输入名称
                            // 直接通过前端或者调用后端生成一个类型定义都可以,此处选择调用后端接口创建资源
                            context.resourceContext?.showModel(<ResourceCreationModal context={context} onOk={info => {
                                context.resourceContext?.service?.create({
                                    parentId: group.id,
                                    kind: "resource",
                                    name: info.name,
                                    config: {
                                    }
                                    ,
                                    previousId: resource.kind === "resource" ? null : resource.id
                                } as unknown as Core.Resource)
                                    .then(res => {
                                        const resourceDetails = res.data;
                                        // 处理资源
                                        context.events?.publish({
                                            id: "resource-flush",
                                            name: "resource-flush",
                                            data: resourceDetails
                                        })
                                    })
                            }} />)
                        }
                    },
                ] as unknown as Core.Menu<Core.Resource>[])
                return false
            }
            return true
        })
        this.addDuplicateMenu(context)
    }

    run(context: Core.ApplicationContext) {

        context.events.watchByName(Constants.EventName.newTypeDefinition, (event, eventBus) => {
            const data = event.data;
            // 调用后端服务,新建一个类型定义,此时需要在前端展示一个对话框,用于展示数据
            eventBus.publish({
                name: "",
                data: {
                    callBack: (name: string) => {
                        // 将类型定义添加到资源树中
                        context.resourceContext!.service!.save({
                            children: [], id: "", isLeaf: false, kind: "", name: "", parentId: "", resourceId: "", extra: ""
                        }).then((res) => {
                            const td = res.data;
                            // 继续推送事件, // 添加到布局中
                        })
                    }
                }
            })
        })
    }
    private addDuplicateMenu(context: Core.ApplicationContext) {
        const layoutContext = context.layoutContext!;
        const menuContext = context.resourceContext?.explorer?.menuContext;
        menuContext!.menus().children!.push(
            ...([
                {
                    id: "resource-tree-flush",
                    type: "item",
                    label: (
                        <div className={"flex justify-between content-between"}>
                            <div style={{ marginRight: "5px" }}>
                                <IconCN type={"icon-flushed1"} />
                            </div>
                            <div>刷新</div>
                        </div>
                    ),
                    onMenuClick: (
                        menu: Core.Menu<Resource>,
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
                        context.resourceContext!.service!
                            .flush(group.id)
                            .then((res) => {
                                const resourceDetails = res.data;
                                // 处理资源
                                context.events?.publish({
                                    id: "resource-reload",
                                    name: "resource-reload",
                                    data: resourceDetails,
                                });

                            });
                    },
                } as unknown as Core.Menu<Core.Resource>,
            ] as unknown as Core.Menu<Core.Resource>[]),
        );
    }
}



