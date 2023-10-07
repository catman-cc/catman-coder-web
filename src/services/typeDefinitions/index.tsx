import { get, put } from '@/common/api';

export function findById(id: string): Promise<API.Response<Core.TypeDefinition>> {
    return get<Core.TypeDefinition>(`/api/type-definition/${id}`)
}
export function fuzzy(query: API.FuzzyQuery): Promise<API.Response<Array<Core.TypeDefinition>>> {
    return get<Array<Core.TypeDefinition>>("/api/type-definition/fuzzy", {
        key: query.key,
        fields: query.fields?.join(",")
    });
}

export function countReference(key: string): Promise<API.Response<number>> {
    return get<number>(`/api/type-definition/reference/count/${key}`)
}
export function save(obj: Core.TypeDefinition): Promise<API.Response<Core.TypeDefinition>> {
    return put<Core.TypeDefinition>(`/api/type-definition`, obj)
}
