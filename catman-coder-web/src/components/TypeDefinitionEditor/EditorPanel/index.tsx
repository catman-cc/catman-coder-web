import { ComplexType, DefaultTypeDefinition } from "catman-coder-core";
import { TreeRow } from "@/components/TypeDefinitionEditor/EditorPanel/Row";
import { useDebounceFn } from "ahooks";
import { Badge, InputRef, Tooltip, Tree } from "antd";
import { DataNode } from "antd/es/tree";
import { useEffect, useState } from "react";
import "./index.less";
export interface TypeDefinitionEditorProps {
  /**
   * 传入的类型定义
   */
  defaultSchema: TypeDefinitionSchema;
  /**
   * 保存类型定义的回调
   */
  onChange?: (schema: TypeDefinitionSchema) => void;
}

export const TypeDefinitionEditor = (props: TypeDefinitionEditorProps) => {
  const [nameRefs, setNameRefs] = useState<{ [index: string]: InputRef }>({});
  // 以一个树状结构展示所有的类型定义
  const [tree, setTree] = useState<TypeDefinitionSchemaTree[]>([
    schemaParse(props.defaultSchema),
  ]);

  // useEffect(() => {
  //   if (JSON.stringify(tree[0].schema) === JSON.stringify(props.schema)) {
  //     // 避免无限循环
  //     return;
  //   }
  //   setTree([schemaParse(props.schema)]);
  // }, [props]);

  const save = useDebounceFn(
    (tree: TypeDefinitionSchemaTree) => {
      if (props.onChange) {
        console.warn("save", tree, tree.toSchema());
        props.onChange(tree.toSchema());
      }
    },
    { wait: 200, leading: true, trailing: true }
  );
  useEffect(() => {
    console.log("tree was changed", tree[0]);
    save.run(tree[0]);
  }, [tree]);

  return (
    <Tree
      style={{
        position: "relative",
      }}
      className={"type-definition-tree"}
      defaultExpandAll
      // draggable={true}
      treeData={tree}
      showLine={true}
      onDrop={(info) => {
        const dropKey = info.node.key as string; // 目标元素
        const dragKey = info.dragNode.key as string; // 被拖拽的元素
        // 如果dropToGap是真的,那么position就表示他是目标位置
        // position表示相对于目标元素的位置,等于目标元素的索引+-1
        const position = info.dropPosition; // 元素放置的位置,即目标index,改index要和节点本身关联
        //  0 下方 1 内部 2 内部

        if (info.dropToGap) {
          if (info.node.dragOverGapTop) {
            // 在目标节点的上方
            console.log("上方", info.node.dragOverGapTop);
            tree[0].move(dragKey, dropKey, -1);
          } else {
            // 在目标节点的下方
            console.log("下方", info.node.dragOverGapTop);
            tree[0].move(dragKey, dropKey, 1);
          }
        } else {
          // 放在了节点上,那就表示是内部
          tree[0].move(dragKey, dropKey, 0);
        }
        save.run(tree[0]);
      }}
      blockNode
      titleRender={(node) => {
        if (
          node.schema.circularRefs &&
          node.schema.circularRefs[node.typeDefinitionId] !== undefined
        ) {
          return (
            <Badge.Ribbon
              color={"red"}
              text={
                <Tooltip
                  title={"当前类型被循环引用,此处展示一个唯一标记📌,便于查看"}
                >
                  {Object.keys(node.schema.circularRefs).indexOf(
                    node.typeDefinitionId
                  ) + 1}
                </Tooltip>
              }
            >
              <TreeRow
                tree={node}
                nameRefs={nameRefs}
                addNameRef={(id, ref) => {
                  nameRefs[id] = ref;
                  setNameRefs({ ...nameRefs });
                }}
                onChange={(t) => {
                  setTree([t.root()]);
                }}
              />
            </Badge.Ribbon>
          );
        }

        return (
          <span>
            <TreeRow
              tree={node}
              nameRefs={nameRefs}
              addNameRef={(id, ref) => {
                nameRefs[id] = ref;
                setNameRefs({ ...nameRefs });
              }}
              onChange={(t) => {
                setTree([t.root()]);
                // save.run(t.root());
              }}
            />
          </span>
        );
      }}
    />
  );
};

