import { ForgotPasswordForm } from "@/auth/ForgotPasswordForm";
import { AuthShell } from "@/components/layout/AuthShell";
import { getDictionary } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const t = getDictionary();

  return (
    <AuthShell
      eyebrow={t.authPages.forgotPasswordEyebrow}
      title={t.authPages.forgotPasswordTitle}
      description={t.authPages.forgotPasswordDescription}
    >
        <ForgotPasswordForm />
    </AuthShell>
  );
}
