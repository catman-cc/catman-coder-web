import { DefaultTypeDefinition } from "@/common/core"
import { Collapse } from "antd"
import { ReactNode, useState } from "react"
import Line from "."
import { TypeDefinitionDataNode } from "../TypeDefinitionDataNode"
import LineEditor from "./LineEditor"

class TreeLineProps {
    blur: boolean = false // 当前元素是否获得焦点
    dataNode: TypeDefinitionDataNode
    isTypeSelector: boolean // 当前是否处于选中状态
    onTypeSelector: (id: string, finish: boolean) => void // 当进行类型选择的时候进行回调
    updateTypeData: (key: string | number, td: DefaultTypeDefinition) => void;
    createBrother: (key: string | number) => void;
    createChild: (key: string | number) => void;
    removeItem: (key: string | number) => void;
    toObject: (key?: string | number) => DefaultTypeDefinition;
    showJsonView: (key?: string | number) => void;
    constructor(
        blur: boolean
        , dataNode: TypeDefinitionDataNode
        , isTypeSelector: boolean
        , onTypeSelector: (id: string, finish: boolean) => void
        , updateTypeData: (key: string | number, td: DefaultTypeDefinition) => void
        , createBrother: (key: string | number) => void
        , createChild: (key: string | number) => void
        , removeItem: (key: string | number) => void
        , toObject: (key?: string | number) => DefaultTypeDefinition
        , showJsonView: (key?: string | number) => void
    ) {
        this.blur = blur;
        this.dataNode = dataNode;
        this.isTypeSelector = isTypeSelector;
        this.onTypeSelector = onTypeSelector
        this.updateTypeData = updateTypeData;
        this.createBrother = createBrother;
        this.createChild = createChild;
        this.removeItem = removeItem;
        this.toObject = toObject;
        this.showJsonView = showJsonView;
    }
}


const TreeLine = (props: TreeLineProps) => {
    const [collapsed, setCollapsed] = useState((false))
    function doCrateLineLabel(d: TypeDefinitionDataNode): ReactNode {
        return (<div
            className={d.data.canDrag() ? "" : "drag-tree-disable"}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            key={"rc"}>
            <Line

                {
                ...props
                }
            />
        </div>)
    }

    function doCreateLineChildren(d: TypeDefinitionDataNode): ReactNode {
        const data = d.data.data
        return collapsed ? <LineEditor
            td={data}
            tdKey={d.key as string}
            updateTypeData={(key, td) => {
                props.updateTypeData(key, td)
            }}
        /> : <div></div>
    }

    return <Collapse
        bordered={false}
        ghost
        size='small'
        onChange={(key) => {
            setCollapsed(key.length > 0)
        }}
        expandIconPosition={"end"}
        items={[
            {
                key: props.dataNode.key as string,
                label: doCrateLineLabel(props.dataNode),
                children: doCreateLineChildren(props.dataNode)
            }
        ]}
    />
}

export default TreeLine