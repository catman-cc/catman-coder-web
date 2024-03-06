import {
  ID,
  ComplexType,
  Scope,
  TypeDefinitionSchema,
  TypeDefinition,
  TypeItem,
  Type,
} from "catman-coder-core";
import constants from "@/config/constants";
import { DefaultHierarchicalRegister, HierarchicalRegister } from ".";
/**
 *  进行id映射操作,每次调用encode都会生成新的id
 */
export interface IdMapper {
  encode(_id: string): string;
  add(_id: string, _encodeId: string): string;
  decode(_id: string): string;
  list(): { [index: string]: string };
  merge(_other: IdMapper): IdMapper;
}
export class DefaultIdMapper implements IdMapper {
  mapper: {
    [index: string]: string;
  };
  revert: {
    [index: string]: string;
  };
  constructor() {
    this.mapper = {};
    this.revert = {};
  }

  encode(id: string): string {
    if (this.mapper[id]) {
      return this.mapper[id];
    }
    const encodeId = ID();
    return this.add(id, encodeId);
  }
  add(id: string, encodeId: string) {
    this.mapper[id] = encodeId;
    this.revert[encodeId] = id;
    return encodeId;
  }

  decode(id: string): string {
    if (this.revert[id]) {
      return this.revert[id];
    }
    return "";
  }
  list(): { [index: string]: string } {
    return this.mapper;
  }
  merge(other: IdMapper): IdMapper {
    const otherMapper = other.list();
    Object.keys(otherMapper).forEach((key) => {
      const v = otherMapper[key];
      this.mapper[key] = v;
      this.revert[v] = key;
    });
    return this;
  }
}

export interface MixUpCoder extends IdMapper {
  decode(_str: string): string;
}

export class RandomMixUpCoder implements MixUpCoder {
  encode(str: string): string {
    return `${str}-$mixup$-${ID()}`;
  }
  decode(str: string): string {
    if (str.includes("-$mixup$-")) {
      return str.split("-$mixup$-")[0];
    }
    return str;
  }
  list(): { [index: string]: string } {
    return {};
  }
  merge(): IdMapper {
    return this;
  }

  add(_id: string, _encodeId: string): string {
    return "";
  }
}

export type TypeDefinitionHierarchialSchemaWatcher = (
  _schema: TypeDefinitionHierarchialSchema,
) => void;

export class TypeDefinitionHierarchialSchema {
  schmea: TypeDefinitionSchema;

  registry: HierarchicalRegister;

  idMapper: IdMapper;

  mixup: MixUpCoder;

  watchers: TypeDefinitionHierarchialSchemaWatcher[];

  outIdMapper: IdMapper;

  static of(schema: TypeDefinitionSchema) {
    const parse = TypeDefinitionSchemaParser.parse(schema);
    return new TypeDefinitionHierarchialSchema(
      parse.newSchema,
      parse.registry,
      parse.idMapper,
      new DefaultIdMapper(),
      [],
    );
  }

  static copy(hierarchial: TypeDefinitionHierarchialSchema) {
    return new TypeDefinitionHierarchialSchema(
      {
        ...hierarchial.schmea,
      },
      hierarchial.registry,
      hierarchial.idMapper,
      hierarchial.outIdMapper,
      hierarchial.watchers,
    );
  }

  constructor(
    schema: TypeDefinitionSchema,
    registry: HierarchicalRegister,
    idMapper: IdMapper,
    outIdMapper: IdMapper,
    watchers: TypeDefinitionHierarchialSchemaWatcher[],
  ) {
    this.schmea = schema;
    this.registry = registry;
    this.idMapper = idMapper;
    this.outIdMapper = outIdMapper;
    this.mixup = new RandomMixUpCoder();
    this.watchers = watchers;
  }

  addWatcher(watch: TypeDefinitionHierarchialSchemaWatcher) {
    this.watchers.push(watch);
  }

  encode(str: string): string {
    return this.mixup.encode(str);
  }

  decode(str: string): string {
    return this.mixup.decode(str);
  }

  get(id: string) {
    return this.schmea.context.typeDefinitions[this.idMapper.decode(id)];
  }

