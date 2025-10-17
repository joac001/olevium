import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para debuggear requests
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('🚀 Axios Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            headers: config.headers,
            data: config.data,
        });
        return config;
    },
    (error) => {
        console.error('❌ Axios Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para debuggear responses
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Axios Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
        });
        return response;
    },
    (error) => {
        console.error('❌ Axios Response Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
        });
        return Promise.reject(error);
    }
);

export default axiosInstance;