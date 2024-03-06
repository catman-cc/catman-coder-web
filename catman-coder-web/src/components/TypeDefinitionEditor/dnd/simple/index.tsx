import { TypeDefinitionHierarchialSchema } from "@/components/HierarchicalSchema/TypeDefinitionSchemaParse";
import IconCN from "@/components/Icon";
import { PeekTypeColor } from "@/components/TypeDefinition/common";
import { Tag } from "antd";
import { CSSProperties, LegacyRef, useEffect, useMemo, useState } from "react";
import { HierarchicalConfig, HierarchicalConfigFunc, createDefaultHierarchicalConfig } from "..";
import "./index.less";
/**
 *  一个独立的简单视图,其主要目的是为了在function编辑器下,提供一个简单的视图,取代编辑视图
 */
export interface TypeDefinitionViewProps {
    treeId: string
    schema: TypeDefinitionHierarchialSchema
    renderChildrenIfPublic: boolean
    index?: number
    style?: CSSProperties | undefined;
    ref?: LegacyRef<unknown> | undefined;
    locked?: boolean
    config?: HierarchicalConfig | HierarchicalConfigFunc
}
/**
 *  一个简单的类型定义视图,应该至少包含下面几个数据:
 *  - 折叠按钮: 为了控制循环引用渲染
 *  - name: 名称
 *  - type: 类型
 *  - describe: 描述信息
 * @param props 
 */
export const TypeDefinitionView = (props: TypeDefinitionViewProps) => {
    const [schmea, setSchema] = useState(props.schema)
    useEffect(() => {
        setSchema(props.schema)
    }, [props.schema])

    const [fold, setFold] = useState(true)
    const config = useMemo(() => {
        if (props.config) {
            if (typeof props.config === "function") {
                return props.config()
            }
            return props.config
        }
        return createDefaultHierarchicalConfig()
    }, [props])

    return (
        <div className="typedefinition-view">
            <div className="typedefinition-view-body">
                <div>
                    {schmea.hasChild(props.treeId) && (
                        <IconCN type={"icon-caidanzhedie"}
                            className={`${fold ? "type-definition-line-fold-expand" : ""}`}
                            onClick={() => {
                                setFold(!fold)
                            }} />
                    )}
                </div>
                <div>
                    <Tag
                        style={{
                            color: PeekTypeColor(schmea.getType(props.treeId).typeName)
                        }}
                        color="white"
                    // color={PeekTypeColor(schmea.getType(props.treeId).typeName)}
                    >
                        {schmea.get(props.treeId).name}
                        {/* <Paragraph
                            style={{
                                color: PeekTypeColor(schmea.getType(props.treeId).typeName)
                                , height: "1rem"
                            }}
                            color="white"
                            copyable={
                                {
                                    text: schmea.get(props.treeId).name,
                                    tooltips: "复制名称"
                                }
                            }
                        >
                            {schmea.get(props.treeId).name}
                        </Paragraph> */}

                    </Tag>
                </div>
                <div>
                    <Tag
                        style={{
                            // color: PeekTypeColor(schmea.getType(props.treeId).typeName)
                            backgroundColor: "transparent",
                            border: "unset"
                        }}

                    // color={PeekTypeColor(schmea.getType(props.treeId).typeName)}
                    >
                        {schmea.getType(props.treeId).typeName}
                    </Tag>
                </div>
                <div>
                    <small
                        style={{
                            color: "gray"
                        }}
                    > {schmea.get(props.treeId).describe}</small>
                </div>
            </div>
            <div className="typedefinition-view-children">
                <div>
                    {fold && schmea.renderChild(props.treeId, props.renderChildrenIfPublic) && (
                        schmea.getChildren(props.treeId).map((cid, index) => {
                            return <div
                            >
                                <TypeDefinitionView
                                    key={cid}
                                    treeId={cid} schema={schmea} renderChildrenIfPublic={false} index={index}
                                    config={() => {
                                        const cfg = { ...config }
                                        const t = schmea.getType(props.treeId)
                                        if (t.typeName === "enum") {
                                            cfg.type.filter = (item) => {
                                                console.log(item);

                                                return ["number", "string", "boolean"].includes(item.value)
                                            }
                                        }
                                        return cfg
                                    }}
                                />
                            </div>
                        })
                    )}
                </div>
            </div>
        </div>
    )
}