export interface TypeDefinitionTree extends DataNode {
  id: string;
  parent?: string;
  children?: TypeDefinitionTree[];
  schema: TypeDefinitionSchema;
}

export function simpleParse(schema: TypeDefinitionSchema) {
  // 构建树
  const root = schema.definitions[schema.root];
  return deepSimpleParse(root!, schema);
}

/**
 *  解析类型定义为树节点
 * @param typeDefinition  被解析的类型定义
 * @param schema  维护了所有公开类型定义的元数据对象
 * @param parent  当前类型定义所属的父定义
 * @returns  被解析后的一个树节点
 */
function deepSimpleParse(
  typeDefinition: TypeDefinition,
  schema: TypeDefinitionSchema,
  parent?: string
): TypeDefinitionTree {
  // 初始化树节点的基本定义
  const tree: TypeDefinitionTree = {
    id: typeDefinition.id!,
    key: typeDefinition.id!,
    parent: parent,
    schema: schema,
  };

  const type = typeDefinition.type;

  /**
   * 解析当前类型定义的子元素定义
   */
  const children = type.sortedAllItems.map((item) => {
    let itemTypeDefinition: TypeDefinition | undefined = undefined;
    if (item.scope === "PRIVATE") {
      itemTypeDefinition = type.privateItems[item.itemId];
    }
    if (!itemTypeDefinition) {
      itemTypeDefinition = schema.definitions[item.itemId];
    }
    if (!itemTypeDefinition) {
      throw new Error(`无法找到类型定义:${item.itemId}`);
    }
    // 递归解析子元素定义
    return deepSimpleParse(itemTypeDefinition, schema, typeDefinition.id);
  });

  if (children.length > 0) {
    // 只有在拥有子元素时,才会初始化子节点数组
    tree.children = children;
  }
  return tree;
}

export class TypeDefinitionSchemaTree implements TypeDefinitionTree {
  id: string; // tree的唯一标志
  key: string; // tree的key值,类似于id
  typeDefinitionId: string; // 对应的类型定义
  children: TypeDefinitionSchemaTree[]; // 当前组件的子组件
  refs?: TypeDefinitionSchemaTree[];
  schema: TypeDefinitionSchema;
  leafs: { [index: string]: TypeDefinitionSchemaTree } = {};
  circular: string[] = [];
  parent?: TypeDefinitionSchemaTree;
  circularReference: boolean = false;
  constructor(
    id: string,
    key: string,
    typeDefinitionId: string,
    children: TypeDefinitionSchemaTree[],
    schema: TypeDefinitionSchema,
    leafs: { [index: string]: TypeDefinitionSchemaTree } = {},
    parent?: TypeDefinitionSchemaTree
  ) {
    this.id = id;
    this.key = key;
    this.typeDefinitionId = typeDefinitionId;
    this.children = children;
    this.schema = schema;
    this.leafs = leafs;
    this.parent = parent;
  }

  root() {
    return this.leafs[this.schema.root];
  }

  generatorFullKey(): string {
    if (!this.parent) {
      return this.key;
    }
    if (this.getTypeDefinition().scope.toString() === "PUBLIC") {
      return this.key;
    }

    if (this.parent.getTypeDefinition().scope.toString() === "PUBLIC") {
      return `${this.parent.typeDefinitionId}.${this.key}`;
    }

    return `${this.parent.generatorFullKey()}.${this.key}`;
  }

  updateType(type: Type, allowChangeRoot?: boolean) {
    // 更新当前节点的类型,主要需要调整当前节点的children,包括新增和删除
    const definition = this.getTypeDefinition();
    if (this.schema.root === definition.id && !allowChangeRoot) {
      // 根节点不允许修改类型
      return this;
    }
    definition.type = type;
    // return this;
    return this.update(definition);
  }

