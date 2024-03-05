import { IJsonModel, TabNode } from "flexlayout-react";
import { IJsonTabNode } from "flexlayout-react/declarations/model/IJsonModel";
import { ReactNode } from "react";
import {
  ComponentFactory,
  LayoutNode,
  Resource,
  ComponentCreator,
  LayoutRender,
  LayoutRenderFactory,
  LayoutContext,
  LayoutType,
} from "@/core/entity/Common";
/**
 * 具有缓存特性的组件工厂
 */
export class CacheableFactory implements ComponentFactory {
  proxy: ComponentFactory;
  cache: { [index: string]: React.ReactNode };
  cacheValue: { [index: string]: LayoutNode<unknown> };
  static of(factory: ComponentFactory) {
    return new CacheableFactory(factory);
  }
  constructor(factory: ComponentFactory) {
    this.proxy = factory;
    this.cache = {};
    this.cacheValue = {};
  }

  create(node: LayoutNode<unknown>): React.ReactNode {
    const key = node.id;
    if (!this.cache[key]) {
      this.update(node);
    }
    return this.cache[key];
  }
  nameMatch(
    name: string,
    createMethod: (_node: LayoutNode<unknown>) => React.ReactNode
  ): ComponentFactory {
    return this.proxy.nameMatch(name, createMethod);
  }
  add(...factories: ComponentCreator[][]): ComponentFactory {
    return this.proxy.add(...factories);
  }
  remove(node: LayoutNode<unknown>) {
    delete this.cache[node.id!];
    delete this.cacheValue[node.id!];
    this.proxy.remove(node);
  }

  delete(node: LayoutNode<unknown>) {
    this.remove(node);
  }

  update(node: LayoutNode<unknown>) {
    this.cache[node.id] = this.proxy.create(node);
    this.cacheValue[node.id] = node;
  }
}

/**
 * 复用节点工厂
 */
export class RefuseNodeComponentFactory implements ComponentFactory {
  proxy: ComponentFactory;
  constructor(proxy: ComponentFactory) {
    this.proxy = proxy;
  }
  static of(factory: ComponentFactory) {
    return new RefuseNodeComponentFactory(factory);
  }

  create(node: LayoutNode<unknown>): React.ReactNode | undefined {
    const config = node.config;
    if (config && config.refuseNode) {
      return config.refuseNode as ReactNode;
    }
    return this.proxy.create(node);
  }
  nameMatch(
    name: string,
    createMethod: (_node: LayoutNode<unknown>) => React.ReactNode
  ): ComponentFactory {
    return this.proxy.nameMatch(name, createMethod);
  }
  add(...factories: ComponentCreator[][]): ComponentFactory {
    return this.proxy.add(...factories);
  }
  remove(node: LayoutNode<unknown>) {
    this.proxy.remove(node);
  }
}

/**
 * 根据名称创建组件
 */
export class NamedComponentCreator implements ComponentCreator {
  name: string;
  render: (_node: LayoutNode<unknown>) => React.ReactNode;

  static of(
    name: string,
    createMethod: (_node: LayoutNode<unknown>) => React.ReactNode
  ) {
    return new NamedComponentCreator(name, createMethod);
  }

  constructor(
    name: string,
    createMethod: (_node: LayoutNode<unknown>) => React.ReactNode
  ) {
    this.name = name;
    this.render = createMethod;
  }
  support(_node: LayoutNode<unknown>) {
    return this.name === _node.componentName;
  }
  create(node: LayoutNode<unknown>) {
    return this.render(node);
  }
  remove(_node: LayoutNode<unknown>): void {}
}

export class DefaultComponentFactory implements ComponentFactory {
  factories: ComponentCreator[];
  static create() {
    return new DefaultComponentFactory();
  }
  constructor(factories?: ComponentCreator[]) {
    this.factories = factories || [];
  }

  remove(node: LayoutNode<unknown>): void {
    this.factories.forEach((f) => {
      f.remove(node);
    });
  }

  add(...factories: ComponentCreator[][]) {
    if (factories) {
      factories.forEach((f) => {
        this.factories.push(...f);
      });
    }
    return this;
  }
  nameMatch(
    name: string,
    createMethod: (_node: LayoutNode<unknown>) => React.ReactNode
  ) {
    return this.add([NamedComponentCreator.of(name, createMethod)]);
  }

  create(node: LayoutNode<unknown>): React.ReactNode | undefined {
    const matched = this.factories.find((f) => {
      return f.support(node);
    });
    return matched?.create(node);
  }
}

export class DefaultLayoutRenderFactory implements LayoutRenderFactory {
  renders: LayoutRender[];
  constructor() {
    this.renders = [];
  }

  registry(render: LayoutRender): LayoutRenderFactory {
    this.renders.push(render);
    return this;
  }

  replace(id: string, render: LayoutRender): LayoutRenderFactory {
    const index = this.renders.findIndex((r) => r.id === id);
    if (index > 0) {
      this.renders[index] = render;
    } else {
      this.renders.push(render);
    }
    return this;
  }

  render(node: LayoutNode<unknown>): void {
    const find = this.renders.find((r) => r.support(node))!;
    find.render(node);
  }

  close(node: LayoutNode<unknown>): void {
    this.renders
      .filter((r) => r.support(node))
      .forEach((r) => {
        if (r.close) {
          r.close(node);
        }
      });
  }
}
/**
 * 默认的布局上下文,该上下文将持有所有布局容器,并调用相关方法进行布局操作
 */
export class DefaultLayoutContext implements LayoutContext {
  layouts: {
    [index: string]: LayoutNode<unknown>;
  };

  renderFactory: LayoutRenderFactory;
  componentRenderFactory: ComponentFactory;

  modelConfig: IJsonModel = {} as IJsonModel;
  // model:Model|undefined
  constructor(
    componentRenderFactory: ComponentFactory,
    modelConfig: IJsonModel
  ) {
    this.layouts = {};
    this.renderFactory = new DefaultLayoutRenderFactory();
    this.componentRenderFactory = componentRenderFactory;
    this.modelConfig = modelConfig;
  }

  close(node: LayoutNode<unknown>) {
    this.renderFactory.close(node);
  }

  createOrActive(node: LayoutNode<unknown>, type?: LayoutType) {
    if (type) {
      node.layoutType = type;
    }
    this.renderFactory.render(node);
  }
}
export class DefaultLayoutNode<T> implements LayoutNode<T> {
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
    const defaultLayoutNode = new DefaultLayoutNode<T>(id, name, componentName);
    defaultLayoutNode.data = data;
    return defaultLayoutNode;
  }

  static ofResource(resource: Resource) {
    // 一定要注意,如果资源直接使用extra配置,没有resourceId
    const layoutNode = DefaultLayoutNode.of<Resource>(
      resource?.resourceId || resource.id,
      resource?.name,
      resource?.kind
    );
    layoutNode.data = resource;
    return layoutNode;
  }
  static create(componentName: string, resource: Resource) {
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
      tabNode.getComponent()!
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
