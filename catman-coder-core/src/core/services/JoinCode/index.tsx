import { get, put } from "@/core/api";
import { ExecutorJoinCode } from "./typeings";
import { API } from "@/core/api/typings";
export enum ExecutorJoinCodeStatus {
  WAIT_ACTIVE = "WAIT_ACTIVE",
  VALID = "VALID",
  INVALID = "INVALID",
  EXPIRED = "EXPIRED",
  USED = "USED",
  DISABLED = "DISABLED",
}

export function findAll(
  keyword: string
): Promise<API.Response<ExecutorJoinCode[]>> {
  return get<ExecutorJoinCode[]>(`/api/join-code/all`, { keyword });
}

export function findPage(
  page: API.Page
): Promise<API.Response<API.VPage<ExecutorJoinCode>>> {
  return get<API.VPage<ExecutorJoinCode>>(`/api/join-code/page`, {
    ...page,
  });
}

export function findById(id: string): Promise<API.Response<ExecutorJoinCode>> {
  return get<ExecutorJoinCode>(`/api/join-code/${id}`);
}

export function findByJoinCode(
  code: string
): Promise<API.Response<ExecutorJoinCode>> {
  return get<ExecutorJoinCode>(`/api/join-code/join-code/${code}`);
}

export function createJoinCode(): Promise<API.Response<ExecutorJoinCode>> {
  return get<ExecutorJoinCode>(`/api/join-code/create-join-code`);
}

export function createExecutorJoinCode(): Promise<
  API.Response<ExecutorJoinCode>
> {
  return put<ExecutorJoinCode>(`/api/join-code/create`, {});
}

export function flushJoinCode(
  joinCode: ExecutorJoinCode
): Promise<API.Response<ExecutorJoinCode>> {
  return put<ExecutorJoinCode>(`/api/join-code/flush-join-code`, joinCode);
}

export function save(
  joinCode: ExecutorJoinCode
): Promise<API.Response<ExecutorJoinCode>> {
  return put<ExecutorJoinCode>(`/api/join-code/save`, joinCode);
}

export function fuzzy(
  query: API.FuzzyQuery
): Promise<API.Response<Array<ExecutorJoinCode>>> {
  return get<Array<ExecutorJoinCode>>("/api/join-code/fuzzy", {
    key: query.key,
    fields: query.fields?.join(","),
  });
}

export class ExecutorJoinCodeService {
  static findPage(
    page: API.Page
  ): Promise<API.Response<API.VPage<ExecutorJoinCode>>> {
    return findPage(page);
  }
  static findAll(keyword: string): Promise<API.Response<ExecutorJoinCode[]>> {
    return findAll(keyword);
  }

  static findById(id: string): Promise<API.Response<ExecutorJoinCode>> {
    return findById(id);
  }

  static findByJoinCode(code: string): Promise<API.Response<ExecutorJoinCode>> {
    return findByJoinCode(code);
  }

  static createJoinCode(): Promise<API.Response<ExecutorJoinCode>> {
    return createJoinCode();
  }

  static createExecutorJoinCode(): Promise<API.Response<ExecutorJoinCode>> {
    return createExecutorJoinCode();
  }

  static flushJoinCode(
    joinCode: ExecutorJoinCode
  ): Promise<API.Response<ExecutorJoinCode>> {
    return flushJoinCode(joinCode);
  }

  static save(
    joinCode: ExecutorJoinCode
  ): Promise<API.Response<ExecutorJoinCode>> {
    return save(joinCode);
  }

  static fuzzy(
    query: API.FuzzyQuery
  ): Promise<API.Response<Array<ExecutorJoinCode>>> {
    return fuzzy(query);
  }
}
