import { ExecutorJoinCodeService } from '@/services/JoinCode';
import { ExecutorJoinCode } from '@/services/JoinCode/typeings';
import { AntDesignProHelper } from '@/services/common';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Dropdown, Modal, ModalProps, Tag, message } from 'antd';
import { useRef, useState } from 'react';
import { ExecutorJoinCodeEditor } from '../Editor';



export const ExecutorJoinCodePage = () => {
    const [modalProps, setModalProps] = useState<ModalProps>({
        open: false,
    })
    const actionRef = useRef<ActionType>();
    const columns: ProColumns<ExecutorJoinCode>[] = [
        {
            dataIndex: 'id',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '名称',
            dataIndex: 'name',
            copyable: true,
            ellipsis: true,
            tip: '名称过长会自动收缩',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: '接入码',
            dataIndex: 'code',
            copyable: true,
            ellipsis: true,
            tip: '名称过长会自动收缩',
            renderFormItem(schema, config, form, action) {
                return <Button />
            },
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            disable: true,
            title: '状态',
            dataIndex: 'status',
            filters: true,
            onFilter: true,
            ellipsis: true,
            valueType: 'select',
            valueEnum: {
                WAIT_ACTIVE: { text: "待激活" },
                VALID: { text: '有效' },
                INVALID: {
                    text: '无效',
                    status: 'Error',
                },
                EXPIRED: {
                    text: '过期',
                    status: 'Success',
                    // disabled: true,
                },
                USED: {
                    text: '已使用',
                    status: 'Processing',
                },
                DISABLED: {
                    text: '禁用',
                    status: 'Processing',
                },
            },
        },
        {
            disable: true,
            title: '接入器类型',
            dataIndex: 'kind',
            search: false,
            renderFormItem: (_, { defaultRender }) => {
                return defaultRender(_);
            },
            render: (_, record) => (
                <>
                    {record.supportedKinds?.map((kind) => {
                        return <Tag key={kind}>
                            {kind}
                        </Tag>
                    })}

                </>
            ),
        },
        {
            title: '创建时间',
            key: 'showTime',
            dataIndex: 'createAt',
            valueType: 'date',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: '创建时间',
            dataIndex: 'createAt',
            valueType: 'dateRange',
            hideInTable: true,
            search: {
                transform: (value) => {
                    return {
                        startTime: value[0],
                        endTime: value[1],
                    };
                },
            },
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        action?.startEditable?.(record.id!);
                    }}
                >
                    编辑
                </a>,
                <a
                    onClick={() => {
                        let code: ExecutorJoinCode | null = null
                        setModalProps({
                            open: true,
                            title: "编辑接入码",
                            maskClosable: false,
                            width: "800px",
                            onOk: () => {
                                console.log(code);
                                if (code !== null) {
                                    // 执行保存操作
                                    ExecutorJoinCodeService.save(code).then(res => {
                                        if (res.success) {
                                            message.success("保存成功")
                                            setModalProps({
                                                open: false,
                                            })
                                            actionRef.current?.reload()
                                        }
                                    })
                                } else {
                                    setModalProps({
                                        open: false,
                                    })
                                    message.info("数据未发生变化")
                                }
                            },
                            onCancel: () => {
                                setModalProps({
                                    open: false
                                })
                            },
                            children: (
                                <div
                                    style={{
                                        maxHeight: "60vh",
                                        overflow: "auto"
                                    }}
                                >
                                    <ExecutorJoinCodeEditor
                                        data={record}
                                        onChange={c => {
                                            code = c
                                        }}
                                        parentNodesDoNotSynchronizeData
                                    />
                                </div>
                            )
                        })
                    }}
                >编辑</a>,
                <a href={record.id} target="_blank" rel="noopener noreferrer" key="view">
                    查看
                </a>,
                <TableDropdown
                    key="actionGroup"
                    onSelect={() => action?.reload()}
                    menus={[
                        { key: 'copy', name: '复制' },
                        { key: 'delete', name: '删除' },
                    ]}
                />,
            ],
        },
    ];
    return (
        <div>
            <Modal
                {...modalProps}
            />

            <ProTable<ExecutorJoinCode>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={(params
                    , sort
                ) => {
                    return AntDesignProHelper.doPage(params, sort, (page) => {
                        return ExecutorJoinCodeService.findPage(page)
                    })
                }}
                editable={{
                    type: 'multiple',
                }}
                columnsState={{
                    persistenceKey: 'pro-table-singe-demos',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        option: { fixed: 'right', disable: true },
                    },
                    onChange(value) {
                        console.log('value: ', value);
                    },
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                form={{
                    // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
                    syncToUrl: (values, type) => {
                        if (type === 'get') {
                            return {
                                ...values,
                                created_at: [values.startTime, values.endTime],
                            };
                        }
                        return values;
                    },
                }}
                pagination={{
                    pageSize: 5,
                    onChange: (page) => console.log(page),
                }}
                dateFormatter="string"
                headerTitle="高级表格"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {

                            // actionRef.current?.reload();
                            ExecutorJoinCodeService.createExecutorJoinCode().then(res => {
                                if (res.success) {
                                    let code: ExecutorJoinCode | null = null
                                    const md = {
                                        open: true,
                                        title: "编辑接入码",
                                        maskClosable: false,
                                        width: "800px",
                                        joinCode: res.data,
                                        onOk: () => {
                                            console.log(code);
                                            if (code !== null) {
                                                // 执行保存操作
                                                ExecutorJoinCodeService.save(code).then(res => {
                                                    if (res.success) {
                                                        message.success("保存成功")
                                                        setModalProps({
                                                            open: false,
                                                        })
                                                    }
                                                })
                                            } else {
                                                message.info("数据未发生变化")
                                                setModalProps({
                                                    open: false,
                                                })
                                            }

                                        },
                                        onCancel: () => {
                                            setModalProps({
                                                open: false,
                                            })
                                        },
                                        children: (
                                            <div
                                                style={{
                                                    maxHeight: "60vh",
                                                    overflow: "auto"
                                                }}
                                            >
                                                <ExecutorJoinCodeEditor
                                                    simple
                                                    parentNodesDoNotSynchronizeData
                                                    data={res.data}
                                                    onChange={(c) => {
                                                        code = c
                                                    }}
                                                />
                                            </div>
                                        )
                                    }
                                    setModalProps(md)
                                }
                            })
                        }
                        }
                        type="primary"
                    >
                        新建
                    </Button>,
                    <Dropdown
                        key="menu"
                        menu={{
                            items: [
                                {
                                    label: '1st item',
                                    key: '1',
                                },
                                {
                                    label: '2nd item',
                                    key: '1',
                                },
                                {
                                    label: '3rd item',
                                    key: '1',
                                },
                            ],
                        }}
                    >
                        <Button>
                            <EllipsisOutlined />
                        </Button>
                    </Dropdown>,
                ]}
            />
        </div>
    );
};