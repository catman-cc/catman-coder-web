import { get, post } from "@/core/api";
import { Parameter, ParameterSchema } from "@/core/entity/Common";
import { API } from "@/core/api/typings";

export function findById(id: string): Promise<API.Response<Parameter>> {
  return get<Parameter>(`/api/parameter/${id}`);
}

export function fuzzy(
  query: API.FuzzyQuery
): Promise<API.Response<Array<Parameter>>> {
  return get<Array<Parameter>>("/api/parameter/fuzzy", {
    key: query.key,
    fields: query.fields?.join(","),
  });
}

export function countReference(key: string): Promise<API.Response<number>> {
  return get<number>(`/api/type-definition/reference/count/${key}`);
}

export function save(obj: Parameter): Promise<API.Response<Parameter>> {
  return post<Parameter>(`/api/parameter`, obj);
}

export function createFromTypeDefinitionId(
  id: string
): Promise<API.Response<ParameterSchema>> {
  return post<ParameterSchema>(
    `/api/parameter/create-from-type-definition/${id}`,
    {}
  );
}

export class ParameterService {
  static createFromTypeDefinitionId(
    id: string
  ): Promise<API.Response<ParameterSchema>> {
    return createFromTypeDefinitionId(id);
  }
}
