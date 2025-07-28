export enum MenuPath {
    Dashboard = '/',
    Transactions = '/transactions',
    Preferences = '/me',
}

export interface MenuOption {
    label: string;
    href: MenuPath;
}

export const menuOptions: MenuOption[] = [
    { label: 'Dashboard', href: MenuPath.Dashboard },
    { label: 'Mis transacciones', href: MenuPath.Transactions },
    { label: 'Preferencias', href: MenuPath.Preferences },
];

export default menuOptions;