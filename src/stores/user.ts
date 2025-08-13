import axios from "@/services/axios";
// import cache from "@/services/cache";
import { create } from 'zustand'

const useAuthStore = create((set) => ({
    user: null,
    mountUser: async () => {
        try {
            const response = await axios.get('/users/me');
            set({ user: response.data });
        } catch (error) {
            set({ user: null });
        }
    },
}));

export default useAuthStore;