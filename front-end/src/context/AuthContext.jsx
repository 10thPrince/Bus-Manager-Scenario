import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('isAuth') === "true"
    )
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user')
        return storedUser ? JSON.parse(storedUser) : null
    })

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData || null)
        localStorage.setItem('isAuth', 'true');
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null)
        localStorage.removeItem('isAuth');
        localStorage.removeItem('user');
    }

    return(
        <AuthContext.Provider value={{isAuthenticated, user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
