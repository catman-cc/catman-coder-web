import {ReactNode} from "react";
import ComponentFactory = Core.ComponentFactory;


/**
 * 具有缓存特性的组件工厂
 */
export class CacheableFactory implements ComponentFactory {
    proxy: Core.ComponentFactory
    cache: { [index: string]: React.ReactNode }
    cacheValue: { [index: string]: Core.LayoutNode }
    static of(factory: Core.ComponentFactory) {
        return new CacheableFactory(factory)
    }
    constructor(factory: Core.ComponentFactory) {
        this.proxy = factory
        this.cache = {}
        this.cacheValue = {}
    }

    create(node: Core.LayoutNode): React.ReactNode {
        const key = node.id
        if (!this.cache[key]) {
            this.update(node)
        }
        return this.cache[key]
    }
    nameMatch(name: string, createMethod: (_node: Core.LayoutNode) => React.ReactNode): ComponentFactory{
        return this.proxy.nameMatch(name,createMethod)
    }
    add(...factories: Core.ComponentCreator[][]): ComponentFactory{
        return this.proxy.add(...factories)
    }
    remove(node: Core.LayoutNode) {
        delete this.cache[node.id]
        delete this.cacheValue[node.id]
        this.proxy.remove(node)
    }

    delete(node: Core.LayoutNode) {
       this.remove(node)
    }

    update(node: Core.LayoutNode) {
        this.cache[node.id] = this.proxy.create(node)
        this.cacheValue[node.id] = node
    }
}

/**
 * 复用节点工厂
 */
export class RefuseNodeComponentFactory implements Core.ComponentFactory {
    proxy: Core.ComponentFactory
    constructor(proxy: Core.ComponentFactory) {
        this.proxy = proxy
    }
    static of(factory: Core.ComponentFactory) {
        return new RefuseNodeComponentFactory(factory)
    }

    create(node: Core.LayoutNode): React.ReactNode | undefined {
        const config = node.config
        if (config && config.refuseNode ) {
            return config.refuseNode as ReactNode
        }
        return this.proxy.create(node)
    }
    nameMatch(name: string, createMethod: (_node: Core.LayoutNode) => React.ReactNode): ComponentFactory{
        return this.proxy.nameMatch(name,createMethod)
    }
    add(...factories: Core.ComponentCreator[][]): ComponentFactory{
        return this.proxy.add(...factories)
    }
    remove(node: Core.LayoutNode) {
        this.proxy.remove(node)
    }

}

/**
 * 根据名称创建组件
 */
export class NamedComponentCreator implements Core.ComponentCreator{
    name: string
    render: (_node: Core.LayoutNode) => React.ReactNode

    static of(name: string, createMethod: (_node: Core.LayoutNode) => React.ReactNode) {
        return new NamedComponentCreator(name, createMethod)
    }

    constructor(name: string, createMethod: (_node: Core.LayoutNode) => React.ReactNode) {
        this.name = name;
        this.render = createMethod;
    }
    support(_node: Core.LayoutNode) {
        return this.name === _node.componentName
    }
    create(node: Core.LayoutNode) {
        return this.render(node)
    }
    remove(node: Core.LayoutNode):void{

    }
}


export class DefaultComponentFactory implements Core.ComponentFactory{
    factories: Core.ComponentCreator[]
    static create() {
        return new DefaultComponentFactory()
    }
    constructor(factories?:  Core.ComponentCreator[]) {
        this.factories = factories || [];
    }

    remove(node: string): void {
        this.factories.forEach(f=>{
            f.remove(node)
        })
    }

    add(...factories: Core.ComponentCreator[][]) {
        this.factories.push(...factories)
        return this
    }
    nameMatch(name: string, createMethod: (_node: Core.LayoutNode) => React.ReactNode) {
        return this.add(NamedComponentCreator.of(name, createMethod))
    }

    create(node: Core.LayoutNode): React.ReactNode | undefined {
        const matched = this.factories.find(f => {
            return f.support(node)
        })
        return matched?.create(node)
    }
}
