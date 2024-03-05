import React, { ReactNode } from "react";
import { Item, ItemParams, Menu, Separator, Submenu } from "react-contexify";
import IconCN from "@/core/component/Icon";
import { DefaultLayoutNode } from "@/core";

export class KindMatchResourceItemRender implements Core.ResourceItemRender {
  matchKind: string;
  renderFunction: (_resource: Core.Resource) => Core.ResourceDataNode;

  static of(
    kindName: string,
    render: (_resource: Core.Resource) => Core.ResourceDataNode
  ) {
    return new KindMatchResourceItemRender(kindName, render);
  }

  constructor(
    matchKind: string,
    render: (_resource: Core.Resource) => Core.ResourceDataNode
  ) {
    this.matchKind = matchKind;
    this.renderFunction = render;
  }

  support(resource: Core.Resource): boolean {
    return this.matchKind === resource.kind;
  }

  render(resource: Core.Resource): Core.ResourceDataNode {
    return this.renderFunction(resource);
  }
}

export class DefaultResourceItemRenderFactory
  implements Core.ResourceItemRenderFactory
{
  iconFactory?: Core.ResourceItemIconFactory;
  factories: Core.ResourceItemRender[];
  defaultResourceItemRender: Core.ResourceItemRender;
  constructor(defaultResourceItemRender: Core.ResourceItemRender) {
    this.factories = [];
    this.defaultResourceItemRender = defaultResourceItemRender;
  }

  setIconFactory(
    iconFactory: Core.ResourceItemIconFactory
  ): Core.ResourceItemRenderFactory {
    this.iconFactory = iconFactory;
    return this;
  }

  registry(render: Core.ResourceItemRender): Core.ResourceItemRenderFactory {
    this.factories.push(render);
    return this;
  }
  render(resource: Core.Resource): Core.ResourceDataNode | undefined {
    let matched = this.factories.find((factory) => factory.support(resource));
    if (!matched) {
      matched = this.defaultResourceItemRender;
    }
    const dataNode = matched?.render(resource);
    if (dataNode) {
      dataNode.icon = this.iconFactory?.render(resource) || dataNode.icon;
    }
    return dataNode;
  }
}

export class DefaultResourceItemIconRender
  implements Core.ResourceItemIconRender
{
  render(resource: Core.Resource): React.ReactNode {
    return <IconCN type={`icon-${resource.kind}`} />;
  }
  support(): boolean {
    return true;
  }
}
export class DefaultResourceItemIconFactory
  implements Core.ResourceItemIconFactory
{
  defaultResourceItemRender: Core.ResourceItemIconRender;
  renders: Core.ResourceItemIconRender[];

  constructor(defaultResourceItemRender: Core.ResourceItemIconRender) {
    this.defaultResourceItemRender = defaultResourceItemRender;
    this.renders = [];
  }

  registry(render: Core.ResourceItemIconRender): Core.ResourceItemIconFactory {
    this.renders.push(render);
    return this;
  }
  render(resource: Core.Resource): React.ReactNode {
    const render =
      this.renders.find((r) => r.support(resource)) ||
      this.defaultResourceItemRender;
    return render.render(resource);
  }
}

export interface ResourceMenuRender {
  support(menu: Core.Menu<Core.Resource>): boolean;
  render(resource: Core.Resource, menu: Core.Menu<Core.Resource>): ReactNode;
}

