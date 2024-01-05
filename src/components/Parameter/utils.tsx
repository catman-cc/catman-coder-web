import { ID } from "@/common/id"

/**
 *  将类型定义转换为参数定义
 * @param td 类型定义
 * @returns  参数定义
 */
export const wrapperTypeDefinitionToParameter = (td: Core.TypeDefinition): Core.Parameter => {
    return {
        id: ID(),
        name: td.name,
        type: td,
        items: td.type.items.map(t => {
            return wrapperTypeDefinitionToParameter(t)
        })
    } as Core.Parameter
}