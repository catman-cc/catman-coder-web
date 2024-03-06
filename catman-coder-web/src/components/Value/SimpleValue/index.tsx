import { Input } from "antd";
import DefaultValueDefinitionFactoryInstance, {
  DefaultValueDefinitionCreator,
} from "../factory";

// 最简单的值定义,只支持直接赋值
export const VALUE_KIND: string = "simple";

export interface SimpleValueDefinition extends ValueDefinition {
  value: unknown;
}

DefaultValueDefinitionFactoryInstance.registry(
  new DefaultValueDefinitionCreator(VALUE_KIND, () => {
    return <SimpleValue />;
  })
);

export const SimpleValue = () => {
  return <Input></Input>;
};
