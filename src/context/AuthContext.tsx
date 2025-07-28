import { type User, type UserCredential, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../repository/firebase";

interface AuthContextType {
    currentUser: User | null;
    login: (user, password) => Promise<UserCredential>;
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, logout: () => new Promise<void>(() => { }), login: () => new Promise<UserCredential>(() => { }) });

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        return signOut(auth);
    }

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook para consumir el contexto fácilmente
const useAuth = () => {
    return useContext(AuthContext);
};

// eslint-disable-next-line react-refresh/only-export-components
export default useAuth;