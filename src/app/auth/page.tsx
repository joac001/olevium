'use client';
import Glass from "@/components/global/Glass";
import {
    Box,
    Button,
    Container,
    FormGroup,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { LoginPkg, RegisterPkg } from "@/types/form";
import { isValidEmail, isSecurePassword } from "@/utils/validation";
import RegisterTab from "@/components/RegisterTab";
import LoginTab from "@/components/LoginTab";
import useAuthStore from "@/stores/auth";
import cache from "@/services/cache";
import { AuthStoreType } from "@/types/store";

export default function AuthPage() {

    const router = useRouter();

    useEffect(() => {
        if (cache.get('token')) {
            router.push('/');
        }
    }, [router]);

    const [activeTab, setActiveTab] = useState<number>(0);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const { login, register } = useAuthStore() as AuthStoreType;

    const [form, setForm] = useState({
        name: '',
        lastName: '',
        email: '',
        password: '',
        repeatPassword: ''
    });


    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleChange = (field: keyof typeof form) => (value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const { name, lastName, email, password, repeatPassword } = form;

        if (!email || !password) {
            alert("Completá todos los campos.");
            return;
        }

        if (!isValidEmail(email)) {
            alert("El email no es válido.");
            return;
        }

        if (activeTab === 0) {
            // LOGIN
            handleLogin({ email, password });
        } else {
            // REGISTER
            if (!name || !lastName || !repeatPassword) {
                alert("Completá todos los campos.");
                return;
            }

            if (!isSecurePassword(password)) {
                alert("La contraseña debe tener al menos 8 caracteres, incluir números, letras y una mayúscula.");
                return;
            }

            if (password !== repeatPassword) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            handleRegister({ name, email, password });
        }
    };

    const handleLogin = async (data: LoginPkg) => {
        try {
            await login(data);
            setForm({
                name: '',
                lastName: '',
                email: '',
                password: '',
                repeatPassword: ''
            });

            router.push('/');
        } catch (error) {
            alert(error);
        }
    };

    const handleRegister = async (data: RegisterPkg) => {
        try {
            await register(data);
            setForm({
                name: '',
                lastName: '',
                email: '',
                password: '',
                repeatPassword: ''
            });

            router.push('/auth/cta-verify');
        } catch (error) {
            alert(error);
        }
    };

    const Tab = (title: string, index: number) => {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: 1,
                    margin: 0,
                    borderRadius: 2,
                    backgroundColor: activeTab === index ? 'glass.paper' : 'transparent',
                    cursor: 'pointer',
                }}
                role="button"
                tabIndex={index}
                onClick={() => setActiveTab(index)}
            >
                <Typography variant="link" sx={{ color: 'prim.contrastText', fontWeight: 600, letterSpacing: 0.5 }}>
                    {title}
                </Typography>
            </Box>
        );
    }

    return (
        <Container
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 8,
                width: '100%',
                height: '80vh',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textWrap: 'nowrap',
                    gap: 2,
                    marginBottom: 2,
                    top: 0,
                    userSelect: 'none',
                }}
            >
                {Tab('Iniciar sesión', 0)}
                {Tab('Registrarse', 1)}

            </Box>

            <Glass
                sx={{
                    backgroundColor: 'glass.main',
                    paddingX: 4,
                    paddingY: 2,
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: 400
                }}
            >
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <FormGroup sx={{ width: '100%' }}>
                        {activeTab === 1 ?
                            <RegisterTab
                                name={form.name}
                                lastName={form.lastName}
                                email={form.email}
                                password={form.password}
                                repeatPassword={form.repeatPassword}
                                showPassword={showPassword}
                                onChangeName={handleChange('name')}
                                onChangeLastName={handleChange('lastName')}
                                onChangeEmail={handleChange('email')}
                                onChangePassword={handleChange('password')}
                                onChangeRepeatPassword={handleChange('repeatPassword')}
                                onTogglePassword={handleClickShowPassword}
                            />

                            :

                            <LoginTab
                                email={form.email}
                                password={form.password}
                                showPassword={showPassword}
                                onChangeEmail={handleChange('email')}
                                onChangePassword={handleChange('password')}
                                onTogglePassword={handleClickShowPassword}
                            />
                        }
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 2, mb: 2, bgcolor: 'prim.main', color: 'prim.contrastText' }}
                        >
                            {activeTab === 0 ? 'Iniciar sesión' : 'Registrarme'}
                        </Button>
                    </FormGroup>
                </form>
            </Glass>
        </Container>
    );
}
