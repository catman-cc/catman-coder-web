// @flow
import { DefaultTypeDefinition } from "@/common/core.ts";
import EventBus, { Events } from "@/common/events";
import IconCN from "@/components/Icon";
import { useAppDispatch, useAppSelector } from "@/stores";
import { TypeDefinitionListQuery } from "@/stores/typeDefinitions";
import { Button, Menu, Popover } from "antd";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import { Layout, TabNode } from "flexlayout-react";
import * as React from 'react';
import styled from "styled-components";
// import "./index.less";
// 一个菜单项,其主要作用是返回一组菜单信息

type Props = {
    node: TabNode
    layoutRef: React.RefObject<Layout>
};



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
const ParameterMenu = (props: Props) => {
    // const node = props.node
    const parameters = useAppSelector(state => state.parameter)

    const dispatch = useAppDispatch()


    // React.useEffect(() => {
    //     EventBus.on(Actions.DELETE_TAB, (node: TabNode) => {
    //         console.log(node);

    //         if (node.getComponent() === "TypeDefinitionTreePanel") {
    //             if (selected === node.getId()) {
    //                 setSelected(undefined)
    //             }
    //         }
    //     })
    // }, [])


    /**
     *  将类型定义转换为具体的菜单项数据
     * @param td 类型定义
     * @returns  菜单项
     */
    const toMenuItem = (param: Core.Parameter): ItemType => {
        return {
            key: param.id!,
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
                                // const parameter = wrapperTypeDefinitionToParameter(td)
                                // 将该类型定义传递给
                                window.parameters = parameters
                            }}
                        >create parameter</Button>
                    </div>
                }
            >
                <div className="type-definition-menu-label">

                    <div className="td-name">
                        {param.name}
                    </div>

                    <div className="td-id">
                        id: {param.id}
                    </div>
                </div >
            </Popover>,
        }
    }
    // const items = React.useState(tds.map(t => toMenuItem(t)))

    const getItems = () => {
        return parameters.parameters.map(param => toMenuItem(param))
    }

    React.useEffect(() => {
        dispatch(TypeDefinitionListQuery())
    }, [])

    // EventBus.emit(Events.Layout.ADD_TAB, {
    //     id: key,
    //     name: find?.name,
    //     icon: "icon-moxing",
    //     component: 'TypeDefinitionTreePanel',
    //     enableFloat: true,
    //     config: { id: key, td: find },
    // })

    return (
        <Container>
            <Menu
                style={{ fontSize: 13, overflowX: "auto" }}
                defaultOpenKeys={["type-definitions",]}
                mode="inline"
                items={[
                    {
                        key: "type-definitions",
                        label: <TitleBar>参数定义
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
                            </div>
                        </TitleBar>,
                        // type:"group",
                        children: getItems()
                    }
                ]
                }
                onClick={({ key }) => {
                    EventBus.emit(Events.Layout.ADD_TAB, {
                        id: key,
                        name: "name",
                        icon: "icon-moxing",
                        component: 'ParameterEditor',
                        enableFloat: true,
                        config: {
                            data: parameters.parameters[0]
                        }
                    })
                }}

            />
        </Container>
    );
}
export default ParameterMenu