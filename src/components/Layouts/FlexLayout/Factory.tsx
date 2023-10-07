import { Actions, TabNode } from "flexlayout-react";

export interface ComponentFactory {
    support(_node: TabNode): boolean
    create(_node: TabNode): React.ReactNode
}
export interface Factory {
    create(node: TabNode): React.ReactNode | undefined
}
/**
 * 具有缓存特性的组件工厂
 */
export class CacheableFactory implements Factory {
    proxy: Factory
    cache: { [index: string]: React.ReactNode }
    cacheValue: { [index: string]: TabNode }
    static of(factory: Factory) {
        return new CacheableFactory(factory)
    }
    constructor(factory: Factory) {
        this.proxy = factory
        this.cache = {}
        this.cacheValue = {}
    }

    create(node: TabNode): React.ReactNode {
        const key = node.getId()
        if (!this.cache[key]) {
            this.update(node)
        }
        // 是否需要重命名
        if (node.getName() !== this.cacheValue[key].getName()) {
            node.getModel().doAction(Actions.renameTab(node.getId(), node.getName()))
        }

        return this.cache[key]
    }
    remove(node: TabNode) {
        delete this.cache[node.getId()]
        delete this.cacheValue[node.getId()]
    }
    delete(id: string) {
        delete this.cache[id]
        delete this.cacheValue[id]
    }
    update(node: TabNode) {
        this.cache[node.getId()] = this.proxy.create(node)
        this.cacheValue[node.getId()] = node
    }
}

/**
 * 根据名称创建组件
 */
export class NamedComponentFactory {
    name: string
    render: (_node: TabNode) => React.ReactNode

    static of(name: string, createMethod: (_node: TabNode) => React.ReactNode) {
        return new NamedComponentFactory(name, createMethod)
    }

    constructor(name: string, createMethod: (_node: TabNode) => React.ReactNode) {
        this.name = name;
        this.render = createMethod;
    }
    support(_node: TabNode) {
        return this.name === _node.getComponent()
    }
    create(node: TabNode) {
        return this.render(node)
    }
}


export class DefaultFactory {
    factories: ComponentFactory[]
    static create() {
        return new DefaultFactory()
    }
    constructor(factories?: ComponentFactory[]) {
        this.factories = factories || [];
    }

    add(...factories: ComponentFactory[]) {
        this.factories.push(...factories)
        return this
    }
    nameMatch(name: string, createMethod: (_node: TabNode) => React.ReactNode) {
        return this.add(NamedComponentFactory.of(name, createMethod))
    }

    create(node: TabNode): React.ReactNode | undefined {
        const matched = this.factories.find(f => {
            return f.support(node)
        })
        return matched?.create(node)
    }
}
// 默认全局工厂
export const GlobalFactory = DefaultFactory.create()
export default GlobalFactory