export interface ResourceMenuRenderFactory {
  registry(render: ResourceMenuRender): ResourceMenuRenderFactory;
  render(resource: Core.Resource, menu: Core.Menu<Core.Resource>): ReactNode;
}
function checkEmptyMenu(menu: Core.Menu<Core.Resource>): boolean {
  switch (menu.type) {
    case "submenu" || "menu":
      if (!menu.children) {
        return true;
      }
      if (menu.children?.length > 0) {
        // 找到任意一个不为空的则不为空
        return menu.children!.filter((c) => !checkEmptyMenu(c)).length === 0;
      }
      return true;
    default:
      return false;
  }
}
export class DefaultResourceMenuRenderFactory
  implements ResourceMenuRenderFactory
{
  renders: ResourceMenuRender[];
  onMenuClick?: (
    menu: Core.Menu<Core.Resource>,
    resource: Core.Resource,
    itemParams: ItemParams
  ) => void;
  constructor() {
    const other = this;
    this.onMenuClick = (
      _menu: Core.Menu<Core.Resource>,
      _resource: Core.Resource,
      _itemParams: ItemParams
    ) => {
      // 推送事件
    };
    const onMenuClickWrapper = (
      menu: Core.Menu<Core.Resource>,
      resource: Core.Resource,
      itemParams: ItemParams
    ) => {
      if (menu.onMenuClick) {
        menu.onMenuClick(menu, resource, itemParams);
      } else if (this.onMenuClick) {
        this.onMenuClick(menu, resource, itemParams);
      }
    };

    this.renders = [
      {
        support(menu: Core.Menu<Core.Resource>): boolean {
          return menu.type == "menu";
        },
        render(
          resource: Core.Resource,
          menu: Core.Menu<Core.Resource>
        ): ReactNode {
          if (menu.filter!(resource)) {
            if (checkEmptyMenu(menu)) {
              return;
            }
            return (
              <Menu key={menu.id} id={menu.id!}>
                {menu.children?.map((c) => other.render(resource, c))}
              </Menu>
            );
          }
        },
      },
      {
        support(menu: Core.Menu<Core.Resource>): boolean {
          return menu.type === "item";
        },
        render(
          resource: Core.Resource,
          menu: Core.Menu<Core.Resource>
        ): ReactNode {
          if (menu.filter!(resource)) {
            return (
              <>
                {menu.renderMenuItem &&
                  menu.renderMenuItem(
                    menu,
                    resource,
                    <Item
                      key={menu.id}
                      id={menu.id}
                      data={menu.data}
                      onClick={(params: ItemParams) => {
                        onMenuClickWrapper(menu, resource, params);
                      }}
                    >
                      {typeof menu.label === "function"
                        ? menu.label(menu, resource)
                        : menu.label}
                    </Item>
                  )}
                {!menu.renderMenuItem && (
                  <Item
                    key={menu.id}
                    id={menu.id}
                    data={menu.data}
                    onClick={(params) => {
                      onMenuClickWrapper(menu, resource, params);
                    }}
                  >
                    {typeof menu.label === "function"
                      ? menu.label(menu, resource)
                      : menu.label}
                  </Item>
                )}
              </>
            );
          }
        },
      },
      {
        support(menu: Core.Menu<Core.Resource>): boolean {
          return menu.type === "separator";
        },
        render(): ReactNode {
          return <Separator />;
        },
      },
      {
        support(menu: Core.Menu<Core.Resource>): boolean {
          return menu.type === "submenu";
        },
        render(
          resource: Core.Resource,
          menu: Core.Menu<Core.Resource>
        ): ReactNode {
          if (checkEmptyMenu(menu)) {
            return;
          }
          if (menu.filter!(resource)) {
            return (
              <Submenu
                key={menu.id}
                label={
                  typeof menu.label === "function"
                    ? menu.label(menu, resource)
                    : menu.label
                }
                onClick={(_e) => {
                  onMenuClickWrapper(menu, resource, {} as ItemParams);
                }}
              >
                {menu.children?.map((c) => other.render(resource, c))}
              </Submenu>
            );
          }
        },
      },
    ];
  }
  render(
    resource: Core.Resource,
    menu: Core.Menu<Core.Resource>
  ): React.ReactNode {
    if (!menu.filter) {
      menu.filter = () => true;
    }
    return this.renders.find((r) => r.support(menu))?.render(resource, menu);
  }

  registry(render: ResourceMenuRender): ResourceMenuRenderFactory {
    this.renders.push(render);
    return this;
  }
}

export class DefaultResourceMenuContext implements Core.ResourceMenuContext {
  resourceMenus: Core.Menu<Core.Resource>;
  resourceMenuRenderFactory: ResourceMenuRenderFactory;

  constructor(resourceMenus: Core.Menu<Core.Resource>) {
    this.resourceMenus = resourceMenus;
    this.resourceMenuRenderFactory = new DefaultResourceMenuRenderFactory();
  }
  recursion(
    menu: Core.Menu<Core.Resource>,
    handler: (
      menu: Core.Menu<Core.Resource>,
      parent?: Core.Menu<Core.Resource>
    ) => boolean
  ): boolean {
    const next = handler(menu, undefined);
    if (next) {
      const child = menu.children || [];
      for (let c of child) {
        if (!this.recursion(c, handler)) {
          return false;
        }
      }
    }
    return false;
  }

  deep(
    handler: (
      menu: Core.Menu<Core.Resource>,
      parent?: Core.Menu<Core.Resource>
    ) => boolean
  ) {
    const m = this.menus();
    this.recursion(m, handler);
  }

