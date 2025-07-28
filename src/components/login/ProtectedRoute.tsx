
import type { FC } from "react";
import { Outlet, Navigate } from "react-router";
import useAuth from "../../context/AuthContext";

const ProtectedRoute: FC = () => {
    const { currentUser } = useAuth(); // Obtenemos loading también aquí

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};


export default ProtectedRoute;