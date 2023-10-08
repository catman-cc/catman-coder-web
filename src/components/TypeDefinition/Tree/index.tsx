import { Tree } from 'antd';
import type { TreeProps } from 'antd/es/tree';

import { ReactNode, useCallback, useEffect, useState } from "react";

import { ComplexType, DefaultTypeDefinition } from "@/common/core.ts";
import constants from '@/config/constants';
import { ID } from '../common';
import TreeLine from './Line/TreeLine';
import { TypeDefinitionDataNode, TypeDefinitionTree } from './TypeDefinitionDataNode';
import "./index.less";

interface Props {
    tree: TypeDefinitionTree
    setTree(td: TypeDefinitionTree): void
    showJson(id: string): void
}

/**
 *  一个用于展示类型定义树的面板组件
 * @param props  需要展示的定义树
 */
const TypeDefinitionTreePanel = (props: Props) => {
    const id = ID()

    const [tree, setTree] = useState(props.tree);
    const data = useCallback(() => {
        return tree.toNode()
    }, [tree])

    const [dragged, setDragged] = useState<string[]>([]);
    const [expands, setExpands] = useState<string[]>([]);
    // const [blurLine, setBlurLine] = useState<string | null>(null)
    const [typeSelector, setTypeSelector] = useState<string>("")

    // useEffect(() => {
    //     setTree(props.tree)
    // }, [props.tree]);

    useEffect(() => {
        if (!expands.includes(tree.root)) {
            expands.push(tree.root)
            setExpands([...expands])
        }
    }, [data()])

    const onDrop: TreeProps['onDrop'] = (info) => {
        const dropKey = info.node.key as string; // 目标元素
        const dragKey = info.dragNode.key as string; // 被拖拽的元素
        // 如果dropToGap是真的,那么position就表示他是目标位置
        const position = info.dropPosition; // 元素放置的位置,即目标index,改index要和节点本身关联

        // let dragNode = tree.get(dragKey)
        const check = (id: string, td: DefaultTypeDefinition) => {
            return id !== dragKey && td.name === tree.get(dragKey).name
        }
        if (info.dropToGap) {
            if (tree.hasBrother(dropKey, check)) {
                return
            }
        } else {
            if (tree.hasChild(dropKey, check)) {
                return
            }
        }
        // 直接操作tree进行变化就可以了
        if (info.dropToGap) {
            // 拖拽了节点的缝隙,添加操作放到父节点
            if (info.node.dragOverGapTop) {
                tree.before(dragKey, dropKey)
            } else {
                tree.after(dragKey, dropKey)
            }

        } else {
            // 放了节点上,移动到节点内部
            tree.move(dragKey, dropKey, position)
        }
        setTree(tree.copy())
    };

    const cache: { [index: string]: ReactNode } = {}

    const updateTypeData = (itemId: string, td: DefaultTypeDefinition) => {
        // 更新数据类型时,需要考虑到如何处理老数据的问题,如果涉及到修改数据结构,则需要执行特殊处理,比如:
        // 修改数据定义,在有可能的情况下尽可能保证原有数据,比如,由简单类型转变为复杂类型,可以考虑将老数据迁移至其内部
        const oid = itemId as string;
        const otd = tree.get(oid);
        tree.items[itemId] = td
        if (otd.type.typeName !== td.type.typeName) {
            if (otd.type.isRaw()) {
                if (td.type.isComplex()) {
                    if (td.type.isArray()) {
                        const ai = DefaultTypeDefinition.create({
                            name: constants.ARRAY_ITEM_NAME,
                            type: ComplexType.ofType(constants.Types.TYPE_NAME_STRING)
                        })
                        tree.createChild(itemId as string, ai)
                    } else {
                        otd.id = ID()
                        tree.createChild(itemId as string, otd)
                    }
                }
            } else {
                // 复杂变换成其他
                if (td.type.isRaw()) {
                    tree.clearChild(itemId as string)
                }
            }
        }
        // tree.createChild(itemId as string,td||TypeDefinition.create())
        props.setTree(tree.copy())
    }

    // function doCrateLineLabel(d: TypeDefinitionDataNode): ReactNode {
    //     return (<div
    //         className={d.data.canDrag() ? "" : "drag-tree-disable"}
    //         onClick={(e) => {
    //             e.preventDefault()
    //             e.stopPropagation()
    //         }}
    //         key={"rc"} style={dragged.includes(d.key as string) ? {
    //             opacity: 0.3,
    //             backgroundColor: "transparent",
    //             borderRight: 12
    //         } : {}}>
    //         <Line
    //             blur={blurLine === d.key}
    //             dataNode={d}
    //             isTypeSelector={typeSelector === d.data.data.id}
    //             onTypeSelector={(id, finish) => {
    //                 if (finish) {
    //                     if (id === d.data.data.id) {
    //                         setTypeSelector("")
    //                     }
    //                 } else {
    //                     setTypeSelector(id)
    //                 }
    //             }}
    //             updateTypeData={(itemId, td) => {
    //                 updateTypeData(itemId as string, td)
    //             }}
    //             createBrother={() => {
    //                 tree.createBrother(d.key as string, false)
    //                 props.setTree(tree.copy())
    //             }}
    //             createChild={() => {
    //                 tree.createChild(d.key as string)
    //                 props.setTree(tree.copy())
    //             }}
    //             removeItem={(key) => {
    //                 tree.remove(key as string, true)
    //                 props.setTree(tree.copy())
    //             }}
    //             toObject={(key?) => {
    //                 return tree.get((key || tree.root) as string)
    //             }}
    //             showJsonView={(key?) => {
    //                 props.showJson(key as string)
    //             }}
    //         />
    //     </div>)
    // }

    // function doCreateLineChildren(d: TypeDefinitionDataNode): ReactNode {
    //     const data = d.data.data
    //     return <LineEditor
    //         td={data}
    //         tdKey={d.key as string}
    //         updateTypeData={(key, td) => {
    //             updateTypeData(key as string, td)
    //         }}
    //     />
    // }

    // 真正执行创建的方法
    function doCreate(d: TypeDefinitionDataNode): ReactNode {
        return <TreeLine
            blur={false}
            dataNode={d}
            isTypeSelector={typeSelector === d.data.data.id}
            onTypeSelector={(id, finish) => {
                if (finish) {
                    if (id === d.data.data.id) {
                        setTypeSelector("")
                    }
                } else {
                    setTypeSelector(id)
                }
            }}
            updateTypeData={(itemId, td) => {
                updateTypeData(itemId as string, td)
            }}
            createBrother={() => {
                tree.createBrother(d.key as string, false)
                props.setTree(tree.copy())
            }}
            createChild={() => {
                tree.createChild(d.key as string)
                props.setTree(tree.copy())
            }}
            removeItem={(key) => {
                tree.remove(key as string, true)
                props.setTree(tree.copy())
            }}
            toObject={(key?) => {
                return tree.get((key || tree.root) as string)
            }}
            showJsonView={(key?) => {
                props.showJson(key as string)
            }}
        />
    }

    function createOrGet(d: TypeDefinitionDataNode): ReactNode {
        if (d.key) {
            if (String(d.key) in cache) {
                return cache[String(d.key)]
            }
            cache[d.key as string] = doCreate(d)

            return cache[String(d.key)]
        }
        return <div />
    }

    return (
        <div id={id} className='type-definition-tree'>
            <Tree
                onClick={() => {
                    console.log("====");

                }}
                className="draggable-tree"
                draggable
                blockNode
                showLine

                expandedKeys={expands}

                onMouseEnter={(info) => {
                    if (typeSelector !== "" && typeSelector !== info.node.data.data.id) {
                        setTypeSelector("")
                    }
                    // setBlurLine(info.node.key as string)
                }}

                // onMouseLeave={(info) => {
                //     if (typeSelector !== "") {
                //         setTypeSelector("")
                //     }
                //     if (blurLine === info.node.key) {
                //         setBlurLine(null)
                //     }
                // }}

                allowDrop={(option) => {
                    const res = () => {
                        if (option.dropPosition === 0) {
                            // 拖拽到了节点上
                            return option.dropNode.data.canDrop()
                        }
                        // 节点上下 ,取决于节点的父节点
                        return option.dropNode.data.belong?.canDrop() || false
                    }
                    return res()
                }}

                onExpand={(_keys, info) => {
                    if (info.expanded) {
                        // 数组的element元素和父元素的展开状态一致
                        if (!expands.includes(info.node.key as string)) {
                            expands.push(info.node.key as string)
                        }
                        tree.doWitchChild(info.node.key as string, (id: string) => {
                            if (!expands.includes(id)) {
                                if (tree.getNode(id).data.isBuiltIn()) {
                                    expands.push(id)
                                }
                            }
                        })
                    } else {
                        tree.doWitchChild(info.node.key as string, (id: string) => {
                            const index = expands.indexOf(id);
                            if (index !== -1) {
                                expands.splice(index, 1)
                            }
                        })
                        const index = expands.indexOf(info.node.key as string);
                        if (index !== -1) {
                            // 将内部所有展开的元素也关闭
                            expands.splice(index, 1)
                        }
                    }
                    setExpands([...expands])
                }}
                onDragStart={(info) => {
                    if (!info.node.data.canDrag()) {
                        info.event.preventDefault()
                    }
                    setDragged([...dragged, info.node.key as string])
                }}
                onDragEnd={(info) => {
                    const index = dragged.indexOf(info.node.key as string);
                    if (index !== -1) {
                        dragged.splice(index, 1)
                        setDragged([...dragged])
                    }
                }}
                onDrop={onDrop}
                treeData={[tree.toNode()]}
                titleRender={(d) => {
                    return createOrGet(d)
                }}
            />
        </div>
    );
};

export default TypeDefinitionTreePanel;
