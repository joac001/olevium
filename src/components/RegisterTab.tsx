'use client';
import {
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

interface RegisterTabProps {
    name: string;
    lastName: string;
    email: string;
    password: string;
    repeatPassword: string;
    showPassword: boolean;
    onChangeName: (val: string) => void;
    onChangeLastName: (val: string) => void;
    onChangeEmail: (val: string) => void;
    onChangePassword: (val: string) => void;
    onChangeRepeatPassword: (val: string) => void;
    onTogglePassword: () => void
}

export default function RegisterTab({
    name,
    lastName,
    email,
    password,
    repeatPassword,
    showPassword,
    onChangeName,
    onChangeLastName,
    onChangeEmail,
    onChangePassword,
    onChangeRepeatPassword,
    onTogglePassword,
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
            <InputLabel sx={{ color: 'prim.contrastText', alignSelf: 'start' }}>Email</InputLabel>
            <OutlinedInput
                type="email"
                placeholder="ejemplo@mail.com"
                fullWidth
                sx={{ mb: 2 }}
                value={email}
                onChange={(e) => onChangeEmail(e.target.value)}
            />

            <InputLabel sx={{ color: 'prim.contrastText', alignSelf: 'start' }}>Contraseña</InputLabel>
            <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                placeholder="unaContraseñaSegura"
                fullWidth
                sx={{ mb: 2 }}
                value={password}
                onChange={(e) => onChangePassword(e.target.value)}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton onClick={onTogglePassword} edge="end">
                            {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                    </InputAdornment>
                }
            />
            <InputLabel sx={{ color: 'prim.contrastText', alignSelf: 'start' }}>Repetí tu contraseña</InputLabel>
            <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                fullWidth
                sx={{ mb: 2 }}
                value={repeatPassword}
                onChange={(e) => onChangeRepeatPassword(e.target.value)}
            />
        </>
    );
}
