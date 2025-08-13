import axios from "@/services/axios";
import cache from "@/services/cache";
import { create } from 'zustand'

const useAuthStore = create((set) => ({
    registeredUserName: null,
    registeredUserEmail: null,
    login: async (args = {}) => {
        try {
            const response = await axios.post('/auth/login', args);
            cache.set("token", response.data.access_token);
            cache.set("refresh_token", response.data.refresh_token);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    register: async (args = {}) => {
        try {
            const response = await axios.post('/auth/signup', args);
            set({
                registeredUserName: response.data.name,
                registeredUserEmail: response.data.email
            });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
}));

export default useAuthStore;