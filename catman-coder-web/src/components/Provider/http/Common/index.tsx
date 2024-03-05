import {
  BodyDataItem,
  BodyDataItemObjectType,
  BodyDataItemType,
  EBodyDataType,
  FileDescriptor,
} from "@/components/Provider/http/types.ts";
import {
  FormDataMetadata,
  FormDataParser,
} from "@/components/Provider/http/Common/Parse.tsx";
import { parse } from "yaml";
import { xml2json } from "xml-js";

export function parseXmlToBodyDataItem(xml: string): BodyDataItem[] {
  const obj = xml2json(xml, { compact: true, spaces: 4 });
  return parseJSONToBodyDataItem(obj);
}
export function parseYamlToBodyDataItem(yamlString: string): BodyDataItem[] {
  const obj = parse(yamlString);
  return parseJSONToBodyDataItem(JSON.stringify(obj));
}

function parseJSONToBodyDataItem(jsonString: string): BodyDataItem[] {
  const parsedData: Record<string, unknown> = JSON.parse(jsonString);
  const parsedItems: BodyDataItem[] = [];

  // 解析对象
  const parseObject = (
    data: Record<string, unknown>,
    key: string | number,
  ): BodyDataItemObjectType => {
    const parsedObject: BodyDataItem[] = [];

    for (const [innerKey, innerValue] of Object.entries(data)) {
      const innerKeyString = innerKey.toString();
      const value = innerValue as BodyDataItemType;

      let parsedValue: BodyDataItem;

      // 检查基础类型并创建BodyDataItem
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        const type: EBodyDataType = getType(value);
        parsedValue = {
          key: generateRandomKey(),
          name: innerKeyString,
          type,
          value,
        };
      } else if (Array.isArray(value)) {
        // 处理数组
        const arrayItems: BodyDataItem[] = [];
        value.forEach((arrayItem: unknown) => {
          arrayItems.push(parseValue(arrayItem, innerKeyString));
        });
        parsedValue = {
          key: generateRandomKey(),
          name: innerKeyString,
          type: EBodyDataType.Array,
          value: "",
          children: arrayItems,
        };
      } else {
        // 处理嵌套对象
        parsedValue = parseValue(value, innerKeyString);
      }

      parsedObject.push(parsedValue);
    }

    return parsedObject;
  };

  // 解析值
  const parseValue = (value: unknown, key: string | number): BodyDataItem => {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      const type: EBodyDataType = getType(value);
      return { key: generateRandomKey(), name: key.toString(), type, value };
    }

    if (Array.isArray(value)) {
      // 处理数组
      const arrayItems: BodyDataItem[] = [];
      value.forEach((arrayItem: unknown) => {
        arrayItems.push(parseValue(arrayItem, ""));
      });
      return {
        key: generateRandomKey(),
        name: key.toString(),
        value: "",
        type: EBodyDataType.Array,
        children: arrayItems,
      };
    }

    return {
      key: generateRandomKey(),
      name: key.toString(),
      type: EBodyDataType.Object,
      value: "",
      children: parseObject(value as Record<string, unknown>, key),
    };
  };

  // 获取值类型
  const getType = (value: unknown): EBodyDataType => {
    if (typeof value === "string") {
      return EBodyDataType.String;
    } else if (typeof value === "number") {
      return EBodyDataType.Number;
    } else if (typeof value === "boolean") {
      return EBodyDataType.Boolean;
    } else if (Array.isArray(value)) {
      return EBodyDataType.Array;
    } else {
      return EBodyDataType.Object;
    }
  };

  // 生成随机键
  const generateRandomKey = (): string => {
    return Math.random().toString(16).slice(2);
  };

  // 解析 JSON 数据为 BodyDataItem
  for (const [key, value] of Object.entries(parsedData)) {
    const bassicInfo = {
      key: generateRandomKey(),
      name: key,
      type: getType(value),
      value: "",
      description: "",
      children: undefined,
    } as BodyDataItem;
    switch (bassicInfo.type) {
      case EBodyDataType.String:
      case EBodyDataType.Number:
      case EBodyDataType.Boolean:
        bassicInfo.value = value as string;
        break;
      case EBodyDataType.Array:
        bassicInfo.children = (value as unknown[]).map((item) => {
          return parseValue(item, "");
        });
        break;
      case EBodyDataType.Object:
        bassicInfo.children = parseObject(
          value as Record<string, unknown>,
          key,
        );
        break;
      default:
        break;
    }
    parsedItems.push(bassicInfo);
  }

  return parsedItems;
}

