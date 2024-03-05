/**
 *  一个用来啊编辑form表单的组件
 *  form表单的数据结构为:
 *   - header: 表单的头部, 类似http的header,示例: { 'Content-Type': 'application/json' }
 *   - value: 表单的正文值,可以是String,也可以是多个其他表单构成的对象
 *   - name: 表单的名称,用来标识表单的作用
 */
import {Button, Input, InputNumber, Popover, Select, Switch, Table, Upload} from "antd";
import {Dispatch, SetStateAction, useState} from "react";
import {PlusCircleFilled} from "@ant-design/icons";
import {TiFlowChildren} from "react-icons/ti";
import {GrSubtractCircle} from "react-icons/gr";
import MonacoCodeEditor from "@/components/CodeEditor";
import {BodyDataItem, EBodyDataType} from "@/components/Provider/http/types.ts";
import {RcFile} from "antd/es/upload";

interface Props {
    body?: BodyDataItem
    updateRawBody?: (body: BodyDataItem) => void
}

// interface Data {
//     key: string,
//     name: string,
//     type: string,
//     headers: {
//         [key: string]: string
//     }
//     extra?: {
//         [key: string]: string
//     }
//     value: string,
//     description: string,
//     children?: Data[]
// }


const recordHasChildren = (record: BodyDataItem) => {
    return record.type === "object" || record.type === "array"
}

const renderValueEditor = (record: BodyDataItem, data: BodyDataItem[], setData: Dispatch<SetStateAction<BodyDataItem[]>>) => {
    switch (record.type) {
        case EBodyDataType.File:
            const file = record.value as File
            return <Upload
                name={"file"}
                fileList={[
                    {
                        uid: Math.random().toString(24).trim(),
                        name: file.name,
                        originFileObj: record.value as RcFile,
                    }
                ]}
                action={"/"}
                beforeUpload={(file, files) => {
                    // 将文件数据转换为json数据
                    if (files.length > 1) {
                        console.log("只能上传一个文件")
                        return false
                    }
                    record.value = file
                    setData([...data])
                    return false
                }}
            >
                <Button size={"small"} icon={"upload"}>上传</Button>
            </Upload>
        case  EBodyDataType.Boolean:
            return <Switch
                size={"small"}
                checked={record.value === "true"} onChange={(v) => {
                record.value = v ? "true" : "false"
                setData([...data])
            }}/>
        case EBodyDataType.Number:
            return <InputNumber
                value={Number(record.value)}
                onInput={(e) => {
                    record.value = e
                    setData([...data])
                }
                }
                addonAfter={
                    <PlusCircleFilled onClick={() => {
                        const value = record.value;
                        // if can convert to number do convert, else return 0
                        if (isNaN(Number(value))) {
                            record.value = "0"
                            setData([...data])
                            return
                        }
                        record.value = (Number(value as string) + 1).toString()
                        setData([...data])
                    }
                    }/>
                }
                addonBefore={
                    <GrSubtractCircle onClick={() => {
                        const value = record.value;
                        // if can convert to number do convert, else return 0
                        if (isNaN(Number(value))) {
                            record.value = "0"
                            setData([...data])
                            return
                        }
                        record.value = (Number(value) - 1).toString()
                        setData([...data])
                    }}/>
                } defaultValue={0}

            />
        default:
            // 如果是文件类型,则读取base64
            let v = ""
            if (record.value instanceof File) {
                const fileValue = record.value as File;
                const fr = new FileReader()
                fr.onload = () => {
                    v = fr.result as string
                }
                fr.readAsDataURL(fileValue)
            } else {
                v = record.value as string
            }
            return <Input
                size={"small"}
                defaultValue={v}
                value={v} onChange={(e) => {
                record.value = e.target.value
                setData([...data])
            }}/>
    }

}

const convert = (formData: FormData) => {
    console.log("convert")
    // 将data转换为FormData
    const req = new Request("", {
        method: "POST",
        body: formData
    })
    return req.text()
}

