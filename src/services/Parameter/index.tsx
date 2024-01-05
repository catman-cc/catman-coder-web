import { get, post } from '@/common/api';

export function findById(id: string): Promise<API.Response<Core.Parameter>> {
    return get<Core.Parameter>(`/api/parameter/${id}`)
}

export function fuzzy(query: API.FuzzyQuery): Promise<API.Response<Array<Core.Parameter>>> {
    return get<Array<Core.Parameter>>("/api/parameter/fuzzy", {
        key: query.key,
        fields: query.fields?.join(",")
    });
}

export function countReference(key: string): Promise<API.Response<number>> {
    return get<number>(`/api/type-definition/reference/count/${key}`)
}

export function save(obj: Core.Parameter): Promise<API.Response<Core.Parameter>> {
    return post<Core.Parameter>(`/api/parameter`, obj)
}
