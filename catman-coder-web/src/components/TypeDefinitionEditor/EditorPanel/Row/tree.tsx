/**
 * 用于维护tree的相关信息
 * 一棵树由多个节点构成,如果该节点有子节点,则该节点的children字段不为空
 * 树节点在解析时,将会区分私有和公开两种节点. 私有节点将会正常渲染成树状视图
 * 公开节点则需要由节点本身进行渲染.
 *  除此之外,一个数还需要提供以下几种方法
 */
export interface Tree<T> {
    /**
     * 唯一标志
     */
    key: string

    /**
     * 数据
     */
    data: T
    /**
     * 子节点
     */
    children: Tree<T>[]
}

export interface TreeAssertor {
    /**
     * 是否可编辑,
     */
    editable(): boolean
    /**
     * 是否被禁用
     */
    disable(): boolean
    /**
     * 是否可以修改名称
     */
    canRename(): boolean

    /**
     * 是否可以修改类型定义
     */
    canChangeType(): boolean
    /**
     * 是否可以创建兄弟节点
     */
    canCreateBrother(): boolean

    /**
     * 是否可以创建子节点
     */
    canCreateChildren(): boolean

    /**
     * 是否可以拖拽该节点
     */
    canDrag(): boolean

    /**
     * 是否允许放置节点
     */
    canDrop(): boolean
}

/**
 * 树结构的断言器
 */
export interface TreeStructAssertor<T> {
    isChildren(_compare: T): boolean
    isParent(_compare: T): boolean
    isAncestors(_compare: T): boolean
    isDescendants(_compare: T): boolean
}




export interface Schema<T> {
    /**
     * 用于存放的所有数据
     */
    datas: { [index: string]: T }
}