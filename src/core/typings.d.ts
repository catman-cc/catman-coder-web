
declare namespace Core {
  import type { DataNode } from "antd/es/tree";
  import { ReactNode } from "react";
  import { IJsonTabNode } from "flexlayout-react/declarations/model/IJsonModel";
  import { ItemParams } from "react-contexify";
  import { ResourceState } from "@/stores/resource";
  import { IJsonModel } from "flexlayout-react";

  interface LabelSelector<T> {
    match: string;
    kind: string;
    value: T;
    rules?: LabelSelector[];
  }

  interface Base {
    id: string;
    scope?: Scope;
    labels?: Labels;
    alias?: string[];
    type: Type;
    tag?: Tag[];
    group?: Group;
    /**
     * 被标注资源的版本信息,根据资源的版本信息,访问者可以考虑如何处理资源的版本信息
     */
    version?: string
  }
  interface Config { }
  type Scope = "PRIVATE" | "PUBlIC";

  interface Mock {
    kind: string;
    name: string;
  }

  interface Tag {
    id: string;
    name: string;
  }

  interface Group {
    id: string;
    name: string;
    namespace: string;
  }

  interface Label {
    name: string;
    value: string[];
    labels?: Labels;
  }

  interface Labels {
    labels?: Labels;
    items: Map<string, Label>;
  }

  interface TypeItem {
    itemId: string;
    name?: string;
    scope: Scope;
  }
  interface Type {
    typeName: string;
    items: TypeDefinition[];
    privateItems: { [index: string]: TypeDefinition };
    sortedAllItems: TypeItem[];
  }

  /**
   *  用于存放循环引用数据的上下文
   */
  interface LoopReferenceContext {
    typeDefinitions: { [index: string]: TypeDefinition }
    valueProviderDefinitions: { [index: string]: unknown }
    parameters: { [index: string]: Parameter }
    functionInfos: { [index: string]: unknown }
  }

  interface TypeDefinitionSchema {
    root: string;
    context: Core.LoopReferenceContext
    definitions: { [index: string]: TypeDefinition };
    refs: Map<string, TypeDefinition>;
    circularRefs?: { [index: string]: string[] };

  }

  interface TypeDefinition {
    id?: string;
    name: string;
    scope: Scope;
    labels?: Labels;
    type: Type;
    tag?: Tag[];
    group: Group;
    mock?: Mock;
    alias?: string[];
    defaultValue?: string;
    describe?: string;
    wiki?: string;
    required?: boolean
  }

  export interface ValueDefinition extends Core.Base {
    kind: string; //值类型
  }

  /**
   * TypeDefinition的运行时数据
   */
  export interface Parameter extends Core.Base {
    id: string;
    name: string;
    type: Core.TypeDefinition;
    items: Parameter[];
    value: ValueDefinition;
    defaultValue: ValueDefinition;
  }

  export interface ParameterSchema {
    root: string,
    context: LoopReferenceContext
  }

  export interface JobDefinition extends Core.Base {
    id: string;
    name: string;
    requesParameter: Parameter;
    responseParameter: Parameter;
  }
  export interface Resource {
    id: string;
    name: string;
    kind: string;
    parentId: string;
    resourceId: string;
    isLeaf: boolean;
    extra?: string;
    children: Resource[];
    previousId?: string
    nextId?: string
  }

  /**
   * 布局元素的配置
   */
  export interface LayoutElementConfig {
    key: string; // 在整个布局中的唯一标志
    position: string; // 布局位置,此处应提供一个回调方法,用于更智能的控制布局位置
    title: string; // 布局元素所展示的名称,此处应被替换为React元素
  }
  export type LayoutType = "tab" | "float" | "window";
  /**
   * 布局节点
   * 1. 布局类型
   */
  export interface LayoutNode<T> {
    id: string; // 渲染时,元素的唯一标志
    name: string; // 渲染时,展示的窗口名称
    componentName: string; // 渲染时使用的组件名称
    /**
     * 不同的展示方式的配置数据
     */
    settings: {
      tab: unknown;
      float: unknown;
      window: unknown;
    };
    config: {
      [index: string]: unknown;
    };
    data?: T;
    icon: string | undefined; // icon
    helpText?: string; // 鼠标悬浮时,展示的帮助文本
    layoutType: LayoutType; // 布局类型
    enableFloat: boolean;
    enableToWindow: boolean;
    enableRename: boolean;
    enableDrag: boolean;
    enableClose: boolean;
    renameCallback?: () => void; // 重命名后,调用的回调方法
    className?: string; // 布局元素的跟class名称
    toFlexLayout(): IJsonTabNode;
  }