  change(
    id: string,
    update: (td: TypeDefinition, schmea: TypeDefinitionSchema) => void,
  ) {
    const td = this.get(id);
    update(td, this.schmea);
    this.flushAndNotify();
  }

  getType(id: string) {
    return this.get(id).type;
  }

  getChildren(id: string) {
    return this.registry.getChild(id);
  }

  isPublic(id: string): boolean {
    return this.get(id).scope === Scope.PUBLIC.toString();
  }

  hasChild(id: string): boolean {
    return this.registry.hasChild(id);
  }
  hasPublicChild(id: string): boolean {
    const children = this.registry.listChild(id);
    if (!children) {
      return false;
    }
    return children.some((c) => {
      return this.get(c).scope === Scope.PUBLIC;
    });
  }

  addChild(id: string, child: string) {
    if (this.registry.registryMap[id]) {
      if (this.registry.registryMap[id].includes(child)) {
        return;
      }
      this.registry.registryMap[id].push(child);
    } else {
      this.registry.registryMap[id] = [child];
    }
    this.flushAndNotify();
  }

  /**
   *  为指定节点创建子节点
   *
   *  解析一个新的类型定义理论上最好是使用schema,因为类型定义可能也包含循环定义
   *  在合并时,应当注意尽可能不要替换现有同名定义,这意味着还要执行合并操作
   *  1. 解析schema
   * @param pid  父id
   * @param schema 新增的类型定义
   * @param index 添加的位置
   */
  add(
    pid: string,
    schema: TypeDefinitionSchema,
    index: number = 0,
    outId?: string,
  ) {
    if (!this.canAddChild(pid)) {
      return "";
    }
    const parsedSchema = this.doAdd(schema);
    this.registry.addChild(pid, parsedSchema.registry.root, index);
    if (outId) {
      this.outIdMapper.add(parsedSchema.registry.root, outId);
    }
    this.flushAndNotify();
  }
  addBrother(
    id: string,
    schema: TypeDefinitionSchema,
    before: boolean = false,
  ) {
    const pid = this.findParent(id);
    if (!(pid && this.canAddChild(pid))) {
      return;
    }
    const index = this.getIndex(id);
    this.add(pid, schema, before ? index : index + 1);
  }

  update(id: string, schema: TypeDefinitionSchema) {
    const parsedSchema = this.doAdd(schema);
    this.registry.replace(id, parsedSchema.registry.root);

    this.flushAndNotify();
  }

  changeType(id: string, type: Type, schema: TypeDefinitionSchema) {
    const td = this.get(id);
    const newTd = { ...td, type: type };
    console.log(
      "change type",
      newTd,
      wrapperTypeDefinitionToSchema(newTd, schema),
    );

    this.update(id, wrapperTypeDefinitionToSchema(newTd, schema));
  }

  private doAdd(schema: TypeDefinitionSchema): TypeDefinitionSchemaParser {
    // 此处需要额外将当前的定义传递过去,避免循环
    schema.definitions = { ...this.schmea.definitions, ...schema.definitions };
    schema.context.typeDefinitions = schema.definitions;
    const parsedSchema = TypeDefinitionSchemaParser.parse(schema);
    // 合并idmapper
    this.idMapper.merge(parsedSchema.idMapper);
    // 合并register
    this.registry.addAll(parsedSchema.registry);
    // 合并defintions
    const otherSchema = parsedSchema.newSchema;
    Object.keys(otherSchema.definitions).forEach((key) => {
      // 直接修改元素的数据类型,会出现修改同key的定义
      // if (this.schmea.definitions[key]) {
      //     return
      // }
      this.schmea.definitions[key] = otherSchema.definitions[key];
    });

    this.schmea.context.typeDefinitions = this.schmea.definitions;
    return parsedSchema;
  }

  exist(id: string): boolean {
    return this.registry.registryMap[id] !== undefined;
  }

  flushAndNotify() {
    const newSchema = this.copy();
    this.watchers.forEach((watch) => {
      watch(newSchema);
    });
  }

  findParent(id: string) {
    const allParent = this.registry.findAllParent(id);
    if (allParent && allParent.length > 0) {
      return allParent[0];
    }
    return undefined;
  }

