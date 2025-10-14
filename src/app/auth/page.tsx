import {Container, Box, Card } from "@/components/shared/ui/";
import LoginForm from "./_authComponents/LoginForm";

export default function AuthPage() {
    return (
    <>
    <Container className="items-center justify-center">
        <Box>
        <Card title="¡Hola!">
            <LoginForm />
        </Card>
        </Box>
    </Container>
    </>
    );
}