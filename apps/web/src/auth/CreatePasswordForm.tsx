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
      onError: (err) => setError(err.message),
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
        <h1 className="text-2xl font-bold">{t.auth.createPasswordTitle}</h1>
        <p className="text-green-600">{t.auth.passwordCreated}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">{t.auth.createPasswordTitle}</h1>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
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

      <Button type="submit" isLoading={createPassword.isPending} className="w-full">
        {t.common.save}
      </Button>
    </form>
  );
}
