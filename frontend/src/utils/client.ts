import axios, {type AxiosResponse, type InternalAxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';
import AuthService from '../services/auth/AuthService';

const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'
};

interface CustomInternalConfig extends InternalAxiosRequestConfig {
    _retried?: boolean;
}

export const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    withCredentials: true,
});

client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        const { response, config } = error;
        const originalRequest = config as CustomInternalConfig;

        if (response) {
            const status = response.status;

            // 1. Обробка 401 (Refresh Token)
            if (status === 401 && originalRequest && !originalRequest._retried) {
                originalRequest._retried = true;
                try {
                    const success = await AuthService.refresh();
                    if (success) {
                        const newToken = Cookies.get('accessToken');
                        if (newToken && originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return client(originalRequest);
                    }
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }

            // 2. Додана логіка: Редірект на 403 та 404
            if (status === 403) {
                window.location.replace('/403');
                return Promise.reject(error); // Зупиняємо виконання коду в компоненті
            }

            if (status === 404) {
                window.location.replace('/404');
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);