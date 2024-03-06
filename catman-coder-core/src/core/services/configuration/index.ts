import { get, post } from "@/core/api";
import { API } from "@/core/api/typings";

export function findByName(
  name: string
): Promise<API.Response<Configuration.ConfigurationItem>> {
  return get<Configuration.ConfigurationItem>(
    `/api/configuration-items/name/${name}`
  );
}

export function save(
  item: Configuration.ConfigurationItem
): Promise<API.Response<Configuration.ConfigurationItem>> {
  return post<Configuration.ConfigurationItem>(
    `/api/configuration-items`,
    item
  );
}