  /**
   * 更新当前节点的类型定义,就两步
   * 1. 递归解析当前节点的子节点,并将子节点的类型定义更新到schema中
   * 2. 更新当前节点的类型定义
   * @param td
   */
  update(td: TypeDefinition) {
    // 该操作用于更新当前节点的类型定义
    // 首先需要查找到当前节点的父节点,然后将当前节点替换为新的节点
    const parent = this.getParent();
    // 如果没有父节点,则说明当前节点是根节点,那就直接按照public的方式更新
    // this.schema.definitions[this.id] = td;
    this.schema.definitions[this.typeDefinitionId] = td;
    this.schema.context.typeDefinitions[this.typeDefinitionId] = td;
    if (parent) {
      const pt = parent.getType();
      pt.privateItems[this.typeDefinitionId] = td;
    }

    const newTree = deepParse(td, this.schema, this.parent);
    this.leafs[this.id] = newTree;
    console.log("new-tree", newTree);
    return newTree;
  }

  change(tree: TypeDefinitionSchemaTree) {
    // 更新树中的某个节点
    this.leafs[tree.id] = tree;
    if (tree.leafs !== this.leafs) {
      tree.leafs = this.leafs;
    }
    return this;
  }

  remove() {
    // 删除当前节点
    const parent = this.getParent();
    if (!parent) {
      throw new Error(`无法删除根节点`);
    }
    parent.deleteChild(this.id);
    return parent;
  }

  deleteChild(id: string) {
    // 删除某个子节点
    const index = this.children.findIndex((c) => c.id === id);
    if (index === -1) {
      return;
    }
    this.children.splice(index, 1);
  }

  replaceLeaf(leaf: TypeDefinitionSchemaTree) {
    const index = this.children.findIndex((c) => c.id === leaf.id);
    if (index === -1) {
      throw new Error(`无法找到需要替换的叶子节点:${leaf.id}`);
    }
    this.children[index] = leaf;
    this.leafs[leaf.id] = leaf;
    if (leaf.leafs !== this.leafs) {
      leaf.leafs = this.leafs;
    }
  }

  createChild(td: TypeDefinition) {
    // 简单校验,不能重复创建同名的节点
    const exist = this.children.find((c) => {
      return c.getTypeDefinition().name === td.name;
    });
    if (exist) {
      if (td.name === "") {
        return {
          id: exist.id,
          msg: "当前已经存在了一个空白节点,禁止重复创建",
        };
      }
      return {
        id: exist.id,
        msg: "当前已经存在了一个名称为:${td.name}的节点,禁止重复创建`",
      };
    }
    // 创建一个子节点
    const child = deepParse(td, this.schema, this);
    this.addLeaf(child);
    return child;
  }

  createChildFromTypeName(typeName: string, name?: string) {
    // 创建一个子节点
    return this.createChildFromType(ComplexType.ofType(typeName), name);
  }

  createChildFromType(type: ComplexType, name?: string) {
    const td = new DefaultTypeDefinition();
    td.name = name || "";
    td.type = type;
    return this.createChild(td);
  }

  createBrotherFromTypeName(typeName: string, name?: string, before?: boolean) {
    // 创建一个兄弟节点
    return this.createBrotherFromType(
      ComplexType.ofType(typeName),
      name,
      before
    );
  }

  createBrotherFromType(type: ComplexType, name?: string, before?: boolean) {
    const td = new DefaultTypeDefinition();
    td.name = "";
    td.type = type;
    return this.createBrother(td, before);
  }