  export type ComponentCreatorFunction = (node: LayoutNode) => React.ReactNode;
  export interface ComponentCreator {
    support(_node: LayoutNode): boolean;
    create(_node: LayoutNode): React.ReactNode;
    remove(node: LayoutNode): void;
  }

  export interface ComponentFactory {
    // 支持动态添加组件创建器,默认支持安装组件名称添加
    create(_node: LayoutNode): React.ReactNode;
    remove(node: string): void;
    nameMatch(
      name: string,
      createMethod: (_node: Core.LayoutNode) => React.ReactNode,
    ): ComponentFactory;
    add(...factories: Core.ComponentCreator[][]): ComponentFactory;
  }
  export interface LayoutRender {
    id: string;
    nodes: {
      [index: string]: LayoutNode;
    };
    support(node: LayoutNode): boolean;
    render(node: LayoutNode): void;
    close(node: LayoutNode): void;
  }

  export interface LayoutRenderFactory {
    registry(render: LayoutRender): LayoutRenderFactory;
    replace(id: string, render: LayoutRender): LayoutRenderFactory;
    render(node: LayoutNode): void;
    close(node: LayoutNode): void;
  }

  /**
   * 布局上下文
   */
  export interface LayoutContext {
    /**
     * 管理的所有布局元素
     */
    layouts: {
      [index: string]: LayoutNode;
    };

    modelConfig: IJsonModel;
    // model:Model
    /**
     * 布局渲染工厂
     */
    renderFactory: LayoutRenderFactory;

    /**
     * 元素组件渲染工厂
     */
    componentRenderFactory: ComponentFactory;

    /**
     * 创建或者激活一个节点信息
     * @param node 节点
     * @param type 可选的展示类型
     */
    createOrActive(node: LayoutNode<unknown>, type?: LayoutType);

    /**
     * 关闭一个节点
     * @param node 节点
     */
    close(node: LayoutNode<unknown>);
  }

  export interface Event<T> {
    id?: string;
    name: string;
    group?: string;
    data: T;
    stopSpreading?: boolean;
  }

  export interface EventListener {
    id: string;
    name: string;
    watchGroup?: string;
    filterEvent: (event: Core.Event<unknown>) => boolean;
    process: (
      event: Core.Event<unknown>,
      eventBus: Core.EventBusContext,
    ) => void;
  }

  export interface EventBusContext {
    // 触发事件
    publish(event: Core.Event<unknown>): EventBusContext;
    // 订阅事件
    addListener(listener: Core.EventListener): EventBusContext;
    subscribe(
      filter: (event: Core.Event<unknown>) => boolean,
      handler: (event: Core.Event<unknown>, eventBus: EventBusContext) => void,
    ): void;
    subscribeGroup(
      group: string,
      filter: (event: Core.Event<unknown>) => boolean,
      handler: (event: Core.Event<unknown>, eventBus: EventBusContext) => void,
    ): void;
    watchByName(
      name: string,
      handler: (
        event: Core.Event<unknown>,
        eventBus: Core.EventBusContext,
      ) => void,
    ): EventBusContext;
  }
  export interface ResourceDataNode extends DataNode {
    resource: Core.Resource;
  }
  export type ItemRenderFunction = (resource: Resource) => ResourceDataNode;
  export interface ResourceItemRender {
    support(_resource: Resource): boolean;
    render(_resource: Resource): ResourceDataNode;
  }

  export interface ResourceItemRenderFactory {
    iconFactory?: ResourceItemIconFactory;
    setIconFactory(
      iconFactory: ResourceItemIconFactory,
    ): ResourceItemRenderFactory;
    registry(_render: ResourceItemRender): ResourceItemRenderFactory;
    render(_resource: Resource): ResourceDataNode | undefined;
  }

  export type iconRenderFunction = (resource: Resource) => ReactNode;

  export interface ResourceItemIconRender {
    support(_resource: Resource): boolean;
    render(_resource: Resource): ReactNode;
  }
  export interface ResourceItemIconFactory {
    defaultResourceItemRender: ResourceItemIconRender;
    registry(_render: ResourceItemIconRender): ResourceItemIconFactory;
    render(_resource: Resource): ReactNode;
  }

  export interface ResourceService {
    root(_selector?: string): Promise<API.Response<Core.Resource>>;
    findById(_id: string): Promise<API.Response<Core.Resource>>;

