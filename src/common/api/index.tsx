import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5173/",
    timeout: 1000
});

// axiosInstance.defaults.baseURL = "http://localhost:8000/";

axiosInstance.interceptors.response.use((response) => {
    if (response.data.success) {
        return Promise.resolve(response.data);
    }
    return Promise.reject(response.data);
}, (error) => {
    return Promise.reject(error);
});

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
                console.log(123321312);

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

export default axiosInstance;