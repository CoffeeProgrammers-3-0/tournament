import axios, {type AxiosResponse, type InternalAxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';
import AuthService from '../services/auth/AuthService';

export interface CustomInternalConfig extends InternalAxiosRequestConfig {
    _retried?: boolean;
}


export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

export const responseSuccess = (response: AxiosResponse) => response;

export const responseError = async (error: any) => {
    const originalRequest = error.config as CustomInternalConfig;

    if (!error.response) {
        console.error("Network error or CORS issue. No response received.");
        await AuthService.refresh();
        return Promise.reject(error);
    }

    const status = error.response.status;

    if (
        originalRequest.url?.includes('/auth/callback') ||
        originalRequest.url?.includes('/auth/refresh')
    ) {
        return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retried) {
        originalRequest._retried = true;

        try {
            const success = await AuthService.refresh();

            if (success) {
                const newToken = Cookies.get('accessToken');
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return client(originalRequest);
                }
            }
        } catch (e) {
            Cookies.remove('accessToken');
            window.location.replace('/login');
            return Promise.reject(e);
        }
    }

    if (status === 403) window.location.replace('/403');
    if (status === 404) window.location.replace('/404');

    return Promise.reject(error);
};

export const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
});

client.interceptors.request.use(requestInterceptor);
client.interceptors.response.use(responseSuccess, responseError);