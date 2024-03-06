import {
  BodyDataItem,
  BodyDataItemObjectType,
  BodyDataItemType,
  EBodyDataType,
  FileDescriptor,
} from "@/components/Provider/http/types.ts";
import { ComplexFormData } from "@/components/Provider/http/Common/Parse.tsx";

function convertBodyDataItemToComplexFormData(
  items: BodyDataItem[],
): ComplexFormData {
  const formData = ComplexFormData.create();

  // 辅助函数，用于递归处理 BodyDataItem
  const processItem = (formData: ComplexFormData, item: BodyDataItem) => {
    switch (item.type) {
      case EBodyDataType.String:
      case EBodyDataType.Boolean:
      case EBodyDataType.Number:
      case EBodyDataType.Date:
        formData.append(item.name, item.value as string);
        break;

      case EBodyDataType.File:
        if (item.value instanceof File) {
          formData.append(item.name, item.value);
        }
        break;

      case EBodyDataType.Array:
        if (Array.isArray(item.children)) {
          // multipart/form-data 支持传递多个同名称的子表单数据
          // 对于多个同名字段拥有不同类型定义的情况，在标准的 multipart/form-data 规范中并不支持
          // 某些服务器端的框架或处理库可能会以某种方式处理这种情况，但是并不是所有的服务器端框架或处理库都支持
          // 所以,这里在处理时,显示配置了允许混合类型,方才能通过校验

          // 判断数组中是否同时包含了复合类型和简单类型

          // 复合类型,不允许出现嵌套数组,因为在解析时,嵌套数组会被合并至同一层级,导致无法区分
          const containsNestedArray = (
            item.children as BodyDataItemType[]
          ).find((subItem) => Array.isArray(subItem));
          if (containsNestedArray) {
            throw new Error(
              `Invalid body data multipart/form-data does not support nested array,please parent array name:${item.name},child array:${containsNestedArray}`,
            );
          }

          const containsComplexData = (
            item.children as BodyDataItemType[]
          ).some((subItem) => {
            const i = subItem as BodyDataItem;
            return (
              i.type === EBodyDataType.Object || i.type === EBodyDataType.Array
            );
          });

          const containsSimpleData = (item.children as BodyDataItemType[]).some(
            (subItem) => {
              const i = subItem as BodyDataItem;
              return (
                i.type !== EBodyDataType.Object &&
                i.type !== EBodyDataType.Array
              );
            },
          );

          if (containsComplexData && containsSimpleData) {
            throw new Error(
              `Invalid body data, multipart/form-data does not support mixed types,beacuse some server framework or library does not support it,please check your body data,see ${item.name}}`,
            );
          }

          if (containsComplexData) {
            // 因为前面过滤掉了嵌套数组,所以这里可以直接认为是对象结构
            const subFormData = ComplexFormData.create();
            (item.children as BodyDataItemType[]).forEach((subItem) => {
              processItem(subFormData, subItem as BodyDataItem);
            });
            formData.append(item.name, subFormData);
          } else {
            (item.children as BodyDataItemType[]).forEach((subItem) => {
              // 因为数组中的元素是不允许有名称的,所以这里直接使用数组名称
              const i = { ...(subItem as BodyDataItem), name: item.name };
              processItem(formData, i);
            });
          }
        }
        break;

      case EBodyDataType.Object:
        if (typeof item.children === "object" && item.children !== null) {
          const subFormData = ComplexFormData.create();
          Object.values(item.children as BodyDataItemObjectType).forEach(
            (subItem) => {
              processItem(subFormData, subItem as BodyDataItem);
            },
          );
          formData.append(item.name, subFormData);
        }
        break;

      default:
        // Handle other cases if necessary
        break;
    }
  };

  for (const item of items) {
    processItem(formData, item);
  }
  console.log("formData", formData);
  return formData;
}
export const readFileToFileDescriptor = async (
  file: File,
): Promise<FileDescriptor> => {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(file);
  return new Promise<FileDescriptor>((resolve, reject) => {
    fileReader.onload = () => {
      const fileDesc: FileDescriptor = {
        name: file.name,
        size: file.size,
        uid: Math.random().toFixed(16).slice(2),
        type: file.type,
        lastModified: file.lastModified,
        webkitRelativePath: file.webkitRelativePath,
        base64: fileReader.result as string,
      };
      resolve(fileDesc);
    };
    fileReader.onerror = () => {
      reject(fileReader.error);
    };
  });
};
const executeJsonFileScript = (script: string, item: BodyDataItem): any => {
  try {
    const func = new Function("item", script);
    return func(item);
  } catch (error) {
    console.error("Error executing the JSON file script:", error);
    return null;
  }
};

