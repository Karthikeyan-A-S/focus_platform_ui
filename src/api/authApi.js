import api from './axiosConfig';

export const authApi = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { 
            email, 
            password 
        });
        return response.data; // Returns { token, name, role }
    },

    register: async (name, email, password, role) => {
        const response = await api.post('/auth/register', { 
            name, 
            email, 
            password, 
            role // 'STUDENT' or 'TEACHER'
        });
        return response.data;
    }
};