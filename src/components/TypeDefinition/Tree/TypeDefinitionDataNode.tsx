// 用于将TypeDefinition对象做最简单的解析生成一个树
import { DefaultTypeDefinition } from "@/common/core";
import { ID } from "@/common/id";
import constants from "@/config/constants";
import { DataNode } from "antd/es/tree";
// 因为存在refer类型定义,所以在这里有可能会出现重复的key值,想要避免该问题,就必须想办法对key值进行可逆的变化,比如,最简单的方式就是抛弃原有的key值,重新创建一个key值的映射表
// 每一个数据的key值都是随机生成的,在转换为实际对象时,再根据对照表还原key值
// 通过这种方式可以有效的避免key值的重复问题

export interface TypeDefinitionDataNode extends DataNode {
    data: TypeDefinitionData
}
class KeyMap {
    keymap: {
        [index: string]: string
    }
    revert: {
        [index: string]: string
    }

    constructor() {
        this.keymap = {}
        this.revert = {}
    }
    add(n: string, o: string) {
        this.keymap[n] = o;
        this.revert[o] = n;
    }

    removeByNewId(n: string) {
        delete this.keymap[n]
    }

    removeByOldId(n: string) {
        delete this.revert[n]
    }

    encode(o: string): string {
        const n = ID();
        this.add(n, o)
        return n
    }
    contains(n: string): boolean {
        return this.keymap[n] !== undefined
    }
    get(o: string): string {
        return this.keymap[o]
    }
    decode(id: string) {
        return this.revert[id] || this.encode(id)
    }
}
/**
 * 类型定义数据
 */
export class TypeDefinitionData {
    data: DefaultTypeDefinition
    belong?: TypeDefinitionData

    constructor(data: DefaultTypeDefinition, belong?: TypeDefinitionData) {
        this.data = data;
        this.belong = belong;
    }
    /**
     * 判断一个元素是否可以放置到当前集合中
     * @param drag 需要放置的元素
     */
    canDrop(): boolean {
        return this.canAddChild();
    }

    canDrag(): boolean {
        return !this.isBuiltIn()
    }

    /**
     * 判断一个元素是否是内置元素,该内置元素是不允许执行,rename,delete操作的,
     * 比如: array和refer类型的element子元素
     */
    isBuiltIn(): boolean {
        // 父
        if (!this.belong) {
            return false
        }
        const p = this.belong;
        const pt = p.data.type;

        const name = this.data.name;
        if (pt.isArray()) {
            return name === constants.ARRAY_ITEM_NAME
        }
        if (pt.isRefer()) {
            return name === constants.ARRAY_ITEM_NAME
        }
        return false;
    }

    /**
     * 用于判断一个元素是否可以添加新的子元素,像list是不可以直接添加子元素的
     */
    canAddChild(): boolean {
        const type = this.data.type;
        // 如果当前类型是array的话,也是不可以放置的
        return type.isComplex() && !type.isArray() && !type.isStruct() && this.canEditor();
    }

    canAddBrother(): boolean {
        return (this.belong?.canAddChild() && this.canEditor()) || false
    }
    /**
     * 判断当前元素是否可以移除,有些元素是固定数据,是无法执行移除操作的
     */
    canRemove(): boolean {
        return !this.isBuiltIn()
    }

    /**
     * 判断一个元素是否可以进行编辑操作,
     * struct结构的数据是不可进行编辑操作的,因为该结构需要和外部资源强关联
     */
    canEditor(): boolean {
        // const type = this.data.type;
        // if (this.belong) {
        //     return this.belong.canEditor() && !type.isStruct()
        // }
        // return !type.isStruct()
        if (this.belong) {
            if (this.belong.canEditor()) {
                return !this.belong.data.type.isStruct()
            } {
                return false
            }
        }
        return true
    }
}

/**
 * 类型定义树,将负责的数据操作,尽可能变得更得更简单一些
 */
export class TypeDefinitionTree {
    root: string
    // key值对照表
    keymap: KeyMap
    /**
     * 以TypeDefinition的id作为index存放数据,避免使用数组,循环分析数据
     */
    items: {
        [index: string]: DefaultTypeDefinition
    }
    cache: {
        [index: string]: TypeDefinitionDataNode
    }
    /**
     * 父查子
     * 以TypeDefinition的id作为index存放数据,值保存了该TypeDefinition的所有子项
     */
    relationship: {
        [index: string]: string[]
    }

