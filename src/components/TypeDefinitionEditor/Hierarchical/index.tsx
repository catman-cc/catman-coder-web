import { TypeDefinitionHierarchialSchema } from "@/components/HierarchicalSchema/TypeDefinitionSchemaParse";
import IconCN from "@/components/Icon";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Button, Input } from "antd";
import { CSSProperties, LegacyRef, useEffect, useMemo, useState } from "react";
import { SelectTypePanelFactory } from "../EditorPanel/Row/SelectTypePanel";
import "./index.less";

export const Hierarchical = (props: {
    treeId: string
    schema: TypeDefinitionHierarchialSchema
    renderChildrenIfPublic: boolean
    index?: number
    style?: CSSProperties | undefined;
    ref?: LegacyRef<unknown> | undefined;
}) => {
    const [schmea, setSchema] = useState(props.schema)
    const id = useMemo(() => {
        return schmea.encode(props.treeId)
    }, [props.treeId])

    useEffect(() => {
        setSchema(props.schema)
    }, [props.schema])

    const [selectTypeFactory, setSelectTypeFactory] = useState(
        SelectTypePanelFactory.create(),
    );

    /**
     * 是否展开折叠
     */
    const [fold, setFold] = useState(true)


    const { attributes, listeners, setNodeRef, transform, isOver, isDragging } = useDraggable({
        id: id,
        data: schmea.get(props.treeId).name
    });
    //    const { attributes, listeners, setNodeRef, transform, transition, isOver, isDragging } = useSortable({
    //        id: props.treeId,
    //    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        //        transition
    } : undefined;

    const { setNodeRef: setDropRef, isOver: isDropOver } = useDroppable({
        id: `${id}`,
        data: schmea.get(props.treeId).name
    })

    return (

        <div className="type-definition-line"
            ref={(ref) => {
                setDropRef(ref)
                setNodeRef(ref)
            }}
            style={style}
        >
            <div className="type-definition-line-info">
                <div className="type-definition-line-drag"
                >
                    {schmea.canDrag(props.treeId) && <Button
                        type="link"
                        {...listeners} {...attributes}
                        icon={<IconCN type="icon-drag1" />}
                    />}
                </div>
                <div>{props.treeId}</div>
                <div className="type-definition-line-fold">
                    {/* 一个折叠按钮 */}
                    {schmea.hasChild(props.treeId) && (
                        <IconCN type={"icon-caidanzhedie"}
                            className={`${fold ? "type-definition-line-fold-expand" : ""}`}
                            onClick={() => {
                                setFold(!fold)
                            }} />
                    )}
                </div>
                <div className="type-definition-line-tag-group">
                    {/* 公开标记 */}
                    {schmea.isPublic(props.treeId) && <div
                        className="type-definition-line-tag-public">
                        <IconCN type="icon-public" />
                    </div>}
                </div>
                <div className="type-definition-line-name">
                    <Input
                        disabled={schmea.canChangeName(props.treeId)}
                        value={schmea.get(props.treeId).name}
                        onChange={e => {
                            // discard --- 注意,此处修改了原始数据,不会触发更新操作 ---
                            schmea.get(props.treeId).name = e.target.value
                            setSchema(schmea.copy())
                        }}
                    />
                </div>
                <div className={"type-definition-tree-row-right-basic"}>
                    <div className={"type-definition-tree-row-type"}>
                        {selectTypeFactory.render(
                            schmea.getType(props.treeId),
                            (t) => {
                                console.log("change type definition type", t);
                                // props.tree.getTypeDefinition().type = t;
                                // props.onChange(props.tree.updateType(t, true).deepCopy());
                            },
                            props.schema.schmea,
                            schmea.locked(props.treeId)
                        )}
                        {/*{props.tree.maxLevel()} , {props.tree.getLevel()}*/}
                    </div>
                    <div className={"type-definition-tree-row-describe"}>
                        <Input
                            // disabled={!props.tree.canEdit()}
                            size={"small"}
                            bordered={false}
                            value={schmea.get(props.treeId).describe}
                            onChange={(e) => {
                            }}
                            placeholder={"描述"}
                        />
                    </div>
                </div>
            </div>
            {/* 渲染子元素 */}
            {
                fold && schmea.renderChild(props.treeId, props.renderChildrenIfPublic) &&
                (
                    <div className={`type-definition-line-children  fade-in `}
                    //                            ref={setDropRef}
                    >
                        {schmea.getChildren(props.treeId).map((cid, index) => {
                            return <div
                                style={
                                    {
                                        paddingLeft: "30px"
                                    }
                                }
                            >
                                <Hierarchical
                                    treeId={cid} schema={schmea} renderChildrenIfPublic={false} index={index}
                                />
                            </div>
                        })}
                    </div>

                )
            }
        </div>
    )
}