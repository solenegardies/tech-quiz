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
        <h1 className="text-2xl font-bold">{t.auth.forgotPasswordTitle}</h1>
        <p className="text-gray-600">{t.auth.resetEmailSent}</p>
        <Link href="/login" className="text-sm font-medium text-gray-900 hover:underline">
          {t.auth.loginLink}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">{t.auth.forgotPasswordTitle}</h1>

      <Input
        label={t.auth.email}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Button type="submit" isLoading={requestReset.isPending} className="w-full">
        {t.auth.sendResetLink}
      </Button>

      <p className="text-sm text-center text-gray-600">
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          {t.auth.loginLink}
        </Link>
      </p>
    </form>
  );
}
