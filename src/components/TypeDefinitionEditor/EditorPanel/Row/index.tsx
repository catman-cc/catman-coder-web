import { TypeDefinitionSchemaTree } from "@/components/TypeDefinitionEditor/EditorPanel";
import { useCallback, useEffect, useState } from "react";
import "./index.less";
import { Button, Input, InputRef, message, Popover, Tooltip } from "antd";
import { PeekTypeColor } from "@/components/TypeDefinitionEditor/EditorPanel/Row/TypeSelector/common.tsx";
import IconCN from "@/components/Icon";
import { SelectTypePanelFactory } from "@/components/TypeDefinitionEditor/EditorPanel/Row/SelectTypePanel";
export const TreeRow = (props: {
  tree: TypeDefinitionSchemaTree;
  onChange: (tree: TypeDefinitionSchemaTree) => void;
  nameRefs: { [index: string]: InputRef };
  addNameRef: (id: string, ref: InputRef) => void;
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectTypeFactory, setSelectTypeFactory] = useState(
    SelectTypePanelFactory.create(),
  );

  const maxLevel = useCallback(() => {
    return props.tree.maxLevel();
  }, [props.tree]);

  if (!props.tree.getTypeDefinition()) {
    return null;
  }

  // 名称,类型,别名,描述
  return (
    <div className={"type-definition-tree-row"}>
      {contextHolder}
      <div className={"type-definition-tree-row-name"}>
        <Input
          status={"error"}
          style={{
            color: PeekTypeColor(props.tree.getTypeDefinition().type.typeName),
          }}
          ref={(ref) => {
            if (ref) {
              if (!props.nameRefs[props.tree.getTypeDefinition().id!]) {
                props.addNameRef(props.tree.getTypeDefinition().id!, ref);
              }
            }
          }}
          disabled={!props.tree.canRename()}
          size={"small"}
          bordered={false}
          value={props.tree.getTypeDefinition().name}
          onChange={(e) => {
            props.tree.getTypeDefinition().name = e.target.value;
            props.onChange(props.tree);
          }}
          placeholder={"参数名称"}
        />
      </div>
      <div
        className={"type-definition-tree-row-right"}
        style={{
          left: `${(maxLevel() - props.tree.getLevel()) * 24 - 14}px`,
        }}
      >
        <div className={"type-definition-tree-row-right-basic"}>
          <div className={"type-definition-tree-row-type"}>
            {selectTypeFactory.render(
              props.tree.getTypeDefinition().type,
              (t) => {
                console.log("change type definition type", t);
                props.tree.updateType(t);
                // props.tree.getTypeDefinition().type = t;
                props.onChange(props.tree);
              },
              props.tree.schema,
            )}
            {/*{props.tree.maxLevel()} , {props.tree.getLevel()}*/}
          </div>
          <div className={"type-definition-tree-row-describe"}>
            <Input
              size={"small"}
              bordered={false}
              value={props.tree.getTypeDefinition().describe}
              placeholder={"描述"}
            />
          </div>
        </div>
        <div className={"type-definition-tree-row-right-operation"}>
          {props.tree.circularReference ? (
            <Tooltip
              title={
                <span>
                  和索引值为
                  <span
                    style={{
                      backgroundColor: "red",
                      color: "white",
                    }}
                  >
                    {props.tree.schema.circularRefs!.indexOf(
                      props.tree.getTypeDefinition().id!,
                    ) + 1}
                  </span>
                  的类型定义之间存在
                  <span style={{ color: "skyblue" }}>
                    循环引用,此处隐藏内部数据结构
                  </span>
                </span>
              }
            >
              <Button
                size={"small"}
                icon={
                  <IconCN
                    type={"icon-tubiaozhizuomoban"}
                    style={{ color: "red" }}
                  />
                }
              />
            </Tooltip>
          ) : null}
          {props.tree.canAddChild() ? (
            <Tooltip
              title={
                <span>
                  添加新的<span style={{ color: "skyblue" }}>子节点</span>
                </span>
              }
            >
              <Button
                size={"small"}
                icon={
                  <IconCN
                    type={"icon-Basic_Branch_a"}
                    onClick={() => {
                      const res = props.tree.createChildFromTypeName(
                        "string",
                        "",
                      );
                      if (res.msg) {
                        messageApi.warning(res.msg);
                        props.nameRefs[res.id]?.focus();
                      }
                      props.onChange(props.tree);
                    }}
                  />
                }
              />
            </Tooltip>
          ) : null}
          {props.tree.canHasBrother() ? (
            <div>
              <Tooltip
                title={
                  <span>
                    添加兄弟节点到<span style={{ color: "skyblue" }}>前面</span>
                  </span>
                }
              >
                <Button
                  size={"small"}
                  icon={
                    <IconCN
                      type={"icon-tablerowplusbefore"}
                      onClick={() => {
                        const err = props.tree.createBrotherFromTypeName(
                          "string",
                          "",
                          true,
                        );
                        if (err) {
                          messageApi.warning(err.msg);
                          props.nameRefs[err.id]?.focus();
                        }
                        props.onChange(props.tree);
                      }}
                    />
                  }
                />
              </Tooltip>
              <Tooltip
                title={
                  <span>
                    添加兄弟节点到<span style={{ color: "skyblue" }}>后面</span>
                  </span>
                }
              >
                <Button
                  size={"small"}
                  icon={
                    <IconCN
                      type={"icon-tablerowplusafter"}
                      onClick={() => {
                        const err = props.tree.createBrotherFromTypeName(
                          "string",
                          "",
                          false,
                        );
                        if (err) {
                          messageApi.warning(err.msg);
                          props.nameRefs[err.id]?.focus();
                        }
                        props.onChange(props.tree);
                      }}
                    />
                  }
                />
              </Tooltip>
            </div>
          ) : null}
          {props.tree.canRemove() ? (
            <Tooltip title={"删除"}>
              <Button
                size={"small"}
                icon={
                  <IconCN
                    type={"icon-remove2-copy"}
                    onClick={() => {
                      props.tree.remove();
                      props.onChange(props.tree);
                    }}
                  />
                }
              />
            </Tooltip>
          ) : null}
          <div>
            <Tooltip
              title={
                props.tree.isPublic()
                  ? "当前节点已公开"
                  : "当前定义为私有定义,是否公开"
              }
            >
              <Button
                size={"small"}
                disabled={props.tree.isPublic()}
                icon={
                  <IconCN
                    type={
                      props.tree.isPublic() ? "icon-lock_is_open1" : "icon-lock"
                    }
                    onClick={() => {}}
                  />
                }
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
