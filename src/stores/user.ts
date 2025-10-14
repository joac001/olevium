import { create } from 'zustand'
import { UserType } from '../types/';

const useStore = create<UserType>()((set) => ({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
}))

const login = (email: string, password: string) => {
    // Perform login logic here, e.g., make an API call
    // On successful login, update the store:
    // useStore.setState({ email, password, id: 'user-id', firstName: 'John', lastName: 'Doe' })
}

const register = (userData: Omit<UserType, 'id'>) => {
    // Perform registration logic here, e.g., make an API call
    // On successful registration, update the store:
    // useStore.setState({ ...userData, id: 'new-user-id' })
}
export { useStore, login, register }