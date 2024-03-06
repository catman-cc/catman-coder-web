import { RequestData } from "@ant-design/pro-components";
export type ParamsType = {
    [index: string]: unknown
}
export class AntDesignProHelper {
    static convertAntDesignProPage(params: ParamsType & {
        pageSize?: number;
        current?: number;
        keyword?: string;
    }, sort: Record<string, 'descend' | 'ascend' | null>): API.Page {
        return convertAntDesignProPage(params, sort)
    }

    static doPage<T>(params: ParamsType & {
        pageSize?: number;
        current?: number;
        keyword?: string;
    }, sort: Record<string, 'descend' | 'ascend' | null>, request: PageFunction<T>): Promise<Partial<RequestData<T>>> {
        return doPage(params, sort, request)
    }
}

export function convertAntDesignProPage(params: ParamsType & {
    pageSize?: number;
    current?: number;
    keyword?: string;
}, sort: Record<string, 'descend' | 'ascend' | null>): API.Page {

    const page = {
        ...params
    } as API.Page
    if (page.current) {
        // 这里需要注意,后端接口的current从0开始,但是ant design 的current从1开始
        page.current = page.current > 0 ? page.current - 1 : 0
    }

    if (sort) {
        if (!page.sorts) {
            page.sorts = {}
        }
        Object.keys(sort).forEach(key => {
            const v = sort[key]
            const sortValue = v === null ? "ASC"
                : v === "ascend" ? "ASC" : "DESC"
            page.sorts![key] = sortValue
        })
    }

    return page

}
export type PageFunction<T> = (_page: API.Page) => Promise<API.Response<API.VPage<T>>>

export function doPage<T>(params: ParamsType & {
    pageSize?: number;
    current?: number;
    keyword?: string;
}, sort: Record<string, 'descend' | 'ascend' | null>, request: PageFunction<T>): Promise<Partial<RequestData<T>>> {
    return request(convertAntDesignProPage(params, sort))
        .then((res) => {
            const vp = res.data;
            return {
                data: vp.records,
                success: res.success,
                total: vp.total,
                page: vp.current,
            } as Partial<RequestData<T>>;
        });
}


{/* 
return ExecutorJoinCodeService.findPage(AntDesignProHelper.convertAntDesignProPage(params, sort))
    .then((res) => {
        const vp = res.data

        return {
            data: vp.records,
            success: res.success,
            total: vp.total,
            page: vp.current
        } as Partial<RequestData<GithubIssueItem>>
    })
} */}