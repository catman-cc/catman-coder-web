import { message } from "antd";
import axios from "axios";
import Qs from 'qs';

const axiosInstance = axios.create({
    baseURL: "http://localhost:5173/",
    timeout: 30000,

});

// axiosInstance.defaults.baseURL = "http://localhost:8000/";

axiosInstance.interceptors.response.use((response) => {
    const res = response.data as unknown as API.Response<unknown>
    if (res.success) {
        return Promise.resolve(response.data);
    }
    message.warning("接口调用出错:" + res.message)
    return Promise.reject(response.data);
}, (error) => {
    message.error("接口调用出错:" + error)
    return Promise.reject(error);
});

axiosInstance.interceptors.request.use(config => {
    config.paramsSerializer = {
        serialize: (params) => {
            return Qs.stringify(params, {
                arrayFormat: "repeat",
                encode: true,
                indices: false,
                format: "RFC3986",
                filter: (prefix, value) => {
                    if (prefix === "sorts") {
                        if (isSort(value)) {
                            const sorts = value as API.Sort
                            return Object.keys(sorts).map(key => {
                                const dir = sorts[key]
                                return `${key}:${dir}`
                            })
                        }
                        return value
                    }
                    return value
                }
            });
        }
    }

    return config;
})

function isSort(obj: unknown) {
    if (!(obj instanceof Object)) {
        return
    }

    if (Array.isArray(obj)) {
        return false
    }
    obj = obj as object
    return Object.keys(obj as object).every(key => {
        const v = obj[key]
        if (typeof v !== "string") {
            return false
        }
        return (v === 'ASC' || v === 'DESC')
    });
}

export class FuzzyQuery {
    key!: string;
    fields!: Array<string>;
}



interface AnyObject {
    [key: string]: unknown;
}


export const get = <T,>(url: string, params: AnyObject = {}, post?: (data: API.Response<T>) => API.Response<T>): Promise<API.Response<T>> =>
    new Promise((resolve) => {
        axiosInstance
            .get(url, { params })
            .then((result) => {
                const res = result as unknown as API.Response<T>
                resolve((post ? post(res) : res))
            })
            .catch((err) => {
                resolve({
                    success: false,
                    message: err.message,
                    timestamp: Date.now(),
                    error: err
                } as API.Response<T>)
            })
    })

export const post = <T,>(url: string, params: object, post?: (data: API.Response<T>) => API.Response<T>): Promise<API.Response<T>> =>
    new Promise((resolve) => {
        axiosInstance
            .post(url, { ...params }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((result) => {
                const res = result as unknown as API.Response<T>
                resolve((post ? post(res) : res))
            })
            .catch((err) => {
                resolve({
                    success: false,
                    message: err.message,
                    timestamp: Date.now(),
                    error: err
                } as API.Response<T>)
            })
    })

export const put = <T,>(url: string, params: object, post?: (data: API.Response<T>) => API.Response<T>): Promise<API.Response<T>> =>
    new Promise((resolve) => {
        axiosInstance
            .put(url, { ...params }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((result) => {
                const res = result as unknown as API.Response<T>
                resolve((post ? post(res) : res))
            })
            .catch((err) => {
                resolve({
                    success: false,
                    message: err.message,
                    timestamp: Date.now(),
                    error: err
                } as API.Response<T>)
            })
    })

export const del = <T,>(url: string, post?: (data: API.Response<T>) => API.Response<T>): Promise<API.Response<T>> =>
    new Promise((resolve) => {
        axiosInstance
            .delete(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((result) => {
                const res = result as unknown as API.Response<T>
                resolve((post ? post(res) : res))
            })
            .catch((err) => {
                resolve({
                    success: false,
                    message: err.message,
                    timestamp: Date.now(),
                    error: err
                } as API.Response<T>)
            })
    })

export default axiosInstance;