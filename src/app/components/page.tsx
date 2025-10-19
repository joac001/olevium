'use client';

import { useState } from 'react';
import { 
  Button, 
  ActionButton, 
  Banner, 
  Box, 
  Card, 
  Chip, 
  Container,
  Input,
  Link,
  Tooltip,
  Typography,
  FormWrapper,
  ModalWrapper
} from '@/components/shared/ui';
import { ColorKey } from '@/types/ColorKey';

const colorVariants: ColorKey[] = [
  'primary', 'secondary', 'success', 'accent', 'warning', 'error', 'danger', 'info', 'neutral'
];

export default function ComponentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <Container className="p-6 space-y-8">
      {/* Header */}
      <Box className="text-center mb-8">
        <Typography variant="h1">Catálogo de Componentes UI</Typography>
        <Box className="mt-2">
          <Typography variant="body">
            Demostración de todos los componentes disponibles en el sistema de diseño
          </Typography>
        </Box>
      </Box>

      {/* Buttons Section */}
      <Card title="Botones" subtitle="Botones principales y de acción">
        <Box className="space-y-6">
          {/* Regular Buttons */}
          <Box>
            <Box className="mb-3">
              <Typography variant="subtitle">Button</Typography>
            </Box>
            <Box className="flex flex-wrap gap-3">
              {colorVariants.map((variant) => (
                <Button 
                  key={variant} 
                  type={variant} 
                  text={`Button ${variant}`} 
                  onClick={() => console.log(`Clicked ${variant} button`)}
                />
              ))}
              <Button text="Default Button" />
              <Button text="Disabled Button" disabled />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box>
            <Box className="mb-3">
              <Typography variant="subtitle">ActionButton</Typography>
            </Box>
            <Box className="flex flex-wrap gap-3">
              {colorVariants.map((variant) => (
                <ActionButton 
                  key={variant}
                  icon="fas fa-star" 
                  type={variant}
                  text={`Action ${variant}`}
                  tooltip={`Tooltip para ${variant}`}
                  onClick={() => console.log(`Clicked ${variant} action`)}
                />
              ))}
              <ActionButton 
                icon="fas fa-heart" 
                text="Con tooltip" 
                tooltip="Este es un tooltip personalizado" 
              />
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Content Components */}
      <Card title="Contenido" subtitle="Componentes de contenido y estructura">
        <Box className="space-y-6">
          {/* Banner */}
          <Box>
            <Box className="mb-3">
              <Typography variant="subtitle">Banner</Typography>
            </Box>
            <Box className="space-y-3">
              <Banner 
                icon="fas fa-info"
                color="primary"
                title="Banner de información"
                description="Este es un ejemplo de banner informativo"
              />
              <Banner 
                icon="fas fa-check"
                color="success"
                title="Banner de éxito"
                description="Operación completada correctamente"
              />
              <Banner 
                icon="fas fa-exclamation-triangle"
                color="warning"
                title="Banner de advertencia"
                description="Ten cuidado con esta acción"
              />
              <Banner 
                icon="fas fa-times"
                color="error"
                title="Banner de error"
                description="Ha ocurrido un error inesperado"
              />
            </Box>
          </Box>

          {/* Chips */}
          <Box>
            <Box className="mb-3">
              <Typography variant="subtitle">Chip</Typography>
            </Box>
            <Box className="flex flex-wrap gap-2">
              {colorVariants.map((variant) => (
                <Chip 
                  key={variant}
                  color={variant}
                  text={`Chip ${variant}`}
                />
              ))}
              <Chip text="Default Chip" />
              <Chip icon="fas fa-star" color="accent" text="Con ícono" />
              <Chip color="success" />
            </Box>
          </Box>

          {/* Box Example */}
          <Box>
            <Box className="mb-3">
              <Typography variant="subtitle">Box</Typography>
            </Box>
            <Box className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Typography variant="body">
                Este es un ejemplo de Box - el componente base para contenedores flexibles.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Typography */}
      <Card title="Tipografía" subtitle="Variantes de texto y enlaces">
        <Box className="space-y-4">
          <Typography variant="h1">Título H1 - El más grande</Typography>
          <Typography variant="h2">Título H2 - Secundario</Typography>
          <Typography variant="subtitle">Subtítulo - Para secciones</Typography>
          <Typography variant="body">
            Texto de cuerpo - Para párrafos y contenido principal. Este es el texto que se usa normalmente para el contenido.
          </Typography>
          <Typography variant="caption">Texto de caption - Para metadatos y información secundaria</Typography>
          <Box className="flex gap-4">
            <Link url="/components" text="Link interno" newWindow={false} />
            <Link url="https://example.com" text="Link externo" newWindow={true} />
            <Link url="https://github.com" text="Link con ícono" icon="fab fa-github" />
          </Box>
        </Box>
      </Card>

      {/* Form Components */}
      <Card title="Formularios" subtitle="Inputs y componentes de formulario">
        <FormWrapper 
          title="Formulario de Ejemplo"
          onSubmit={(formData) => console.log('Form submitted:', formData)}
          buttons={[
            { text: 'Enviar', htmlType: 'submit', type: 'primary' },
            { text: 'Limpiar', htmlType: 'button', type: 'neutral', onClick: () => setInputValue('') }
          ]}
        >
          <Box className="space-y-4">
            <Box>
              <Box className="mb-3">
                <Typography variant="subtitle">Input</Typography>
              </Box>
              <Input
                name="textInput"
                placeholder="Escribe algo aquí..."
                value={inputValue}
                onValueChange={(value) => setInputValue(value as string)}
                label="Campo de texto"
              />
            </Box>

            <Box>
              <Input
                name="emailInput"
                type="email"
                placeholder="ejemplo@correo.com"
                label="Email"
                icon="fas fa-envelope"
              />
            </Box>

            <Box>
              <Input
                name="passwordInput"
                type="password"
                placeholder="Tu contraseña"
                label="Contraseña"
                required
              />
            </Box>

            <Box>
              <Input
                name="dateInput"
                type="date"
                label="Fecha"
                placeholder="dd/mm/aaaa"
              />
            </Box>
          </Box>
        </FormWrapper>
      </Card>

      {/* Interactive Components */}
      <Card title="Componentes Interactivos" subtitle="Modales y tooltips">
        <Box className="space-y-4">
          <Box className="flex gap-4">
            <Button 
              type="accent" 
              text="Abrir Modal" 
              onClick={() => setShowModal(true)} 
            />
            
            <Tooltip content="Este es un tooltip de ejemplo" placement="top">
              <Button text="Hover para tooltip" />
            </Tooltip>
          </Box>

          {/* Modal */}
          <ModalWrapper isOpen={showModal} onClose={() => setShowModal(false)}>
            <Card title="Modal de Ejemplo" size="fit">
              <Box className="p-4">
                <Box className="mb-4">
                  <Typography variant="body">
                    Este es un ejemplo de modal usando ModalWrapper.
                  </Typography>
                </Box>
                <Button 
                  type="error" 
                  text="Cerrar" 
                  onClick={() => setShowModal(false)} 
                />
              </Box>
            </Card>
          </ModalWrapper>
        </Box>
      </Card>

      {/* Nested Card Example */}
      <Card 
        title="Card Anidada" 
        subtitle="Ejemplo de card con acciones"
        actions={[
          {
            icon: 'fas fa-edit',
            type: 'primary',
            text: 'Editar',
            onClick: () => console.log('Edit clicked')
          },
          {
            icon: 'fas fa-trash',
            type: 'error',
            text: 'Eliminar',
            onClick: () => console.log('Delete clicked')
          }
        ]}
      >
        <Typography variant="body">
          Esta card tiene botones de acción en la esquina superior derecha.
        </Typography>
        
        <Card title="Card Interna" size="fit">
          <Typography variant="body">
            Ejemplo de cards anidadas para mostrar la flexibilidad del sistema.
          </Typography>
        </Card>
      </Card>
    </Container>
  );
}