interface Part {
  start: number;
  end: number;
  children: Part[];
}

export function parseMultipartFormData(formData: string): BodyDataItem[] {
  const parser = FormDataParser.ofString(formData);
  if (!parser.isFormData()) {
    throw new Error("Not a valid form data");
  }

  const metadatas = parser.parse();
  console.log("parser", JSON.stringify(metadatas));
  const bodyData: BodyDataItem[] = [];

  function processChild(children, name, bodyData: BodyDataItem[]) {
    // 此处需要注意,如果有多个同名字段,则会被合并为一个数组
    // 例如: {a:1,a:2} => {a:[1,2]}
    // 对child中的数据按照name进行分组
    const childMap: Record<string, FormDataMetadata[]> = {};
    console.log("children", children);
    children.forEach((child: FormDataMetadata) => {
      const { name } = child;
      if (!childMap[name || ""]) {
        childMap[name || ""] = [];
      }
      childMap[name || ""].push(child);
    });

    console.log("childMap", childMap);

    const bodyDataItem: BodyDataItem = {
      key: generateRandomKey(),
      name: name || "",
      type: EBodyDataType.Object,
      value: "",
      children: [],
    };
    bodyData.push(bodyDataItem);
    // 如果map中的数据只有一个,表示没有同名字段
    if (Object.keys(childMap).length === 1) {
      const child = Object.values(childMap)[0];
      if (child.length === 1) {
        return process(child[0], bodyDataItem.children as BodyDataItem[]);
      }
      // 如果有多个同名字段,则表示是数组
      bodyDataItem.type = EBodyDataType.Array;
      console.log("item", child);
      return child.forEach((item) => {
        process(item, bodyDataItem.children as BodyDataItem[]);
      });
    }
    // 有多个分组,表示是对象,需要将分组后的数据进行处理
    // 将分组后的数据进行处理
    Object.values(childMap).forEach((child) => {
      // 如果child中的数据只有一个,则直接处理
      if (child.length === 1) {
        return process(child[0], bodyDataItem.children as BodyDataItem[]);
      }
      // 如果有多个同名字段,则表示是子元素是一个数组
      const arrayItem: BodyDataItem = {
        key: generateRandomKey(),
        name: child[0].name || "",
        type: EBodyDataType.Array,
        value: "",
        children: [],
      };
      child.forEach((item) => {
        process(item, arrayItem.children as BodyDataItem[]);
      });
      (bodyDataItem.children! as BodyDataItem[]).push(arrayItem);
    });
  }

  function process(metadata: FormDataMetadata, bodyData: BodyDataItem[]): void {
    const { name, body, file, children } = metadata;
    if (children) {
      return processChild(children, name, bodyData);
    } else if (file) {
      bodyData.push({
        key: generateRandomKey(),
        name: name || "",
        type: EBodyDataType.File,
        value: file,
      });
    } else {
      bodyData.push({
        key: generateRandomKey(),
        name: name || "",
        type: EBodyDataType.String,
        value: body as string,
      });
    }
  }
  processChild(metadatas, "", bodyData);
  // metadatas.forEach((metadata) => {
  //   process(metadata, bodyData);
  // });
  return bodyData[0].children as BodyDataItem[];
}

// Helper function to generate random keys
function generateRandomKey(): string {
  return Math.random().toString(16).slice(2);
}

// Helper function to determine value type
function determineType(value: string): EBodyDataType {
  if (/^\d+$/.test(value)) {
    return EBodyDataType.Number;
  } else if (
    value.toLowerCase() === "true" ||
    value.toLowerCase() === "false"
  ) {
    return EBodyDataType.Boolean;
  } else if (Date.parse(value)) {
    return EBodyDataType.Date;
  } else {
    return EBodyDataType.String;
  }
}

// 判断对象是否符合 FileDescriptor 接口定义
export const isFileDescriptor = (obj: any): obj is FileDescriptor => {
  return (
    typeof obj.name === "string" &&
    typeof obj.type === "string" &&
    typeof obj.uid === "string" &&
    typeof obj.size === "number" &&
    typeof obj.lastModified === "number" &&
    typeof obj.webkitRelativePath === "string" &&
    typeof obj.base64 === "string"
  );
};

export default parseJSONToBodyDataItem;
