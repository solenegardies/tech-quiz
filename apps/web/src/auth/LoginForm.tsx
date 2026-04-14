"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc, queryClient } from "@/lib/trpc";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        router.push("/dashboard");
      },
      onError: (err: Error) => {
        setError(err.message);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-semibold text-[color:var(--text-strong)]">
          {t.auth.loginTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          {t.authPages.loginSubtitle}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)]">
          {error}
        </div>
      )}

      <Input
        label={t.auth.email}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Input
        label={t.auth.password}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[color:var(--text-soft)] hover:text-[color:var(--text-strong)]"
        >
          {t.auth.forgotPassword}
        </Link>
      </div>

      <Button type="submit" isLoading={login.isPending} className="w-full py-3">
        {t.auth.loginButton}
      </Button>

      <p className="text-center text-sm text-[color:var(--text-soft)]">
        {t.auth.noAccount}{" "}
        <Link href="/signup" className="font-medium text-[color:var(--text-strong)] hover:underline">
          {t.auth.signupLink}
        </Link>
      </p>
    </form>
  );
}
