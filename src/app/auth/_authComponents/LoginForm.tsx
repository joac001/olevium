'use client';
import {useState} from 'react';
import {UserType} from '@/types/'
import { ButtonProps, FormWrapper } from '@/components/shared/ui';
export default function LoginForm() {
    const [user, setUser] = useState<UserType | null>(null);

    const handleLogin = async (userValues: UserType | null) => {}
    const handleChangeToRegister = () => {}
    
    const FormButtons: ButtonProps[] = [
        {
            type: 'primary',
            text: 'Iniciar sesión',
            htmlType: 'submit',
        },
        {
            type: 'primary',
            text: 'Iniciar sesión',
            onClick: () => handleChangeToRegister(),
        }
    ]

    return (
        <FormWrapper 
            onSubmit={() => handleLogin(user)}
            buttons={FormButtons}
        >
            <div>Login form content</div>
        </FormWrapper>
    )
}