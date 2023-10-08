import EventBus, { Events } from "@/common/events/index.tsx";
import MonacoCodeEditor from "@/components/CodeEditor/index.tsx";
import IconCN from "@/components/Icon";
import Editor from "@/components/TypeDefinition/Editor/index.tsx";
import { useAppSelector } from '@/stores';
import { Button, List, Popover } from 'antd';
import { Actions, BorderNode, DockLocation, DropInfo, IJsonModel, IJsonTabNode, Layout, Model, Node, TabNode, TabSetNode } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import ReactJson from "react-json-view";
import TypeDefinitionMenu from '../../TypeDefinition/Menu';
import { CacheableFactory, DefaultFactory } from './Factory.tsx';
import FloatWindow from "./Float/index.tsx";
import WinBoxManager, { WinBoxComponent } from "./WinBox/index.tsx";
import "./index.less";

export const DefaultLayout: IJsonModel = {
    "global": {
        "enableRotateBorderIcons": false,
        tabEnableRenderOnDemand: false,
        "tabIcon": "close",
        "borderClassName": "border"
    },
    "borders": [
        {
            "type": "border",
            "config": {
                "type": [
                    "td"
                ]
            },
            autoSelectTabWhenOpen: true,
            autoSelectTabWhenClosed: true,
            show: true,
            "size": 300,
            "location": "left",
            enableDrop: false,
            className: "border-left",
            barSize: 50,
            selected: 0, // 默认选中
            "children": [
                {
                    "type": "tab",
                    "id": "#56c90a5b-d84f-4e73-8e27-d824e21f4aa2",
                    "name": "数据类型定义",
                    "component": "TypeDefinitionMenu",
                    floating: true,
                    enableFloat: true,
                    enableDrag: false,
                    helpText: "展示所有数据类型定义",
                    "config": {
                        "type": "td",
                    },
                    "enableClose": false,
                    className: "TypeDefinitionMenuIcon",
                    "icon": "icon-type",
                },
            ]
        },
        {
            "type": "border",
            "config": {
                "type": [
                    "td"
                ]
            },
            "size": 300,
            "location": "bottom",
            "children": [
                // {
                //     "type": "tab",
                //     "id": "#56c90a5b-d84f-4e73-8e27-d824e21f4aa3",
                //     "name": "浮动窗口管理",
                //     "component": "WinBoxManager",
                //     // floating: true,
                //     helpText: "123",
                //     floating: true,
                //     // enableFloat: true,
                //     "config": {
                //         "active": true
                //     },
                //     "enableClose": false,
                //     className: "WinBoxManager",
                //     "icon": "icon-type",
                // },
            ]
        },
        {
            "type": "border",
            "config": {
                "type": [
                    "td"
                ]
            },
            "size": 300,
            "location": "right",
            "children": [
            ]
        },
        // {
        //     "type": "border",
        //     "config": {
        //         "type": [
        //             "td"
        //         ]
        //     },
        //     "size": 300,
        //     "location": "top",
        //     "children": [
        //     ]
        // }
    ],
    "layout": {
        "type": "row",
        "id": "#fa5496cc-ead0-4170-9a32-f2066522e55f",
        "children": [
            {
                "type": "tabset",
                "id": "#688e372a-3c7b-4bdd-977d-bfa6a3736f9f",
                "selected": -1,
                "children": [
                ],
                "active": true
            }
        ]
    }
}

const postProcessModel = (model: Model) => {
    // 处理拖拽事件
    model.setOnAllowDrop((node: Node, dropInfo: DropInfo): boolean => {

        if (!(dropInfo.node instanceof BorderNode)) {
            return true;
        }
        // 强制类型转换
        const dg = node as unknown as TabNode;

        if (dropInfo.node.getType() === "border") {
            const supportTypes: string[] = dropInfo.node.getConfig()?.type;
            if (supportTypes) {
                return supportTypes.includes(dg.getConfig()?.type)
            }
        }

        const dropNode = dropInfo.node as BorderNode
        if (dropNode === undefined) {
            return true
        }

        if (dg.getType() === undefined) {
            return false
        }

        return dropNode.getConfig().type?.includes(dg.getConfig().type) as boolean
    })

    return model
}

interface Position {
    x?: number
    y?: number
    w?: number | string
    h?: number | string
}

