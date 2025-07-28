'use client';
import {
    InputLabel,
    OutlinedInput
} from '@mui/material';

interface RegisterTabProps {
    name: string;
    lastName: string;
    repeatPassword: string;
    showPassword: boolean;
    onChangeName: (val: string) => void;
    onChangeLastName: (val: string) => void;
    onChangeRepeatPassword: (val: string) => void;
}

export default function RegisterTab({
    name,
    lastName,
    repeatPassword,
    showPassword,
    onChangeName,
    onChangeLastName,
    onChangeRepeatPassword
}: RegisterTabProps) {
    return (
        <>
            <InputLabel sx={{ color: 'prim.contrastText', alignSelf: 'start' }}>Nombre</InputLabel>
            <OutlinedInput
                type="text"
                placeholder="Joaquín"
                fullWidth
                sx={{ mb: 2 }}
                value={name}
                onChange={(e) => onChangeName(e.target.value)}
            />

            <InputLabel sx={{ color: 'prim.contrastText', alignSelf: 'start' }}>Apellido</InputLabel>
            <OutlinedInput
                type="text"
                placeholder="Ordoñez"
                fullWidth
                sx={{ mb: 2 }}
                value={lastName}
                onChange={(e) => onChangeLastName(e.target.value)}
            />

            <InputLabel sx={{ color: 'prim.contrastText', alignSelf: 'start' }}>Repetí tu contraseña</InputLabel>
            <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                placeholder="contraseñaSegura1234"
                fullWidth
                sx={{ mb: 2 }}
                value={repeatPassword}
                onChange={(e) => onChangeRepeatPassword(e.target.value)}
            />
        </>
    );
}
