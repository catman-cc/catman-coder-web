import React, { ReactNode } from "react";
import { Item, ItemParams, Separator, Submenu } from "react-contexify";
import { Menu as RcMenu } from "react-contexify";
import IconCN from "@/core/component/Icon";
import { DefaultLayoutNode } from "@/core";
import {
  IApplicationContext,
  LayoutContext,
  Menu,
  Resource,
  ResourceContext,
  ResourceDataNode,
  ResourceDetails,
  ResourceExplorerContext,
  ResourceItemIconFactory,
  ResourceItemIconRender,
  ResourceItemRender,
  ResourceItemRenderFactory,
  ResourceMenuContext,
  ResourceRegistry,
  ResourceService,
  ResourceViewer,
  ResourceViewerFactory,
  ResourceViewerFunction,
} from "@/core/entity/Common";
export class KindMatchResourceItemIconRender implements ResourceItemIconRender {
  matchKind: string;
  renderFunction: (_resource: Resource) => React.ReactNode;
  public static of(
    kindName: string,
    render: (_resource: Resource) => React.ReactNode
  ) {
    return new KindMatchResourceItemIconRender(kindName, render);
  }

  constructor(
    matchKind: string,
    renderFunction: (_resource: Resource) => React.ReactNode
  ) {
    this.matchKind = matchKind;
    this.renderFunction = renderFunction;
  }

  render(resource: Resource): React.ReactNode {
    return this.renderFunction(resource);
  }

  support(resource: Resource): boolean {
    return this.matchKind === resource.kind;
  }
}

export class KindMatchResourceItemRender implements ResourceItemRender {
  matchKind: string;
  renderFunction: (_resource: Resource) => ResourceDataNode;

  static of(
    kindName: string,
    render: (_resource: Resource) => ResourceDataNode
  ) {
    return new KindMatchResourceItemRender(kindName, render);
  }

  constructor(
    matchKind: string,
    render: (_resource: Resource) => ResourceDataNode
  ) {
    this.matchKind = matchKind;
    this.renderFunction = render;
  }

  support(resource: Resource): boolean {
    return this.matchKind === resource.kind;
  }

  render(resource: Resource): ResourceDataNode {
    return this.renderFunction(resource);
  }
}