function FlexLayout() {
    const layout = useAppSelector(state => state.configuration).layout
    const [model, setModel] = useState<Model>(Model.fromJson(DefaultLayout))
    const [openedTabs, setOpenedTabs] = useState<string[]>([])
    const [winBoxs] = useState<WinBoxComponent[]>([
        new WinBoxComponent("111", "TestJsonView", "JsonView", { name: 13 })
    ])

    const [floatWindows, setFloatWindows] = useState<{
        [index: string]: {
            show?: boolean
            title: React.ReactNode,
            content: ReactNode
            zIndex: number,
            x?: number
            y?: number
            w?: number | string
            h?: number | string
            oldPosition?: Position
        }
    }>({
        // "1": {
        //     show: true,
        //     title: "c1",
        //     content: <Input defaultValue={"c1"} />,
        //     zIndex: 10
        // },
        // "2": {
        //     show: true,
        //     title: "c2",
        //     content: <Input defaultValue={"c2"} />,
        //     zIndex: 10
        // }
    })

    const zIndex = useCallback(() => {
        let max = 10
        Object.keys(floatWindows).forEach(k => {
            const fw = floatWindows[k]
            if (fw.zIndex > max) {
                max = fw.zIndex
            }
        })
        return max
    }, [floatWindows])

    // const dispatch = useAppDispatch()
    const layoutRef = useRef<Layout>(null)


    // useEffect(() => {
    //     // dispatch(LayoutQuery())
    //     // model.getBorderSet().getBorders()[0].isAutoSelectTab = true
    //     // model.doAction(Actions.selectTab("#56c90a5b-d84f-4e73-8e27-d824e21f4aa2"))
    // }, [layoutRef])

    useEffect(() => {
        if (layout === undefined) {
            return
        }
        setModel(postProcessModel(Model.fromJson(layout?.info as unknown as IJsonModel)))
    }, [layout])

    /**
     * 用于创建不同类型的组件
     */
    const factory = CacheableFactory.of(DefaultFactory.create()
        .nameMatch("button", (node) => {
            return <Button>{node.getName()}</Button>
        })
        .nameMatch("TypeDefinitionMenu", (node: TabNode) => {
            return <TypeDefinitionMenu node={node} layoutRef={layoutRef} />
        })
        // .nameMatch("TypeDefinitionTreePanel", (node: TabNode) => {
        //     return <TypeDefinitionTreePanel td={node.getExtraData().td} />
        // })
        .nameMatch("TypeDefinitionTreePanel", (node: TabNode) => {
            return <Editor td={node.getExtraData().td} node={node} />
        })
        .nameMatch("JsonView", (node: TabNode) => {
            return <ReactJson src={node.getConfig().data} />
        })
        .nameMatch("MonacoCodeEditor", (node: TabNode) => {
            return <MonacoCodeEditor code={node.getConfig().data as string} />
        })
        .nameMatch("WinBoxManager", (node) => {
            return <WinBoxManager
                key={`default-winbox-manager-${node.getId()}`}
                windows={winBoxs}
            />
        })
        .nameMatch("FloatWindowManager", (): JSX.Element => {
            return <List
                itemLayout="horizontal"
                dataSource={Object.keys(floatWindows)}
                renderItem={(item) => (
                    <Button
                        icon={<IconCN type={floatWindows[item].show ? "icon-ico-show" : "icon-hideinvisiblehidden"} />}
                        key={`WinBoxComponent-${item}`}
                        onClick={() => {
                            const b = floatWindows[item]
                            // box.ref?.restore()
                            b.show = !b.show
                            setFloatWindows({ ...floatWindows })
                        }}
                    >
                        {floatWindows[item].title}
                    </Button>
                )}
            />


        })
    )
    // .nameMatch("TypeDefinitionTreePanel", (node: TabNode) => {
    //     return <div>123</div>
    // })

    EventBus.on(Events.Layout.ADD_TAB, (tab: IJsonTabNode) => {
        const node = model.getNodeById(tab.id!)
        if (node) {
            model.doAction(Actions.selectTab(tab.id!))
        } else {

            model.doAction(Actions.addNode(tab, model.getActiveTabset()?.getId() || "#688e372a-3c7b-4bdd-977d-bfa6a3736f9f", DockLocation.CENTER, -1, true))
        }
    })

    const createLayout = () => {
        if (!model) {
            return <></>
        } else {
            const res = <div style={
                { width: '100vw', height: '100vh', position: "relative" }
            }>
                <Layout
                    key={"default-layout"}
                    supportsPopout={false}
                    ref={layoutRef}
                    model={model!}
                    factory={(node) => {
                        // 需要进行数据填充,根据类型进行数据填充操作
                        // let element = cache[node.getId()]
                        // if (element !== undefined) {
                        //     return element
                        // }
                        return factory.create(node)
                    }}
                    iconFactory={(node => {
                        return <IconCN key={node.getId()} className={"TypeDefinitionMenuIcon"} style={{
                            color: "purple"
                        }} type={node.getIcon()!} />
                    })}
                    onRenderTab={(node, rv) => {
                        const nid = node.getId();
                        if (model!.getBorderSet().getBorders().some((border: BorderNode) => {
                            if (border.getLocation() !== DockLocation.LEFT) {
                                return false;
                            }
                            return border.getChildren().some(node => {
                                return node.getId() === nid
                            })
                        })) {
                            node.getIcon()
                            rv.content = ""
                            rv.buttons = [
                            ]
                            return
                        }
                        rv.content = node.getName()
                        rv.buttons = [
                            <IconCN
                                key={node.getId()}
                                type="icon-Tabs-1"
                                onClick={() => {

                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    // 将节点转换为浮窗
                                    const fw = {
                                        show: true,
                                        title: node.getName(),
                                        content: factory.create(node),
                                        zIndex: zIndex() + 1
                                    }
                                    floatWindows[node.getId()] = fw
                                    setFloatWindows({ ...floatWindows })
                                }}
                            />
                            // <Button
                            //     type="text"
                            //     shape="circle"
                            //     icon={}
                            //     onClick={(e) => {
                            //         e.stopPropagation()
                            //         e.preventDefault()
                            //         console.log(123312);
                            //         // 将节点转换为浮窗
                            //         const fw = {
                            //             show: true,
                            //             title: node.getName(),
                            //             content: factory.create(node),
                            //             zIndex: zIndex() + 1
                            //         }
                            //         floatWindows[node.getId()] = fw
                            //         setFloatWindows({ ...floatWindows })
                            //     }}
                            // />
                        ]
                    }}
                    onRenderTabSet={(node, rv) => {
                        // 在左下角创建一个设置按钮
                        // rv.headerButtons = [<Button key={1}>1</Button>]
                        if (node instanceof BorderNode) {
                            if (node.getLocation() === DockLocation.LEFT) {
                                rv.buttons = [
                                    <Button key={2} icon={<IconCN type={"icon-Settings"} />}></Button>

                                ]
                            } else if (node.getLocation() === DockLocation.BOTTOM) {
                                rv.centerContent = [
                                    <Button key={2} icon={<IconCN type={"icon-Settings"} />}></Button>

                                ]

                            }
                        } else if (node instanceof TabSetNode) {
                            rv.buttons = [
                                <Popover placement="top"
                                    key={node.getId()}
                                    title={""}
                                    content={
                                        <List
                                            key={node.getId()}
                                            style={{
                                                display: "flex"
                                            }}
                                            itemLayout="horizontal"
                                            dataSource={Object.keys(floatWindows)}
                                            renderItem={(item) => (
                                                <div>
                                                    <Button
                                                        icon={<IconCN type={floatWindows[item].show ? "icon-ico-show" : "icon-hideinvisiblehidden"} />}
                                                        key={`float-window${node.getId()}-${item}`}
                                                        onClick={() => {
                                                            const b = floatWindows[item]
                                                            // box.ref?.restore()
                                                            b.show = !b.show
                                                            if (b.show) {
                                                                b.zIndex = zIndex() + 1
                                                            }
                                                            setFloatWindows({ ...floatWindows })
                                                        }}
                                                    >
                                                        {floatWindows[item].title}
                                                    </Button>
                                                </div>
                                            )}
                                        />
                                    }
                                    trigger="hover">
                                    <Button key={`float-window${node.getId()}-float`} icon={<IconCN type={"icon-Tabs-1"} />}>浮动窗口</Button>
                                </Popover>


                            ]
                        }

                    }}
                    onAction={(action) => {

                        switch (action.type) {
                            case Actions.DELETE_TAB:
                                factory.delete(action.data.node)
                                setOpenedTabs(openedTabs.filter(t => t !== action.data.node))
                                break;
                            case Actions.ADD_NODE:
                                setOpenedTabs([...openedTabs, action.data.node])
                                break;

                        }
                        return action
                    }}
                />
                <div
                    className="layout-status-bar"
                >
                    {/* <Button>123</Button> */}
                </div >
            </div >
            return res
        }
    }

    return (
        <div>
            {createLayout()}
            {
                Object.keys(floatWindows).map(k => {
                    const fw = floatWindows[k]
                    return <FloatWindow
                        key={`float-window-k-${k}`}
                        {...fw}
                        updateZIndex={() => {
                            const zi = floatWindows[k].zIndex
                            if (zi !== 10 && zi === zIndex()) {
                                // 已经在最前面了,不用改了
                                return
                            }
                            floatWindows[k].zIndex = zIndex() + 1
                            setFloatWindows({ ...floatWindows })
                        }}

                        onPin={() => {
                            floatWindows[k].show = false
                            setFloatWindows({ ...floatWindows })
                        }}
                        onMinimize={() => {
                            if (fw.oldPosition) {
                                const op = fw.oldPosition
                                floatWindows[k].x = op.x
                                floatWindows[k].y = op.y
                                floatWindows[k].w = op.w
                                floatWindows[k].h = op.h
                                setFloatWindows({ ...floatWindows })
                            }
                        }}
                        update={({
                            x, y, w, h
                        }) => {
                            floatWindows[k].x = x || floatWindows[k].x
                            floatWindows[k].y = y || floatWindows[k].y
                            floatWindows[k].w = w || floatWindows[k].w
                            floatWindows[k].h = h || floatWindows[k].h
                            setFloatWindows({ ...floatWindows })
                        }}
                        onMaxmize={() => {
                            floatWindows[k].oldPosition = {
                                x: fw.x,
                                y: fw.y,
                                w: fw.w,
                                h: fw.h
                            }
                            floatWindows[k].x = 0
                            floatWindows[k].y = 0
                            floatWindows[k].w = "99vw"
                            floatWindows[k].h = "99vh"
                            setFloatWindows({ ...floatWindows })
                        }}

                        onClose={() => {
                            delete floatWindows[k]
                            setFloatWindows({ ...floatWindows })
                        }}
                    />
                })
            }
        </div>
    );
}

export default FlexLayout;