  createBrother(td: TypeDefinition, before?: boolean) {
    // 创建一个兄弟节点
    const parent = this.getParent();
    if (!parent) {
      throw new Error(`无法创建根节点的兄弟节点`);
    }
    // 简单校验,不能重复创建同名的节点
    const exist = parent.children.find((c) => {
      return c.getTypeDefinition().name === td.name;
    });
    if (exist) {
      if (td.name === "") {
        return {
          id: exist.id,
          msg: "当前已经存在了一个空白节点,禁止重复创建",
        };
      }
      return {
        id: exist.id,
        msg: "当前已经存在了一个名称为:${td.name}的节点,禁止重复创建`",
      };
    }
    const child = parent.createChild(td);
    parent.move(child.id, this.id, before ? -1 : 1);
  }

  insertBefore(leaf: TypeDefinitionSchemaTree, targetId: string) {
    this.insert(leaf, targetId, true);
  }

  insert(leaf: TypeDefinitionSchemaTree, targetId: string, before: boolean) {
    const index = this.children.findIndex((c) => c.id === targetId);
    if (index === -1) {
      throw new Error(`无法找到目标节点:${targetId}`);
    }
    this.children.splice(before ? index : index + 1, 0, leaf);
    this.addLeaf(leaf);

    // 修改类型定义中的顺序
    const td = this.getTypeDefinition();
    const sortedAllItems = td.type.sortedAllItems;
    const targetIndex = sortedAllItems.findIndex((c) => c.itemId === targetId);
    if (targetIndex === -1) {
      throw new Error(`无法找到目标节点:${targetId}`);
    }
    sortedAllItems.splice(targetIndex, 0, {
      itemId: leaf.id,
      name: leaf.key,
      scope: "PRIVATE",
    });
    td.type.privateItems[leaf.id] = leaf.getTypeDefinition();
  }

  insertAfter(leaf: TypeDefinitionSchemaTree, targetId: string) {
    this.insert(leaf, targetId, false);
  }

  /**
   *
   * @param moveId
   * @param targetId
   * @param position -1 下方 0 内部 1 上方
   */
  move(moveId: string, targetId: string, position: number) {
    // 移动节点,将moveId移动到targetId的前面或者后面,或者内部
    const moveTree = this.leafs[moveId];
    const targetTree = this.leafs[targetId];
    if (!moveTree) {
      throw new Error(`无法找到需要移动的节点:${moveId}`);
    }
    if (!targetTree) {
      throw new Error(`无法找到目标节点:${targetId}`);
    }

    const moveParent = moveTree.getParent();
    console.log("move", moveTree, targetTree, moveParent);
    if (!moveParent) {
      throw new Error(`无法移动根节点`);
    }
    moveParent.deleteChild(moveId);
    if (position === 0) {
      // 移动到targetId节点的内部
      // 将moveTree添加到targetTree中
      targetTree.addLeaf(moveTree);
    } else {
      // 移动到targetId节点的前后
      const targetParent = targetTree.getParent();
      if (!targetParent) {
        throw new Error(`不支持多个根节点`);
      }
      targetParent.addLeafBefore(moveTree, targetId, position === -1);
    }
  }

  addLeaf(leaf: TypeDefinitionSchemaTree) {
    this.children.push(leaf);
    // 一个leaf可能不止一个parent了,比如同时在两个地方引用了同一个类型a的b字段是一个引用类型,该类型的值指向了一个b类型的定义
    // 不对,能被复用的其实是类型定义的type,而不是类型定义本身
    if (leaf.getParentTypeDefinition()?.scope.toString() !== "PUBLIC") {
      // 很重要,公开类型的定义,不要修改父节点
      leaf.parent = this;
      this.leafs[leaf.id] = leaf;
      if (leaf.leafs !== this.leafs) {
        Object.entries(leaf.leafs).forEach(([key, value]) => {
          this.leafs[key] = value;
        });
        leaf.leafs = this.leafs;
      }
    }
  }

