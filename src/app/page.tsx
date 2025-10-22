import { Container, Box, Typography } from "@/components/shared/ui";
import WelcomePanel from "./_homeComponents/WelcomePanel";

export default function HomePage() {
  return (
    <Container className="py-10">
      <Box className="mx-auto flex w-full max-w-xl flex-col items-center gap-8">
        <Box className="space-y-2 text-center">
          <Typography variant="h1">Bienvenido a Olevium</Typography>
          <Typography variant="body" className="text-[color:var(--text-muted)]">
            Gestiona tus finanzas personales con insights personalizados y herramientas inteligentes.
          </Typography>
        </Box>

        <WelcomePanel />
      </Box>
    </Container>
  );
}
