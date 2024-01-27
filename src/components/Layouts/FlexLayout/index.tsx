import applicationContext from "@/ApplicationContext.tsx";
import EventBus, { Events } from "@/common/events/index.tsx";
import IconCN from "@/components/Icon";
import global from "@/config/index.tsx";
import { useLayoutContext } from "@/core";
import { DefaultLayoutNode } from "@/core/Layout";
import { useAppDispatch, useAppSelector } from "@/stores";
import { RootResourceQuery } from "@/stores/resource";
import { Button, List, Modal, Popover, Tooltip } from "antd";
import {
  Actions,
  BorderNode,
  DockLocation,
  DropInfo,
  IJsonTabNode,
  Layout,
  Model,
  Node,
  TabNode,
  TabSetNode,
} from "flexlayout-react";
import "flexlayout-react/style/light.css";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import FloatWindow from "./Float/index.tsx";
import "./index.less";

const postProcessModel = (model: Model) => {
  // 处理拖拽事件
  model.setOnAllowDrop((node: Node, dropInfo: DropInfo): boolean => {
    if (!(dropInfo.node instanceof BorderNode)) {
      return true;
    }
    // 强制类型转换
    const dg = node as unknown as TabNode;
    if (dropInfo.node.getType() === "border") {
      const supportTypes: string[] = dropInfo.node.getConfig()?.type;
      if (supportTypes) {
        return supportTypes.includes(dg.getConfig()?.type);
      }
    }

    const dropNode = dropInfo.node as BorderNode;
    if (dropNode === undefined) {
      return true;
    }

    if (dg.getType() === undefined) {
      return false;
    }
    return dropNode.getConfig().type?.includes(dg.getConfig().type) as boolean;
  });

  return model;
};

/**
 * flex布局渲染器
 */
class FlexLayoutRender implements Core.LayoutRender {
  id: string = "flex-layout-render";
  nodes: {
    [index: string]: Core.LayoutNode<unknown>;
  };
  activeTabSetId: string;
  model: Model;
  factory: Core.ComponentFactory
  constructor(model: Model, factory: Core.ComponentFactory, activeTabSetId?: string) {
    this.nodes = {};
    this.model = model;
    this.factory = factory;
    this.activeTabSetId =
      activeTabSetId ||
      this.model.getActiveTabset()?.getId() ||
      "#688e372a-3c7b-4bdd-977d-bfa6a3736f9f";
  }

  close(node: Core.LayoutNode): void {
    // 显式执行关闭时,一定要移除缓存
    this.factory.remove(node)
  }

  support(node: Core.LayoutNode): boolean {
    return node.layoutType === "tab";
  }
  render(node: Core.LayoutNode): void {
    const tab = node.toFlexLayout();
    // 进行渲染操作
    const oldTab = this.model.getNodeById(tab.id!);
    if (oldTab) {
      // 已存在,激活
      this.model.doAction(Actions.selectTab(tab.id!));
    } else {
      this.model.doAction(
        Actions.addNode(
          tab,
          this.model.getActiveTabset()!.getId(),
          DockLocation.CENTER,
          -1,
          true,
        ),
      );
      this.model.doAction(Actions.selectTab(tab.id!));
    }
  }
}

interface Position {
  x?: number;
  y?: number;
  w?: number | string;
  h?: number | string;
}

interface FloatLayoutNodeInfo {
  id: string;
  show?: boolean;
  title: React.ReactNode;
  content: ReactNode;
  zIndex: number;
  x?: number;
  y?: number;
  w?: number | string;
  h?: number | string;
  oldPosition?: Position;
  data: Core.LayoutNode<unknown>;
}

/**
 * float布局渲染器
 */
class FloatLayoutRender implements Core.LayoutRender {
  id: string = "float-layout-render";
  nodes: {
    [index: string]: Core.LayoutNode<unknown>;
  };
  factory: Core.ComponentFactory;
  windows: {
    [index: string]: FloatLayoutNodeInfo;
  };
  setWindows: React.Dispatch<
    React.SetStateAction<{ [p: string]: FloatLayoutNodeInfo }>
  >;

  constructor(
    factory: Core.ComponentFactory,
    windows: {
      [p: string]: FloatLayoutNodeInfo;
    },
    setWindows: React.Dispatch<
      React.SetStateAction<{ [p: string]: FloatLayoutNodeInfo }>
    >,
  ) {
    this.factory = factory;
    this.windows = windows;
    this.setWindows = setWindows;
    this.nodes = {};
  }

  support(node: Core.LayoutNode): boolean {
    return node.layoutType === "float";
  }

