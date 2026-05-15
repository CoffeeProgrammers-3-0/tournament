import {Navigate, Outlet} from "react-router-dom";
import Cookies from "js-cookie";

type Role = 'ADMIN' | 'JURY' | 'USER';

interface PrivateRouteProps {
    allowedRoles?: Role[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
    const isLoggedIn = !!Cookies.get("token") || !!Cookies.get("userId");
    const userRole = (Cookies.get("role") as Role) || 'USER';

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;