'use client';

import { useCallback, useMemo, useState } from "react";

import { Box, FormWrapper, Input, DropMenu } from "@/components/shared/ui";
import type { DropMenuOption } from "@/components/shared/ui";
import type { AccountDetail, AccountType } from "@/types";
import { useAccountsStore } from "@/lib/stores/accounts";
import { useNotification } from "@/context/NotificationContext";
import { buildAccountTypeOptions, normalizeAccountFormData } from "./accountFormUtils";

interface EditAccountFormProps {
  account: AccountDetail;
  accountTypes: AccountType[];
  loadingTypes: boolean;
  onSuccess?: () => void;
}

export default function EditAccountForm({ account, accountTypes, loadingTypes, onSuccess }: EditAccountFormProps) {
  const { showNotification } = useNotification();
  const updateAccount = useAccountsStore((state) => state.updateAccount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeOptions: DropMenuOption[] = useMemo(() => buildAccountTypeOptions(accountTypes), [accountTypes]);

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? "Guardando..." : "Guardar cambios",
        htmlType: "submit" as const,
        type: "primary" as const,
        disabled: isSubmitting,
      },
    ],
    [isSubmitting],
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const normalized = normalizeAccountFormData({ formData, showNotification });

      if (!normalized) {
        return;
      }

      setIsSubmitting(true);
      try {
        await updateAccount(account.accountId, {
          name: normalized.name,
          typeId: normalized.typeId,
          currency: normalized.currency,
          balance: normalized.balance,
        });

        showNotification(
          "fa-solid fa-circle-check",
          "success",
          "Cuenta actualizada",
          "Guardamos los cambios en tu cuenta.",
        );
        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo actualizar la cuenta.";
        showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al actualizar", message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [account.accountId, showNotification, updateAccount, onSuccess],
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="name"
          label="Nombre de la cuenta"
          defaultValue={account.name}
          required
          icon="fas fa-wallet"
        />

        <DropMenu
          name="typeId"
          label="Tipo de cuenta"
          placeholder={loadingTypes ? "Cargando tipos..." : "Selecciona un tipo"}
          options={typeOptions}
          required
          disabled={loadingTypes || !typeOptions.length}
          defaultValue={account.typeId}
        />

        <Input
          name="currency"
          label="Moneda"
          defaultValue={account.currency ?? ""}
          required
          icon="fas fa-coins"
        />

        <Input
          name="balance"
          label="Balance"
          type="number"
          defaultValue={account.balance}
          required
          icon="fas fa-money-bill-trend-up"
        />
      </Box>
    </FormWrapper>
  );
}
