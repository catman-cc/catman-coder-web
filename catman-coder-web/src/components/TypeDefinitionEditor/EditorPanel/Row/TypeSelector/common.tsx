import { ComplexType, DefaultTypeDefinition } from "catman-coder-core";
import IconCN from "@/components/Icon";
import constants from "@/config/constants";
import { QuestionOutlined, RetweetOutlined } from "@ant-design/icons";
import { BsQuestion, BsTranslate } from "react-icons/bs";
import { FaBimobject } from "react-icons/fa";
import { FcGenericSortingAsc } from "react-icons/fc";
import {
  MdDataArray,
  MdDataObject,
  MdExtension,
  MdOutlineNumbers,
} from "react-icons/md";
import { PiNumberOneFill } from "react-icons/pi";
import { v4 as uuidv4 } from "uuid";
/**
 * 根据类型返回类型颜色
 * @param type 类型,比如:string,number,array...
 */
export const PeekTypeColor = (type: string): string => {
  switch (type) {
    case "string": {
      return "#235d37";
    }
    case "number": {
      return "#01779b";
    }
    case "struct" || "map": {
      return "#ff5a15";
    }
    case "file": {
      return "#3903eb";
    }
    case "map": {
      return "#ff5a15";
    }
    case "array": {
      return "#b97307";
    }
    case "refer": {
      return "#090000";
    }
    case "boolean": {
      return "#0a44c5";
    }
    case "slot": {
      return "#d30202";
    }
    case "enum": {
      return "#d302d0";
    }
    case "generic": {
      return "#00b997";
    }
    case "anonymous": {
      return "#543939";
    }
    default: {
      return "black";
    }
  }
};

/**
 * 根据类型返回类型对应的icon标志
 * @param type 类型,比如:string,number,array...
 */
export const PeekTypeIcon = (type: string) => {
  switch (type) {
    case "string": {
      return <BsTranslate style={{ color: PeekTypeColor(type) }} />;
    }
    case "number": {
      return <PiNumberOneFill style={{ color: PeekTypeColor(type) }} />;
    }
    case "boolean": {
      return <FaBimobject style={{ color: PeekTypeColor(type) }} />;
    }
    case "slot": {
      return <MdExtension style={{ color: PeekTypeColor(type) }} />;
    }
    case "file": {
      return (
        <IconCN
          type="icon-file-word-fill"
          style={{ color: PeekTypeColor(type) }}
        />
      );
    }
    case "struct": {
      return (
        <IconCN type="icon-java1" style={{ color: PeekTypeColor(type) }} />
      );
    }
    case "map": {
      return <MdDataObject style={{ color: PeekTypeColor(type) }} />;
    }
    case "array": {
      return <MdDataArray style={{ color: PeekTypeColor(type) }} />;
    }
    case "refer": {
      return <RetweetOutlined style={{ color: PeekTypeColor(type) }} />;
    }
    case "enum": {
      return <MdOutlineNumbers style={{ color: PeekTypeColor(type) }} />;
    }
    case "generic": {
      return <FcGenericSortingAsc style={{ color: PeekTypeColor(type) }} />;
    }
    case "anonymous": {
      return <BsQuestion style={{ color: PeekTypeColor(type) }} />;
    }
    default: {
      return <QuestionOutlined style={{ color: PeekTypeColor(type) }} />;
    }
  }
};

/**
 * 根据类型返回类型对应的icon标志
 * @param type 类型,比如:string,number,array...
 */
export const PeekTypeIconWithConfig = (type: string, config: object = {}) => {
  switch (type) {
    case "string": {
      return <BsTranslate {...config} />;
    }
    case "number": {
      return <PiNumberOneFill {...config} />;
    }
    case "file": {
      return <IconCN type="icon-file-word-fill" {...config} />;
    }
    case "struct": {
      return <IconCN type="icon-java-ext" {...config} />;
    }
    case "map": {
      return <MdDataObject {...config} />;
    }
    case "array": {
      return <MdDataArray {...config} />;
    }
    case "refer": {
      return <RetweetOutlined {...config} />;
    }
    case "boolean": {
      return <FaBimobject {...config} />;
    }
    case "slot": {
      return <MdExtension {...config} />;
    }
    default: {
      return <QuestionOutlined {...config} />;
    }
  }
};

