import {
  get,
  put,
  API,
  TypeDefinition,
  TypeDefinitionSchema,
} from "catman-coder-core";

export class TypeeDefinitionService {
  static findById(id: string): Promise<API.Response<TypeDefinition>> {
    return findById(id);
  }
}

export class TypeeDefinitionSchemaService {}

export function serialize(): Promise<API.Response<string>> {
  return get<string>(`/api/type-definition/serialize`);
}

export function findById(id: string): Promise<API.Response<TypeDefinition>> {
  return get<TypeDefinition>(`/api/type-definition/${id}`);
}

export function fuzzy(
  query: API.FuzzyQuery,
): Promise<API.Response<Array<TypeDefinition>>> {
  return get<Array<TypeDefinition>>("/api/type-definition/fuzzy", {
    key: query.key,
    fields: query.fields?.join(","),
  });
}

export function countReference(key: string): Promise<API.Response<number>> {
  return get<number>(`/api/type-definition/reference/count/${key}`);
}

export function save(
  obj: TypeDefinition,
): Promise<API.Response<TypeDefinition>> {
  return put<TypeDefinition>(`/api/type-definition`, obj);
}
export function saveSchema(
  obj: TypeDefinitionSchema,
): Promise<API.Response<TypeDefinition>> {
  return put<TypeDefinition>(`/api/type-definition/schema`, obj);
}
export function findSchemaById(
  id: string,
): Promise<API.Response<TypeDefinition>> {
  return get<TypeDefinition>(`/api/type-definition/schema/${id}`);
}
export function findAllSimples(): Promise<API.Response<TypeDefinition[]>> {
  return get<TypeDefinition[]>(`/api/type-definition/list-simple`);
}