export class DefaultResourceItemRenderFactory
  implements ResourceItemRenderFactory
{
  iconFactory?: ResourceItemIconFactory;
  factories: ResourceItemRender[];
  defaultResourceItemRender: ResourceItemRender;
  constructor(defaultResourceItemRender: ResourceItemRender) {
    this.factories = [];
    this.defaultResourceItemRender = defaultResourceItemRender;
  }

  setIconFactory(
    iconFactory: ResourceItemIconFactory
  ): ResourceItemRenderFactory {
    this.iconFactory = iconFactory;
    return this;
  }

  registry(render: ResourceItemRender): ResourceItemRenderFactory {
    this.factories.push(render);
    return this;
  }
  render(resource: Resource): ResourceDataNode | undefined {
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

export class DefaultResourceItemIconRender implements ResourceItemIconRender {
  render(resource: Resource): React.ReactNode {
    return <IconCN type={`icon-${resource.kind}`} />;
  }
  support(): boolean {
    return true;
  }
}
export class DefaultResourceItemIconFactory implements ResourceItemIconFactory {
  defaultResourceItemRender: ResourceItemIconRender;
  renders: ResourceItemIconRender[];

  constructor(defaultResourceItemRender: ResourceItemIconRender) {
    this.defaultResourceItemRender = defaultResourceItemRender;
    this.renders = [];
  }

  registry(render: ResourceItemIconRender): ResourceItemIconFactory {
    this.renders.push(render);
    return this;
  }
  render(resource: Resource): React.ReactNode {
    const render =
      this.renders.find((r) => r.support(resource)) ||
      this.defaultResourceItemRender;
    return render.render(resource);
  }
}

export interface ResourceMenuRender {
  support(menu: Menu<Resource>): boolean;
  render(resource: Resource, menu: Menu<Resource>): ReactNode;
}

export interface ResourceMenuRenderFactory {
  registry(render: ResourceMenuRender): ResourceMenuRenderFactory;
  render(resource: Resource, menu: Menu<Resource>): ReactNode;
}
function checkEmptyMenu(menu: Menu<Resource>): boolean {
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
    menu: Menu<Resource>,
    resource: Resource,
    itemParams: ItemParams
  ) => void;
  constructor() {
    const other = this;
    this.onMenuClick = (
      _menu: Menu<Resource>,
      _resource: Resource,
      _itemParams: ItemParams
    ) => {
      // 推送事件
    };
    const onMenuClickWrapper = (
      menu: Menu<Resource>,
      resource: Resource,
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
        support(menu: Menu<Resource>): boolean {
          return menu.type == "menu";
        },
        render(resource: Resource, menu: Menu<Resource>): ReactNode {
          if (menu.filter!(resource)) {
            if (checkEmptyMenu(menu)) {
              return;
            }
            return (
              <RcMenu key={menu.id} id={menu.id!}>
                {menu.children?.map((c) => other.render(resource, c))}
              </RcMenu>
            );
          }
        },
      },
      {
        support(menu: Menu<Resource>): boolean {
          return menu.type === "item";
        },
        render(resource: Resource, menu: Menu<Resource>): ReactNode {
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
        support(menu: Menu<Resource>): boolean {
          return menu.type === "separator";
        },
        render(): ReactNode {
          return <Separator />;
        },
      },
      {
        support(menu: Menu<Resource>): boolean {
          return menu.type === "submenu";
        },
        render(resource: Resource, menu: Menu<Resource>): ReactNode {
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
  render(resource: Resource, menu: Menu<Resource>): React.ReactNode {
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

export class DefaultResourceMenuContext implements ResourceMenuContext {
  resourceMenus: Menu<Resource>;
  resourceMenuRenderFactory: ResourceMenuRenderFactory;

  constructor(resourceMenus: Menu<Resource>) {
    this.resourceMenus = resourceMenus;
    this.resourceMenuRenderFactory = new DefaultResourceMenuRenderFactory();
  }
  recursion(
    menu: Menu<Resource>,
    handler: (menu: Menu<Resource>, parent?: Menu<Resource>) => boolean
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

  deep(handler: (menu: Menu<Resource>, parent?: Menu<Resource>) => boolean) {
    const m = this.menus();
    this.recursion(m, handler);
  }

  showMenus(resource: Resource) {
    return this.resourceMenuRenderFactory.render(resource, this.resourceMenus);
  }

  menus(): Menu<Resource> {
    return this.resourceMenus;
  }

  process(handler: (context: ResourceMenuContext) => void) {
    handler(this);
  }

  render(resource: Resource): React.ReactNode {
    const render = this.resourceMenuRenderFactory.render(
      resource,
      this.resourceMenus
    );
    return render;
  }
}
export class DefaultResourceViewer implements ResourceViewer {
  support(): boolean {
    return true;
  }
  render(
    resource: ResourceDetails<unknown>,
    _context: IApplicationContext,
    layout: LayoutContext
  ): void {
    console.log("require view for resource", resource);
    const resourceDetails = resource as ResourceDetails<unknown>;
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

export class DefaultResourceViewerFactory implements ResourceViewerFactory {
  viewers: ResourceViewer[];
  defaultViewer: ResourceViewer;
  constructor(defaultViewer?: ResourceViewer) {
    this.viewers = [];
    this.defaultViewer = defaultViewer || new DefaultResourceViewer();
  }
  registry(viewer: ResourceViewer): ResourceViewerFactory {
    this.viewers.push(viewer);
    return this;
  }

  view(
    resource: ResourceDetails<unknown>,
    context: IApplicationContext,
    layoutContext: LayoutContext
  ): void {
    const viewer = this.viewers.find((v) => v.support(resource));
    if (viewer) {
      return viewer.render(resource, context, layoutContext);
    } else {
      return this.defaultViewer.render(resource, context, layoutContext);
    }
  }
}
export class DefaultResourceExplorerContext implements ResourceExplorerContext {
  itemRenderFactory?: ResourceItemRenderFactory;
  menuContext?: ResourceMenuContext;
  viewFactory?: ResourceViewerFactory;

  setResourceItemRenderFactory(
    itemRenderFactory: ResourceItemRenderFactory
  ): ResourceExplorerContext {
    this.itemRenderFactory = itemRenderFactory;
    return this;
  }

  setResourceMenuContext(
    menuContext: ResourceMenuContext
  ): ResourceExplorerContext {
    this.menuContext = menuContext;
    return this;
  }
  setResourceViewerFactory(
    viewFactory: ResourceViewerFactory
  ): ResourceExplorerContext {
    this.viewFactory = viewFactory;
    return this;
  }

  flush(_resource: Resource) {}
}

export class KindMatchResourceViewer implements ResourceViewer {
  kind: string;
  viewer: ResourceViewerFunction;
  static of(kind: string, viewer: ResourceViewerFunction) {
    return new KindMatchResourceViewer(kind, viewer);
  }
  constructor(kind: string, viewer: ResourceViewerFunction) {
    this.kind = kind;
    this.viewer = viewer;
  }

  support(resource: Resource): boolean {
    return this.kind === resource.kind;
  }

  render(
    resource: ResourceDetails<unknown>,
    context: IApplicationContext,
    layoutContext: LayoutContext
  ): void {
    this.viewer(resource, context, layoutContext);
  }
}

export class DefaultResourceContext implements ResourceContext {
  explorer?: ResourceExplorerContext;
  service?: ResourceService;
  applicationContext?: IApplicationContext;
  store?: {};

  setResourceExplorerContext(
    explorer: ResourceExplorerContext
  ): ResourceContext {
    this.explorer = explorer;
    return this;
  }
  setResourceStore(store: {}) {
    this.store = store;
    return this;
  }
  setResourceService(service: ResourceService): ResourceContext {
    this.service = service;
    return this;
  }

  setApplicationContext(
    applicationContext: IApplicationContext
  ): ResourceContext {
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
  register(kind: string, register: ResourceRegistry) {
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
            KindMatchResourceItemIconRender.of(
              kind,
              iconRender
            ) as ResourceItemIconRender
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
  support(_resource: Resource): boolean {
    return true;
  },
  render(res: Resource): ResourceDataNode {
    return {
      key: res.id,
      title: res.name,
      kind: res.kind,
      resourceId: res.resourceId,
      isLeaf: res.isLeaf,
      icon: <IconCN type={"json"} />,
      children: [],
      resource: res,
    } as ResourceDataNode;
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