  addRefs(ref: TypeDefinitionSchemaTree) {
    this.refs = this.refs || [];
    this.refs.push(ref);
    if (ref.getParentTypeDefinition()?.scope.toString() !== "PUBLIC") {
      this.leafs[ref.id] = ref;
      if (ref.leafs !== this.leafs) {
        Object.entries(ref.leafs).forEach(([key, value]) => {
          this.leafs[key] = value;
        });
        ref.leafs = this.leafs;
      }
    }
  }

  addLeafBefore(
    leaf: TypeDefinitionSchemaTree,
    targetId: string,
    before?: boolean
  ) {
    const index = this.children.findIndex((c) => c.id === targetId);
    if (index === -1) {
      throw new Error(`无法找到目标节点:${targetId}`);
    }
    this.children.splice(before ? index : index + 1, 0, leaf);
  }

  addLeafWithPosition(leaf: TypeDefinitionSchemaTree, pos: number) {
    if (pos < 0 || pos > this.children.length) {
      this.children.push(leaf);
    } else {
      this.children.splice(pos, 0, leaf);
    }

    this.leafs[leaf.id] = leaf;
    if (leaf.leafs !== this.leafs) {
      Object.entries(leaf.leafs).forEach(([key, value]) => {
        this.leafs[key] = value;
      });
      leaf.leafs = this.leafs;
    }
  }

  // 获取整棵树的最大深度
  maxLevel(): number {
    // 从根节点开始,递归获取所有子节点的最大深度
    if (!this.getParent()) {
      return this.getMaxChildrenDeep() + 1;
    }
    return this.getParent()!.maxLevel()!;
  }

  getMaxChildrenDeep(): number {
    if (this.children.length === 0) {
      return 0;
    }
    return this.children
      .map((c) => c.getMaxChildrenDeep() + 1)
      .sort((a, b) => b - a)[0];
  }

  getLevel(): number {
    if (this.parent === undefined) {
      return 0;
    }
    return this.parent!.getLevel()! + 1;
  }

  isPublic(): boolean {
    return (
      this.schema.definitions[this.typeDefinitionId]!.scope.toString() ===
      "PUBLIC"
    );
  }

  getChildDefinition(id: string): TypeDefinition {
    const td = this.schema.definitions[id];
    if (td) {
      return td;
    }
    const ptd = this.getParentTypeDefinition();
    if (!ptd) {
      throw new Error(`无法找到类型定义:${id}`);
    }
    return ptd.type.privateItems[id];
  }

  canHasChildren(): boolean {
    return canHasChildren(this.getTypeName());
  }

  canHasBrother(): boolean {
    const pt = this.getParent();
    return pt?.canAddChild() || false;
  }

  canAddChild(): boolean {
    return (
      this.canHasChildren() &&
      "array" !== this.getTypeName() &&
      "refer" !== this.getTypeName()
    );
  }

  canRemove(): boolean {
    return (
      this.parent !== undefined && this.getParent()?.getTypeName() !== "array"
    );
  }

  canRename(): boolean {
    return this.getParent()?.getTypeName() !== "array";
  }

  isReferFieldButNotRoot(): boolean {
    // 判断当前是否是被引用的字段,从自身网上查,如果有refer类型,则是被引用的字段
    const parent = this.getParent();
    if (!parent) {
      return false;
    }
    if (parent.typeDefinitionId === this.schema.root) {
      return false;
    }
    if (parent.getTypeDefinition().scope.toString() === "PUBLIC") {
      return true;
    }
    return parent.isReferFieldButNotRoot();
  }

  canEdit(): boolean {
    // 被引入的类型,不允许编辑
    if (this.schema.root !== this.typeDefinitionId && this.isPublic()) {
      return false;
    }
    // 同理,被引入的类型的子字段,也不允许编辑
    return !this.isReferFieldButNotRoot();
  }

  getBelongPublic(): TypeDefinitionSchemaTree | undefined {
    const parent = this.getParent();
    if (!parent) {
      return undefined;
    }
    if (parent.isPublic()) {
      return parent;
    }
    return parent.getBelongPublic();
  }

