import { del, get, put } from "@/core/api";
import {
  Resource,
  ResourceDetails,
  ResourceService,
} from "@/core/entity/Common";
import { API } from "@/core/api/typings";

export class DefaultResourceService implements ResourceService {
  root(selector?: string): Promise<API.Response<Resource>> {
    return get(`/api/resource/root?selector=${selector || ""}`);
  }

  findById(id: string): Promise<API.Response<Resource>> {
    return get(`/api/resource/${id}`);
  }

  save(resource: Resource): Promise<API.Response<Resource>> {
    return put(`/api/resource`, resource);
  }

  rename(id: string, name: string): Promise<API.Response<Resource>> {
    return put(`/api/resource/rename/${id}/${name}`, {});
  }

  delete(resource: Resource): Promise<API.Response<Resource>> {
    return del<Resource>(`/api/resource/${resource.id}`);
  }

  loadDetails<T>(resource: Resource): Promise<API.Response<T>> {
    return get(`/api/resource/details/${resource.id}`);
  }

  create<T>(resource: Resource): Promise<API.Response<ResourceDetails<T>>> {
    return put("/api/resource/create", resource);
  }
  move(
    id: string,
    parentId?: string,
    previousId?: string,
    nextId?: string,
    index?: number
  ): Promise<API.Response<boolean>> {
    return put(
      `/api/resource/move/${id}?parentId=${parentId || ""}&previousId=${
        previousId || ""
      }&nextId=${nextId || ""}&index=${index || 0}`,
      {}
    );
  }
  flush(id: string): Promise<API.Response<boolean>> {
    return get(`/api/resource/flush-sort/${id}`);
  }
}

export const defaultResourceService = new DefaultResourceService();
