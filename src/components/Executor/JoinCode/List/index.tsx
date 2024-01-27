import { ExecutorJoinCodeService } from "@/services/JoinCode";
import { ExecutorJoinCode } from "@/services/JoinCode/typeings";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Modal, ModalProps, Space, Table, TableColumnType, Tag } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import Paragraph from "antd/es/typography/Paragraph";
import { useEffect, useRef, useState } from "react";
import Highlighter from 'react-highlight-words';
import { ExecutorJoinCodeEditor } from "../Editor";
/**
 *  以列表的方式查看所有接入码
 * @returns 
 */
export const ExecutorJoinCodeList = () => {
    const [modalProps, setModalProps] = useState<ModalProps>({
        open: false
    })
    const [joinCodes, setJoinCode] = useState<ExecutorJoinCode[]>([])

    useEffect(() => {
        ExecutorJoinCodeService.findAll().then((res) => {
            if (res.success) {
                setJoinCode(res.data)
            }
        })
    }, [])

    useEffect(() => {
        ExecutorJoinCodeService.findPage({
            current: 0,
            pageSize: 10,
            sorts: {
                "code": "ASC",
                "key": "DESC"
            }
        }, "code")
    }, [])
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };
    type DataIndex = keyof ExecutorJoinCode
    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<ExecutorJoinCode> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) => {
            if (record[dataIndex]) {
                return record[dataIndex]!
                    .toString()
                    .toLowerCase()
                    .includes((value as string).toLowerCase())
            }
            return false
        },
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });
    return (
        <div>
            <div>
                <Button
                    onClick={() => {
                        ExecutorJoinCodeService.createExecutorJoinCode().then(res => {
                            if (res.success) {
                                setModalProps({
                                    open: true,
                                    title: "编辑接入码",
                                    maskClosable: false,
                                    width: "800px",
                                    onOk: () => {
                                        setModalProps({
                                            open: false
                                        })
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
                                                data={res.data}
                                            />
                                        </div>
                                    )
                                })
                            }
                        })
                    }}
                >
                    新建接入码
                </Button>
            </div>
            <div>
                <Table
                    size="small"
                    columns={[
                        {
                            key: "id",
                            title: "id",
                            dataIndex: "id",
                            render: (value) => {
                                return <Paragraph
                                    copyable={
                                        {
                                            text: value
                                        }
                                    }
                                >
                                    <Tag>
                                        {value}
                                    </Tag>
                                </Paragraph>
                            }
                        },
                        {
                            key: "name",
                            title: "接入码名称",
                            dataIndex: "name",
                            ...getColumnSearchProps('name'),
                        },
                        {
                            key: "kind",
                            title: "接入码类型",
                            dataIndex: "kind",
                        },
                        {
                            key: "code",
                            title: "接入码",
                            dataIndex: "code",
                            render: (value) => {
                                return <Paragraph
                                    copyable={
                                        {
                                            text: value
                                        }
                                    }
                                >
                                    <Tag>
                                        {value}
                                    </Tag>
                                </Paragraph>
                            }
                        },
                        {
                            key: "disabled",
                            title: "接入码状态",
                            dataIndex: "disabled",
                            render(value, record) {
                                return (
                                    <div>
                                        {record.disabled ? "已禁用" : record.invalid ? "已失效" : "可用"}
                                    </div>
                                );
                            }
                        },
                        {
                            key: "operations",
                            title: "操作",
                            render(value, record) {
                                return (
                                    <div>
                                        <a
                                            onClick={() => {
                                                setModalProps({
                                                    open: true,
                                                    title: "编辑接入码",
                                                    maskClosable: false,
                                                    width: "800px",
                                                    onOk: () => {
                                                        setModalProps({
                                                            open: false
                                                        })
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
                                                            />
                                                        </div>
                                                    )
                                                })
                                            }}
                                        >编辑</a>
                                        <code>  </code>
                                        <a>在新窗口打开</a>
                                        <code>  </code>
                                        <a>下载</a>
                                        <code>  </code>
                                        <a>获取接入参数</a>
                                        <code>  </code>
                                        <a>查看节点接入历史</a>
                                        <a>删除</a>
                                    </div>
                                );
                            }
                        }
                    ]}
                    dataSource={joinCodes}
                />
                <Modal
                    {...modalProps}
                />
            </div >
        </div >
    )
}


function mockData(count: number): ExecutorJoinCode[] {
    const codeGroups: ExecutorJoinCode[] = [];

    // Generate 10 groups of data
    for (let i = 0; i < count; i++) {

        codeGroups.push({
            id: `codeID_${i + 1}`,
            kind: `codeKind_${i + 1}`,
            name: `codeName_${i + 1}`,
            code: `code_${i + 1}`,
            disabled: Math.random() < 0.5 // Randomly generate boolean value for each group
        } as ExecutorJoinCode);
    }
    return codeGroups
}
