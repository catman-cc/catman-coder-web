import { CacheableComponentFactory, DefaultFactory, LayoutElement, WindowKind } from "@/common/component";
import IconCN from "@/components/Icon";
import { Button, List } from "antd";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import WinBox from "react-winbox";
import 'winbox/dist/css/themes/modern.min.css'; // optional
import 'winbox/dist/css/themes/white.min.css'; // optional
import 'winbox/dist/css/winbox.min.css'; // required
import FloatWindow from "../Float";
import "./index.less";
type IconType = string | React.ReactNode
/**
 * Winbox类型组件的定义
 */
export class WinBoxComponent implements LayoutElement {
    id: string
    name: string
    component: string
    data?: unknown
    icon: IconType | undefined
    window: WindowKind = "FLOAT"

    constructor(
        id: string,
        name: string,
        component: string,
        data: unknown,
    ) {
        this.id = id
        this.name = name
        this.component = component
        this.data = data
    }
}

export const WinBoxFactory = DefaultFactory.create<WinBoxComponent>()
    .nameMatch("JsonView", (node) => {
        return <ReactJson src={node.data as object} />
    })

const WinBoxComponentFactory = CacheableComponentFactory.wrapper<WinBoxComponent>(
    WinBoxFactory
)

interface Props {
    windows: WinBoxComponent[]
}
/**
 *  窗口管理器,不进行太多额外的渲染,只渲染一个简单的toobar就好了,能给查看所有已渲染的窗口,进行隐藏,展开之类的操作
 */
interface Boxs {
    [index: string]: {
        node: WinBoxComponent,
        ref: (WinBox | null)
        hide: boolean,
        width: number,
        height: number,
        x: number,
        y: number,
    }
}
const mapToBoxs = (ws: WinBoxComponent[]) => {
    const nbs: Boxs = {}

    ws.forEach(w => {
        nbs[w.id] = {
            node: { ...w },
            ref: null,
            hide: false,
            width: 500,
            height: 500,
            x: 500,
            y: 100
        }
    })
    return nbs
}


const WinBoxManager = (props: Props) => {
    const [boxs, setBoxs] = useState<Boxs>(mapToBoxs(props.windows))
    // let [boxs,] = [{} as Boxs]
    // const setBoxs = (b) => {
    //     boxs = b
    // }
    // 当执行一些操作,比如关闭时,需要进行额外的回调
    useEffect(() => {
        setBoxs(mapToBoxs(props.windows))
    }, [props])

    const getWindow = (node: WinBoxComponent): React.ReactElement => {
        const box = boxs[node.id]
        const n = WinBoxComponentFactory.create(node)
        return <WinBox
            ref={(r) => {
                if (r !== null && r !== box.ref) {
                    boxs[node.id] = {
                        ...boxs[node.id],
                        ref: r,
                    }
                    setBoxs({ ...boxs })
                }

            }}
            key={node.id}
            id={node.id}
            title={node.name}
            width={box.width}
            height={box.height}
            x={box.x}
            y={box.y}
            customControls={[
                {
                    index: 0,
                    class: "control-pin",
                    image: "/public/icons/pin.png",
                    click: () => {

                    }
                }
            ]}
            onClose={() => {
                // TODO 需要回调,从提供方移除该数据
            }}
            // noClose
            onMinimize={() => {
                // 最小化
                const b = boxs[node.id]

                const position = b.ref?.getPosition()
                b.x = position?.x || b.x
                b.y = position?.y || b.y

                const size = b.ref?.getSize()
                b.width = size?.width || b.width
                b.height = size?.height || b.height

                b.hide = true

                setBoxs({ ...boxs })

            }}
        >
            {n.hasNode() ? n.node! : <div>123312</div>}
        </WinBox>
    }
    return (
        <div
            key={"default"}
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "gray"
            }}>
            {
                props.windows.map((node) => {
                    return boxs[node.id].hide ? <div></div> : getWindow(node)
                })
            }
            {
                <FloatWindow
                    title={"asdas"}
                    content={"asdd"}
                />
            }
            {/* 一个列表,用于来展示所有的float window */}
            {
                <List
                    itemLayout="horizontal"
                    dataSource={Object.keys(boxs)}
                    renderItem={(item) => (
                        <Button
                            icon={<IconCN type={boxs[item].hide ? "icon-ico-show" : "icon-hideinvisiblehidden"} />}
                            key={`WinBoxComponent-${item}`}
                            onClick={() => {
                                const b = boxs[item]
                                // box.ref?.restore()
                                b.hide = !b.hide
                                const position = b.ref?.getPosition()
                                b.x = position?.x || b.x
                                b.y = position?.y || b.y

                                const size = b.ref?.getSize()
                                b.width = size?.width || b.width
                                b.height = size?.height || b.height
                                setBoxs({ ...boxs })
                            }}
                        >
                            {boxs[item].node?.name}
                        </Button>
                    )}
                />

            }
        </div >
    )
}

export default WinBoxManager