    /**
     * 子查父
     */
    reverseRelationship: {
        [index: string]: string
    }

    static of(td: DefaultTypeDefinition): TypeDefinitionTree {
        return new TypeDefinitionTree(td)
    }

    constructor(td?: DefaultTypeDefinition) {
        this.keymap = new KeyMap()
        this.root = ""
        this.items = {}
        this.cache = {}
        this.relationship = {}
        this.reverseRelationship = {}

        if (!td) {
            return
        }

        this.root = this.keymap.encode(td.id)
        this.items[this.root] = td

        td.recursionChildWithCallback((c: DefaultTypeDefinition, p: DefaultTypeDefinition) => {
            const cid = this.keymap.encode(c.id);
            const pid = this.keymap.decode(p.id)
            this.items[cid] = c

            let res = this.relationship[pid];
            if (!res) {
                this.relationship[pid] = res = []
            }
            res.push(cid)
            this.reverseRelationship[cid] = pid
        })
    }

    copy(): TypeDefinitionTree {
        const newTree = new TypeDefinitionTree()
        newTree.root = this.root
        newTree.keymap = this.keymap
        newTree.items = this.items
        newTree.relationship = this.relationship
        newTree.reverseRelationship = this.reverseRelationship

        return newTree
    }
    toNode(): TypeDefinitionDataNode {
        return this.covertToNode(this.root)
    }
    getNode(id: string): TypeDefinitionDataNode {
        return this.covertToNode(id)
    }
    covertToNode(id: string): TypeDefinitionDataNode {
        const cached = this.cache[id]
        if (cached) {
            return cached
        }
        const pid = this.reverseRelationship[id];
        let belong;
        if (pid) {
            belong = this.cache[pid]
            if (!belong) {
                this.cache[pid] = belong = this.covertToNode(pid)
            }
        }

        const data: TypeDefinitionDataNode = {
            key: id,
            data: new TypeDefinitionData(this.items[id], belong?.data)
        }
        this.cache[id] = data
        const child = this.relationship[id];
        if (child) {
            data.children = child.map(c => this.covertToNode(c))
        }
        return data
    }
    get(id: string) {
        return this.items[id]
    }
    hasChild(id: string, filter: (_tdId: string, _td: DefaultTypeDefinition) => boolean): boolean {
        const child = this.relationship[id];
        if (child) {
            return child.some((cid: string) => {
                return filter(cid, this.items[cid])
            })
        }
        return false
    }
    hasBrother(id: string, filter: (_tdId: string, _td: DefaultTypeDefinition) => boolean): boolean {
        return this.hasChild(this.reverseRelationship[id], filter)
    }

    indexOf(id: string): number {
        const pid = this.reverseRelationship[id];
        const child = this.relationship[pid];
        return child ? child.indexOf(id) : -1
    }
    before(source: string, target: string): void {
        const pid = this.reverseRelationship[target];
        this.move(source, pid, this.indexOf(target) - 1)
    }
    after(source: string, target: string): void {
        const pid = this.reverseRelationship[target];
        this.move(source, pid, this.indexOf(target))
    }
    /**
     * 将一个元素移动到另一个元素下
     * @param source
     * @param target
     * @param index
     */
    move(source: string, target: string, index: number): void {
        // 移动包含两个操作
        // 1. 移除旧位置
        const pid = this.reverseRelationship[source];
        const pChild = this.relationship[pid];
        const oldIndex = pChild.indexOf(source);
        if (oldIndex === -1) {
            // 元素不存在,离谱
            return
        }

        // 移除
        pChild.splice(oldIndex, 1)

        // 2. 将其添加到目标数组
        let sChild = this.relationship[target]
        if (sChild === undefined) {
            this.relationship[target] = sChild = []
        }
        sChild.splice(index === -1 ? sChild.length - 1 : index, 0, source)
        this.reverseRelationship[source] = target
    }

    remove(id: string, recursion: boolean = false): DefaultTypeDefinition {
        const pid = this.reverseRelationship[id];
        const pChild = this.relationship[pid];
        const oldIndex = pChild.indexOf(id);
        if (oldIndex === -1) {
            // 元素不存在,离谱
            return DefaultTypeDefinition.create()
        }
        // 移除
        pChild.splice(oldIndex, 1)
        // 同时从列表中移除该数据
        const item = this.items[id];
        if (recursion) {
            const child = this.relationship[id];
            if (child) {
                child.forEach(c => {
                    this.remove(c, recursion)
                })
            }
        }
        delete this.items[id]
        delete this.reverseRelationship[id]
        delete this.relationship[id]

        return item
    }

