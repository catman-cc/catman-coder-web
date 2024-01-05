import EventBus, { Events } from "@/common/events"
import { Button, Popover, PopoverProps, Tooltip } from "antd"
import { IJsonTabNode } from "flexlayout-react"
import IconCN from "../Icon"
export interface PopoverTabProps extends PopoverProps {
    id: string,
    name: string,
    component: string,
    enableClose?: boolean,
    icon?: string
}
const PopoverTab = (props: PopoverTabProps) => {
    return <Popover
        {...props}

        content={
            props.content
        }
        title={
            <div className="flex justify-between">
                {typeof props.title === "function" ? props.title() : props.title}
                <div>
                    <Tooltip title="使用弹窗编辑" placement="topLeft">
                        <Button size="small" type="text" icon={<IconCN type="icon-export" onClick={() => {
                            EventBus.emit(Events.Layout.ADD_TAB, {
                                "type": "tab",
                                "id": `[float-tab]-${props.id}`,
                                "name": props.name,
                                "component": props.component,
                                // floating: true,
                                "config": {
                                    type: "refuse-node",
                                    node: props.content
                                },

                                "enableClose": props.enableClose || true,
                                // className: "TypeDefinitionMenuIcon",
                                "icon": props.icon || "icon-type",
                            } as IJsonTabNode)
                            props.onOpenChange!(false)
                        }} />} />
                    </Tooltip>
                </div>
            </div>
        }
    >
        <Button
            // style={(this.state.dataNode.data.isBuiltIn() || !this.state.dataNode.data.canEditor()) ? { visibility: "hidden" } : {}}
            // disabled={this.state.dataNode.data.isBuiltIn() || !this.state.dataNode.data.canEditor()}
            shape={"circle"} type={"text"} size={"small"}
            onClick={() => {
            }}>
            <IconCN type={"icon-setting-preferences-gear-office-application-structure-define-process-fbaaebdf"} />
            {/*<AiFillDelete style={{ color: "#ff6464" }} />*/}
        </Button>
    </Popover>
}
export default PopoverTab