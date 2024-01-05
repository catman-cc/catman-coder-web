// @flow
import { FuzzyQuery } from "@/common/api";
import { ComplexType, DefaultTypeDefinition, Scope } from "@/common/core.ts";
import EventBus, { Events } from "@/common/events";
import IconCN from "@/components/Icon";
import { wrapperTypeDefinitionToParameter } from "@/components/Parameter/utils";
import constants from "@/config/constants";
import { useAppDispatch, useAppSelector } from "@/stores";
import { ParameterSlice } from "@/stores/parameter";
import { TypeDefinitionListQuery, TypeDefinitionSlice } from "@/stores/typeDefinitions";
import { Button, Dropdown, Menu, Popover, Select } from "antd";
import Search from "antd/es/input/Search";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import { Actions, Layout, TabNode } from "flexlayout-react";
import * as React from 'react';
import { BiSearchAlt } from "react-icons/bi";
import { HiDocumentAdd } from "react-icons/hi";
import { PanelGroup } from "react-resizable-panels";
import styled from "styled-components";
import "./index.less";
import {useApplicationContext} from "@/core";
import {DefaultLayoutNode} from "@/core/Layout";
// 一个菜单项,其主要作用是返回一组菜单信息

type Props = {
    node: TabNode
    layoutRef: React.RefObject<Layout>
};
interface Config {
    tds: string[]
}


type State = {
    fuzzyKey: string
    select: string
    tds: DefaultTypeDefinition[]
    unSavedTds: string[]
    items: ItemType[]
};

const Container = styled.div`
//max-height: 500px;
  height: 100%;
overflow-x: auto;
overflow-y: auto;
`

const TitleBar = styled.span`
display: inline-flex;
align-items: baseline;
justify-content: space-between;
justify-items: flex-end;
width: 100%;
`

const Link = styled.a`
&:hover {
border-bottom: 1px solid #ff1818;
}
`
/**
     * 将类型定义转换为一个菜单项
     * @param td 类型定义
     */
