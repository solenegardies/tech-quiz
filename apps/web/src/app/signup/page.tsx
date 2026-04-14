import { SignupForm } from "@/auth/SignupForm";
import { AuthShell } from "@/components/layout/AuthShell";
import { getDictionary } from "@/lib/i18n";

export default function SignupPage() {
  const t = getDictionary();

  return (
    <AuthShell
      eyebrow={t.authPages.signupEyebrow}
      title={t.authPages.signupTitle}
      description={t.authPages.signupDescription}
    >
        <SignupForm />
    </AuthShell>
  );
}
