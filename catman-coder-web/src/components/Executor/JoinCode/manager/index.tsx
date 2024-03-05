import { ID } from "@/common/id";
import IconCN from "@/components/Icon";
import { useLayoutContext } from "@/core";
import { DefaultLayoutNode } from "@/core/Layout";
import { ExecutorJoinCodeService } from "@/services/JoinCode";
import { ExecutorJoinCode } from "@/services/JoinCode/typeings";
import { Button, Card, Input, List } from "antd";
import { useEffect, useState } from "react";
import "./index.less";
export const ExecutorJoinCodeManager = () => {
    const layout = useLayoutContext()
    const [keyword, setKeyword] = useState("")
    const [codes, setCodes] = useState<ExecutorJoinCode[]>([])

    useEffect(() => {
        ExecutorJoinCodeService.findAll(keyword).then((res) => {
            if (res.success) {
                setCodes(res.data)
            }
        })
    }, [])

    return (
        <div>
            <Card
                title={
                    <div>
                        <div className="flex justify-between">
                            执行器接入码管理
                            <Button
                                size="small"
                                type="dashed"
                                onClick={(e) => {
                                    const layoutNode = DefaultLayoutNode.of("executor-join-code-manager-dashboard",
                                        "接入码管理",
                                        "ExecutorJoinCodeDashBoard"
                                    )
                                    layoutNode.icon = "icon-moxing";
                                    layout.createOrActive(layoutNode, "tab");
                                }}
                            >
                                管理
                            </Button>
                        </div>


                        <div className="flex justify-between">

                            <Input
                                size="small"
                                placeholder="请输入查找关键字"
                                value={keyword}
                                onChange={e => {
                                    setKeyword(e.target.value)
                                }}
                                addonAfter={
                                    <Button
                                        size="small"
                                        type="link"
                                        icon={
                                            <IconCN type="icon-search6" />
                                        }
                                        onClick={() => {
                                            ExecutorJoinCodeService.findAll(keyword).then((res) => {
                                                if (res.success) {
                                                    setCodes(res.data)
                                                }
                                            })
                                        }}
                                    />
                                }
                            />

                        </div>
                    </div>
                }
            >
                <List
                    split
                    bordered
                    dataSource={codes}
                    renderItem={(item) => {
                        return <div className="executor-join-code-manager-list-item"
                            onClick={() => {
                                const layoutNode = DefaultLayoutNode
                                    .of(item.id || ID(), item.name || "未命名", "ExecutorJoinCodeEditor", item)
                                layout.createOrActive(layoutNode, "tab");
                            }}
                        >
                            {item.id}
                        </div>
                    }}
                />
            </Card>
        </div>
    )
}