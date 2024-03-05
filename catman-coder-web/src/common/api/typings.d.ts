declare namespace API {
    // 通用模糊查询字段
    interface FuzzyQuery {
        key?: string // 模糊查询字段
        fields: string[] // 进行模糊查询时, 需要查询的字段列表
    }

    // 响应数据类型
    interface Response<T> {
        success: boolean; // 是否成功
        code: number; // 状态码
        data: T; // 数据
        message: string; // 消息
        timestamp: number; // 时间戳
        error: Error | null; // 错误
    }

    interface Sort {
        [index: string]: "ASC" | "DESC"
    }

    interface Page {
        [index: string]: unknown
        pageSize: number
        current?: number
        startId?: string
        type?: "GENERAL" | "SCROLL" | "AUTO"
        sorts?: Sort
    }



    export interface VPage<T> {
        size?: number

        pages?: number

        current?: number

        total?: number

        isFirst?: boolean

        isLast?: boolean

        hasPre?: boolean

        hasNext?: boolean

        records?: T[]

        ex?: unknown
    }

}