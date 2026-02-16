import Cookies from 'js-cookie';

export const useAuth = () => {
    const isAuthenticated = (): boolean => {
        return Cookies.get('accessToken') !== undefined;
    };

    return { isAuthenticated };
};