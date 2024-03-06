export interface FileDescriptor {
  name: string;
  type: string;
  uid: string;
  size: number;
  lastModified: number;
  webkitRelativePath: string;
  base64: string;
}

export enum EBodyDataType {
  String = "string",
  Boolean = "boolean",
  Number = "number",
  Date = "Date",
  File = "File",
  Array = "array",
  Object = "object",
}
export type BodyDataBasicType = string | boolean | number | Date | File;
export type BodyDataItemArrayType = BodyDataBasicType[] | BodyDataItem[];
export type BodyDataItemObjectType = { [key: string]: BodyDataItem };
export type BodyDataItemType =
  | BodyDataBasicType
  | BodyDataItemArrayType
  | BodyDataItemObjectType
  | BodyDataItem;

export interface BodyDataItem {
  key: string; // 唯一标识
  name: string; // 名称
  type: EBodyDataType; // 类型
  extra?: {
    // 额外信息
    [key: string]: string | object;
  };
  value: BodyDataItemType; // 值
  description?: string; // 描述
  children?: BodyDataItemType; // 子项
}

interface BodyDataItemExtra {
  required: "true" | "false";
  valid: [
    {
      name: string;
      message: (item: BodyDataItem) => string;
      valid: (item: BodyDataItem) => boolean;
    },
  ];
}
