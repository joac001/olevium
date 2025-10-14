import { create } from 'zustand'
import { UserType } from '@/types/';
import axiosInstance from '@/utils/axios';
import { LocalStorageCache } from '@/utils/cache';

const useUserStore = create<UserType>()((set) => ({
    email: '',
    password: '',
    accessToken: '',
    refreshToken: '',
}))

/**
 * Authenticates a user with email and password
 * @param email The user's email address
 * @param password The user's password
 */
const login = (email: string, password: string) => {
   
    axiosInstance.post('/auth/login', { email, password })
        .then(response => {
            useUserStore.setState({ email, password, accessToken: response.data.access_token, refreshToken: response.data.refresh_token });
            LocalStorageCache.set('accessToken', response.data.access_token);
            LocalStorageCache.set('refreshToken', response.data.refresh_token);
        })
        .catch(error => {
            console.error('Login failed:', error);
        });
}

const register = (userData: Omit<UserType, 'id'>) => {
    // Perform registration logic here, e.g., make an API call
    // On successful registration, update the store:
    // useUserStore.setState({ ...userData, id: 'new-user-id' })
}

export { useUserStore, login, register }