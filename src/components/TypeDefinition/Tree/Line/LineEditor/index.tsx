import { DefaultTypeDefinition } from "@/common/core";
import { PeekTypeColor, PeekTypeIconWithConfig } from "@/components/TypeDefinition/common";
import { Button, Col, Collapse, Input, Space, Tag } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import { useEffect, useState } from "react";
import styled from "styled-components";
import "./index.less";
/**
 * 针对一行参数定义的编辑操作,这里的编辑操作不能直接反馈到上层,否则重复渲染,会导致界面卡顿
 * 需要考虑做防抖,或者添加一个按钮进行保存操作
 */
export interface Props {
    tdKey: string
    td: DefaultTypeDefinition
    updateTypeData: (key: string | number, td: DefaultTypeDefinition) => void;
}

const Row = styled.div`
display: flex;
align-content: center;
align-items: center;
flex-wrap: nowrap;
`

const LineEditor = (props: Props) => {
    const [td, setTd] = useState(props.td.copy())

    useEffect(() => {
        if (td.alias !== props.td.alias) {
            // 每次调用更新时,都会延迟响应,避免卡顿
            props.updateTypeData(props.tdKey, td)
        }

    }, [td])

    const createAlias = () => {
        const elements: JSX.Element[] = []
        for (let i = 0; i < td.alias.length; i++) {
            const alias = td.alias[i]
            elements.push(
                <Input key={`alias-${td.id}-${i}`}
                    value={td.alias[i]}
                    onChange={(e) => {
                        if (alias !== e.target.value) {
                            // 回调父组件,传回去新的值
                            td.alias[i] = e.target.value
                            setTd(td.copy())
                        }
                    }}
                />
            )
        }
        return elements
    }

    return <div className="line-editor-box">
        <Row>
            {/* 工具栏 */}
        </Row>
        {/* 1. 名称  类型  */}
        <Space direction="vertical" align="start" style={{
            width: "100%",
        }}
            styles={
                {
                    item: {
                        width: "100%"
                    }
                }
            }
        >
            <Paragraph
                style={{
                    margin: 0
                }}
                copyable={
                    {
                        text: td.name
                    }
                }>
                <Tag color="blue">
                    名称:   {td.name}
                </Tag>
            </Paragraph>
            <Paragraph
                style={{
                    margin: 0
                }}
                copyable={
                    {
                        text: td.id
                    }
                }>
                <Tag color="blue">
                    id:   {td.id}
                </Tag>
            </Paragraph>

            <Row>
                <Col flex={1}>
                    <Space>
                        类型:
                        <Tag
                            icon={PeekTypeIconWithConfig(td.type.getTypeName())}
                            color={PeekTypeColor(td.type.getTypeName())}>
                            {td.type.getTypeName()}
                        </Tag>
                    </Space>

                </Col>
                <Col flex={1}>
                    <Space>
                        范围:
                        <Tag
                            color="#108ee9">
                            {td.scope}
                        </Tag>
                    </Space>

                </Col>
            </Row >
            {/* <Divider /> */}
            <Row style={{
                width: "100%",
                marginTop: 5
            }}>
                <Collapse
                    size='large'
                    style={{
                        width: "100%"
                    }}
                    items={[
                        {
                            key: `alias-${td.id}`,
                            label: <div style={{
                                fontSize: 11,
                                lineHeight: 2
                            }}>别名配置</div>,
                            children: <div style={{
                                width: "100%"
                            }}>
                                {
                                    createAlias()
                                }
                                <Button type='dashed' onClick={() => {
                                    td.alias = [...td.alias, ""]
                                    setTd(td.copy())
                                }}>
                                    新增别名
                                </Button>
                            </div>
                        },
                    ]} />
            </Row>
        </Space>
    </div >
}

export default LineEditor