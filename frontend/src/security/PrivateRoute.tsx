import {Navigate, Outlet} from "react-router-dom";
import Cookies from "js-cookie";

type Role = 'ADMIN' | 'JURY' | 'USER';

interface PrivateRouteProps {
    allowedRoles?: Role[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
    const isLoggedIn = !!Cookies.get("token") || !!Cookies.get("userId");
    const userRole = (Cookies.get("role") as Role) || 'USER';

    // 1. Якщо не авторизований - на сторінку логіну
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 2. Якщо маршрут вимагає певних ролей, перевіряємо їх
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/403" replace />;
    }

    // 3. Все добре - пропускаємо
    return <Outlet />;
};

export default PrivateRoute;