import { LoginPkg, RegisterPkg } from "@/types/form";

export interface AuthStoreType {
    loggedIn: boolean;
    registeredUserName: string;
    registeredUserEmail: string;
    login: (data: LoginPkg) => void;
    register: (data: RegisterPkg) => void;
}