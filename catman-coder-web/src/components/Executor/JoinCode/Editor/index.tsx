import IconCN from "@/components/Icon"
import { ExecutorJoinCode } from "@/services/JoinCode/typeings"
import { Button, Collapse, DatePicker, Divider, Input, InputNumber, InputProps, Popconfirm, Select, Space, Switch, Tag, Tooltip, message } from "antd"
import locale from 'antd/es/date-picker/locale/zh_CN'
import Paragraph from "antd/es/typography/Paragraph"
import { ReactNode, useEffect, useState } from "react"

import { IpsEditor } from "@/components/Common/IpsEditor"
import { ExecutorJoinCodeService, ExecutorJoinCodeStatus } from "@/services/JoinCode"
import { CaretRightOutlined } from "@ant-design/icons"
import 'dayjs/locale/zh-cn'
import { ExecutorJoinStatusTag } from "../Status"
import "./index.less"

export interface ExecutorJoinCodeEditorProps {
    data: ExecutorJoinCode,
    onChange?(data: ExecutorJoinCode): void
    simple?: boolean,
    parentNodesDoNotSynchronizeData?: boolean
}

export const ExecutorJoinCodeEditor = ({
    data, onChange, simple = true, parentNodesDoNotSynchronizeData = false
}: ExecutorJoinCodeEditorProps) => {
    const [joinCode, setJoinCode] = useState<ExecutorJoinCode>(data)
    const [editting, setEditting] = useState<{ [index: string]: boolean }>({})
    const [refrenceOption, setRefrenceOption] = useState<{
        keepValiad: boolean,
        reason: string
    }>({
        keepValiad: true,
        reason: ""
    })
    useEffect(() => {
        setJoinCode(data)
    }, [data])


    const update = (code?: ExecutorJoinCode) => {
        if (onChange) {
            onChange({ ...(code || joinCode) })
            if (parentNodesDoNotSynchronizeData) {
                setJoinCode({ ...(code || joinCode) })
            }
        } else {
            setJoinCode({ ...(code || joinCode) })
        }
    }

    return <div className="executor-join-code-editor">
        <div className="executor-join-code-editor-line">
            <div>
                <Paragraph
                    className="labeled"
                    copyable={
                        {
                            text: joinCode.id
                        }
                    }
                >
                    <div>
                        id:
                    </div>
                    <div>
                        <Tag>
                            {joinCode.id}
                        </Tag>
                    </div>

                </Paragraph>
            </div>

        </div>
        <div className="executor-join-code-editor-line">
            <div>
                <EditorInput
                    editName="name"
                    labelFor="名称:"
                    placeholder="为接入码提供一个名称吧"
                    editable={editting}
                    forceEdit={simple}
                    updateEditable={(e) => {
                        setEditting(e)
                    }}
                    copyText={joinCode.name}
                    value={joinCode.name}
                    size="small"
                    width={200}
                    onChange={(e) => {
                        joinCode.name = e.target.value
                        update(joinCode)
                    }}
                />
            </div>
            <div className="flex">
                <EditorInput
                    editName="code"
                    labelFor="接入码:"
                    editable={editting}
                    updateEditable={(e) => {
                        setEditting(e)
                    }}
                    copyText={joinCode.code}
                    value={joinCode.code}
                    size="small"
                    width={200}
                    onChange={(e) => {
                        joinCode.code = e.target.value
                        update(joinCode)
                    }}
                />

                <Tooltip
                    title="刷新接入码"
                >
                    <Popconfirm
                        title="请谨慎操作"
                        description={
                            <div
                                style={
                                    {
                                        width: "250px"
                                    }
                                }
                            >
                                <div>
                                    <Space>
                                        作废当前接入码:<Switch size="small" value={!refrenceOption.keepValiad} onChange={v => {
                                            setRefrenceOption({
                                                ...refrenceOption,
                                                keepValiad: !v
                                            })
                                        }} />
                                    </Space>
                                </div>
                                {refrenceOption.keepValiad
                                    ? <div>
                                        本次操作将会为旧的接入码创建一个副本,继续提供工作
                                    </div>
                                    : <div>
                                        <Space>
                                            废弃原因:<Input
                                                size="small"
                                                value={refrenceOption.reason}
                                                onChange={(e) => {
                                                    setRefrenceOption({
                                                        ...refrenceOption,
                                                        reason: e.target.value
                                                    })
                                                }}
                                            />
                                        </Space>
                                    </div>}
                            </div>
                        }
                        onConfirm={() => {
                            const willFlushJoinCode: ExecutorJoinCode = {
                                ...joinCode,
                                invalid: !refrenceOption.keepValiad,
                                invalidReason: refrenceOption.reason
                            }
                            ExecutorJoinCodeService.flushJoinCode(willFlushJoinCode).then((res) => {
                                if (res.success) {
                                    message.success("接入码刷新成功")
                                    update(res.data)
                                }
                            })
                        }}
                        okButtonProps={{
                            danger: true,
                            size: "small"
                        }}
                        okText="刷新"
                        cancelText="🤔我再想想"
                    >
                        <Button
                            size="small"
                            type="text"
                            shape="circle"
                            icon={
                                <IconCN type="icon-tubiaozhizuomoban"
                                    color="red"
                                    style={{
                                        color: "red"
                                    }}
                                />
                            }
                            onClick={() => {

                            }}
                        />
                    </Popconfirm>
                </Tooltip>
            </div>
        </div>
        <div className="executor-join-code-editor-line">
            <div className="labeled">
                <div>
                    状态:
                </div>
                <div>
                    <ExecutorJoinStatusTag
                        status={joinCode.status!}
                    />
                    {joinCode.status === ExecutorJoinCodeStatus.WAIT_ACTIVE && (
                        <Tooltip
                            title="点击激活,记得保存"
                        >
                            <Button size="small"
                                shape="circle"
                                type="text"
                                icon={
                                    <IconCN type="icon-quanxian" />
                                }
                                onClick={() => {
                                    joinCode.status = ExecutorJoinCodeStatus.VALID
                                    update(joinCode)
                                }}
                            />
                        </Tooltip>
                    )}
                    {/* <Tag >{joinCode.status}</Tag> */}
                </div>
            </div>
            {
                joinCode.invalid && (
                    <div className="labeled">
                        <div>
                            失效原因:
                        </div>
                        <div>
                            {joinCode.invalidReason}
                        </div>
                    </div>
                )
            }
            <div className="labeled">
                <div>
                    类型:
                </div>
                <div>
                    <Select
                        size="small"
                        mode="tags"
                        popupMatchSelectWidth={false}
                        value={joinCode.supportedKinds}
                        options={[
                            {
                                key: "executor",
                                label: "执行器",
                                value: "executor",
                                icon: "icon-yunhang1"
                            },
                            {
                                key: "worker",
                                label: "节点",
                                value: "worker",
                                icon: "icon-diannao1"
                            },
                            {
                                key: "schedule",
                                label: "调度器",
                                value: "schedule",
                                icon: "icon-Recycle"
                            }
                        ]}
                        optionRender={(option) => {
                            return (
                                <Space>
                                    <IconCN type={option.data.icon} />
                                    <span>{`${option.label}(${option.value})`}</span>
                                </Space>
                            )
                        }}
                        onSelect={(v, o) => {
                        }}
                        onChange={(v, o) => {
                            joinCode.supportedKinds = v
                            update(joinCode)
                        }}
                    />
                </div>
            </div>
        </div>
        <Divider />
        <div>
            <IpsEditor ips={[
                ...joinCode.ipFilter || []
            ]}
                onUpdate={(ips) => {
                    joinCode.ipFilter = ips
                    update()
                }}
            />
        </div>
        <Divider />
        <div className="executor-join-code-editor-line">
            <div className="labeled">
                <span>
                    是否支持重复接入:
                </span>
                <div style={{
                    height: "1em",
                    alignItems: "baseline"
                }}>
                    <Switch size="small"
                        value={joinCode.repeatable}
                        onChange={(v) => {
                            joinCode.repeatable = v
                            update()
                        }}
                    />
                </div>
            </div>
        </div>
        <div className="executor-join-code-editor-line">
            <div className="labeled">
                <span>
                    是否限制接入时间:
                </span>
                <div style={{
                    height: "1em",
                    alignItems: "baseline"
                }}>
                    <Switch size="small"
                        value={joinCode.limitAccessTime}
                        onChange={(v) => {
                            joinCode.limitAccessTime = v
                            update()
                        }}
                    />
                </div>
            </div>
        </div>
        <div className="labeled">
            {/* 限制访问时间 */}
            <span>
                是否限制接入IP池:
            </span>
            <div style={{
                height: "1em",
                alignItems: "baseline"
            }}>
                <Switch size="small"
                    value={joinCode.limitAccessIps}
                    onChange={(v) => {
                        joinCode.limitAccessIps = v
                        update()
                    }}
                />
            </div>
        </div>
        <div>
            <Collapse
                size="small"
                bordered={false}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                items={[
                    {
                        key: "limit-repeatable",
                        label: "限制重复访问",
                        children: <div style={{
                            marginLeft: "18px"
                        }}>
                            <div className="labeled">
                                <div>
                                    最大重复接入次数:
                                </div>
                                <div>
                                    <InputNumber
                                        size="small"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </div>

                    },
                    {
                        key: "limit-access-time",
                        label: "限制访问时间",
                        children:

                            <div>
                                <div className="executor-join-code-editor-line">
                                    <div className="labeled">
                                        <span>
                                            指定时间之后<span
                                                style={{
                                                    color: "green"
                                                }}
                                            >允许</span>接入:
                                        </span>
                                        <div style={{
                                            height: "1em",
                                            alignItems: "baseline"
                                        }}>
                                            <DatePicker showTime size="small" locale={locale} />
                                        </div>
                                    </div>
                                </div>

                                <div className="executor-join-code-editor-line">
                                    <div className="labeled">
                                        <span>
                                            指定时间之后<span
                                                style={{
                                                    color: "red"
                                                }}
                                            >禁止</span>接入:
                                        </span>
                                        <div style={{
                                            height: "1em",
                                            alignItems: "baseline"
                                        }}>
                                            <DatePicker showTime size="small" locale={locale} />
                                        </div>
                                    </div>
                                </div>
                                周期性访问限制,每月,选择,每年,每周,每天,多个维度限制
                                <div>
                                    <div className="executor-join-code-editor-line">
                                        <div className="labeled">
                                            <span>
                                                指定时间之后<span
                                                    style={{
                                                        color: "green"
                                                    }}
                                                >允许</span>接入:
                                            </span>
                                            <div style={{
                                                height: "1em",
                                                alignItems: "baseline"
                                            }}>
                                                <DatePicker showTime size="small" locale={locale} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="executor-join-code-editor-line">
                                        <div className="labeled">
                                            <span>
                                                指定时间之后<span
                                                    style={{
                                                        color: "red"
                                                    }}
                                                >禁止</span>接入:
                                            </span>
                                            <div style={{
                                                height: "1em",
                                                alignItems: "baseline"
                                            }}>
                                                <DatePicker showTime size="small" locale={locale} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                    },
                    {
                        key: "limit-access-ip",
                        label: "限制访问IP",
                        children: <div>
                            <IpsEditor ips={[]} />
                        </div>

                    },
                    {
                        key: "settings-for-executor",
                        label: "执行器设置",
                        children: <div>
                            如果解码类型中包含了执行器,可以进一步限制:
                            <ul>
                                <li>
                                    只允许特定操作系统,特定bitNess,特定language的执行器接入
                                </li>
                                <li>
                                    配置任务调度策略,比如:禁止调度非当前用户的任务到执行器,(需要完善用户系统)
                                </li>
                                <li>
                                    配置核心资源访问权限,比如,在执行任务时,可以使用某特定用户来执行任务
                                </li>
                            </ul>
                        </div>

                    },
                    {
                        key: "settings-for-schedule",
                        label: "调度器设置",
                        children: <div>
                            如果接入码类型包含了Schedule,可以进一步限制:
                            <ul>
                                <li>
                                    只允许只允许特定操作系统,特定bitNess,特定language的执行器接入
                                </li>
                                <li>
                                    为schedule添加标签过滤机制,过滤任务,其目的是让特定的schedule只调度一些特定的任务
                                </li>
                                <li>
                                    配置schedule的访问权限,比如,接入后,默认拥有某一个用户的权限
                                </li>
                            </ul>
                        </div>

                    },
                    {
                        key: "settings-for-runner",
                        label: "运行节点设置",
                        children: <div>
                            如果接入码包含了Worker,可以进一步限制:
                            <ul>
                                <li>
                                    只允许只允许特定操作系统,特定bitNess,特定language的执行器接入
                                </li>
                                <li>
                                    配置核心资源访问权限,比如,在执行任务时,可以使用某特定用户来执行任务
                                </li>
                            </ul>
                        </div>

                    },
                ]}
            />
        </div>
        展示 id
        展示名称
        展示状态
        展示接入码类型
        展示已接入码,提供一个刷新按钮,可以自定义接入码
        提供禁用启用按钮
        支持是否重复接入开关
        当启用重复开关时,支持设置最大重入次数
        提供一个输入框,允许输入访问时间限制,当达到限制自动断开
        限制接入的时间范围,起止时间
        提供一个可编辑列表,允许配置可访问ip和禁用id地址,支持地址段,解析时按照定义顺序处理.
        匹配任意一个白名单即放行,或者不匹配任何黑名单

    </div>
}

export const EditorInput = (props: {
    editName: string,
    editable: { [index: string]: boolean },
    updateEditable: (_editable: { [index: string]: boolean }) => void
    labelFor?: string | ReactNode
    copyText?: string
    forceEdit?: boolean
} & InputProps) => {
    return (
        <div className="executor-join-code-editor-labeled-input">
            <Paragraph
                className="labeled"
                copyable={props.copyText ? {
                    text: props.copyText
                } : false}
            >
                <div>
                    {props.labelFor ? props.labelFor : null}
                </div>
                <Input
                    style={
                        {
                            width: "auto"
                        }
                    }
                    {...props}
                    disabled={(!props.forceEdit && !props.editable[props.editName])}
                    size="small"
                    addonAfter={
                        !props.forceEdit && (
                            <IconCN type={props.editable[props.editName] ? "icon-save" : "icon-editor-line"}
                                onClick={() => {
                                    props.editable[props.editName] = !props.editable[props.editName]
                                    props.updateEditable({
                                        ...props.editable,
                                    })
                                }}
                            />
                        )
                    }
                />

            </Paragraph>
        </div>
    )
}