export const ID = (): string => {
  return "@TMP-" + uuidv4();
};

// 分析js对象,并将其转换为ComplexType定义
// 1:字符串,数字,布尔值
// 2:数组 3:对象
export const analyzeJson = (obj: unknown): ComplexType | undefined => {
  // type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"

  // 如果是字符串,数字,布尔值,则直接返回
  if (obj === null || obj === undefined)
    return ComplexType.ofType(constants.Types.TYPE_NAME_STRING);

  const type = typeof obj;

  if (
    type === constants.Types.TYPE_NAME_STRING ||
    type === constants.Types.TYPE_NAME_BOOLEAN ||
    type === constants.Types.TYPE_NAME_NUMBER
  ) {
    return ComplexType.ofType(constants.Types.TYPE_NAME_STRING);
  }

  if (type === "bigint")
    return ComplexType.ofType(constants.Types.TYPE_NAME_NUMBER);
  if (type === "symbol")
    return ComplexType.ofType(constants.Types.TYPE_NAME_STRING);
  // 或许应该忽略
  if (type === "function")
    return ComplexType.ofType(constants.Types.TYPE_NAME_STRING);

  if (obj instanceof Array) {
    const c = ComplexType.ofType(constants.Types.TYPE_NAME_ARRAY);
    c.items.push(
      DefaultTypeDefinition.create({
        name: constants.ARRAY_ITEM_NAME,
        type: analyzeJson(obj.length > 0 ? obj[0] : undefined),
      })
    );
    return c;
  }

  if (type === "object") {
    // 如果是对象,则遍历类型的所有方法,并将其转换为ComplexType
    // 遍历对象获取所有的key/value
    const c = ComplexType.ofType(constants.Types.TYPE_NAME_MAP);
    Object.entries(obj).forEach(([key, value]) => {
      c.items.push(
        DefaultTypeDefinition.create({
          name: key,
          type: analyzeJson(value),
        })
      );
    });
    return c;
  }
  return ComplexType.ofType(constants.Types.TYPE_NAME_MAP);
};

// 分析js对象,并将其转换为ComplexType定义
// 1:字符串,数字,布尔值
// 2:数组 3:对象
// export const analyzeJson = (obj: unknown): ComplexType | undefined => {
//     // type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"

//     // 如果是字符串,数字,布尔值,则直接返回
//     if (obj === null || obj === undefined) return ComplexType.ofType(constants.Types.TYPE_NAME_STRING)

//     const type = typeof obj

//     if (type === constants.Types.TYPE_NAME_STRING
//         || type === constants.Types.TYPE_NAME_BOOLEAN
//         || type === constants.Types.TYPE_NAME_NUMBER) {
//         return ComplexType.ofType(constants.Types.TYPE_NAME_STRING)
//     }

//     if (type === "bigint") return ComplexType.ofType(constants.Types.TYPE_NAME_NUMBER)
//     if (type === "symbol") return ComplexType.ofType(constants.Types.TYPE_NAME_STRING)
//     // 或许应该忽略
//     if (type === "function") return ComplexType.ofType(constants.Types.TYPE_NAME_STRING)

//     if (obj instanceof Array) {
//         const c = ComplexType.ofType(constants.Types.TYPE_NAME_ARRAY)
//         c.items.push(DefaultTypeDefinition.create({
//             name: constants.ARRAY_ITEM_NAME,
//             type: analyzeJson(obj.length > 0 ? obj[0] : undefined)
//         }))
//         return c
//     }

//     if (type === "object") {
//         // 如果是对象,则遍历类型的所有方法,并将其转换为ComplexType
//         // 遍历对象获取所有的key/value
//         const c = ComplexType.ofType(constants.Types.TYPE_NAME_MAP)
//         Object.entries(obj).forEach(([key, value]) => {
//             c.items.push(DefaultTypeDefinition.create({
//                 name: key,
//                 type: analyzeJson(value)
//             }))
//         })
//         return c
//     }
//     return ComplexType.ofType(constants.Types.TYPE_NAME_MAP)
// }
