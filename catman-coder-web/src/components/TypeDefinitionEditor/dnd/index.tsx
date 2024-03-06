import { ComplexType, DefaultTypeDefinition } from "catman-coder-core";
import { TypeDefinitionHierarchialSchema } from "@/components/HierarchicalSchema/TypeDefinitionSchemaParse";
import IconCN from "@/components/Icon";
import { PeekTypeColor } from "@/components/TypeDefinition/common";

import { Button, Dropdown, Input, Popover, Tag, Tooltip, message } from "antd";
import type { Identifier } from "dnd-core";
import {
  CSSProperties,
  LegacyRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { XYCoord, useDrag, useDrop } from "react-dnd";
import { SelectTypePanelFactory } from "../EditorPanel/Row/SelectTypePanel";
import { TypeSelectorMenuItemFilter } from "../EditorPanel/Row/TypeSelector";
import "./index.less";

export interface DropCollect {
  handlerId: Identifier;
  isOver: boolean;
}

export interface HierarchicalConfig {
  locked: boolean;
  limit: {
    root: {
      lockType: boolean;
      lockName: boolean;
      lockDrag: boolean;
    };
  };
  type: {
    filter?: TypeSelectorMenuItemFilter;
  };
}

export const createDefaultHierarchicalConfig = (): HierarchicalConfig => {
  return {
    locked: false,
    limit: {
      root: {
        lockType: false,
        lockName: false,
        lockDrag: false,
      },
    },
    type: {
      filter: () => true,
    },
  };
};
export type HierarchicalConfigFunc = () => HierarchicalConfig;
export const HierarchicalDnd = (props: {
  treeId: string;
  schema: TypeDefinitionHierarchialSchema;
  renderChildrenIfPublic: boolean;
  index?: number;
  style?: CSSProperties | undefined;
  ref?: LegacyRef<unknown> | undefined;
  locked?: boolean;
  config?: HierarchicalConfig | HierarchicalConfigFunc;
}) => {
  const [schmea, setSchema] = useState(props.schema);
  useEffect(() => {
    setSchema(props.schema);
  }, [props.schema]);

  const config = useMemo(() => {
    if (props.config) {
      if (typeof props.config === "function") {
        return props.config();
      }
      return props.config;
    }
    return createDefaultHierarchicalConfig();
  }, [props]);

  const [selectTypeFactory, setSelectTypeFactory] = useState(
    SelectTypePanelFactory.create(),
  );

  /**
   * 是否展开折叠
   */
  const [fold, setFold] = useState(true);
  const allRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const dragref = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allRef) {
      return;
    }
    new ResizeObserver((entries, observer) => {
      console.log(
        "rect was change",
        allRef.current?.getBoundingClientRect().width,
      );
    }).observe(allRef.current!);
  }, [allRef]);

  const [{ handlerId: titleHandlerId }, titleDrop] = useDrop<
    DropCollect,
    void,
    { handlerId: Identifier | null }
  >({
    accept: "td",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver({ shallow: true }),
      };
    },
    canDrop(item, monitor) {
      return true;
    },
    drop(item, monitor) {
      monitor.didDrop();
    },
    hover(item, monitor) {
      if (!monitor.canDrop()) {
        return;
      }
      if (!titleRef.current) {
        return;
      }
      if (props.treeId === item.id) {
        return;
      }
      if (!monitor.isOver({ shallow: true })) {
        // 确保只保留最顶层响应数据
        return;
      }
      // Don't replace items with themselves,本身不处理

      // Determine rectangle on screen,获取屏幕上的矩形
      const hoverBoundingRect = titleRef.current?.getBoundingClientRect();

      // Get vertical middle 垂直的中间位置
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position 鼠标位置x
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top 鼠标位置y
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      //          仅当鼠标超过项目高度的一半时才执行移动
      //
      //          向下拖动时，仅在光标低于50%时移动
      //
      //          向上拖动时，仅当光标高于50%时才移动
      // console.log("hover", schmea.get(props.treeId).name, item);
      // console.log("pos", monitor.getClientOffset());
      // console.log("位置[上]", props.treeId, hoverClientY < hoverMiddleY);
      // console.log("x", (hoverBoundingRect.left), (hoverBoundingRect.left + 50 <= clientOffset!.x));
      const index = schmea.getIndex(props.treeId);
      const targetIndex = hoverClientY < hoverMiddleY ? index - 1 : index;
      const tryAddChild = hoverBoundingRect.left + 50 <= clientOffset!.x;

      const pid = tryAddChild
        ? schmea.canAddChild(props.treeId)
          ? props.treeId
          : schmea.findParent(props.treeId)
        : schmea.findParent(props.treeId);
      const itemId = schmea.decodeOutOrSelf(item!.id as string);
      if (tryAddChild) {
        // 尝试添加子节点
        if (schmea.canAddChild(props.treeId)) {
          // 可以添加子节点
          const oldPid = schmea.findParent(itemId);
          if (pid === oldPid) {
            const oldIndex = schmea.getIndex(itemId);
            if (oldIndex === targetIndex) {
              return;
            }
          }
          if (schmea.exist(itemId)) {
            schmea.move(itemId, pid!, targetIndex);
          } else {
            schmea.add(pid!, item.getSchema(), targetIndex, itemId);
          }

          return;
        }
      }
      if (pid) {
        const oldPid = schmea.findParent(itemId);
        if (pid === oldPid) {
          const oldIndex = schmea.getIndex(itemId);
          if (oldIndex === targetIndex) {
            return;
          }
        }
        // 继续判断
        // console.log("move", itemId, pid!, oldPid, targetIndex, schmea.getIndex(itemId));
        if (schmea.exist(itemId)) {
          schmea.move(itemId, pid!, targetIndex);
        } else {
          schmea.add(pid!, item.getSchema(), targetIndex, itemId);
        }
      }
      // 判断,距离开始位置在x轴如果超过30px,则认为是创建子元素
      // 否则则根据y轴创建兄弟节点
    },
  });

  // TODO 后续为了支持跨窗口拖拽,需要再item中携带更多的额外数据
  const [{ isDragging }, drag, preview] = useDrag({
    type: "td",
    item: () => {
      return {
        id: props.treeId,
        name: schmea.get(props.treeId).name,
        rootId: schmea.registry.root,
        getSchema: () => {
          return schmea.toTypeDefinitionSchema(props.treeId);
        },
      };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging() || monitor.getItem()?.id == props.treeId,
    }),
  });
  const [{ handlerId: childHandlerId, isOver: childIsOver }, childDrop] =
    useDrop<unknown, void, DropCollect>({
      accept: "td",
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId()?.toString() + "child",
          isOver: monitor.isOver({ shallow: true }),
        } as DropCollect;
      },
      hover(item, monitor) {
        // 暂时用不到
      },
    });
  drag(dragref);
  childDrop(childRef);
  titleDrop(titleRef);
  preview(allRef);
  const opacity = isDragging ? 0.5 : 1;
  const style = isDragging ? {} : {};
  return (
    <div
      className="type-definition-line"
      ref={allRef}
      style={{
        ...style,
        opacity,
      }}
    >
      <div
        className="type-definition-line-info"
        ref={titleRef}
        data-handler-id={titleHandlerId}
      >
        <div className="type-definition-line-drag">
          {
            <Button
              disabled={config.locked}
              size="small"
              type="link"
              ref={dragref}
              style={{
                display:
                  !config.locked && schmea.canDrag(props.treeId)
                    ? "block"
                    : "none",
              }}
              icon={<IconCN type="icon-drag1" />}
            />
          }
        </div>
        {/* <div>{props.treeId}</div> */}
        <div className="type-definition-line-fold">
          {/* 一个折叠按钮 */}
          {schmea.hasChild(props.treeId) && (
            <IconCN
              type={"icon-caidanzhedie"}
              className={`${fold ? "type-definition-line-fold-expand" : ""}`}
              onClick={() => {
                setFold(!fold);
              }}
            />
          )}
        </div>
        <div className="type-definition-line-tag-group">
          {/* 公开标记 */}
          {schmea.isPublic(props.treeId) && (
            <div className="type-definition-line-tag-public">
              <IconCN type="icon-public" />
            </div>
          )}
        </div>
        <div className="type-definition-line-name">
          <Input
            size="small"
            style={{
              color: PeekTypeColor(schmea.getType(props.treeId).typeName),
            }}
            disabled={config.locked || !schmea.canChangeName(props.treeId)}
            value={schmea.get(props.treeId).name}
            onChange={(e) => {
              // discard --- 注意,此处修改了原始数据,不会触发更新操作 ---
              schmea.change(props.treeId, (td) => {
                td.name = e.target.value;
              });
            }}
          />
        </div>
        <div className={"type-definition-tree-row-right-basic"}>
          <div className={"type-definition-tree-row-type"}>
            {selectTypeFactory.render(
              schmea.getType(props.treeId),
              (t, s) => {
                schmea.changeType(props.treeId, t, s!);
              },
              props.schema.schmea,
              config.locked || schmea.locked(props.treeId),
              config.type.filter,
            )}
          </div>
          <div className="type-definition-tree-row-required">
            <Popover
              title={
                <span>
                  是否为必填项,当前值表示:
                  <Tag>
                    {schmea.get(props.treeId).required ? "必填" : "选填"}
                  </Tag>
                </span>
              }
            >
              <IconCN
                type={
                  schmea.get(props.treeId).required
                    ? "icon-icon_required"
                    : "icon-required1"
                }
                onClick={() => {
                  schmea.change(props.treeId, (td) => {
                    td.required = !td.required;
                  });
                }}
              />
              {/* <Switch
                                size="small"
                                disabled={config.locked || !schmea.canChangeName(props.treeId)}
                                checked={schmea.get(props.treeId).required || false}
                                onClick={e => {
                                    schmea.change(props.treeId, (td) => {
                                        td.required = e
                                    })
                                }}
                            /> */}
            </Popover>
          </div>
          <div className="type-definition-tree-row-default-value">
            {/* <Popover
                            title={<span>是否为必填项,当前值表示:<Tag>{
                                schmea.get(props.treeId).required
                                    ? "必填"
                                    : "选填"
                            }</Tag></span>}
                        > */}
            <Input
              size="small"
              disabled={config.locked || !schmea.canChangeName(props.treeId)}
              addonBefore={<IconCN type="icon-function6" />}
            />
            {/* </Popover> */}
          </div>
          <div className="type-definition-tree-row-default-cheker">
            {/* <Popover
                            title={<span>是否为必填项,当前值表示:<Tag>{
                                schmea.get(props.treeId).required
                                    ? "必填"
                                    : "选填"
                            }</Tag></span>}
                        > */}
            <Input
              size="small"
              disabled={config.locked || !schmea.canChangeName(props.treeId)}
              addonBefore={<IconCN type="icon-panduanti1" />}
            />
            {/* </Popover> */}
          </div>
          <div className={"type-definition-tree-row-describe"}>
            <Input
              disabled={config.locked}
              addonBefore={<IconCN type="icon-miaoshu-copy" />}
              size={"small"}
              bordered={false}
              value={schmea.get(props.treeId).describe}
              onChange={(e) => {
                schmea.change(props.treeId, (td) => {
                  td.describe = e.target.value;
                });
              }}
              placeholder={"描述"}
            />
          </div>
        </div>
        {!config.locked && (
          <div className={"type-definition-tree-row-right-operation"}>
            {schmea.canAddChild(props.treeId) ? (
              <Tooltip
                title={
                  <span>
                    添加新的<span style={{ color: "skyblue" }}>子节点</span>
                  </span>
                }
              >
                <Button
                  disabled={schmea.locked(props.treeId)}
                  size={"small"}
                  icon={
                    <IconCN
                      type={"icon-Basic_Branch_a"}
                      onClick={() => {
                        schmea.add(
                          props.treeId,
                          DefaultTypeDefinition.createSchema({
                            name: "",
                            type: ComplexType.ofType("string"),
                          }),
                        );
                      }}
                    />
                  }
                />
              </Tooltip>
            ) : null}
            {schmea.canAddBrother(props.treeId) ? (
              <>
                <Tooltip
                  title={
                    <span>
                      添加兄弟节点到
                      <span style={{ color: "skyblue" }}>前面</span>
                    </span>
                  }
                >
                  <Button
                    disabled={schmea.locked(props.treeId)}
                    size={"small"}
                    icon={
                      <IconCN
                        type={"icon-tablerowplusbefore"}
                        onClick={() => {
                          schmea.addBrother(
                            props.treeId,
                            DefaultTypeDefinition.createSchema({
                              name: "",
                              type: ComplexType.ofType("string"),
                            }),
                            true,
                          );
                        }}
                      />
                    }
                  />
                </Tooltip>
                <Tooltip
                  title={
                    <span>
                      添加兄弟节点到
                      <span style={{ color: "skyblue" }}>后面</span>
                    </span>
                  }
                >
                  <Button
                    disabled={schmea.locked(props.treeId)}
                    size={"small"}
                    icon={
                      <IconCN
                        type={"icon-tablerowplusafter"}
                        onClick={() => {
                          schmea.addBrother(
                            props.treeId,
                            DefaultTypeDefinition.createSchema({
                              name: "",
                              type: ComplexType.ofType("string"),
                            }),
                            false,
                          );
                        }}
                      />
                    }
                  />
                </Tooltip>
              </>
            ) : null}
            {schmea.canRemove(props.treeId) ? (
              <Tooltip title={"删除"}>
                <Button
                  disabled={schmea.locked(props.treeId)}
                  size={"small"}
                  icon={
                    <IconCN
                      type={"icon-remove2-copy"}
                      onClick={() => {
                        schmea.remove(props.treeId);
                      }}
                    />
                  }
                />
              </Tooltip>
            ) : null}

            <Tooltip title={<span>高级设置</span>}>
              <Dropdown
                trigger={["click"]}
                disabled={schmea.locked(props.treeId)}
                placement="bottom"
                menu={{
                  items: [
                    {
                      key: "copy",
                      onClick: () => {
                        navigator.clipboard
                          .writeText(
                            JSON.stringify(
                              schmea.toTypeDefinitionSchema(props.treeId),
                            ),
                          )
                          .then(() => {
                            message.info("复制成功");
                          })
                          .catch(() => {
                            message.error("复制失败");
                          });
                      },
                      label: (
                        <Tooltip title={"复制元素"}>
                          <Button
                            disabled={schmea.locked(props.treeId)}
                            size={"small"}
                            icon={<IconCN type={"icon-icon-test1"} />}
                          >
                            复制元数据
                          </Button>
                        </Tooltip>
                      ),
                    },
                    {
                      key: "editor",
                      label: (
                        <Tooltip title={"导入元素"}>
                          <Button
                            disabled={schmea.locked(props.treeId)}
                            size={"small"}
                            icon={
                              <IconCN type={"icon-code4"} onClick={() => {}} />
                            }
                          >
                            编辑元数据
                          </Button>
                        </Tooltip>
                      ),
                    },
                  ],
                }}
              >
                <IconCN
                  type={"icon-more5"}
                  onClick={() => {
                    //  展示一个弹窗用于高级设置,目前想到的功能
                    //  - 解析配置,比如,是否跳过子元素赋值检查,理论上该逻辑属于Parameter的定义,但是作为类型定义默认值,会被参数定义继承
                    //    但是参数定义可以选择移除对应的配置
                  }}
                />
              </Dropdown>
            </Tooltip>
          </div>
        )}
      </div>

      {/* 渲染子元素 */}
      {fold &&
        schmea.renderChild(props.treeId, props.renderChildrenIfPublic) && (
          <div
            className={`type-definition-line-children  fade-in `}
            style={{
              paddingLeft: "30px",
            }}
            ref={childRef}
            data-handler-id={childHandlerId}
            //                            ref={setDropRef}
          >
            {schmea.getChildren(props.treeId).map((cid, index) => {
              return (
                <div>
                  <HierarchicalDnd
                    key={cid}
                    treeId={cid}
                    schema={schmea}
                    renderChildrenIfPublic={false}
                    index={index}
                    config={() => {
                      const cfg = { ...config };
                      const t = schmea.getType(props.treeId);
                      if (t.typeName === "enum") {
                        cfg.type.filter = (item) => {
                          console.log(item);

                          return ["number", "string", "boolean"].includes(
                            item.value,
                          );
                        };
                      }
                      return cfg;
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};