    save(_resource: Resource): Promise<API.Response<Core.Resource>>;

    rename(_id: string, _name: string): Promise<API.Response<Core.Resource>>;

    delete(_resource: Resource): Promise<API.Response<Core.Resource>>;
    /**
     * 根据resource定义,获取对应的具体资源数据
     * @param resource resource定义
     */
    loadDetails<T>(_resource: Resource): Promise<API.Response<T>>;

    create<T>(
      _resource: Resource,
    ): Promise<API.Response<Core.ResourceDetails<T>>>;
    move(_id: string, _parentId?: string, _previousId?: string, _nextId?: string, index?: number): Promise<API.Response<boolean>>
    flush(_id: string): Promise<API.Response<boolean>>
  }

  /**
   * 右键菜单上下文,主要控制右键菜单
   * 每一个菜单项和资源都同时可以筛选对方,只有都满足筛选条件的情况下,才会被渲染
   *
   * 目前来看,menu的触发直接通过事件机制进行推送就可以了
   */
  export interface MenuShowFilter<T> {
    filter(item: T): boolean;
  }

  type MenuRenderFunction = (
    menu: Menu<unknown>,
    _resource: Resource,
  ) => JSX.Elemen;
  type MenuItemRenderFunction = (
    _menu: Menu<unknown>,
    _resource: Resource,
    _item: ReactNode,
  ) => JSX.Elemen;
  export interface Menu<T> {
    id?: string;
    label?: ReactNode | MenuRenderFunction;
    renderMenuItem?: MenuItemRenderFunction;
    data?: unknown;
    type: "menu" | "item" | "separator" | "submenu";
    filter?(item: T): boolean;
    children?: Menu<unknown>[];
    onMenuClick?: (
      menu: Menu<Resource>,
      resource: Resource,
      itemParams: ItemParams,
    ) => void;
  }

  /**
   * 资源上下文菜单对应的上下文
   * 1. 支持注册新的上下文菜单
   * 2. 支持根据需要替换现有的上下文菜单
   * 3. 支持修改现有的上下文菜单
   * 4. 能够访问到现有的上下文菜单,并根据需求向特定位置添加新的上下文菜单
   */
  export interface ResourceMenuContext {
    /**
     * 直接获取现有的菜单信息
     */
    menus(): Menu<Resource>;

    deep(handler: (menu: Menu<Resource>, parent?: Menu<Resource>) => boolean);

    /**
     * 注册一个处理器来处理现有的上下文,并根据需要进行修改
     * @param handler 处理器
     */
    process(handler: (context: ResourceMenuContext) => void);

    render(resource: Core.Resource): ReactNode;

    showMenus(resource: Resource);
  }

  export interface ResourceDetails<T> extends Resource {
    details: T;
  }
  type ResourceViewerFunction = (
    _resource: ResourceDetails,
    _context: ApplicationContext,
    _layoutContext: LayoutContext,
  ) => void;
  /**
   * 资源查看器,主要用于响应资源点击得到的数据
   */
  export interface ResourceViewer {
    support(_resource: ResourceDetails): boolean;
    render(
      _resource: ResourceDetails,
      _context: ApplicationContext,
      _layoutContext: LayoutContext,
    ): void;
  }

  export interface ResourceViewerFactory {
    registry(_render: ResourceDetails): ResourceViewerFactory;
    view(
      _resource: ResourceDetails,
      _context: ApplicationContext,
      _layoutContext: LayoutContext,
    ): void;
  }

  export interface Placeholder {
    show: boolean;
    child: ReactNode;
  }
  /**
   *  资源面板上下文
   *  1. 渲染资源树时调用上下文绘制每一个元素,并为每一个元素添加必要的交互,比如:右键菜单
   *  2. 调用资源service,进行资源的操作,包括,移动,更新,删除资源
   */
  export interface ResourceExplorerContext {
    itemRenderFactory?: ResourceItemRenderFactory;
    viewFactory?: ResourceViewerFactory;
    menuContext?: ResourceMenuContext;
    setResourceItemRenderFactory(
      itemRenderFactory: ResourceItemRenderFactory,
    ): ResourceExplorerContext;
    setResourceMenuContext(
      menuContext: ResourceMenuContext,
    ): ResourceExplorerContext;

    setResourceViewerFactory(
      viewFactory: ResourceViewerFactory,
    ): ResourceExplorerContext;
    flush(resource: Resource);
  }

