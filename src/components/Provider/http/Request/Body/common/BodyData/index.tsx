// 一个用于请求体的数据
import {
    BodyDataItem,
    BodyDataItemArrayType,
    BodyDataItemType,
    EBodyDataType
} from "@/components/Provider/http/types.ts";

interface BodyData {
    [key: string]: BodyDataItem
}

/**
 * 请求体数据转换策略
 */
interface BodyDataConvertStrategy<T,C> {
    convert(data: BodyData,config:C): T
}

const isArray = (data: BodyDataItem): boolean => {
    return data.type === EBodyDataType.Array
}
const isObject = (data: BodyDataItem): boolean => {
    return data.type === EBodyDataType.Object
}

const isFile = (data: BodyDataItem): boolean => {
    return data.type === EBodyDataType.File
}
const isDate = (data: BodyDataItem): boolean => {
    return data.type === EBodyDataType.Date
}
const isString = (data: BodyDataItem): boolean => {
    return data.type === EBodyDataType.String
}
const isNumber = (data: BodyDataItem): boolean => {
    return data.type === EBodyDataType.Number
}
const isBoolean = (data: BodyDataItem): boolean => {
    return data.type === EBodyDataType.Boolean
}
interface FormDataConvertConfig {
    /**
     * 嵌套集合或者对象的分隔符
     */
    separator: string;
    /**
     * 是否支持嵌套集合或者对象
     */
    supportNest: boolean;
    /**
     * 是否允许嵌套集合或者对象中出现空名称
     */
    supportEmptyNameWhenNest: boolean;
}

export class FormDataConvertStrategy implements BodyDataConvertStrategy<FormData,FormDataConvertConfig> {

    isBodyDataItemBaseType(data: BodyDataItemType): boolean {
        return this.isFile(data) ||  this.isDate(data) ||  this.isString(data) ||  this.isNumber(data) ||  this.isBoolean(data);
    }

    isBodyDataItemArrayType(data: BodyDataItemType): boolean {
        return this.isArray(data);
    }
    isBodyDataItem(data: any): boolean {
        return "key" in data && "value" in data && "type" in data;
    }
    isBodyDataItemObjectType(data: BodyDataItemType): boolean {
        return typeof data === 'object' && !this.isArray(data);
    }

    typeInfo(data: BodyDataItemType): number {
       if (this.isBodyDataItemBaseType(data)){
           return 0;
       }
         if (this.isBodyDataItemArrayType(data)){
              return 1;
         }
            if (this.isBodyDataItemObjectType(data)){
                return 2;
            }
            return -1;
    }

    isArray(data: BodyDataItemType): boolean {
        return data instanceof Array;
    }

    isObject(data: BodyDataItemType): boolean {
        return data instanceof Object;
    }

    isFile(data: BodyDataItemType): boolean {
        return data instanceof File;
    }

    isDate(data: BodyDataItemType): boolean {
        return data instanceof Date;
    }

    isString(data: BodyDataItemType): boolean {
        return typeof data === 'string';
    }

    isNumber(data: BodyDataItemType): boolean {
        return typeof data === 'number';
    }

    isBoolean(data: BodyDataItemType): boolean {
        return typeof data === 'boolean';
    }

    computeFormDataName(name: string, parentName: string, config: FormDataConvertConfig,index?:number,): string {
        if (parentName === undefined || parentName === null || parentName.trim() === '') {
            if (!config.supportNest){
                throw new Error("不支持嵌套集合或者对象,请检查数据或者开启`supportNest`特性");
            }
        }

       if(name===undefined||name===null||name.trim()===""){
           if(config.supportEmptyNameWhenNest){
              if (index!==undefined){
                  return `${parentName}[${index}]`;
           }else {
              return parentName;
           }

       }else {
              throw new Error('在嵌套集合或对象中,不允许出现空名称,请检查数据或者开启`supportEmptyNameWhenNest`特性');
           }
       }

        return `${parentName}${config.separator}${name}`;
    }

