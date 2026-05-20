import { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. ON PAGE REFRESH: Check memory before doing anything
    useEffect(() => {
        const role = localStorage.getItem('user_role');
        const name = localStorage.getItem('user_name');
        const id = localStorage.getItem('user_id');

        if (role && name) {
            setUser({ role, name, id: id ? Number(id) : undefined });
        }
        setLoading(false);
    }, []);

    // 2. ON LOGIN: Save to memory so it survives a refresh
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;

            // Save the user details (but NOT the token, that is safely in the HttpOnly cookie!)
            localStorage.setItem('user_role', data.role);
            localStorage.setItem('user_name', data.name);
            if (data.id != null) {
                localStorage.setItem('user_id', String(data.id));
            }

            setUser({
                role: data.role,
                name: data.name,
                id: data.id != null ? Number(data.id) : undefined,
            });
            return data.role;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    // 3. ON LOGOUT: Tell backend to destroy cookie, then wipe memory
    const logout = async () => {
        try {
            await api.post('/auth/logout'); // Destroys the HttpOnly cookie
        } catch (err) {
            console.error("Logout failed on backend", err);
        } finally {
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_id');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};