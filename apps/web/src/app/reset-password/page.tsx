import { Suspense } from "react";
import { ResetPasswordForm } from "@/auth/ResetPasswordForm";
import { AuthShell } from "@/components/layout/AuthShell";
import { getDictionary } from "@/lib/i18n";

export default function ResetPasswordPage() {
  const t = getDictionary();

  return (
    <AuthShell
      eyebrow={t.authPages.resetPasswordEyebrow}
      title={t.authPages.resetPasswordTitle}
      description={t.authPages.resetPasswordDescription}
    >
        <Suspense fallback={<div>{t.common.loading}</div>}>
          <ResetPasswordForm />
        </Suspense>
    </AuthShell>
  );
}
