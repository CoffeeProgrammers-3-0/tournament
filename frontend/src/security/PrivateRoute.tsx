import React from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuth} from './useAuth.tsx';

const PrivateRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // /callback зазвичай обробляється окремо, але краще тримати його публічним в App.tsx
    if (location.pathname === "/callback") {
        return <Outlet />;
    }

    // Якщо авторизований — показуємо вкладені роути.
    // Якщо ні — перенаправляємо на /login, зберігаючи попередній шлях у state
    return isAuthenticated() ? (
        <Outlet />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default PrivateRoute;