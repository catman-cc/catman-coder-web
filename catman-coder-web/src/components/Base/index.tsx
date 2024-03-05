import { ID } from "@/common/id";
import { DownOutlined, FrownFilled, FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { useDebounceEffect } from 'ahooks';
import "allotment/dist/style.css";
import { Button, Card, ConfigProvider, Input, List, Tabs, Tooltip, Tree } from "antd";
import { useEffect, useState } from "react";
import IconCN from "../Icon";
import "./index.less";
// 元数据编辑器
interface Props {
    metadata: Core.Base
    update: (_metadata: Core.Base) => void
}
const MetadataEditor = (props: Props) => {
    const [metadata, setMetadata] = useState({
        ...props.metadata,
        alias: [...props.metadata?.alias || []],
        tag: [...props.metadata.tag || []]
    })

    useEffect(() => {
        setMetadata({
            ...props.metadata,
            alias: [...props.metadata?.alias || []],
            tag: [...props.metadata.tag || []]
        })
    }, [props.metadata])

    useDebounceEffect(() => {
        if (metadata) {
            props.update(metadata)
        }
    }, [metadata], {
        wait: 500
    })

    //多个tab页

    // 标记别名
    // 列表,直接渲染list

    // 标记labels
    // 树状,左右两栏


    // 标记TAG
    // 直接渲染list

    return (
        <Card className="root-card">
            <Tabs
                style={{
                    overflow: "auto",
                }}
                // tabBarExtraContent={
                //     <Button type="primary" size="small" onClick={() => {
                //         props.update(metadata)
                //     }}>保存</Button>
                // }
                defaultActiveKey="2"
                items={[
                    {
                        label: (
                            <span>
                                <IconCN type="icon-name" />
                                {/* <AppleOutlined /> */}
                                别名
                                <Button size="small" type="text" onClick={() => {
                                    setMetadata({
                                        ...metadata,
                                        alias: ["", ...metadata.alias.filter(a => a !== "")]
                                    })
                                }}><IconCN type="icon-f-add" /></Button>
                            </span>
                        ),
                        key: `${metadata.id}-alias`,
                        children: <div
                            key={`${metadata.id}-alias-list`}
                            style={{
                                overflow: "auto",
                            }}
                        >
                            <ConfigProvider renderEmpty={() => {
                                return <Tooltip title="新增别名" placement="left">
                                    <Button size="small" type="link" icon={<IconCN type="icon-f-add" />} onClick={() => {
                                        setMetadata({
                                            ...metadata,
                                            alias: ["", ...metadata.alias.filter(a => a !== "")]
                                        })
                                    }}> 新建一个别名吧~😁</Button>
                                </Tooltip>
                            }}>
                                <List
                                    // bordered
                                    itemLayout="horizontal"
                                    dataSource={metadata.alias}
                                    renderItem={(item, index) => (
                                        <List.Item key={`${metadata.id}-alias-item`}>

                                            <Input placeholder="请输入别名信息"
                                                // bordered={false}
                                                allowClear
                                                autoFocus={item === ""}
                                                value={item}
                                                onChange={(e) => {
                                                    metadata.alias![index] = e.target.value
                                                    setMetadata({
                                                        ...metadata,
                                                    })
                                                }}
                                            />
                                            {/* {(index === 0 || index === metadata.alias.length - 1) && } */}
                                            <Tooltip title="新增别名" placement="left">
                                                <Button size="small" type="text" onClick={() => {
                                                    setMetadata({
                                                        ...metadata,
                                                        alias: ["", ...metadata.alias.filter(a => a !== "")]
                                                    })
                                                }}><IconCN type="icon-f-add" /></Button>
                                            </Tooltip>
                                            <Tooltip title="删除" placement="left">
                                                <Button size="small" type="text" >
                                                    <IconCN type="icon-remove2" style={{
                                                        color: "red"
                                                    }} />
                                                </Button>
                                            </Tooltip>
                                        </List.Item>
                                    )}
                                />
                            </ConfigProvider>
                        </div>,
                    },
                    {
                        label: (
                            <span>
                                <IconCN type="icon-tag2" />
                                {/* <AppleOutlined /> */}
                                Tags
                                <Button size="small" type="text" onClick={() => {
                                    setMetadata({
                                        ...metadata,
                                        tag: [{
                                            id: ID(),
                                            name: "",
                                        }, ...metadata.tag!.filter(a => a.name !== "")]
                                    })
                                }}><IconCN type="icon-f-add" /></Button>
                            </span>
                        ),
                        key: `${metadata.id}-tag`,
                        children: <div
                            key={`${metadata.id}-tag-list`}
                            style={{
                                overflow: "auto",
                            }}
                        >

                            <List
                                style={{
                                    overflow: "auto",
                                }}
                                itemLayout="horizontal"
                                dataSource={metadata.tag}
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <Input placeholder="请输入标签信息" bordered={false}
                                            value={item.name}
                                            onChange={(e) => {
                                                const tag = metadata.tag![index]
                                                tag.name = e.target.value
                                                setMetadata({
                                                    ...metadata,
                                                })
                                            }}
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>,
                    },
                    {
                        label: (
                            <span>
                                <IconCN type="icon-biaoji" />
                                {/* <AppleOutlined /> */}
                                标签
                            </span>
                        ),
                        key: `${metadata.id}-labels`,
                        children:
                            <div
                                key={`${metadata.id}-labels-list`}
                                className="container"
                            >
                                {/* <Allotment
                                    defaultSizes={[100, 200]}> */}
                                <div
                                    className="labels-list overflow-auto"
                                    style={{
                                        borderRight: "1px solid gray",
                                        paddingRight: "5px"
                                    }}>
                                    <Tree
                                        className="overflow-auto"
                                        showIcon
                                        defaultExpandAll
                                        defaultSelectedKeys={['0-0-0']}
                                        switcherIcon={<DownOutlined />}
                                        treeData={[
                                            {
                                                title: 'parent 1',
                                                key: '0-0',
                                                icon: <SmileOutlined />,
                                                children: [
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-0',
                                                        icon: <MehOutlined />,
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-1',
                                                        icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-2',
                                                        icon: <MehOutlined />,
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-3',
                                                        icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-4',
                                                        icon: <MehOutlined />,
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-5',
                                                        icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-6',
                                                        icon: <MehOutlined />,
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-7',
                                                        icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-8',
                                                        icon: <MehOutlined />,
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-9',
                                                        icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-10',
                                                        icon: <MehOutlined />,
                                                    },
                                                    {
                                                        title: 'leaf',
                                                        key: '0-0-11',
                                                        icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
                                                    },
                                                ],
                                            },
                                        ]}
                                    />
                                </div>
                                <div>
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={metadata.tag}
                                        renderItem={(item, index) => (
                                            <List.Item>
                                                <Input placeholder="请输入标签信息" bordered={false}
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const tag = metadata.tag![index]
                                                        tag.name = e.target.value
                                                        setMetadata({
                                                            ...metadata,
                                                        })
                                                    }}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </div>
                                {/* </Allotment> */}
                            </div>
                    },
                ]}
            />
        </Card>
    )
}

export default MetadataEditor