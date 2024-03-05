import { TypeDefinitionHierarchialSchema } from "@/components/HierarchicalSchema/TypeDefinitionSchemaParse"
import IconCN from "@/components/Icon"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { SortableContext } from "@dnd-kit/sortable"
import { Button, Input } from "antd"
import { useState } from "react"
import "./index.less"

export const Hierarchical = (props: {
    typeDefinitionId: string
    schema: Core.TypeDefinitionSchema
    renderChildrenIfPublic: boolean
}) => {
    const [schmea, setSchema] = useState(TypeDefinitionHierarchialSchema.of(props.schema))
    /**
     * 是否展开折叠
     */
    const [fold, setFold] = useState(false)


    const { attributes, listeners, setNodeRef } = useDraggable({
        id: props.typeDefinitionId,
    })

    const { setNodeRef: setDropNodeRef } = useDroppable({
        id: `${props.typeDefinitionId}-droppable`,
        data: {
            accepts: ['type1', 'type2'],
        },
    });

    return <div className="type-definition-line"
        ref={setNodeRef}
    >
        <div className="type-definition-line-info">
            <div className="type-definition-line-drag"
            >
                {schmea.canDrag(props.typeDefinitionId) && <Button
                    type="link"
                    {...listeners} {...attributes}
                    icon={<IconCN type="icon-drag1" />}
                />}
            </div>
            <div className="type-definition-line-fold">a
                {/* 一个折叠按钮 */}
                {schmea.hasChild(props.typeDefinitionId) && (
                    <IconCN type={"icon-caidanzhedie"}
                        className={`${fold ? "type-definition-line-fold-expand" : ""}`}
                        onClick={() => {
                            setFold(!fold)
                        }} />
                )}
            </div>
            <div className="type-definition-line-tag-group">
                {/* 公开标记 */}
                {schmea.isPublic(props.typeDefinitionId) && <div
                    className="type-definition-line-tag-public">
                    <IconCN type="icon-public" />
                </div>}
            </div>
            <div className="type-definition-line-name">
                <Input
                    value={schmea.get(props.typeDefinitionId).name}
                    onChange={e => {
                        // discard --- 注意,此处修改了原始数据,不会触发更新操作 ---
                        schmea.get(props.typeDefinitionId).name = e.target.value
                        setSchema(schmea.copy())
                    }}
                />
            </div>
        </div>
        {/* 渲染子元素 */}
        {
            fold && schmea.renderChild(props.typeDefinitionId, props.renderChildrenIfPublic) &&
            (
                <SortableContext items={schmea.getChildren(props.typeDefinitionId)}>
                    <div className={`type-definition-line-children  fade-in `}
                        ref={setDropNodeRef}
                    >
                        {schmea.getChildren(props.typeDefinitionId).map(cid => {
                            return <div
                                style={
                                    {
                                        paddingLeft: "30px"
                                    }
                                }
                            >
                                <Hierarchical typeDefinitionId={cid} schema={schmea.schmea} renderChildrenIfPublic={false} />
                            </div>
                        })}
                    </div>
                </SortableContext>
            )
        }
    </div>
}