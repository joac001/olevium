'use client';
import {
    InputLabel,
    OutlinedInput,
    IconButton,
    InputAdornment
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

interface LoginTabProps {
    email: string;
    password: string;
    showPassword: boolean;
    onChangeEmail: (val: string) => void;
    onChangePassword: (val: string) => void;
    onTogglePassword: () => void;
}

export default function LoginTab({
    email,
    password,
    showPassword,
    onChangeEmail,
    onChangePassword,
    onTogglePassword
}: LoginTabProps) {
    return (
        <>
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
        </>
    );
}
