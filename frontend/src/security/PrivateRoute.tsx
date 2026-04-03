import React from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuth} from './useAuth.tsx';

const PrivateRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // If they have a token, let them in.
    if (isAuthenticated()) {
        return <Outlet />;
    }

    // Otherwise, redirect to login and save the attempted URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

export default PrivateRoute;