const TypeDefinitionMenu = (props: Props) => {
    const layoutContext = useApplicationContext().layoutContext!;
    // const node = props.node
    const node = props.node
    const tdStore = useAppSelector(state => state.typeDefinitions)

    const dispatch = useAppDispatch()

    const [unSavedTds, _setUnSavedTds] = React.useState<string[]>([])

    const [selected, setSelected] = React.useState<string>()

    const [query, setQuery] = React.useState<FuzzyQuery>({
        key: "",
        fields: ["name"]
    } as FuzzyQuery)

    const [matchInfo, setMatchInfo] = React.useState<{
        [index: string]: string[]
    }>({})

    const [queryKey, setQueryKey] = React.useState<string>("")

    const [tds, setTds] = React.useState<Core.TypeDefinition[]>([])

    const tdsComput = () => {

        const all: Core.TypeDefinition[] = []
        if (query.key === "") {
            all.push(...tdStore.newTds)
            all.push(...tdStore.tds)
            setMatchInfo({})
            return all
        }
        const mi: {
            [index: string]: string[]
        } = {}

        all.push(...tdStore.tds.filter(td => {
            const tdid = td.id || ""
            const fields = query.fields.length > 0 ? query.fields : ["id", "name", "describe", "labels", "alias"]
            if (fields.includes("name")) {
                if (td.name.includes(query.key)) {
                    mi[tdid] = ["name", td.name]
                    return true
                }
            }
            if (fields.includes("id")) {
                if (td.id?.includes(query.key)) {
                    mi[tdid] = ["id", td.id]
                    return true
                }
            }
            if (fields.includes("describe")) {
                if (td.describe?.includes(query.key)) {
                    mi[tdid] = ["describe", td.describe]
                    return true
                }
            }
            if (fields.includes("labels")) {
                const entries = td.labels?.items.entries
                if (entries) {
                    for (const key in entries) {
                        if (key.includes(query.key)) {
                            mi[tdid] = ["labels-key", key]
                            return true
                        }
                        const l = td.labels?.items.get(key)
                        if (l) {
                            if (l.value.some(lv => lv.includes(query.key))) {
                                mi[tdid] = ["labels-value", key]
                                return true
                            }
                        }
                    }
                }
            }
            if (fields.includes("alias")) {
                const entries = td.alias
                if (entries) {
                    if (entries.some(lv => lv.includes(query.key))) {
                        mi[tdid] = ["alias", "alias"]
                        return true
                    }
                }
            }
            return false;
        }))
        setMatchInfo(mi)
        return all
    }

    React.useEffect(() => {
        EventBus.on(Actions.DELETE_TAB, (node: TabNode) => {
            if (node.getComponent() === "TypeDefinitionTreePanel") {
                if (selected === node.getId()) {
                    setSelected(undefined)
                }
            }
        })
    }, [])

    React.useEffect(() => {
        // node.getModel().getRoot().getChildren()[0].getChildren()[0].isVisible()
        // props.layoutRef.current.
        // const key = selected
        // let tdNode = node.getModel().getNodeById(key) as TabNode
        // if (!tdNode) {
        //     const find = tdStore.tds.find(t => t.id === key);
        //     const newTdNode = {
        //         id: key,
        //         name: find?.name,
        //         icon: "icon-moxing",
        //         component: 'TypeDefinitionTreePanel',
        //         enableFloat: true,
        //         config: { id: key },
        //     }
        //     props.layoutRef.current?.addTabToActiveTabSet(newTdNode)
        //     tdNode = node.getModel().getNodeById(key) as TabNode
        //     tdNode.getExtraData().td = find
        // }
        // node.getModel().doAction(Actions.selectTab(tdNode.getId()))

    }, [tds])

    React.useEffect(() => {
        setTds(tdsComput())
    }, [tdStore.tds, tdStore.newTds, query])

    React.useEffect(() => {
        if ((selected === "" || selected === undefined) && tds.length > 0) {
            setSelected(tds[0].id)
        }
    }, [tds])

    /**
     *  将类型定义转换为具体的菜单项数据
     * @param td 类型定义
     * @returns  菜单项
     */
    const toMenuItem = (td: Core.TypeDefinition): ItemType => {
        return {
            key: td.id!,
            icon: <IconCN type={"icon-moxing"} style={{
                color: "purple"
            }} />,
            label: <Popover
                placement="bottomRight"
                content={
                    <div>
                        <Button
                            onClick={() => {
                                // 使用当前类型定义创建参数定义
                                const parameter = wrapperTypeDefinitionToParameter(td)
                                // 将该类型定义传递给
                                dispatch(ParameterSlice.actions.add(parameter))
                            }}
                        >create parameter</Button>
                    </div>
                }
            >
                <div className="type-definition-menu-label">

                    <div className="td-name">
                        {td.name}
                    </div>

                    <div className="td-id">
                        id: {td.id}
                    </div>
                </div >
            </Popover>,
        }
    }
    // const items = React.useState(tds.map(t => toMenuItem(t)))

    const getItems = () => {
        return tds.map(td => toMenuItem(td))
    }

    const getParameters = () => {

    }

    React.useEffect(() => {
        dispatch(TypeDefinitionListQuery())
    }, [])

    // React.useEffect(() => {
    //     if (!selected && tds) {
    //         setSelected(tds[0].id)
    //     }
    // }, [tds])

    React.useEffect(() => {
        return;
        if (!selected) {
            return
        }
        const key = selected
        const find = tds.find(t => t.id === key);
        if (!find) {
            return
        }
        const layoutNode = DefaultLayoutNode.of(key,find?.name,'TypeDefinitionTreePanel');
        layoutNode.settings.tab={
            id: key,
            name: find?.name,
            icon: "icon-moxing",
            component: 'TypeDefinitionTreePanel',
            enableFloat: true,
            config: { id: key, td: find },
        }
        layoutNode.data={ id: key, td: find }
        layoutContext.createOrActive(layoutNode,"tab")
        // EventBus.emit(Events.Layout.ADD_TAB, layoutNode)


        // let tdNode = node.getModel().getNodeById(key) as TabNode
        // if (!tdNode) {
        //     const find = tdStore.tds.find(t => t.id === key);
        //     const newTdNode = {
        //         id: key,
        //         name: find?.name,
        //         icon: "icon-moxing",
        //         component: 'TypeDefinitionTreePanel',
        //         enableFloat: true,
        //         config: { id: key },
        //     }

        //     props.layoutRef.current?.addTabToActiveTabSet(newTdNode)
        //     tdNode = node.getModel().getNodeById(key) as TabNode
        //     tdNode.getExtraData().td = find
        // }
        // node.getModel().doAction(Actions.selectTab(tdNode.getId()))
        // const find = this.state.tds.filter(t => t.id === key)
        // this.props.selectTypeDefinition(find[0])
    }, [selected, tds])

    return (
        <Container>
            <PanelGroup autoSaveId="example" direction="vertical">
                <Menu
                    style={{ fontSize: 13, overflowX: "auto" }}
                    selectedKeys={[selected || ""]}
                    defaultOpenKeys={["type-definitions",]}
                    mode="inline"
                    items={[
                        {
                            key: "type-definitions",
                            label: <TitleBar><IconCN type="icon-moxing" /> 数据类型定义
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "nowrap",
                                        flexDirection: "row",
                                        alignItems: "baseline",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}>
                                    <Popover placement="rightTop" content={
                                        <div style={{
                                            padding: "5",
                                            maxWidth: 350
                                        }}
                                        >
                                            <Select
                                                allowClear
                                                mode="multiple"
                                                style={{ width: 350, maxWidth: '350', marginBottom: 5 }}
                                                placeholder="不选,默认为全部"
                                                defaultValue={query.fields}
                                                onChange={(value) => {
                                                    setQuery({ ...query, fields: value })
                                                }}
                                                value={query.fields}
                                                optionLabelProp="label"
                                                options={
                                                    [
                                                        {
                                                            label: "ID",
                                                            value: "id",
                                                        },
                                                        {
                                                            label: "名称",
                                                            value: "name",
                                                        },
                                                        {
                                                            label: "别名",
                                                            value: "alias",
                                                        },
                                                        {
                                                            label: "标签",
                                                            value: "labels",
                                                        },

                                                        {
                                                            label: "描述",
                                                            value: "describe",
                                                        }
                                                    ]
                                                }
                                            >

                                            </Select>
                                            <Search
                                                style={{
                                                    maxWidth: "350",
                                                    marginRight: "10px",
                                                    padding: "0"
                                                }}
                                                value={query.key}
                                                onChange={(e) => {
                                                    setQuery({
                                                        ...query,
                                                        key: e.target.value
                                                    })
                                                }}
                                                placeholder="模糊查询,支持正则" onSearch={() => {
                                                }}
                                                enterButton={
                                                    <Button icon={<IconCN type="icon-a-qingkong3x" onClick={() => {
                                                        setQuery({
                                                            fields: [],
                                                            key: ""
                                                        })
                                                    }} />}></Button>
                                                }
                                            />
                                        </div>
                                    } trigger="click"
                                    >
                                        <Button shape={"circle"}
                                            icon={<BiSearchAlt style={{ color: "gray", justifyContent: "center", marginTop: 4 }} />}
                                            size={"small"}
                                            onClick={(e) => {
                                                e.stopPropagation()

                                            }}
                                        ></Button>
                                    </Popover>
                                    {/*<Button shape={"circle"}*/}
                                    {/*    icon={<HiDocumentAdd style={{ color: "green", justifyContent: "center", marginTop: 4 }} />}*/}
                                    {/*    size={"small"}*/}
                                    {/*    onClick={(e) => {*/}
                                    {/*        e.stopPropagation()*/}
                                    {/*        dispatch(TypeDefinitionSlice.actions.add(DefaultTypeDefinition.create({*/}
                                    {/*            scope:Scope.PUBLIC*/}
                                    {/*        })))*/}
                                    {/*    }}*/}
                                    {/*/>*/}
                                    <Dropdown.Button
                                        style={{ color: "green", justifyContent: "center", marginTop: 4 }}
                                        menu={{
                                            items: [{
                                                key: '1',
                                                label: 'from json entity',
                                            },
                                            {
                                                key: '2',
                                                label: 'from xml entity',
                                            },
                                            ],
                                            onClick: (e) => {
                                                console.log(e.key)
                                            }
                                        }}><HiDocumentAdd key={"312"} onClick={(e: Event) => {
                                            e.stopPropagation()

                                            const ntd = DefaultTypeDefinition.create({
                                                scope: Scope.PUBLIC,
                                                type: ComplexType.ofType(constants.Types.TYPE_NAME_STRING)
                                            }).unWrapper();


                                            dispatch(TypeDefinitionSlice.actions.add(ntd))
                                            setSelected(ntd.id)
                                            // 选择新建元素
                                        }} /></Dropdown.Button>
                                </div>
                            </TitleBar>,
                            // type:"group",
                            children: getItems()
                        }, {
                            key: "parameters",
                            label: <div><IconCN type="icon-Link" /> 参数定义</div>,
                            children: []
                        }
                    ]
                    }
                    onClick={({ key }) => {
                        if (selected === key) {
                            return
                        }
                        setSelected(key)

                    }}

                />
            </PanelGroup>
        </Container>
    );
}
export default TypeDefinitionMenu

