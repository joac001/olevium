import axiosBase from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import cache from '@/services/cache';

const axios = axiosBase.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = cache.get('token');
    if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

export default axios;
