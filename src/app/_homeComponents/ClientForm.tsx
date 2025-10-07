'use client';
import { DropMenuOption } from "@/components/shared/ui/inputs/DropMenu";
import FormWrapper from "@/components/shared/ui/wrappers/FormWrapper";
import Input from "@/components/shared/ui/inputs/Input";
import DropMenu from "@/components/shared/ui/inputs/DropMenu";
import Box from "@/components/shared/ui/content/Box";

export default function ClientForm({ dropdownOptions }: { dropdownOptions: DropMenuOption[] }) {
    const handleSubmit = (formData: FormData) => {
        void formData;
        // Handle form submission logic here
        // You can access form data like: formData.get('fieldname')
    };

    const buttons = [
        {
            text: "Guardar Cliente",
            type: "primary" as const,
            htmlType: "submit" as const
        }
    ];

    return (
        <FormWrapper onSubmit={handleSubmit} buttons={buttons}>
            <Box className="flex flex-col md:flex-row gap-4">
                <Input
                    label="Nombre"
                    name="nombre"
                    type="text"
                    placeholder="Campo deshabilitado"
                    disabled
                />
                <Input
                    label="Nacimiento"
                    name="nacimiento"
                    type="date"
                    placeholder="Ingrese la fecha de nacimiento"
                    required
                />
            </Box>

            <Box className="flex flex-col md:flex-row gap-4">
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Ingrese el email"
                    required
                />

                <Input
                    label="Teléfono"
                    name="telefono"
                    type="phone"
                    placeholder="Ingrese el teléfono"
                    required
                />
            </Box>
            <DropMenu
                label="Categoría"
                name="categoria"
                options={dropdownOptions}
                placeholder="Seleccione una opción"
                required
            />

        </FormWrapper>
    );
}
