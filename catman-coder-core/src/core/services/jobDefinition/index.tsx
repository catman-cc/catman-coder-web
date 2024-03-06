import { get, post } from "@/core/api";
import { JobDefinition } from "@/core/entity/Common";
import { API } from "@/core/api/typings";

export function findByName(name: string): Promise<API.Response<JobDefinition>> {
  return get<JobDefinition>(`/api/job-definition/name/${name}`);
}

export function save(
  item: JobDefinition
): Promise<API.Response<JobDefinition>> {
  return post<JobDefinition>(`/api/job-definition`, item);
}

export function fuzzy(
  query: API.FuzzyQuery
): Promise<API.Response<Array<JobDefinition>>> {
  return get<Array<JobDefinition>>("/api/job-definition/fuzzy", {
    key: query.key,
    fields: query.fields?.join(","),
  });
}
