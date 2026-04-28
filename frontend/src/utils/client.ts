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
        const originalRequest = error.config as CustomInternalConfig;

        if (!error.response) {
            console.error("Network error or CORS issue. No response received.");
            await AuthService.refresh();
            // window.location.replace('/login');
            return Promise.reject(error);
        }

        const { response } = error;
        const status = response.status;

        if (originalRequest.url?.includes('/auth/callback') ||
            originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retried) {
            originalRequest._retried = true;

            try {
                console.log("401 detected, attempting token refresh...");
                const success = await AuthService.refresh();

                if (success) {
                    const newToken = Cookies.get('accessToken');
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return client(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error("Refresh token expired or failed. Logging out.");
                Cookies.remove('accessToken');
                window.location.replace('/login');
                return Promise.reject(refreshError);
            }
        }

        if (status === 403) window.location.replace('/403');
        if (status === 404) window.location.replace('/404');

        return Promise.reject(error);
    }
);