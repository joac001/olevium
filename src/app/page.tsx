import Link from 'next/link';
import { Container, Box, Typography, Card, Button } from "@/components/shared/ui";

export default function Page() {
  return (
    <Container className="p-6">
      <Box className="text-center mb-8">
        <Typography variant="h1">Olevium Project</Typography>
        <Box className="mt-4">
          <Typography variant="body">
            Bienvenido al sistema de componentes Olevium
          </Typography>
        </Box>
      </Box>

      <Box className="flex justify-center">
        <Card title="Navegación" subtitle="Explora los componentes disponibles" size="fit">
          <Box className="p-4">
            <Link href="/components">
              <Button 
                type="primary" 
                text="Ver Catálogo de Componentes" 
              />
            </Link>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}