  getParent(id: string): TypeDefinition | undefined {
    const pid = this.findParent(id);
    if (pid) {
      return this.get(pid);
    }
    return undefined;
  }

  getIndex(id: string): number {
    const pid = this.findParent(id);
    if (!pid) {
      return -1;
    }
    return this.registry.indexOf(id, pid);
  }

  belongLength(id: string): number {
    const pid = this.findParent(id);
    if (!pid) {
      return -1;
    }
    return this.registry.length(pid);
  }

  hasParent(id: string) {
    return this.findParent(id) !== undefined;
  }

  containChild(id: string, childId: string): boolean {
    return this.getChildren(id).includes(childId);
  }

  containPosterity(id: string, posterityId: string): boolean {
    if (this.containChild(id, posterityId)) {
      return true;
    }
    return this.getChildren(id).some((c) =>
      this.containPosterity(c, posterityId),
    );
  }

  renderChild(id: string, force?: boolean): boolean {
    if (force) {
      return force;
    }

    if (this.getType(id).typeName === constants.Types.TYPE_NAME_REFER) {
      // 复杂类型定义不渲染子元素,而是自定义渲染
      return false;
    }
    return !this.isPublic(id) && this.hasChild(id);
  }

  copy() {
    return TypeDefinitionHierarchialSchema.copy(this);
  }

  canDrag(id: string) {
    // 根节点不允许拖拽
    if (this.registry.isRoot(id)) {
      return false;
    }
    if (this.isFixed(id)) {
      return false;
    }
    // 如果是嵌套引用,不允许拖拽
    return true;
  }

  isFixed(id: string): boolean {
    const parent = this.getParent(id);
    if (!parent) {
      return false;
    }
    if (parent.type.typeName === constants.Types.TYPE_NAME_ARRAY) {
      return true;
    }
    return false;
  }

  move(id: string, targetId: string, index: number) {
    if (!this.canAddChild(targetId)) {
      return;
    }
    const pid = this.findParent(id) || "";
    if (this.registry.move(id, targetId, index, pid)) {
      this.flushAndNotify();
    }
  }

  canChangeName(id: string) {
    return !this.isFixed(id) && !this.locked(id);
  }

  canAddChild(id: string): boolean {
    const type = this.getType(id);
    const ct = ComplexType.of(type);
    if (ct.isRaw()) {
      return false;
    }
    if (ct.isArray()) {
      return false;
    }
    if (ct.isRefer()) {
      return false;
    }
    if (ct.isEnum()) {
      // 枚举有两种场景,一种是引用了其他枚举定义,一种是完全自定义
      if (this.hasPublicChild(id)) {
        return false;
      }
      return true;
    }
    return true;
  }

  canAddBrother(id: string): boolean {
    if (this.registry.isRoot(id)) {
      return false;
    }
    const pid = this.findParent(id);
    if (!pid) {
      return false;
    }
    return this.canAddChild(pid);
  }

  canRemove(id: string): boolean {
    if (this.isFixed(id)) {
      return false;
    }
    if (this.registry.isRoot(id)) {
      return false;
    }
    return true;
  }
  remove(id: string): boolean {
    if (this.isFixed(id)) {
      return false;
    }
    const pid = this.findParent(id);
    if (pid) {
      if (this.registry.remove(id, pid)) {
        this.flushAndNotify();
        return true;
      }
    }
    return false;
  }

  locked(id: string): boolean {
    if (this.registry.isRoot(id)) {
      return false;
    }
    if (this.isPublic(id) && this.hasParent(id)) {
      return true;
    }
    return false;
  }

  getMappedOutId(id: string) {
    console.log("this.outIdMapper", this.outIdMapper);
    return this.outIdMapper.decode(id);
  }
  decodeOutOrSelf(id: string): string {
    const codeed = this.getMappedOutId(id);
    if (codeed === "") {
      return id;
    }
    return codeed;
  }

  isHandledOut(id: string): boolean {
    return this.outIdMapper.decode(id) !== "";
  }

