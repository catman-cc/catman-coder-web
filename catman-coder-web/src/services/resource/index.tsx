import { del, get, put } from "@/common/api";

export class DefaultResourceService implements Core.ResourceService {
  root(selector?: string): Promise<API.Response<Core.Resource>> {
    return get(`/api/resource/root?selector=${selector || ""}`);
  }

  findById(id: string): Promise<API.Response<Core.Resource>> {
    return get(`/api/resource/${id}`);
  }

  save(resource: Core.Resource): Promise<API.Response<Core.Resource>> {
    return put(`/api/resource`, resource);
  }

  rename(id: string, name: string): Promise<API.Response<Core.Resource>> {
    return put(`/api/resource/rename/${id}/${name}`, {});
  }

  delete(resource: Core.Resource): Promise<API.Response<Core.Resource>> {
    return del<Core.Resource>(`/api/resource/${resource.id}`);
  }

  loadDetails<T>(resource: Core.Resource): Promise<API.Response<T>> {
    return get(`/api/resource/details/${resource.id}`);
  }

  create<T>(
    resource: Core.Resource,
  ): Promise<API.Response<Core.ResourceDetails<T>>> {
    return put("/api/resource/create", resource);
  }
  move(id: string, parentId?: string, previousId?: string, nextId?: string, index?: number): Promise<API.Response<boolean>> {
    return put(`/api/resource/move/${id}?parentId=${parentId || ""}&previousId=${previousId || ""}&nextId=${nextId || ""}&index=${index || 0}`, {});
  }
  flush(id: string): Promise<API.Response<boolean>> {
    return get(`/api/resource/flush-sort/${id}`);
  }
}

export const defaultResourceService = new DefaultResourceService();
