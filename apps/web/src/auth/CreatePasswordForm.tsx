"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CreatePasswordForm() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const createPassword = useMutation(
    trpc.auth.createPassword.mutationOptions({
      onSuccess: () => setSuccess(true),
      onError: (err: Error) => setError(err.message),
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createPassword.mutate({ password });
  };

  if (success) {
    return (
    <div className="space-y-4">
        <h2 className="font-display text-3xl font-semibold text-[color:var(--text-strong)]">{t.auth.createPasswordTitle}</h2>
        <p className="text-[color:var(--success)]">{t.auth.passwordCreated}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-semibold text-[color:var(--text-strong)]">
          {t.auth.createPasswordTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          {t.authPages.createPasswordSubtitle}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)]">
          {error}
        </div>
      )}

      <Input
        label={t.auth.newPassword}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />

      <Button type="submit" isLoading={createPassword.isPending} className="w-full py-3">
        {t.common.save}
      </Button>
    </form>
  );
}