  getAllBelongPublic(): TypeDefinitionSchemaTree[] {
    const parent = this.getParent();
    if (!parent) {
      return [];
    }
    if (parent.isPublic()) {
      return [parent, ...parent.getAllBelongPublic()];
    }
    return parent.getAllBelongPublic();
  }
  deepfilter(
    filter: (leaf: TypeDefinitionSchemaTree) => boolean
  ): TypeDefinitionSchemaTree[] {
    const children = this.children.filter(filter);
    const deepChildren = this.children.map((c) => c.deepfilter(filter)).flat();
    return [...children, ...deepChildren, ...(filter(this) ? [this] : [])];
  }

  /**
   * 判断当前节点是否是循环引用
   */
  isCircularReference(): boolean {
    const parent = this.getParent();
    if (!parent) {
      return false;
    }
    // 是公开类型,判断是否是循环引用,子节点包含了祖宗节点,则是循环引用
    // 先获取所有public类型的祖宗节点
    const allBelongPublic = this.getAllBelongPublic();
    // 判断当前节点的子节点是否包含了祖宗节点
    const finds = this.deepfilter((leaf) => {
      return allBelongPublic.find((p) => p.id === leaf.id) !== undefined;
    });
    return finds.length > 0;
  }

  getType() {
    return this.getTypeDefinition().type;
  }

  getParentType() {
    return this.getParent()?.getType();
  }

  getParent(): TypeDefinitionSchemaTree | undefined {
    return this.parent;
  }

  getTypeName(): string {
    return this.getType().typeName;
  }

  flushSelf(): TypeDefinitionSchemaTree {
    // 从root节点开始遍历,找到所有child中包含自己的元素,修改引用到自身
    const root = this.root();
    const refs = root.deepfilter((leaf) => {
      const index = leaf.children.findIndex((c) => c.id === this.id);
      if (index !== -1) {
        leaf.children[index] = this;
        return true;
      }
      return false;
    });
    console.log("flush child refs", refs.length);
    return this;
  }

  getTypeDefinition(): TypeDefinition {
    let td = this.schema.definitions[this.typeDefinitionId]!;
    if (td) {
      return td;
    }
    const ptd = this.getParentTypeDefinition();
    if (!ptd) {
      // 不应该返回假td,应该抛出异常,但不知道为什么,tree渲染的时候,会访问一次旧数据,而旧数据已经被移除了,导致报错
      return {
        id: this.typeDefinitionId,
        name: `无法找到类型定义:${this.id}`,
        scope: "PUBLIC",
        type: {
          typeName: "string",
          sortedAllItems: [],
          privateItems: {},
          definitionMap: {},
        },
        limitedChanges: false,
      };
    }
    td = ptd.type.privateItems[this.typeDefinitionId];
    if (td) {
      return td;
    }
    // 不应该返回假td,应该抛出异常,但不知道为什么,tree渲染的时候,会访问一次旧数据,而旧数据已经被移除了,导致报错
    return {
      id: this.typeDefinitionId,
      name: `无法找到类型定义:${this.typeDefinitionId}`,
      scope: "PUBLIC",
      type: {
        typeName: "string",
        sortedAllItems: [],
        privateItems: {},
        definitionMap: {},
      },
      limitedChanges: false,
    };
  }

  getParentTypeDefinition(): TypeDefinition | undefined {
    // 一个类型定义,可能存在于两个地方,一个是根节点,一个是其他节点的子节点
    const p = this.getParent();
    if (p) {
      return p.getTypeDefinition();
    }
    return undefined;
  }

  deepCopy(): TypeDefinitionSchemaTree {
    const newSchmea = this.toSchema();
    return schemaParse(newSchmea);
  }
  copy(): TypeDefinitionSchemaTree {
    // return {
    //   ...this,
    // };
    return new TypeDefinitionSchemaTree(
      this.id,
      this.key,
      this.typeDefinitionId,
      this.children.map((c) => c.copy()),
      this.schema,
      this.leafs,
      this.parent
    );
  }