/**
 * 渲染类型处理面板,该面板用于展示类型定义
 */
// export default class TypeMenu extends React.Component<Props, State> {
//     constructor(props: Readonly<Props> | Props) {
//         super(props);
//         this.state = {
//             fuzzyKey: "",
//             tds: useAppSelector(state => state.typeDefinitions).tds,
//             items: this.props.tds.map(t => this.toMenuItem(t)),
//             unSavedTds: this.props.unSavedTds,
//             select: "",
//         }
//     }

//     componentDidUpdate(prevProps: Readonly<Props>) {
//         if (prevProps !== this.props) {
//             const changeSelect = !this.state.select
//             this.setState({
//                 ...this.state,
//                 tds: this.props.tds,
//                 items: this.props.tds.map(t => this.toMenuItem(t)),
//                 unSavedTds: this.props.unSavedTds,
//                 select: changeSelect ? this.props.tds[0]?.id : this.state.select
//             })
//             if (changeSelect) {
//                 this.props.selectTypeDefinition(this.props.tds[0])
//             }
//         }
//     }

//     /**
//      * 将类型定义转换为一个菜单项
//      * @param td 类型定义
//      */
//     toMenuItem(td: Core.DefaultTypeDefinition): ItemType {
//         return {
//             key: td.id,
//             icon: <MdOutlineDataObject />,
//             label: <div style={{}}>
//                 {td.name}
//                 <SettingOutlined size={11} />
//                 {this.state.unSavedTds.includes(td.id) && <Link onClick={() => {
//                     this.props.save(td)
//                 }} style={{ color: "red", margin: 0, padding: 0 }}>未保存</Link>}
//             </div>,
//         }
//     }

