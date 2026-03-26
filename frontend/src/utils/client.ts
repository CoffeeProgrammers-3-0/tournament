import axios, {type AxiosResponse, type InternalAxiosRequestConfig} from 'axios';
import Cookies from 'js-cookie';
import AuthService from '../services/auth/AuthService';

// Додаємо розширення типу для підтримки прапорця повтору
interface CustomInternalConfig extends InternalAxiosRequestConfig {
    _retried?: boolean;
}

export const client = axios.create({
    baseURL: 'http://localhost:8081/api',
    withCredentials: true,
});

client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('accessToken');
        if (token && config.headers) {
            // Використовуємо .set() або пряме призначення, оскільки headers вже ініціалізовані
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

        if (response && response.status === 401 && originalRequest && !originalRequest._retried) {
            originalRequest._retried = true;

            try {
                const success = await AuthService.refresh();

                if (success) {
                    const newToken = Cookies.get('accessToken');
                    if (newToken && originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    // Повертаємо виклик клієнта з оновленим конфігом
                    return client(originalRequest);
                }
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);