  render(node: Core.LayoutNode): void {
    // 获取对应的float配置数据
    let float = node.settings.float as FloatLayoutNodeInfo;
    if (!float.id) {
      const ln = this.windows[node.id];
      if (ln) {
        float = node.settings.float = ln;
      } else {
        // 第一次被转换为浮动窗口
        float = node.settings.float = {
          id: node.id,
          show: true,
          title: node.name,
          content: this.factory.create(node),
          zIndex: 10,
          data: node,
        } as FloatLayoutNodeInfo;
      }
    }
    // 更新浮动窗口
    this.windows[node.id] = float;
    this.setWindows({ ...this.windows });
  }
}

function FlexLayout() {
  const dispatch = useAppDispatch();
  // 加载所有的resource资源
  dispatch(RootResourceQuery());

  const [model, setModel] = useState<Model>(
    Model.fromJson(global.layout.model),
  );

  const layoutContext = useLayoutContext()!;
  const factory = layoutContext.componentRenderFactory;
  const renderFactory = layoutContext.renderFactory;
  // 开始注册布局渲染器
  // 注册flex布局渲染器
  const flexLayoutRender = new FlexLayoutRender(model, factory);
  // renderFactory.registry(flexLayoutRender)
  useEffect(() => {
    renderFactory.replace("flex-layout-render", flexLayoutRender);
  }, [model]);
  const layout = useAppSelector((state) => state.configuration).layout;

  const [openedTabs, setOpenedTabs] = useState<string[]>([]);

  // 设置弹窗
  const [settingsModal, setSettingsModal] = useState({
    show: false,
  });
  // 浮动窗口
  const [floatWindows, setFloatWindows] = useState<{
    [index: string]: FloatLayoutNodeInfo;
  }>({
    // "1": {
    //     show: true,
    //     title: "c1",
    //     content: <Input defaultValue={"c1"} />,
    //     zIndex: 10
    // },
    // "2": {
    //     show: true,
    //     title: "c2",
    //     content: <Input defaultValue={"c2"} />,
    //     zIndex: 10
    // }
  });

  useEffect(() => {
    const floatLayoutRender = new FloatLayoutRender(
      factory,
      floatWindows,
      setFloatWindows,
    );
    renderFactory.replace("float-layout-render", floatLayoutRender);
  }, [floatWindows]);
  // 注册float布局渲染器

  /**
   * 一个计算浮动窗口zIndex的换成函数
   */
  const zIndex = useCallback(() => {
    let max = 10;
    Object.keys(floatWindows).forEach((k) => {
      const fw = floatWindows[k];
      if (fw.zIndex > max) {
        max = fw.zIndex;
      }
    });
    return max;
  }, [floatWindows]);

  // const dispatch = useAppDispatch()
  // const layoutRef = useRef<Layout>(null)

  // useEffect(() => {
  //     // dispatch(LayoutQuery())
  //     // model.getBorderSet().getBorders()[0].isAutoSelectTab = true
  //     // model.doAction(Actions.selectTab("#56c90a5b-d84f-4e73-8e27-d824e21f4aa2"))
  // }, [layoutRef])

  // useEffect(() => {
  //     if (layout === undefined) {
  //         return
  //     }
  //     setModel(postProcessModel(Model.fromJson(layout?.info as unknown as IJsonModel)))
  // }, [layout])

  // 获取全局布局容器
  // const factory = global.layout.layoutFactory
  useEffect(() => {
    // 监听新增TAB事件,并根据需要执行选择或者创建操作
    EventBus.on(Events.Layout.ADD_TAB, (tab: IJsonTabNode) => {
      const node = model.getNodeById(tab.id!);
      flexLayoutRender.render();
      const layoutNode = DefaultLayoutNode.of(tab.id, tab.name, tab.component);

      layoutNode.settings.tab = tab;
      layoutNode.data = tab.config;

      layoutContext.createOrActive(layoutNode);
      // layoutContext.renderFactory.render(layoutNode)
      // flexLayoutRender.render(layoutNode)
      // if (node) {
      //     // 已存在,激活
      //     flexLayoutRender.model.doAction(Actions.selectTab(tab.id!))
      // } else {
      //     // 不存在,创建
      //     flexLayoutRender.model.doAction(Actions.addNode(tab, model.getActiveTabset()?.getId() || "#688e372a-3c7b-4bdd-977d-bfa6a3736f9f", DockLocation.CENTER, -1, true))
      // }
    });
  }, []);

  /**
   * 创建全局布局
   */
  const createLayout = () => {
    if (!model) {
      return <></>;
    } else {
      const res = (
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
          <Layout
            key={"default-layout"}
            supportsPopout={false}
            ref={global.layout.ref}
            model={model!} // 布局数据
            factory={(node) => {
              // 直接通过json提供的原始布局数据,无法通过config提取到LayoutNode数据,所以需要进行一次转换操作
              if (node.getConfig() && node.getConfig().isLayoutNode) {
                // 包含配置项,表示已经经历过了layoutNode的转换
                return factory.create(node.getConfig());
              }
              // 将tabNode转换LayoutNode
              const layoutNode = DefaultLayoutNode.of(
                node.getId(),
                node.getName(),
                node.getComponent()!,
              );
              layoutNode.settings.tab = node;
              return factory.create(layoutNode);
              // 需要进行数据填充,根据类型进行数据填充操作
              // let element = cache[node.getId()]
              // if (element !== undefined) {
              //     return element
              // }
              // flex layout 内部使用TabNode,但是工厂接受的是LayoutNode,所以此处需要进行一次转换工厂函数才可以处理
              // return factory.create(node)
            }}
            iconFactory={(node) => {
              // flex layout 内部使用TabNode,但是工厂接受的是LayoutNode,所以此处需要进行一次转换工厂函数才可以处理
              return (
                <IconCN
                  key={node.getId()}
                  className={"TypeDefinitionMenuIcon"}
                  style={{
                    color: "purple",
                    maxWidth: "25px",
                    maxHeight: "25px",
                  }}
                  type={
                    node.getIcon() || `icon-${node.getConfig()?.componentName}`
                  }
                />
              );
            }}
            onRenderTab={(node, rv) => {
              // 渲染tab页
              const nid = node.getId();
              if (
                model!
                  .getBorderSet()
                  .getBorders()
                  .some((border: BorderNode) => {
                    if (border.getLocation() !== DockLocation.LEFT) {
                      return false;
                    }
                    return border.getChildren().some((node) => {
                      return node.getId() === nid;
                    });
                  })
              ) {
                node.getIcon();
                rv.content = "";
                rv.buttons = [];
                return;
              }

              rv.content = node.getName();
              rv.buttons = [
                ...rv.buttons,
                <Tooltip title="使用弹窗编辑" placement="topLeft">
                  <IconCN
                    key={node.getId()}
                    type="icon-Tabs-1"
                    onClick={() => { }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // 将节点转换为浮窗

                      layoutContext.createOrActive(
                        DefaultLayoutNode.wrapper(node),
                        "float",
                      );
                      // floatLayoutRender.render(DefaultLayoutNode.wrapper(node))
                      // const fw = {
                      //     show: true,
                      //     title: node.getName(),
                      //     content: factory.create(node),
                      //     zIndex: zIndex() + 1
                      // }

                      // floatWindows[node.getId()] = fw
                      // setFloatWindows({ ...floatWindows })
                    }}
                  />
                </Tooltip>,
                // <Button
                //     type="text"
                //     shape="circle"
                //     icon={}
                //     onClick={(e) => {
                //         e.stopPropagation()
                //         e.preventDefault()
                //         console.log(123312);
                //         // 将节点转换为浮窗
                //         const fw = {
                //             show: true,
                //             title: node.getName(),
                //             content: factory.create(node),
                //             zIndex: zIndex() + 1
                //         }
                //         floatWindows[node.getId()] = fw
                //         setFloatWindows({ ...floatWindows })
                //     }}
                // />
              ];
            }}
            onRenderTabSet={(node, rv) => {
              // 在左下角创建一个设置按钮
              // rv.headerButtons = [<Button key={1}>1</Button>]
              if (node instanceof BorderNode) {
                if (node.getLocation() === DockLocation.LEFT) {
                  rv.buttons = [
                    <Button
                      key={2}
                      icon={<IconCN type={"icon-Settings"} />}
                      onClick={() => {
                        setSettingsModal({
                          show: true,
                        });
                      }}
                    ></Button>,
                  ];
                } else if (node.getLocation() === DockLocation.BOTTOM) {
                  rv.centerContent = [
                    <Button
                      key={2}
                      icon={<IconCN type={"icon-Settings"} />}
                    ></Button>,
                  ];
                }
              } else if (node instanceof TabSetNode) {
                rv.buttons = [
                  <Popover
                    placement="top"
                    key={node.getId()}
                    title={""}
                    content={
                      <List
                        key={node.getId()}
                        style={{
                          display: "flex",
                        }}
                        itemLayout="horizontal"
                        dataSource={Object.keys(floatWindows)}
                        renderItem={(item) => (
                          <div>
                            <Button
                              icon={
                                <IconCN
                                  type={
                                    floatWindows[item].show
                                      ? "icon-ico-show"
                                      : "icon-hideinvisiblehidden"
                                  }
                                />
                              }
                              key={`float-window${node.getId()}-${item}`}
                              onClick={() => {
                                const b = floatWindows[item];
                                // box.ref?.restore()
                                b.show = !b.show;
                                if (b.show) {
                                  b.zIndex = zIndex() + 1;
                                }
                                setFloatWindows({ ...floatWindows });
                              }}
                            >
                              {floatWindows[item].title}
                            </Button>
                          </div>
                        )}
                      />
                    }
                    trigger="hover"
                  >
                    <Button
                      key={`float-window${node.getId()}-float`}
                      icon={<IconCN type={"icon-Tabs-1"} />}
                    >
                      浮动窗口
                    </Button>
                  </Popover>,
                ];
              }
            }}
            onAction={(action) => {
              const asTabNode = (): TabNode => {
                return model.getNodeById(
                  action.data.node,
                ) as unknown as TabNode;
              };

              // 当tab发生变化时,所进行的回调操作
              switch (action.type) {
                case Actions.DELETE_TAB:
                  layoutContext.renderFactory.close(
                    asTabNode().getConfig() as Core.LayoutNode<unknown>,
                  );
                  break;
                case Actions.ADD_NODE:
                  setOpenedTabs([...openedTabs, action.data.node]);
                  break;
                case Actions.RENAME_TAB:
                  // 找到对应的resource,但不一定是resource,后面再说吧,假装没有这个功能,嘻嘻
                  // 因为能用面板展示的不一定是resource资源,所以布局元素中的不一定是resource资源
                  // 那么直接调用resource的修改接口就不行了
                  // 直接为不支持修改名称的组件设置 enableRename: false
                  // 然后通过一个类型断言,来调用resource的修改接口
                  // 如果后面有需要,再来实现这个功能
                  const resource = asTabNode().getConfig()
                    .data as Core.Resource;
                  if (action.data.text) {
                    (
                      applicationContext.resourceContext?.service?.rename(
                        resource.id,
                        action.data.text,
                      ) as unknown as Core.Resource
                    ).then((res) => {
                      const resourceDetails = res.data;
                      // 处理资源
                      applicationContext.events?.publish({
                        id: "resource-flush",
                        name: "resource-flush",
                        data: resourceDetails,
                      });
                    });
                  }
                  break;
              }
              return action;
            }}
          />
          <div className="layout-status-bar">{/* <Button>123</Button> */}</div>
        </div>
      );
      return res;
    }
  };

  return (
    <div>
      {createLayout()}
      {Object.keys(floatWindows).map((k) => {
        const fw = floatWindows[k];
        return (
          <FloatWindow
            icon={
              <IconCN type={fw.data.icon || `icon-${fw.data.componentName}`} />
            }
            key={`float-window-k-${k}`}
            {...fw}
            updateZIndex={() => {
              const zi = floatWindows[k].zIndex;
              if (zi !== 10 && zi === zIndex()) {
                // 已经在最前面了,不用改了
                return;
              }
              floatWindows[k].zIndex = zIndex() + 1;
              setFloatWindows({ ...floatWindows });
            }}
            onPin={() => {
              floatWindows[k] = { ...{ ...floatWindows[k], show: false } };
              setFloatWindows({ ...floatWindows });
            }}
            onMinimize={() => {
              if (fw.oldPosition) {
                const op = fw.oldPosition;
                floatWindows[k].x = op.x;
                floatWindows[k].y = op.y;
                floatWindows[k].w = op.w;
                floatWindows[k].h = op.h;
                setFloatWindows({ ...floatWindows });
              }
            }}
            update={({ x, y, w, h }) => {
              floatWindows[k].x = x || floatWindows[k].x;
              floatWindows[k].y = y || floatWindows[k].y;
              floatWindows[k].w = w || floatWindows[k].w;
              floatWindows[k].h = h || floatWindows[k].h;
              setFloatWindows({ ...floatWindows });
            }}
            onMaxmize={() => {
              floatWindows[k].oldPosition = {
                x: fw.x,
                y: fw.y,
                w: fw.w,
                h: fw.h,
              };
              floatWindows[k].x = 0;
              floatWindows[k].y = 0;
              floatWindows[k].w = "99vw";
              floatWindows[k].h = "99vh";
              setFloatWindows({ ...floatWindows });
            }}
            onClose={() => {
              delete floatWindows[k];
              setFloatWindows({ ...floatWindows });
            }}
          />
        );
      })}

      <Modal
        title="🐼设置"
        open={settingsModal.show}
        closable
        afterOpenChange={(open) => {
          setSettingsModal({
            show: open,
          });
        }}
        onCancel={() => {
          setSettingsModal({
            show: false,
          });
        }}
        onOk={() => {
          setSettingsModal({
            show: false,
          });
        }}
        cancelText={"cancel"}
        okText={"apply"}
      ></Modal>
    </div>
  );
}

export default FlexLayout;
