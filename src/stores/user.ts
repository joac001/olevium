import axios from "@/services/axios";
// import cache from "@/services/cache";
import { create } from 'zustand'

const useUserStore = create((set) => ({
    user: null,
    mountUser: async () => {
        try {
            const response = await axios.get('/users/me');
            set({ user: response.data });
        } catch {
            set({ user: null });
        }
    },
}));

export default useUserStore;