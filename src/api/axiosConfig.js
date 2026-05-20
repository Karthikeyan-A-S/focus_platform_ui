// import axios from 'axios';

// // Create a base instance pointing to your Spring Boot server
// const api = axios.create({
//     baseURL: 'http://localhost:8080/api', 
//     headers: {
//         'Content-Type': 'application/json',
//     }
// });

// // // The Interceptor: Automatically attach the JWT token if it exists
// // api.interceptors.request.use(
// //     (config) => {
// //         const token = localStorage.getItem('jwt_token');
// //         if (token) {
// //             config.headers.Authorization = `Bearer ${token}`;
// //         }
// //         return config;
// //     },
// //     (error) => {
// //         return Promise.reject(error);
// //     }
// // );

// // Optional but recommended: Handle 401/403 errors globally to log out the user
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//             console.error("Unauthorized access - clearing token");
//             // localStorage.removeItem('jwt_token');
//             // localStorage.removeItem('user_role');
//             // localStorage.removeItem('user_name');
//             // // Force reload to kick them back to the login screen
//             // window.location.href = '/login'; 
//         }
//         return Promise.reject(error);
//     }
// );

// export default api;

import axios from 'axios';

const envBase = import.meta.env.VITE_API_BASE_URL;
const baseURL = envBase
    ? `${envBase.replace(/\/$/, '')}/api`
    : '/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.log(error)
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_id');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;