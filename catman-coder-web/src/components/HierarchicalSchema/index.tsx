/**
 *  层级结构注册表
 */
export interface HierarchicalRegister {
    /**
     * 父子映射表
     */
    registryMap: {
        [index: string]: string[]
    }

    root: string

    /**
     *  设置根节点id
     * @param _root  根节点id
     */
    setRoot(_root: string): void

    isRoot(_id: string): boolean
    /**
     * 注册父子映射定义
     * @param _parent 父节点
     * @param _child  子节点
     */
    register(_parent: string, _child: string): void

    /**
     * 获取一个子节点的所有父节点定义
     * @param _child  子节点
     */
    findAllParent(_child: string): string[]
    /**
     *  是否拥有子节点
     * @param _id  父节点id
     */
    hasChild(_id: string): boolean

    /**
     *  获取所有子节点
     * @param _id  父节点id
     */
    getChild(_id: string): string[]

    listChild(_id: string): string[]

    indexOf(_id: string, _pid: string): number

    move(_id: string, _targetPid: string, _index: number, _oldPid: string): boolean

    remove(_id: string, _pid: string): boolean

    addAll(_other: HierarchicalRegister): void

    addChild(_pid: string, _childId: string, _index?: number): boolean

    replace(_oid: string, _nid: string): boolean

    length(_id: string): number

}

/**
 * 默认的注册表实现
 */
export class DefaultHierarchicalRegister implements HierarchicalRegister {
    registryMap: {
        [index: string]: string[]
    }
    root: string;
    constructor() {
        this.registryMap = {}
        this.root = ""
    }
    isRoot(id: string): boolean {
        return this.root === id
    }
    setRoot(root: string): void {
        this.root = root
    }
    register(parent: string, child: string): void {
        if (this.registryMap[parent]) {
            this.registryMap[parent].push(child)
        } else {
            this.registryMap[parent] = [child]
        }
        if (!this.registryMap[child]) {
            this.registryMap[child] = []
        }
    }
    findAllParent(child: string): string[] {
        return Object.keys(this.registryMap).filter(key => {
            const children = this.registryMap[key]
            if (children) {
                return children.includes(child)
            }
            return false
        })
    }
    hasChild(id: string): boolean {
        return this.registryMap[id] && this.registryMap[id].length > 0
    }
    listChild(id: string): string[] {
        return this.registryMap[id]
    }
    getChild(id: string): string[] {
        return this.registryMap[id] || []
    }
    indexOf(id: string, pid: string): number {
        if (this.registryMap[pid]) {
            return this.registryMap[pid].indexOf(id)
        }
        return -1
    }

    move(id: string, targetPid: string, index: number, oldPid: string): boolean {
        // 移除旧数据,然后追加到新数据
        if (this.registryMap[oldPid]) {
            const oldIndex = this.registryMap[oldPid].indexOf(id)
            if (oldIndex > -1) {
                this.registryMap[oldPid].splice(oldIndex, 1)
            }
        }
        if (this.registryMap[targetPid]) {
            const removeIndex = this.registryMap[targetPid].indexOf(id)
            if (removeIndex > -1) {
                this.registryMap[targetPid].splice(removeIndex, 1)
            }
            // add
            this.registryMap[targetPid].splice(index, 0, id)
        } else {
            this.registryMap[targetPid] = [id]
        }
        return true
    }
    addAll(other: HierarchicalRegister) {
        const orm = other.registryMap
        Object.keys(orm).forEach(key => {
            if (this.registryMap[key]) {
                return
            }
            const value = orm[key]
            this.registryMap[key] = value
        })
    }
    addChild(pid: string, childId: string, index: number = 0): boolean {
        const exist = this.registryMap[pid]
        if (!exist) {
            this.register(pid, childId)
            return true
        }
        let pos = index > exist.length - 1 ? exist.length : index
        pos = pos < 0 ? 0 : pos
        exist.splice(pos, 0, childId)
        if (!this.registryMap[childId]) {
            this.registryMap[childId] = []
        }
        return true
    }

    replace(oid: string, nid: string): boolean {
        const allParent = this.findAllParent(oid)
        if (!allParent) {
            return false
        }
        Object.keys(this.registryMap).forEach(pid => {
            const children = this.registryMap[pid]
            if (children) {
                const index = children.indexOf(oid)
                if (index > -1) {
                    children.splice(index, 1, nid)
                }
            }
        })
        return true
    }
    remove(id: string, pid: string): boolean {
        const children = this.registryMap[pid]
        if (children && children.length > 0) {

            const index = children.indexOf(id)
            children.splice(index, 1)
            return true
        }
        return false
    }
    length(id: string): number {
        if (this.registryMap[id]) {
            return this.registryMap[id].length
        }
        return -1
    }
}