    clearChild(id: string): void {
        const child = this.relationship[id];
        console.log(child);

        if (!child) {
            return
        }
        child.forEach(c => {
            console.log(c, "remove")
            delete this.items[c]
            delete this.reverseRelationship[c]
            this.keymap.removeByNewId(c)
        })
        this.relationship[id] = []
    }

    createChild(id: string, td?: DefaultTypeDefinition): DefaultTypeDefinition {
        let child = this.relationship[id];
        if (!child) {
            child = []
            this.relationship[id] = child
        }
        const c = td || DefaultTypeDefinition.create()
        const cid = this.keymap.encode(c.id)
        // 调整默认的添加行为,添加到最前方便于编辑
        child.splice(0, 0, cid)
        // child.push(cid)
        this.items[cid] = c
        this.reverseRelationship[cid] = id
        return c
    }

    createBrother(id: string, before?: boolean, td?: DefaultTypeDefinition): DefaultTypeDefinition {
        const pid = this.reverseRelationship[id];
        const pChild = this.relationship[pid];
        let oldIndex = pChild.indexOf(id);
        if (oldIndex === -1) {
            // 元素不存在,离谱
            return DefaultTypeDefinition.create()
        }

        oldIndex = before ? oldIndex : oldIndex + 1
        const c = td || DefaultTypeDefinition.create()
        const cid = this.keymap.encode(c.id)
        this.items[cid] = c
        this.reverseRelationship[cid] = id
        pChild.splice(oldIndex, 0, cid)
        return c
    }

    toObject(id?: string): DefaultTypeDefinition {
        const nid = id || this.root
        const item = this.items[nid];
        const td = new DefaultTypeDefinition(item)
        td.type.items = []
        this.relationship[nid]?.forEach(c => {
            td.type.items.push(this.toObject(c))
        })
        return td;
    }

    toJsonObject(id?: string, skipNull: boolean = true, skipFunc: boolean = true) {
        const nid = id || this.root
        const item = this.items[nid];
        const otd = new DefaultTypeDefinition(item)

        const td = otd as unknown as {
            [index: string]: unknown
            type: Core.Type
        }

        const tdType = td.type as unknown as {
            [index: string]: unknown
            raw: unknown,
            complex: unknown,
            map: unknown,
            struct: unknown,
            refer: unknown,
            slot: unknown,
            array: unknown,
            type: Core.Type
            items: unknown[]
        }

        this.relationship[nid]?.forEach(c => {
            const vjson = this.toJsonObject(c, skipNull, skipFunc)
            tdType.items.push(vjson)
        })


        if (skipFunc) {
            delete tdType.raw
            delete tdType.complex
            delete tdType.map
            delete tdType.struct
            delete tdType.refer
            delete tdType.slot
            delete tdType.array
        }

        if (skipNull) {
            for (const key of Object.keys(tdType)) {
                const v = td[key]
                if (v === undefined || v === null) {
                    delete td[key]
                }
            }

            for (const key of Object.keys(td)) {
                const v = td[key]
                if (v === undefined || v === null) {
                    delete td[key]
                }
            }
        }
        td.type = tdType as unknown as Core.Type
        return td
    }

    doWitchChild(id: string, callback: (_cid: string, _td: DefaultTypeDefinition) => void) {
        this.relationship[id]?.forEach((cid: string) => {
            callback(cid, this.items[cid])
            this.doWitchChild(cid, callback)
        })
    }
}


/**
 * 将TypeDefinition转换为antd能识别的节点数据
 * @param td TypeDefinition
 * @param belong 当td是一个内嵌定义时,belong表示其所属的TypeDefinition
 */
export const buildTypeDefinitionDataNode = (td: DefaultTypeDefinition, belong?: TypeDefinitionData): TypeDefinitionDataNode => {

    const data: TypeDefinitionDataNode = {
        className: "",
        key: td.id,
        data: new TypeDefinitionData(td, belong)
    }
    data.children = td.type.items.map((ctd: Core.TypeDefinition) => { return buildTypeDefinitionDataNode(DefaultTypeDefinition.ensure(ctd), data.data) })
    return data
}