  /**
   *  提供一个统一的模型用于注册资源, 在执行注册操作时,将安装方法定义的顺序进行执行
   *  - 资源的kind
   *  - 如何在树中渲染该资源,可以有选择的提供:元素渲染器,图标渲染器,菜单渲染器
   *  - 如何处理资源的创建,删除,修改等操作
   *  - 如何处理资源的加载,保存等操作
   *  - 如何处理树中的点击事件
   */
  interface ResourceRegistry {
    itemRender?(
      context: ApplicationContext,
      factory: ResourceItemRenderFactory,
    ): ResourceItemRender | ItemRenderFunction;

    registerItemRender?(
      context: ApplicationContext,
      factory: ResourceItemRenderFactory,
    ): void;

    iconRender?(
      context: Core.ApplicationContext,
      factory: Core.ResourceItemIconFactory,
    ): Core.ResourceItemIconRender | IconRenderFunction;
    registerIconRender?(
      context: Core.ApplicationContext,
      factory: Core.ResourceItemIconFactory,
    ): void;

    registerResourceContextMenu?(
      context: Core.ApplicationContext,
      menuContex?: Core.ResourceMenuContext,
    ): void;
    componentCreator?(
      context: Core.ApplicationContext,
      layout: LayoutContext,
    ): ComponentCreatorFunction | ComponentCreator;

    registerComponentCreator?(
      context: Core.ApplicationContext,
      layout: LayoutContext,
    ): void;

    resourceViewer?(
      context: Core.ApplicationContext,
      viewerFactory?: Core.ResourceViewerFactory,
    ): Core.ResourceViewer | ResourceViewerFunction;
    registerResourceViewer?(
      context: Core.ApplicationContext,
      viewerFactory?: Core.ResourceViewerFactory,
    ): void;
  }

  export interface ResourceContext {
    applicationContext?: ApplicationContext;
    setApplicationContext(
      applicationContext: ApplicationContext,
    ): ResourceContext;
    /**
     * 资源面板上下文
     */
    explorer?: ResourceExplorerContext;
    setResourceExplorerContext(
      explorer: ResourceExplorerContext,
    ): ResourceContext;
    service?: ResourceService;
    store?: ResourceState;
    setResourceStore(store: ResourceState): ResourceContext;
    setResourceService(service: ResourceService): ResourceContext;
    showModel(node: ReactNode);
    closeModel();
    register(kind: string, register: ResourceRegistry);
  }
  export interface Processor {
    before?(context: ApplicationContext): void;
    run?(context: ApplicationContext): void;
    after?(context: ApplicationContext): void;
  }
  export interface GlobalConfig {
    /**
     * 后端服务地址,用于访问后端服务,示例:http://localhost:8080
     */
    backendUrl: string;
  }
  /**
   * 消息类型, 用于区分消息的处理方式
   * BROADCAST: 广播消息, 会发送给所有的客户端
   * UNICAST: 单播消息, 会发送给指定的客户端
   * MULTICAST: 组播消息, 一个组内只会有一个客户端接收到消息
   */
  export type MessageType = "BROADCAST" | "UNICAST" | "MULTICAST";

  export interface Message<T> {
    id?: string;

    key?: string;

    topic: string;

    labels?: Core.Labels;

    type: MessageType;

    channelId?: string;
    channelKind?: string;

    sender?: string;

    replyTo?: string;

    count?: number;

    consumeTime?: number;

    answer?: (message: Message<T>) => void;

    payload: T;
  }

  export interface MessageHandler<T> {
    (message: Message<T>): void;
  }

  export interface MessageMatcher {
    match(message: Message<unknown>): boolean;
  }