  showMenus(resource: Core.Resource) {
    return this.resourceMenuRenderFactory.render(resource, this.resourceMenus);
  }

  menus(): Core.Menu<Core.Resource> {
    return this.resourceMenus;
  }

  process(handler: (context: Core.ResourceMenuContext) => void) {
    handler(this);
  }

  render(resource: Core.Resource): React.ReactNode {
    const render = this.resourceMenuRenderFactory.render(
      resource,
      this.resourceMenus
    );
    return render;
  }
}
export class DefaultResourceViewer implements Core.ResourceViewer {
  support(): boolean {
    return true;
  }
  render(
    resource: Core.ResourceDetails<unknown>,
    _context: Core.ApplicationContext,
    layout: Core.LayoutContext
  ): void {
    console.log("require view for resource", resource);
    const resourceDetails = resource as Core.ResourceDetails<unknown>;
    const layoutNode = DefaultLayoutNode.ofResource(resourceDetails);
    layoutNode.componentName = "defaultResourceViewer";
    // 调用上下文展示资源
    layoutNode.settings.tab = {
      id: resourceDetails.id,
      name: resourceDetails.name,
      icon: `icon-${resourceDetails.kind}`,
      component: "defaultResourceViewer",
      enableFloat: true,
    };

    layoutNode.config = {
      data: resourceDetails,
    };

    layout.createOrActive(layoutNode, "tab");
    return;
  }
}

export class DefaultResourceViewerFactory
  implements Core.ResourceViewerFactory
{
  viewers: Core.ResourceViewer[];
  defaultViewer: Core.ResourceViewer;
  constructor(defaultViewer?: Core.ResourceViewer) {
    this.viewers = [];
    this.defaultViewer = defaultViewer || new DefaultResourceViewer();
  }
  registry(viewer: Core.ResourceViewer): Core.ResourceViewerFactory {
    this.viewers.push(viewer);
    return this;
  }

  view(
    resource: Core.ResourceDetails<unknown>,
    context: Core.ApplicationContext,
    layoutContext: Core.LayoutContext
  ): void {
    const viewer = this.viewers.find((v) => v.support(resource));
    if (viewer) {
      return viewer.render(resource, context, layoutContext);
    } else {
      return this.defaultViewer.render(resource, context, layoutContext);
    }
  }
}
export class DefaultResourceExplorerContext
  implements Core.ResourceExplorerContext
{
  itemRenderFactory?: Core.ResourceItemRenderFactory;
  menuContext?: Core.ResourceMenuContext;
  viewFactory?: Core.ResourceViewerFactory;

  setResourceItemRenderFactory(
    itemRenderFactory: Core.ResourceItemRenderFactory
  ): Core.ResourceExplorerContext {
    this.itemRenderFactory = itemRenderFactory;
    return this;
  }

  setResourceMenuContext(
    menuContext: Core.ResourceMenuContext
  ): Core.ResourceExplorerContext {
    this.menuContext = menuContext;
    return this;
  }
  setResourceViewerFactory(
    viewFactory: Core.ResourceViewerFactory
  ): Core.ResourceExplorerContext {
    this.viewFactory = viewFactory;
    return this;
  }

  flush(_resource: Core.Resource) {}
}

export class KindMatchResourceViewer implements Core.ResourceViewer {
  kind: string;
  viewer: Core.ResourceViewerFunction;
  static of(kind: string, viewer: Core.ResourceViewerFunction) {
    return new KindMatchResourceViewer(kind, viewer);
  }
  constructor(kind: string, viewer: Core.ResourceViewerFunction) {
    this.kind = kind;
    this.viewer = viewer;
  }

  support(resource: Core.Resource): boolean {
    return this.kind === resource.kind;
  }

  render(
    resource: Core.ResourceDetails<unknown>,
    context: Core.ApplicationContext,
    layoutContext: Core.LayoutContext
  ): void {
    this.viewer(resource, context, layoutContext);
  }
}

export class DefaultResourceContext implements Core.ResourceContext {
  explorer?: Core.ResourceExplorerContext;
  service?: Core.ResourceService;
  applicationContext?: Core.ApplicationContext;
  store?: {};

  setResourceExplorerContext(
    explorer: Core.ResourceExplorerContext
  ): Core.ResourceContext {
    this.explorer = explorer;
    return this;
  }
  setResourceStore(store: {}) {
    this.store = store;
    return this;
  }
  setResourceService(service: Core.ResourceService): Core.ResourceContext {
    this.service = service;
    return this;
  }

