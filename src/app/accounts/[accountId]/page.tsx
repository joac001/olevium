import { notFound } from "next/navigation";
import Link from "next/link";

import { Container, Box } from "@/components/shared/ui";
import AccountDetailShell from "../_accountsComponents/AccountDetailShell";

interface AccountDetailPageProps {
  params: Promise<{
    accountId: string;
  }>;
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { accountId: rawAccountId } = await params;

  if (typeof rawAccountId !== "string" || rawAccountId.trim().length === 0) {
    notFound();
  }

  const accountId = rawAccountId.trim();

  return (
    <Container className="py-10">
      <Box className="space-y-2">
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--text-primary)]"
        >
          <i className="fas fa-arrow-left" aria-hidden />
          Volver
        </Link>
        <AccountDetailShell accountId={accountId} />
      </Box>
    </Container>
  );
}
