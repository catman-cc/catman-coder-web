import { ID } from "../id"

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


export class Product<R> {
    data?: R
    node: JSX.Element | undefined
    constructor(node: JSX.Element | undefined, data: R) {
        this.data = data
        this.node = node
    }
    hasNode(): boolean {
        return this.node !== undefined
    }
}

export interface NamedNode extends LayoutElement {
    getName(): import("react").ReactNode
    getId(): unknown
    name: string
}

export class NamedComponentCreator<T extends NamedNode> implements ComponentCreator<T> {
    name: string
    doCreate: (_node: T) => (Product<T> | JSX.Element)

    static of<T extends NamedNode>(name: string, doCreate: (_node: T) => (Product<T> | JSX.Element)) {
        return new NamedComponentCreator<T>(name, doCreate)
    }

    constructor(name: string, doCreate: (_node: T) => (Product<T> | JSX.Element)) {
        this.name = name
        this.doCreate = doCreate
    }

    support(node: T): boolean {
        return node.component === this.name
    }

    create(node: T): Product<T> {
        if (this.support(node)) {
            const result = this.doCreate(node);
            if (result instanceof Product) {
                return result;
            } else {
                return new Product(result, node);
            }
        }
        return new Product(undefined, node)
    }
}

export class CacheableComponentFactory<T extends LayoutElement> {
    proxy: ComponentFactory<T>
    cache: { [index: string]: Product<T> }

    static wrapper<T extends LayoutElement>(proxy: ComponentFactory<T>) {
        return new CacheableComponentFactory(proxy)
    }

    constructor(proxy: ComponentFactory<T>) {
        this.proxy = proxy
        this.cache = {}
    }

    create(node: T): Product<T> {
        const key = node.id || ID()
        if (!this.cache[key]) {
            this.update(node)
        }
        return this.cache[key]
    }

    remove(node: T) {
        delete this.cache[node.id!]
    }

    delete(id: string) {
        delete this.cache[id]
    }
    update(node: T) {
        this.cache[node.id!] = this.proxy.create(node)
    }
}


export class DefaultFactory<T extends NamedNode> {
    creates: ComponentCreator<T>[]

    static create<T extends NamedNode>() {
        return new DefaultFactory<T>()
    }

    constructor(creates?: ComponentCreator<T>[]) {
        this.creates = creates || [];
    }

    add(...creates: ComponentCreator<T>[]) {
        this.creates.push(...creates)
        return this
    }

    nameMatch(name: string, createMethod: (_node: T) => (Product<T> | JSX.Element)) {
        return this.add(NamedComponentCreator.of<T>(name, createMethod))
    }

    create(node: T): Product<T> {
        const matched = this.creates.find(f => {
            return f.support(node)
        })
        if (!matched) {
            return new Product(undefined, node)
        }
        return matched.create(node)
    }
}