    handlerArray(data: BodyDataItemType, parent:BodyDataItem,formData:FormData,config: FormDataConvertConfig):boolean {
            if (data===undefined||data===null){
                return false;
            }
            if (!this.isBodyDataItem(data)){
                return false;
            }
            data=data as BodyDataItem;

            if (!this.isBodyDataItemArrayType(data.value)){
              return false;
            }

            if (!config.supportNest){
                throw new Error('不支持嵌套集合或者对象');
            }
            const ivs = data.value as BodyDataItemType[];
            // 集合内不能同时存在基础类型和集合类型,所以在处理之前先进行校验
            const conflict = ivs.some(((iv: BodyDataItemType,index:number) => {
                if (index===undefined||index===0){
                    return false;
                }
                const pre = ivs[index-1];
                return this.typeInfo(pre)!==this.typeInfo(iv);
            }));
            if (conflict){
                throw new Error('集合内不能同时存在基础类型和集合类型');
            }

            ivs.forEach((iv: BodyDataItemType) => {
                if (this.isBodyDataItemBaseType(iv)) {
                    if (this.isFile(iv)) {
                        formData.append(parent.name, iv as File);
                    } else if (
                        this.isString(iv) ||
                        this.isNumber(iv) ||
                        this.isBoolean(iv)
                    ) {
                        formData.append(parent.name, iv.toString());
                    } else if (this.isDate(iv)) {
                        const date = iv as Date;
                        formData.append(parent.name, date.getUTCMilliseconds().toString());
                    }
                }else if (this.isBodyDataItemArrayType(iv)){
                    //
                    this.handlerArray(iv as BodyDataItem,parent,formData,config);
                }
                const formName=this.computeFormDataName(iv.name,key,config,iv.index)
                // 集合内的数据类型,根据配置默认被认为是基础类型
                if (this.isBodyDataItemBaseType(item)) {
                    if (this.isFile(iv)) {
                        formData.append(formName, iv as File);
                    } else if (
                        this.isString(iv) ||
                        this.isNumber(iv) ||
                        this.isBoolean(iv)
                    ) {
                        formData.append(formName, iv.toString());
                    } else if (this.isDate(iv)) {
                        const date = iv as Date;
                        formData.append(formName, date.getUTCMilliseconds().toString());
                    }

                }else {
                    // 嵌套集合或者对象,没想好,暂时不支持
                    throw new Error('暂不支持嵌套集合或者对象');
                }
            }
        }
    }
    convert(data: BodyData,config:FormDataConvertConfig): FormData {
        const formData = new FormData();
        data.forEach((item: BodyDataItem, key: string) => {
            // 集合类型的数据是需要特殊处理的
            if (item.value === undefined || item.value === null) {
                return;
            }
            if (isArray(item)) {
                if (!config.supportNest){
                    throw new Error('不支持嵌套集合或者对象');}
                const ivs = item.value as BodyDataItemType[];
                ivs.forEach((iv: BodyDataItemType) => {
                    if (!key){

                    }
                    const formName=this.computeFormDataName(iv.name,key,config,iv.index)
                    // 集合内的数据类型,根据配置默认被认为是基础类型
                    if (this.isBodyDataItemBaseType(item)) {
                        if (this.isFile(iv)) {
                            formData.append(formName, iv as File);
                        } else if (
                            this.isString(iv) ||
                            this.isNumber(iv) ||
                            this.isBoolean(iv)
                        ) {
                            formData.append(formName, iv.toString());
                        } else if (this.isDate(iv)) {
                            const date = iv as Date;
                            formData.append(formName, date.getUTCMilliseconds().toString());
                        }

                    }else {
                        // 嵌套集合或者对象,没想好,暂时不支持
                        throw new Error('暂不支持嵌套集合或者对象');
                    }
                }
            }
        )
            ;
            return formData;
        }

    }