  toTypeDefinitionSchema(id?: string): TypeDefinitionSchema {
    const tid = id || this.registry.root;
    const schema = {
      root: this.idMapper.decode(tid),
      refs: new Map(),
      context: {},
      definitions: {},
    } as TypeDefinitionSchema;
    //递归解析树级结构,构建类型定义
    const deepParse = (treeId: string) => {
      const tdId = this.idMapper.decode(treeId);
      if (schema.definitions[tdId]) {
        return schema.definitions[tdId];
      }

      const td = this.get(treeId);
      const typeDefinition = {
        ...td,
      } as TypeDefinition;

      if (!schema.definitions[tdId]) {
        schema.definitions[tdId] = typeDefinition;
      }

      const type = typeDefinition.type;
      type.sortedAllItems = [];
      type.privateItems = {};
      // 然后开始拼接私有类型定义和公开类型定义
      const children = this.getChildren(treeId);

      if (children && children.length > 0) {
        children.forEach((cid) => {
          const child = deepParse(cid);
          if (child) {
            if (!schema.definitions[child.id!]) {
              schema.definitions[child.id!] = child;
            }
            type.sortedAllItems.push({
              name: child.name,
              itemId: child.id,
              scope: child.scope,
            } as TypeItem);
          }
        });
      }
      return typeDefinition;
    };
    deepParse(tid);
    schema.context.typeDefinitions = schema.definitions;
    return schema;
  }
}

export class TypeDefinitionSchemaParser {
  newSchema: TypeDefinitionSchema;
  registry: HierarchicalRegister;
  idMapper: IdMapper;
  parsed: { [index: string]: boolean };
  static parse(schme: TypeDefinitionSchema) {
    return new TypeDefinitionSchemaParser(schme);
  }

  constructor(schema: TypeDefinitionSchema) {
    this.newSchema = {
      refs: new Map(),
      context: schema.context || {},
      root: schema.root,
      definitions: { ...schema.definitions, ...schema.context.typeDefinitions },
    };
    this.newSchema.context.typeDefinitions = this.newSchema.definitions;
    this.idMapper = new DefaultIdMapper();
    this.registry = new DefaultHierarchicalRegister();
    this.parsed = {};
    this.parse(schema);
  }

  private parse(schema: TypeDefinitionSchema) {
    // for (const key in schema.definitions) {
    //     // 值得注意的是,此时树状结构所属的pid没有被保存

    // }
    const rootId = this.parseTypeDefinition(schema.definitions[schema.root]);
    this.registry.setRoot(rootId);
    return this.newSchema;
  }

  private parseTypeDefinition(td: TypeDefinition) {
    // this.newSchema.definitions[td.id!] = td
    if (this.parsed[td.id!]) {
      return this.idMapper.encode(td.id!);
    }
    this.parsed[td.id!] = true;
    this.newSchema.definitions[td.id!] = td;
    const type = td.type;

    for (const key in type.privateItems) {
      if (Object.prototype.hasOwnProperty.call(type.privateItems, key)) {
        const element = type.privateItems[key];
        this.newSchema.definitions[key] = element;
        this.parseTypeDefinition(element);
      }
    }

    // 构建父子关系
    const tid = this.idMapper.encode(td.id!);
    if (type.sortedAllItems) {
      type.sortedAllItems.forEach((i) => {
        // 不能直接使用编码后的id做为子节点的唯一标志,
        /// 对被引用的类型定义进行了引用操作,
        const itemTd = this.newSchema.definitions[i.itemId];
        const itemId = this.parseTypeDefinition(itemTd);
        this.registry.register(tid, itemId);
      });
    }
    return tid;
  }
}

export const wrapperTypeDefinitionToSchema = (
  td: TypeDefinition,
  tdSchema: TypeDefinitionSchema,
): TypeDefinitionSchema => {
  const schema = {
    root: td.id!,
    definitions: {},
    context: {},
    refs: new Map(),
  } as TypeDefinitionSchema;

  const deep = (td: TypeDefinition) => {
    if (schema.definitions[td.id!]) {
      return;
    }
    schema.definitions[td.id!] = td;
    if (td.type.sortedAllItems) {
      td.type.sortedAllItems.forEach((item) => {
        const i = tdSchema.context.typeDefinitions[item.itemId];
        schema.definitions[i.id!] = i;
        deep(i);
      });
    }
  };
  deep(td);
  return schema;
};
