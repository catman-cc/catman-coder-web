import { DefaultTypeDefinition } from "@/common/core"
import { ID } from "@/common/id"

export const Convert = (parameter: Core.Parameter) => {
    // 作为复合数据,生成的数据结构和其td保持一致

}

// 将类型定义转换为参数对象
export const parseToParameter = (td: Core.TypeDefinition) => {
    const parameter: Core.Parameter = {
        id: ID(),
        name: td.name,
        type: td,
        items: []
    }
    const etd = DefaultTypeDefinition.ensure(td)
    etd.recursionChildWithCallback((c, p) => {
        parameter.items.push(parseToParameter(c))
    })
    return parameter
}
export interface ParameterTree {
    key: string
    data: Core.Parameter
    children: ParameterTree[]
}

/**
 *  将参数定义转换为参数定义树
 * @param paramet 参数定义
 * @returns 树
 */
export const parseToParameterTree = (parameter: Core.Parameter): ParameterTree => {
    return {
        ...parameter,
        ...{
            key: parameter.id,
            data: parameter,
            children: (parameter.items.length > 0 ? parameter.items.map(p => parseToParameterTree(p)) : undefined)
        }

    } as ParameterTree
}