//     getItems() {
//         return this.state.tds.map(td => this.toMenuItem(td))
//     }

//     render() {
//         return (
//             <Container>
//                 <Menu
//                     style={{ fontSize: 13, overflowX: "auto" }}
//                     selectedKeys={[this.state.select]}
//                     defaultOpenKeys={["type-definitions",]}
//                     mode="inline"
//                     items={[
//                         {
//                             key: "type-definitions",
//                             label: <TitleBar>数据类型定义
//                                 <div onClick={(e) => {
//                                     e.stopPropagation()
//                                 }}>
//                                     <Popover placement="bottom" content={
//                                         <div style={{
//                                             padding: "5",
//                                             maxWidth: 350
//                                         }}
//                                         >
//                                             <Select
//                                                 mode="multiple"
//                                                 style={{ width: 350, maxWidth: '350', marginBottom: 5 }}
//                                                 placeholder="不选,默认为全部"
//                                                 defaultValue={['name']}
//                                                 optionLabelProp="label"
//                                                 options={
//                                                     [
//                                                         {
//                                                             label: "ID",
//                                                             value: "id",
//                                                         },
//                                                         {
//                                                             label: "名称",
//                                                             value: "name",
//                                                         },
//                                                         {
//                                                             label: "别名",
//                                                             value: "alias",
//                                                         },
//                                                         {
//                                                             label: "标签",
//                                                             value: "labels",
//                                                         },

//                                                         {
//                                                             label: "描述",
//                                                             value: "describe",
//                                                         }
//                                                     ]
//                                                 }
//                                             >

//                                             </Select>
//                                             <Search
//                                                 style={{
//                                                     maxWidth: "350",
//                                                     marginRight: "10px",
//                                                     padding: "0"
//                                                 }}
//                                                 placeholder="模糊查询,支持正则" onSearch={() => {
//                                                 }}
//                                                 enterButton
//                                             />
//                                         </div>
//                                     } trigger="click"
//                                     >
//                                         <Button shape={"circle"}
//                                             icon={<BiSearchAlt style={{ color: "gray", justifyContent: "center", marginTop: 4 }} />}
//                                             size={"small"}
//                                             onClick={(e) => {
//                                                 e.stopPropagation()
//                                             }}
//                                         ></Button>
//                                     </Popover>
//                                     <Button shape={"circle"}
//                                         icon={<HiDocumentAdd style={{ color: "green", justifyContent: "center", marginTop: 4 }} />}
//                                         size={"small"}
//                                         onClick={(e) => {
//                                             e.stopPropagation()
//                                             const typeDefinition = this.props.createTypeDefinition();
//                                             this.setState({
//                                                 ...this.state,
//                                                 select: typeDefinition.id
//                                             })
//                                             this.props.selectTypeDefinition(typeDefinition)
//                                         }}
//                                     />
//                                 </div>
//                             </TitleBar>,
//                             // type:"group",
//                             children: this.getItems()
//                         }
//                     ]
//                     }
//                     onSelect={(i) => {
//                         this.setState({ ...this.state, select: i.key })
//                     }}
//                     onClick={({ key }) => {
//                         const find = this.state.tds.filter(t => t.id === key)
//                         this.props.selectTypeDefinition(find[0])
//                     }}
//                 />
//             </Container>
//         );
//     }
// }
