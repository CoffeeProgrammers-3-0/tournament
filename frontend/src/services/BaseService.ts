import type {AxiosRequestConfig, AxiosResponse} from 'axios';
import {client} from "../utils/client.ts";

export default class BaseService {
    private endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    private async handleRequest<T>(request: () => Promise<AxiosResponse<T>>): Promise<T> {
        try {
            const response = await request();
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    public get<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
        return this.handleRequest(() => client.get<T>(`${this.endpoint}${path}`, config));
    }

    public post<T>(path: string, data: unknown = {}, config: AxiosRequestConfig = {}): Promise<T> {
        return this.handleRequest(() => client.post<T>(`${this.endpoint}${path}`, data, config));
    }

    public put<T>(path: string, data: unknown = {}, config: AxiosRequestConfig = {}): Promise<T> {
        return this.handleRequest(() => client.put<T>(`${this.endpoint}${path}`, data, config));
    }

    public patch<T>(path: string, data: unknown = {}, config: AxiosRequestConfig = {}): Promise<T> {
        return this.handleRequest(() => client.patch<T>(`${this.endpoint}${path}`, data, config));
    }


    public delete<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
        return this.handleRequest(() => client.delete<T>(`${this.endpoint}${path}`, config));
    }
}