const convertBodyDataItemToJson = async (
  items: BodyDataItem[],
  isObject: boolean,
): Promise<any> => {
  const result: any = isObject ? {} : [];

  const convertItem = async (
    item: BodyDataItem,
    belong: { [key: string]: any } | any[],
  ) => {
    switch (item.type) {
      case EBodyDataType.String:
      case EBodyDataType.Boolean:
      case EBodyDataType.Number:
      case EBodyDataType.Date:
        if (Array.isArray(belong)) {
          belong.push(item.value);
        } else {
          belong[item.name] = item.value;
        }
        break;

      case EBodyDataType.File:
        if (item.value) {
          const f = item.value as File;
          const extraScript = item.extra?.toJsonFileScript;
          if (extraScript) {
            const val = executeJsonFileScript(extraScript as string, item);
            Array.isArray(belong)
              ? belong.push(val)
              : (belong[item.name] = val);
            break;
          }
          const fd = await readFileToFileDescriptor(f);
          Array.isArray(belong) ? belong.push(fd) : (belong[item.name] = fd);
        }
        break;

      case EBodyDataType.Array:
        const arr: any[] = [];
        const children = item.children as BodyDataItem[];
        for (const child of children) {
          await convertItem(child, arr);
        }
        if (Array.isArray(belong)) {
          belong.push(arr);
        } else {
          belong[item.name] = arr;
        }
        break;

      case EBodyDataType.Object:
        if (typeof item.children === "object" && item.children !== null) {
          const obj: any = {};
          const childrenObj = item.children as BodyDataItemObjectType;
          for (const key in childrenObj) {
            if (childrenObj.hasOwnProperty(key)) {
              await convertItem(childrenObj[key], obj);
            }
          }
          if (Array.isArray(belong)) {
            belong.push(obj);
          } else {
            belong[item.name] = obj;
          }
        }
        break;

      default:
        break;
    }
  };

  for (const item of items) {
    await convertItem(item, result);
  }

  return result;
};

interface BodyDataConversionStrategy {
  convert(items: BodyDataItem[]): Promise<string>;
}

class BodyDataConversionStrategyFactory {
  private strategies: Map<string, BodyDataConversionStrategy>;

  constructor() {
    this.strategies = new Map();
  }

  registerStrategy(contentType: string, strategy: BodyDataConversionStrategy) {
    this.strategies.set(contentType, strategy);
    return this;
  }

  unregisterStrategy(contentType: string) {
    this.strategies.delete(contentType);
    return this;
  }

  createStrategy(contentType: string): BodyDataConversionStrategy {
    const strategy = this.strategies.get(contentType);
    if (strategy) {
      return strategy;
    } else {
      return this.strategies.get("default") as BodyDataConversionStrategy;
    }
  }
}
class ComplexFormDataConversionStrategy implements BodyDataConversionStrategy {
  convert(items: BodyDataItem[]): Promise<string> {
    // 实现将 BodyDataItem[] 转换为 ComplexFormData 的逻辑
    return convertBodyDataItemToComplexFormData(items).toText();
  }
}
class JSONBodyDataConversionStrategy implements BodyDataConversionStrategy {
  convert(items: BodyDataItem[]): Promise<string> {
    // 实现将 BodyDataItem[] 转换为 JSON 字符串的逻辑
    return convertBodyDataItemToJson(items, true).then((json) =>
      JSON.stringify(json),
    );
  }
}

class FormUrlEncodedBodyDataConversionStrategy
  implements BodyDataConversionStrategy
{
  convert(items: BodyDataItem[]): Promise<string> {
    // 实现将 BodyDataItem[] 转换为 application/x-www-form-urlencoded 字符串的逻辑
    // 这里的逻辑非常简单,因为不支持多层嵌套结构和对象,所以最多只需要处理一次children即可
    const result: string[] = [];
    items.forEach((item) => {
      const ignored =
        (item?.extra?.will_ignore_when_parse || "false") === "true";
      if (!ignored) {
        if (item.type === EBodyDataType.Array) {
          const children = item.children as BodyDataItem[];
          children.forEach((child) => {
            if (
              !((child?.extra?.will_ignore_when_parse || "false") === "true")
            ) {
              result.push(`${item.name}=${child.value}`);
            }
          });
        } else {
          result.push(`${item.name}=${item.value}`);
        }
      }
    });
    return new Promise((resolve) => {
      resolve(result.join("&"));
    });
  }
}

const defaultBodyDataConversionStrategyFactory =
  new BodyDataConversionStrategyFactory()
    .registerStrategy("multipart", new ComplexFormDataConversionStrategy())
    .registerStrategy("json", new JSONBodyDataConversionStrategy())
    .registerStrategy("form", new FormUrlEncodedBodyDataConversionStrategy())
    .registerStrategy("default", {
      convert(items: BodyDataItem[]): Promise<string> {
        return new Promise((resolve) => {
          resolve(JSON.stringify(items));
        });
      },
    });

// 策略决策者，用于管理策略工厂和执行具体策略

// 其他策略类的定义...

// 使用示例

export {
  convertBodyDataItemToComplexFormData,
  defaultBodyDataConversionStrategyFactory,
};
