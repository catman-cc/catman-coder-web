import { ID } from "@/common/id";
import constants from "@/config/constants";

export const Scope = {
  PRIVATE: "PRIVATE" as Core.Scope,
  PUBLIC: "PUBLIC" as Core.Scope,
};

export class DefaultTypeDefinition implements Core.TypeDefinition {
  id!: string;
  name!: string;
  scope!: Core.Scope;
  tag: Core.Tag[] = [];
  alias: string[] = [];
  labels!: Core.Labels;
  required: boolean = false
  type: ComplexType;
  defaultValue!: string;
  describe!: string;
  wiki!: string;
  group!: Core.Group;
  mock!: Core.Mock;

  copy(): DefaultTypeDefinition {
    return new DefaultTypeDefinition(this);
  }

  derivedChild() {
    const ctd = new DefaultTypeDefinition();
    ctd.id = ID();
    ctd.name = `child@ ${Math.random().toFixed(2) * 100}`;
    ctd.type.typeName = constants.Types.TYPE_NAME_STRUCT;
    this.type.items.push(ctd);
    return [ctd, this];
  }

  recursionChild(): DefaultTypeDefinition[] {
    const ncs = [
      ...this.type.items,
      ...this.type.items.map((c: DefaultTypeDefinition) => {
        return c.recursionChild();
      }),
    ];
    return Array.isArray(ncs) ? (ncs as DefaultTypeDefinition[]) : [ncs];
  }

  recursionChildWithCallback(
    callback: (
      _child: DefaultTypeDefinition,
      _parent: DefaultTypeDefinition,
    ) => void,
  ) {
    this.type.items.forEach((c) => {
      callback(DefaultTypeDefinition.ensure(c), this);
      c.recursionChildWithCallback(callback);
    });
  }

  unWrapper() {
    return {
      id: this.id,
      name: this.name,
      scope: this.scope,
      labels: this.labels,
      type: this.type.unWrapper(),
      tag: this.tag,
      required: this.required,
      group: this.group,
      mock: this.mock,
      alias: this.alias,
      defaultValue: this.defaultValue,
      describe: this.describe,
      wiki: this.wiki,
    };
  }
  static ensure(typeDefinition: Core.TypeDefinition): DefaultTypeDefinition {
    return typeDefinition instanceof DefaultTypeDefinition
      ? typeDefinition
      : new DefaultTypeDefinition(typeDefinition);
  }

  static createSchema(config: {
    childCount?: number;
    name?: string;
    type?: ComplexType;
    scope?: Core.Scope;
  } = {
      childCount: 0,
      name: constants.DEFAULT_NEW_TYPE_DEFINITION_NAME,
      type: ComplexType.ofType(constants.Types.TYPE_NAME_STRING),
    },
  ) {
    const td = this.create(config)
    const schema = {
      root: td.id,
      context: {},
      definitions: {}
    } as Core.TypeDefinitionSchema
    schema.definitions[td.id] = td
    schema.context.typeDefinitions = schema.definitions
    return schema
  }

  static create(
    config: {
      childCount?: number;
      name?: string;
      type?: ComplexType;
      scope?: Core.Scope;
    } = {
        childCount: 0,
        name: constants.DEFAULT_NEW_TYPE_DEFINITION_NAME,
        type: ComplexType.ofType(constants.Types.TYPE_NAME_STRING),
      },
  ) {
    const ctd = new DefaultTypeDefinition();
    ctd.id = ID();
    ctd.name = config.name === undefined ? constants.DEFAULT_NEW_TYPE_DEFINITION_NAME : config.name
    ctd.scope = config.scope || Scope.PRIVATE;
    if (config.type) {
      ctd.type = config.type;
    } else {
      ctd.type.typeName = constants.Types.TYPE_NAME_STRUCT;
    }

    if (config.childCount !== undefined && config.childCount > 0) {
      for (let i = 0; i < config.childCount; i++) {
        ctd.derivedChild();
      }
    }
    return ctd;
  }
  constructor(td?: Core.TypeDefinition) {
    if (td) {
      Object.assign(this, td);
    }
    if (!this.id) {
      this.id = ID();
    }
    if (!this.scope) {
      this.scope = Scope.PRIVATE;
    }
    if (!this.tag) {
      this.tag = [];
    }
    if (!this.alias) {
      this.alias = [];
    }
    if (!this.required) {
      this.required = false;
    }
    if (!this.type) {
      this.type = new ComplexType();
    } else {
      this.type = new ComplexType(this.type);
    }
  }
}

export class ComplexType implements Core.Type {
  typeName: string;
  items: Array<DefaultTypeDefinition> = [];
  privateItems: { [index: string]: Core.TypeDefinition } = {};
  sortedAllItems: Core.TypeItem[] = [];
  config: Core.Config = {};
  static of(type: Core.Type) {
    return new ComplexType(type)
  }
  static ofType(typeName: string = constants.Types.TYPE_NAME_STRING) {
    const t = new ComplexType();
    t.typeName = typeName;
    return t;
  }

  constructor(at?: Core.Type) {
    if (at) {
      Object.assign(this, at);
      if (this.items) {
        this.items = this.items.map((i) => {
          return new DefaultTypeDefinition(i);
        });
      }
    }
    if (!this.items) {
      this.items = [];
    }
    if (!this.privateItems) {
      this.privateItems = {};
    }
    if (!this.sortedAllItems) {
      this.sortedAllItems = [];
    }
  }
  unWrapper(): Core.Type {
    return {
      typeName: this.typeName,
      items: this.items.map((td) => td.unWrapper()),
      privateItems: this.privateItems,
      sortedAllItems: this.sortedAllItems,
    };
  }
  getTypeName(): string {
    return this.typeName;
  }
  isRaw(): boolean {
    return (
      this.getTypeName() === constants.Types.TYPE_NAME_STRING ||
      this.getTypeName() === constants.Types.TYPE_NAME_BOOLEAN ||
      this.getTypeName() === constants.Types.TYPE_NAME_NUMBER
    );
  }
  isArray(): boolean {
    return this.getTypeName() === constants.Types.TYPE_NAME_ARRAY;
  }
  isStruct(): boolean {
    return this.getTypeName() === constants.Types.TYPE_NAME_STRUCT;
  }
  isRefer(): boolean {
    return (
      this.getTypeName() === constants.Types.TYPE_NAME_REFER ||
      this.getTypeName() === constants.Types.TYPE_NAME_STRUCT
    );
  }
  isEnum(): boolean {
    return this.getTypeName() === constants.Types.TYPE_NAME_ENUM
  }
  isMap(): boolean {
    return this.getTypeName() === constants.Types.TYPE_NAME_MAP;
  }
  isComplex(): boolean {
    return this.isMap() || this.isRefer() || this.isStruct() || this.isArray();
  }
}
