"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const requestReset = useMutation(
    trpc.auth.requestPasswordReset.mutationOptions({
      onSuccess: () => setSent(true),
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestReset.mutate({ email });
  };

  if (sent) {
    return (
    <div className="space-y-4">
        <h2 className="font-display text-3xl font-semibold text-[color:var(--text-strong)]">{t.auth.forgotPasswordTitle}</h2>
        <p className="text-[color:var(--text-soft)]">{t.auth.resetEmailSent}</p>
        <Link href="/login" className="text-sm font-medium text-[color:var(--text-strong)] hover:underline">
          {t.auth.loginLink}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-semibold text-[color:var(--text-strong)]">
          {t.auth.forgotPasswordTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          {t.authPages.forgotPasswordSubtitle}
        </p>
      </div>

      <Input
        label={t.auth.email}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Button type="submit" isLoading={requestReset.isPending} className="w-full py-3">
        {t.auth.sendResetLink}
      </Button>

      <p className="text-center text-sm text-[color:var(--text-soft)]">
        <Link href="/login" className="font-medium text-[color:var(--text-strong)] hover:underline">
          {t.auth.loginLink}
        </Link>
      </p>
    </form>
  );
}
