import { ReactNode } from "react";

export interface ValueDefinitionFactory {
  create(_value: ValueDefinition): React.ReactNode;
}
export interface ValueDefinitionCreator {
  support(_value: ValueDefinition): boolean;
  create(_value: ValueDefinition): React.ReactNode | undefined;
}
export class DefaultValueDefinitionCreator implements ValueDefinitionCreator {
  kind: string;
  create: (_value: ValueDefinition) => React.ReactNode;

  constructor(
    kind: string,
    create: (_value: ValueDefinition) => React.ReactNode
  ) {
    this.kind = kind;
    this.create = create;
  }
  support(value: ValueDefinition): boolean {
    return value.kind === this.kind;
  }
}
class DefaultValueDefinitionFactory implements ValueDefinitionFactory {
  creators: ValueDefinitionCreator[];
  constructor(creators?: ValueDefinitionCreator[]) {
    this.creators = creators || [];
  }

  registry(creator: ValueDefinitionCreator) {
    this.creators.push(creator);
    return this;
  }

  create(value: ValueDefinition): ReactNode {
    return this.creators.find((c) => c.support(value))?.create(value);
  }
}

const DefaultValueDefinitionFactoryInstance =
  new DefaultValueDefinitionFactory();

export default DefaultValueDefinitionFactoryInstance;