  setApplicationContext(
    applicationContext: Core.ApplicationContext
  ): Core.ResourceContext {
    this.applicationContext = applicationContext;
    return this;
  }

  showModel(node: ReactNode) {
    const context = this.applicationContext;
    context?.events?.publish({
      id: "resource-show-model",
      name: "resource-show-model",
      data: node,
    });
  }
  closeModel() {
    const context = this.applicationContext;
    context?.events?.publish({
      id: "resource-close-model",
      name: "resource-show-model",
      data: true,
    });
  }
  register(kind: string, register: Core.ResourceRegistry) {
    // 依次执行register的注册方法
    if (register.itemRender) {
      const itemRender = register.itemRender(
        this.applicationContext!,
        this.explorer!.itemRenderFactory!
      );
      if (itemRender) {
        // 判断是方法还是对象
        if (typeof itemRender === "function") {
          this.explorer?.itemRenderFactory?.registry(
            KindMatchResourceItemRender.of(kind, itemRender)
          );
        } else {
          this.explorer?.itemRenderFactory?.registry(itemRender);
        }
      }
    }

    register.registerItemRender &&
      register.registerItemRender(
        this.applicationContext!,
        this.explorer!.itemRenderFactory!
      );

    if (register.iconRender) {
      const iconRender = register.iconRender(
        this.applicationContext!,
        this.explorer!.itemRenderFactory!.iconFactory!
      );
      if (iconRender) {
        if (typeof iconRender === "function") {
          this.explorer?.itemRenderFactory?.iconFactory?.registry(
            KindMatchResourceItemRender.of(kind, iconRender)
          );
        } else {
          this.explorer?.itemRenderFactory?.iconFactory?.registry(iconRender);
        }
      }
    }
    register.registerIconRender &&
      register.registerIconRender(
        this.applicationContext!,
        this.explorer!.itemRenderFactory!.iconFactory!
      );

    register.registerResourceContextMenu &&
      register.registerResourceContextMenu(
        this.applicationContext!,
        this.explorer!.menuContext
      );

    if (register.componentCreator) {
      const componentCreator = register.componentCreator(
        this.applicationContext!,
        this.applicationContext!.layoutContext!
      );
      if (componentCreator) {
        if (typeof componentCreator === "function") {
          this.applicationContext?.layoutContext?.componentRenderFactory.nameMatch(
            kind,
            componentCreator
          );
        } else {
          this.applicationContext?.layoutContext?.componentRenderFactory.add([
            componentCreator,
          ]);
        }
      }
    }

    register.registerComponentCreator &&
      register.registerComponentCreator(
        this.applicationContext!,
        this.applicationContext!.layoutContext!
      );

    if (register.resourceViewer) {
      const viewer = register.resourceViewer(this.applicationContext!);
      if (viewer) {
        if (typeof viewer === "function") {
          this.applicationContext?.resourceContext?.explorer?.viewFactory?.registry(
            KindMatchResourceViewer.of(kind, viewer)
          );
        } else {
          this.applicationContext?.resourceContext?.explorer?.viewFactory?.registry(
            viewer
          );
        }
      }
    }
    register.registerResourceViewer &&
      register.registerResourceViewer(
        this.applicationContext!,
        this.applicationContext!.resourceContext!.explorer!.viewFactory!
      );
  }
}

const defaultResourceItemRenderFactory = new DefaultResourceItemRenderFactory({
  support(_resource: Core.Resource): boolean {
    return true;
  },
  render(res: Core.Resource): Core.ResourceDataNode {
    return {
      key: res.id,
      title: res.name,
      kind: res.kind,
      resourceId: res.resourceId,
      isLeaf: res.isLeaf,
      icon: <IconCN type={"json"} />,
      children: [],
      resource: res,
    } as Core.ResourceDataNode;
  },
});

defaultResourceItemRenderFactory
  .registry(
    KindMatchResourceItemRender.of("td", (res) => {
      return {
        key: res.id,
        title: res.name,
        kind: res.kind,
        resourceId: res.resourceId,
        isLeaf: res.isLeaf,
        icon: <IconCN type={"json"} />,
        children: [],
        resource: res,
      };
    })
  )
  .registry(
    KindMatchResourceItemRender.of("resource", (res) => {
      return {
        key: res.id,
        title: res.name,
        kind: res.kind,
        resourceId: res.resourceId,
        isLeaf: res.isLeaf,
        icon: <IconCN type={"&#xe61c;"} />,
        children: [],
        resource: res,
      };
    })
  );
