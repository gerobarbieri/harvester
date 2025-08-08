import { Navigate, Outlet } from 'react-router';
import useAuth from '../../context/auth/AuthContext';

const PrivateRoute = () => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export default PrivateRoute;