import { get, post } from "@/core/api";

export function findByName(
  name: string
): Promise<API.Response<Core.JobDefinition>> {
  return get<Core.JobDefinition>(`/api/job-definition/name/${name}`);
}

export function save(
  item: Core.JobDefinition
): Promise<API.Response<Core.JobDefinition>> {
  return post<Core.JobDefinition>(`/api/job-definition`, item);
}

export function fuzzy(
  query: API.FuzzyQuery
): Promise<API.Response<Array<Core.JobDefinition>>> {
  return get<Array<Core.JobDefinition>>("/api/job-definition/fuzzy", {
    key: query.key,
    fields: query.fields?.join(","),
  });
}