  toSchema(): TypeDefinitionSchema {
    const newSchema = {
      root: this.schema.root,
      definitions: {},
      refs: {},
    } as TypeDefinitionSchema;
    const root = this.root().toTypeDefinition(newSchema, true);
    newSchema.definitions[root.id!] = root;
    return newSchema;
  }

  /**
   *
   * @param schema 新的schema主要用于子元素填充引用的public类型的定义
   */
  toTypeDefinition(
    schema: TypeDefinitionSchema,
    mustDeep: boolean
  ): TypeDefinition {
    const current = this.schema.definitions[this.typeDefinitionId];
    if (current.scope.toString() === "PUBLIC") {
      schema.definitions[this.typeDefinitionId] = current;
      if (!mustDeep) {
        return current;
      }
    }
    // 接下来将children转换成typeDefinition
    const type = current.type;
    const newType: Type = {
      typeName: type.typeName,
      items: [],
      privateItems: {},
      sortedAllItems: [],
    };

    const itemList = ["refer", "generic"].includes(type.typeName)
      ? this.refs || []
      : this.children;

    itemList.forEach((c) => {
      // 每一个子节点都是一个类型定义
      const childTypeDefinition = c.toTypeDefinition(schema, false);
      newType.sortedAllItems.push({
        itemId: childTypeDefinition.id!,
        name: childTypeDefinition.name,
        scope: childTypeDefinition.scope,
      });

      if (childTypeDefinition.scope.toString() !== "PUBLIC") {
        newType.privateItems[childTypeDefinition.id!] = childTypeDefinition;
      }
    });

    return {
      ...current,
      id: current.id,
      name: current.name,
      scope: current.scope,
      type: newType,
    } as TypeDefinition;
  }
}

function schemaParse(schema: TypeDefinitionSchema) {
  // 构建树
  const root = schema.definitions[schema.root];
  return deepParse(root!, schema);
}

/**
 * 将类型定义转换为树状结构
 * 假设数据结构:
 *     a
 *   b   c
 *  d     d
 *  解析顺序将会是abdcd,第一次解析d的时候,生成叶子节点,并将其添加到父节点中,第二次解析d的时候,这时候发现d有多个父节点
 *  td->type->tds    a -> at -> b ->bt ->d  c -> ct -> d       d是类型定义,但是类型本质上分别是bt和ct
 *  为了保持这个结构,树状结构中,必须包含类型这一层,否则无法区分d是bt还是ct
 *
 *  a - b -c -a  解析到第二个a的时候,发现已经存在一个a了,第一个a没有父节点,但是第二个a的父节点是c,所以需要想办法区分这两个a
 *  这意味着必须修改leaf的id算法,不能再使用类型定义的id,而是需要使用类型定义的id+父节点的id,这样就能保证id的唯一性,从而保证树状结构的正确
 * @param typeDefinition 类型定义
 * @param schema 类型定义元数据
 * @param parent 父节点
 */
