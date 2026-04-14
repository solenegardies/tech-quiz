import { Suspense } from "react";
import { VerifyEmailForm } from "@/auth/VerifyEmailForm";
import { AuthShell } from "@/components/layout/AuthShell";
import { getDictionary } from "@/lib/i18n";

export default function VerifyEmailPage() {
  const t = getDictionary();

  return (
    <AuthShell
      eyebrow={t.authPages.verifyEmailEyebrow}
      title={t.authPages.verifyEmailTitle}
      description={t.authPages.verifyEmailDescription}
    >
        <Suspense fallback={<div>{t.common.loading}</div>}>
          <VerifyEmailForm />
        </Suspense>
    </AuthShell>
  );
}
