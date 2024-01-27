import { TabNode } from "flexlayout-react";
import { IJsonTabNode } from "flexlayout-react/declarations/model/IJsonModel";
import LayoutNode = Core.LayoutNode;

export class DefaultLayoutRenderFactory implements Core.LayoutRenderFactory {
  renders: Core.LayoutRender[];
  constructor() {
    this.renders = [];
  }

  registry(render: Core.LayoutRender): Core.LayoutRenderFactory {
    this.renders.push(render);
    return this;
  }

  replace(id: string, render: Core.LayoutRender): Core.LayoutRenderFactory {
    const index = this.renders.findIndex((r) => r.id === id);
    if (index > 0) {
      this.renders[index] = render;
    } else {
      this.renders.push(render);
    }
    return this;
  }

  render(node: Core.LayoutNode<unknown>): void {
    const find = this.renders.find((r) => r.support(node))!;
    find.render(node);
  }

  close(node: LayoutNode<unknown>): void {
    this.renders
      .filter((r) => r.support(node))
      .forEach((r) => {
        r.close(node);
      });
  }
}
/**
 * 默认的布局上下文,该上下文将持有所有布局容器,并调用相关方法进行布局操作
 */
export class DefaultLayoutContext implements Core.LayoutContext {
  layouts: {
    [index: string]: Core.LayoutNode<unknown>;
  };

  renderFactory: Core.LayoutRenderFactory;
  componentRenderFactory: Core.ComponentFactory;

  modelConfig: IJsonTabNode[] = [];
  // model:Model|undefined
  constructor(
    componentRenderFactory: Core.ComponentFactory,
    modelConfig: IJsonTabNode[],
  ) {
    this.layouts = {};
    this.renderFactory = new DefaultLayoutRenderFactory();
    this.componentRenderFactory = componentRenderFactory;
    this.modelConfig = modelConfig;
  }

  close(node: LayoutNode<unknown>) {
    this.renderFactory.close(node);
  }

  createOrActive(node: LayoutNode<unknown>, type?: Core.LayoutType) {
    if (type) {
      node.layoutType = type;
    }
    this.renderFactory.render(node);
  }
}
export class DefaultLayoutNode<T> implements Core.LayoutNode<T> {
  id: string; // 渲染时,元素的唯一标志
  name: string; // 渲染时,展示的窗口名称
  componentName: string; // 渲染时使用的组件名称
  data?: T;
  icon: string | undefined; // icon
  helpText?: string; // 鼠标悬浮时,展示的帮助文本
  layoutType: "tab" | "float" | "window" = "tab"; // 布局类型
  enableFloat: boolean = false;
  enableToWindow: boolean = false;
  enableRename: boolean = false;
  enableDrag: boolean = false;
  enableClose: boolean = false;
  renameCallback?: () => void; // 重命名后,调用的回调方法
  className?: string; // 布局元素的跟class名称
  config: { [p: string]: unknown };
  settings: { tab: unknown; float: unknown; window: unknown };
  isLayoutNode: boolean = true;
  static of<T>(id: string, name: string, componentName: string, data?: T) {
    const defaultLayoutNode = new DefaultLayoutNode<T>(id, name, componentName)
    defaultLayoutNode.data = data
    return defaultLayoutNode
  }

  static ofResource(resource: Core.Resource) {
    // 一定要注意,如果资源直接使用extra配置,没有resourceId
    const layoutNode = DefaultLayoutNode.of<Core.Resource>(
      resource?.resourceId || resource.id,
      resource?.name,
      resource?.kind,
    );
    layoutNode.data = resource;
    return layoutNode;
  }
  static create(componentName: string, resource: Core.Resource) {
    const layoutNode = DefaultLayoutNode.ofResource(resource);
    layoutNode.componentName = componentName;
    layoutNode.settings.tab = {
      id: resource.id,
      name: resource.name,
      icon: `icon-${componentName}`,
      component: componentName,
      enableFloat: true,
    };
    return layoutNode;
  }
  static wrapper<T>(tabNode: TabNode) {
    if (tabNode.getConfig() && tabNode.getConfig().isLayoutNode) {
      return tabNode.getConfig() as DefaultLayoutNode<T>;
    }

    const node = new DefaultLayoutNode<T>(
      tabNode.getId(),
      tabNode.getName(),
      tabNode.getComponent()!,
    );
    node.data = tabNode.getConfig();
    node.config["tab"] = tabNode;
    return node;
  }
  constructor(id: string, name: string, componentName: string) {
    this.id = id;
    this.name = name;
    this.icon = `icon-${componentName}`;
    this.componentName = componentName;
    this.config = {};
    this.settings = {
      tab: {
        id: id,
        name: name,
        // icon: `icon-${resourceDetails.kind}`,
        component: componentName,
        enableFloat: true,
      },
      float: {},
      window: {},
    };
  }
  toFlexLayout(): IJsonTabNode {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      component: this.componentName,
      enableFloat: false,
      config: this,
    };
  }
}