function deepParse(
  typeDefinition: TypeDefinition,
  schema: TypeDefinitionSchema,
  parent?: TypeDefinitionSchemaTree
): TypeDefinitionSchemaTree {
  const type = typeDefinition.type;
  const leafs = parent?.leafs || {};

  // 公开类型的id,直接使用类型定义的id即可
  const id =
    typeDefinition.scope.toString() === "PUBLIC"
      ? typeDefinition.id!
      : parent
      ? parent.generatorFullKey() + "." + typeDefinition.id!
      : typeDefinition.id!;

  if (typeDefinition.scope.toString() === "PUBLIC") {
    // ① 优先读取缓存,如果缓存中不存在,则需要重新解析
    // ②  根元素,直接命中缓存,会导致修改失败,因此针对根元素,不使用缓存
    const cache = leafs[id];
    if (cache) {
      return cache;
    }
  }

  const tree = new TypeDefinitionSchemaTree(
    id,
    id!,
    // key!,
    typeDefinition.id!,
    [],
    schema,
    leafs,
    parent
  );
  // 这里直接修改leafs数据,不会影响到已渲染节点中的child字段,所以此处在tree发生了变化之后,需要手动修改所有引用了该节点的节点引用
  leafs[id] = tree;
  tree.flushSelf();
  // 避免重复渲染,循环引用不显示子节点,判断一个节点是否是循环引用,只需要判断其子节点是否包含了祖宗节点即可
  // if (tree.isCircularReference()) {
  //   return tree;
  // }
  // 如果已经存在该类型定义,表示已经被解析过了,不应该再次解析类型定义
  // 一个被解析过的类型定义本质上,应该已经被注册为叶子结点了,但是因为叶子节点id问题,会导致无法直接找到
  // 因为叶子节点的路径和父节点进行了关联,难道这里要做多次生成?
  // 如果一个节点是公开的,那么Ta的子节点路径直接相对于其本身即可.

  // 注意②
  schema.definitions[tree.typeDefinitionId] = typeDefinition;

  for (const pik in type.privateItems) {
    // 不允许替换根节点
    if (pik === schema.root) {
      continue;
    }
    schema.definitions[pik] = type.privateItems[pik];
  }
  // 移除和自己关联的循环引用
  if (schema.circularRefs) {
    Object.entries(schema.circularRefs).forEach(([key, value]) => {
      if (value.includes(typeDefinition.id!)) {
        if (value.length === 1) {
          delete schema.circularRefs![key];
        } else {
          const index = value.findIndex((c) => c === typeDefinition.id!);
          if (index !== -1) {
            value.splice(index, 1);
          }
        }
      }
    });
  }

  tree.children = [];
  // 准备重置当前元素的循环引用标志
  let circularReference = false;
  // 处理子元素定义
  type.sortedAllItems.forEach((item) => {
    // 获取子节点的类型定义
    const itemTypeDefinition = schema.definitions[item.itemId];
    if (!itemTypeDefinition) {
      console.log(
        "无法找到类型定义",
        itemTypeDefinition,
        "from",
        typeDefinition
      );
    }
    /// 递归解析子元素,在递归解析时,如果遇到一个一个public类型的记录,优先使用缓存,如果缓存中没有,则需要重新解析 ①
    const itemTree = deepParse(itemTypeDefinition, schema, tree);
    // 拿到子节点之后,根据当前类型,选择合适的目标容器存放
    // 引用类型的存到refs中,其他类型的存到children中
    if (["refer", "generic"].includes(type.typeName)) {
      // 已经包含了该类型定义,理论上可以直接返回,但是如果属于循环引用,则需要返回一个空的树
      if (id.includes(itemTree.typeDefinitionId)) {
        console.info("检测到循环引用", id, itemTree.typeDefinitionId);
        // 如果当前节点的id包含了引用的类型定义,则表示循环引用
        if (!schema.circularRefs) {
          schema.circularRefs = {};
        }
        if (!schema.circularRefs[itemTree.typeDefinitionId]) {
          schema.circularRefs[itemTree.typeDefinitionId] = [];
        }

        if (
          !schema.circularRefs[itemTree.typeDefinitionId].find(
            (c) => c === typeDefinition.id
          )
        ) {
          !schema.circularRefs[itemTree.typeDefinitionId].push(
            typeDefinition.id!
          );
        }
        circularReference = true;
      } else {
        // 不是循环引用,允许渲染出子元素
        tree.addLeaf(itemTree);
      }
      tree.addRefs(itemTree);
    } else {
      // 普通类型
      tree.addLeaf(itemTree);
    }
  });
  // 重新确认一下是否是循环引用
  tree.circularReference = circularReference;
  return tree;
}

function canHasChildren(type: string): boolean {
  return ["struct", "map", "array", "refer", "generic"].includes(type);
}
