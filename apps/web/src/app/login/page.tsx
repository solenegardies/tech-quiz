import { LoginForm } from "@/auth/LoginForm";
import { AuthShell } from "@/components/layout/AuthShell";
import { getDictionary } from "@/lib/i18n";

export default function LoginPage() {
  const t = getDictionary();

  return (
    <AuthShell
      eyebrow={t.authPages.loginEyebrow}
      title={t.authPages.loginTitle}
      description={t.authPages.loginDescription}
    >
        <LoginForm />
    </AuthShell>
  );
}