  /**
   * channel是对消息总线的一种封装,用于实现消息的分组,不同的channel之间的消息不会相互影响
   * 同时通过channel机制,在服务端实现了具体socket和channel的解耦,因此可以实现不同的socket连接,同时共享同一个channel
   * 什么情况下会用到多个socket复用同一个channel?
   * 答:
   *  - 同一个用户在不同的浏览器中打开了多个页面,此时会有多个socket连接,但是这些socket连接都是同一个用户中的同一个业务,因此可以共享同一个channel
   *    比如: 用户在debug一个编排任务时,可以打开一个新的页面,用于查看任务的日志信息,此时可以共享同一个channel
   * 一个实际应用channel的例子:
   * - 用户在编辑某个组件时,申请一个新的channel,该channel在创建,修改,删除组件时,会向服务端发送消息,
   *   服务端根据channel的类型定义,调用对应的ChannelCreator创建不同的channel,并选择合理的方式,有选择性的进行资源的预创建,释放等操作
   *   比如,用户在创建一个http快速请求时,将申请一个新的HTTP QUICKER类型的channel,此时服务端会创建一个新的channel,并预创建一个http请求资源
   *   - 包括准备用于解析的上下文变量,准备用于解析的请求参数,准备用于解析的请求头,准备用于解析的请求体,准备用于解析的请求方法,准备用于解析的请求地址
   *   并可以有需要的根据前端发送的topic,进行对应的操作,比如:
   *       - 预解析请求地址,并将解析后的请求地址返回给前端
   *       - 根据上下文变量,解析用户的模板字符串,并将解析后的字符串返回给前端,由前端进行展示
   *       - 前端触发特定的事件,比如:点击了发送按钮,此时服务端会根据前端发送的消息,进行对应的操作,比如:发送http请求,并将请求结果返回给前端
   *       - 前端触发特定的事件,比如:点击了保存按钮,此时服务端会根据前端发送的消息,进行对应的操作,比如:保存http请求,并将保存结果返回给前端
   *         (实际上,此处会通过resource的save进行处理,这里只是一个示例)
   *  多socket共享同一个channel的好处:
   *  1. 服务端可以根据channel的id,将消息发送到指定的socket中,而不需要关心具体的socket是哪一个
   *  2. 服务端可以实现多个socket共享同一个channel,但是每个socket接收到的消息可能不同,比如: 一个socket只接收日志消息,另一个socket只接收任务状态消息
   *  多socket共享同一个channel的缺点:
   *  1. 服务端需要维护多个socket和channel的关系,同时需要维护每个socket接收的消息类型
   *  2. 服务端需要实现多个socket共享同一个channel的消息分发机制
   *  3. 服务端需要实现多个socket共享同一个channel的消息过滤机制
   *  4. 服务端需要实现多个socket共享同一个channel的消息过期机制
   *  5. 服务端需要实现多个socket共享同一个channel的消息重发机制
   *  6. 服务端需要实现多个socket共享同一个channel的消息持久化机制
   *  7. 服务端需要实现多个socket共享同一个channel的消息回溯机制
   *  8. 服务端需要实现多个socket共享同一个channel的消息重试机制
   */
  export interface Channel {
    id: string;
    name: string;
    description: string;
    createTime: number;
    creator: string;
    publish<T>(message: Message<T>): Channel;
    publishAndWait<T>(
      message: Message<T>,
      handler: MessageHandler<unknown>,
      matcher?: Core.MessageMatcher,
    ): Channel;

    subscribe(
      matcher: MessageMatcher,
      handler: MessageHandler<unknown>,
    ): Channel;

    unsubscribe(handler: MessageHandler<unknown>): Channel;
    /**
     * 关闭channel,关闭后,channel将不再接收消息,同时会向服务端回传消息,告知服务端channel已经关闭
     */
    destroy(): void;
  }
  export interface MessageBus {
    publish<T>(message: Message<T>): MessageBus;
    publishAndWait<T>(
      message: Message<T>,
      handler: MessageHandler<unknown>,
      matcher?: Core.MessageMatcher,
    ): MessageBus;

    subscribe(
      matcher: MessageMatcher,
      handler: MessageHandler<unknown>,
    ): MessageBus;

    unsubscribe(handler: MessageHandler<unknown>): MessageBus;

    getNewChannel(): Channel;

    getOrCreateChannel(kind?: string, channelId?: string): Channel;

    clear(): void;
  }

  export interface MessageSubscriber<T> {
    listeningTimes: number;
    matcher: MessageMatcher;
    handler: MessageHandler<T>;
  }
  /**
   * 应用程序上下文
   * 1. 注册各种资源渲染器,因此需要可以访问到上下文
   * 2. 可以访问到布局容器
   * 3. 可以访问到事件总线
   */
  export interface ApplicationContext {
    layoutContext?: LayoutContext;
    setLayoutContext(layoutContext: LayoutContext): ApplicationContext;
    events?: EventBusContext;
    messageBus?: MessageBus;
    setMessageBus(messageBus: MessageBus): ApplicationContext;
    setEventBusContext(events: EventBusContext): ApplicationContext;
    resourceContext?: ResourceContext;
    setResourceContext(resourceContext: ResourceContext): ApplicationContext;
    processors?: Processor[];
    config: GlobalConfig;
    /**
     * 添加时,必须调用processor的run方法
     * @param processor
     */
    addProcessor(processor: Processor);
  }
}