const bodyDataToForm = (bodyData: BodyDataItem): Promise<(string | File)> => {
    // 处理formData时,主要有两种特殊场景需要进行额外操作
    // 1. 集合和对象,这表示这是一个mixedform表单,但原始formdata不支持
    const form = new FormData()
    const ps: Promise[any] = []
    switch (bodyData.type) {
        case EBodyDataType.Object || EBodyDataType.Array:
            const objForm = new FormData()
            if (bodyData.children === undefined) {
                form.append(bodyData.name, "");
            } else {
                let bf = bodyData.children?.map(c => {
                    return {
                        child: c,
                        v: bodyDataToForm(c)
                    }
                })
                ps.push(Promise.all(bf).then(cvs => {
                    cvs.forEach(cv => {
                        objForm.append(cv.child.name, v)
                    })
                    return objForm
                }).then(o => {
                    convert(o).then(v => {
                        objForm.append(bodyData.name, v)
                    })
                }))

            }
            break;
        case EBodyDataType.File:
            const f = bodyData.value as File
            form.append(bodyData.name, f)
            break
        default:
            const v = bodyData.value + ""
            form.append(bodyData.name, v)
            break;
    }
    return Promise.all(ps).then(() => {
        return convert(form)
    })
}

export const FormEditor = () => {
    const [data, setData] = useState<BodyDataItem[]>([])

    const [types, setTypes] = useState<EBodyDataType[]>([
        EBodyDataType.String,
        EBodyDataType.Number,
        EBodyDataType.Boolean,
        EBodyDataType.File,
        EBodyDataType.Array,
        EBodyDataType.Object
    ])
    const [httpBody, setHttpBody] = useState<string>("")

    const convert = () => {
        console.log("convert")
        // 将data转换为FormData
        const formData = new FormData()
        const req = new Request("", {
            method: "POST",
            body: formData
        })
        req.text().then((res) => {
            console.log("c", res)
        })
    }


    // 定义数据列
    const columns = [
        {
            key: "1",
            title: "参数名称",
            dataIndex: "name",
            render: (text: string, record: BodyDataItem) => {
                return <Input
                    size={"small"}
                    style={{width: "80%"}}
                    value={text} onChange={(e) => {
                    record.name = e.target.value
                    setData([...data])
                }}/>
            }
        },
        {
            key: "2",
            "title": "参数类型",
            "dataIndex": "type",
            "render": (_: string, record: BodyDataItem) => {
                return <Select size={"small"}
                               popupMatchSelectWidth={false}
                               value={record.type}
                               onChange={(e) => {
                                   const old = record.type
                                   const oldIsComplex = old === EBodyDataType.Complex
                                   const newIsComplex = e === EBodyDataType.Complex
                                   if (newIsComplex && !oldIsComplex) {
                                       record.children = []
                                   } else if (!newIsComplex && oldIsComplex) {
                                       delete record.children
                                   }
                                   record.type = e
                                   setData([...data])
                               }
                               } options={types.map((v) => {
                    return {label: v, value: v}
                })}/>
            }
        },
        {
            key: "3",
            "title": "参数值",
            "dataIndex": "value",
            "render": (_: string, record: BodyDataItem) => {
                return (
                    <div>
                        {renderValueEditor(record, data, setData)}
                    </div>
                )
            }
        },
        {
            key: "4",
            "title": "参数描述",
            "dataIndex": "description",
            "render": (text: string, record: BodyDataItem) => {
                return <Input
                    size={"small"}
                    style={{width: "80%"}}
                    value={text} onChange={(e) => {
                    record.description = e.target.value
                    setData([...data])
                }}/>
            }
        },
        {
            key: "operation",
            title: () => {
                return <div>
                    <Button
                        icon={<PlusCircleFilled style={{color: "skyblue"}}/>}
                        size={"small"}
                        type={"text"}
                        onClick={() => {
                            // 如果已经有了无名数据,则不需要添加
                            const old = data.find((v) => {
                                return v.name === ""
                            })
                            if (old) {
                                // 已经存在空数据,不需要添加 TODO 提示用户,同时聚焦到该数据
                                return
                            }
                            data.push({
                                key: "1",
                                "name": "",
                                "type": EBodyDataType.String,
                                "value": "",
                                "description": "",
                            })
                            setData([...data])
                        }}/>
                </div>
            },
            dataIndex: "operation",
            render: (_: string, record: BodyDataItem) => {
                return <div className={"toolbar"}>
                    <div>
                        {/*<Popover*/}
                        {/*    onOpenChange={(open)=>{*/}
                        {/*        if(!open){*/}
                        {/*            setData([...data])*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*    content={*/}
                        {/*    <Table*/}
                        {/*        size={"small"}*/}
                        {/*        pagination={false}*/}
                        {/*        dataSource={record.headers ? Object.keys(record.headers).map((key) => {*/}
                        {/*            return {header: key, value: record.headers![key]}*/}
                        {/*        }*/}
                        {/*        ) : []}*/}
                        {/*        columns={[*/}
                        {/*            {*/}
                        {/*                key: "header",*/}
                        {/*                title: "header",*/}
                        {/*                dataIndex: "header",*/}
                        {/*                render: (text: string, record: { header: string, value: string }) => {*/}
                        {/*                    return <Input value={text} onChange={(e) => {*/}
                        {/*                        record.header = e.target.value*/}
                        {/*                        setData([...data])*/}
                        {/*                    }}/>*/}
                        {/*                }*/}
                        {/*            },*/}
                        {/*            {*/}
                        {/*                key: "value",*/}
                        {/*                title: "value",*/}
                        {/*                dataIndex: "value",*/}
                        {/*                render: (_: string, headers: { header: string, value: string }) => {*/}
                        {/*                    return <div className={"flex justify-between align-baseline"}>*/}
                        {/*                        <Input value={headers.value} onChange={(e) => {*/}
                        {/*                            headers.value = e.target.value*/}
                        {/*                            setData([...data])*/}
                        {/*                        }}/>*/}
                        {/*                        <Button*/}
                        {/*                            type={"text"}*/}
                        {/*                            size={"small"}*/}
                        {/*                            icon={<GrSubtractCircle/>}*/}
                        {/*                            onClick={() => {*/}
                        {/*                                // 移除当前元素*/}
                        {/*                                delete record.headers![headers.header]*/}
                        {/*                                setData([...data])*/}
                        {/*                            }}/>*/}
                        {/*                    </div>*/}
                        {/*                }*/}
                        {/*            }]}/>*/}
                        {/*}>*/}
                        {/*    <Button size={"small"}*/}
                        {/*            type={"text"}*/}
                        {/*            icon={<SettingFilled*/}
                        {/*            />}*/}
                        {/*    />*/}
                        {/*</Popover>*/}
                    </div>
                    {
                        recordHasChildren(record) ? <div>
                                <div>
                                    <Button icon={<TiFlowChildren/>} size={"small"} type={"text"}
                                            onClick={() => {
                                                record.children?.push({
                                                    key: "1",
                                                    "name": "",
                                                    "type": EBodyDataType.String,
                                                    "value": "",
                                                    // headers: {},
                                                    "description": "",
                                                })
                                                setData([...data])
                                            }}
                                    />
                                </div>
                            </div> :
                            <div/>
                    }
                </div>
            }
        },
    ]

    return (
        <div>
            <Popover
                onOpenChange={(open) => {
                    {
                        if (open) {
                            bodyDataToForm(data[0]).then(v => {
                                setHttpBody(v as string)
                            })
                            // TODO  setHttpBody(toHttpRequestBody())
                        }
                    }
                }}
                content={
                    <div style={{
                        width: 500,
                        height: 300
                    }}>
                        <MonacoCodeEditor code={httpBody}
                                          defaultLanguage={"text"}
                                          config={
                                              {
                                                  wight: "100%",
                                                  height: "100%"
                                              }
                                          }/>
                    </div>
                }
            >
                <Button onClick={() => {
                    // console.log(toHttpRequestBody())
                    convert()
                }}>
                    查看渲染
                </Button>
            </Popover>
            <Popover
                onOpenChange={(open) => {
                    {
                        if (open) {
                            // TODO setHttpBody(toHttpRequestBody())
                            bodyDataToForm(data[0]).then(a => {
                                console.log("===", a)
                            })
                        }
                    }
                }}
                content={
                    <div style={{
                        width: 500,
                        height: 300
                    }}>
                        <MonacoCodeEditor code={JSON.stringify(data)}
                                          defaultLanguage={"json"}
                                          config={
                                              {
                                                  wight: "100%",
                                                  height: "100%"
                                              }
                                          }/>
                    </div>
                }
            >
                <Button onClick={() => {
                    // console.log(toHttpRequestBody())
                }}>
                    查看数据
                </Button>
            </Popover>
            <div>
                <Table
                    size={"small"}
                    columns={columns}
                       dataSource={data}
                       pagination={false}
                />
            </div>
        </div>
    )
}