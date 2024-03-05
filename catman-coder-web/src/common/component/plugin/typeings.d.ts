declare namespace Plugin {

    /**
     * 组件工厂
     */
    export interface ComponentFactory<T extends LayoutElement> {
        create(_node: T): Product<T>
    }

    export interface ComponentCreator<T extends LayoutElement> {
        support(_node: T): boolean
        create(_node: T): Product<T>
    }

    /**
     * 不同的窗口模式:
     * FLEX: 默认布局
     * FLOAT: 悬浮窗口
     * STAND_ALONE: 独立窗口
     */
    export type WindowKind = "FLEX" | "FLOAT" | "STAND_ALONE"

    /**
     * 布局元素,所有被展示的元素都可以称之为布局元素
     */
    export interface LayoutElement {
        id?: string   // 可选的唯一标志,用于生产节点的key值,如果不传,生成随机数
        component: string // 组件的全局唯一名称,当需要创建时,布局操作将通过全局插件管理器进行操作
        config: object // 布局容器需要的独特配置信息
        data: object // 组件所需的数据
        window: WindowKind // 对应的窗口管理器名称
    }

    export interface Layout {
        addBorder()
        addPanel()
        addMainBorderItem()
        addLayoutElement(_element: LayoutElement)
        /**
         *  注册组件创建起
         * @param _creator 创建组件的工具,负责创建组件的工具将忽略布局信息,仅负责根据data渲染自身即可
         */
        registryComponentCreator(_creator: ComponentCreator)
    }

    export interface Context {
        layout(): Layout
        mdx()
    }

    export interface Plugin<T extends Context> {
        id: string
        group: string
        version: string
        // beforeLoad(_ctx: T)
        // afterLoad(_ctx: T)
        // firstLoad(_ctx: T)
        // eachLoad(_ctx: T)
        // afterInstall(_ctx: T)
        // beforeUninstall(_ctx: T)
        run(_ctx: T)
        destory(_ctx: T)
    }

    export interface PluginManager<T extends Plugin> {
        list(): T[]
        findById(_id: string): T[]
        findByGiv(_id: string, _group: string, _version: string)
    }
}