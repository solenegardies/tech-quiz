"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc, queryClient } from "@/lib/trpc";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SignupForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  const signup = useMutation(
    trpc.auth.signup.mutationOptions({
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
    signup.mutate({ email, password, firstName, lastName: lastName || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-semibold text-[color:var(--text-strong)]">
          {t.auth.signupTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          {t.authPages.signupSubtitle}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t.auth.firstName}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          autoComplete="given-name"
        />
        <Input
          label={t.auth.lastName}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
        />
      </div>

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
        minLength={8}
        autoComplete="new-password"
      />

      <Button type="submit" isLoading={signup.isPending} className="w-full py-3">
        {t.auth.signupButton}
      </Button>

      <p className="text-center text-sm text-[color:var(--text-soft)]">
        {t.auth.hasAccount}{" "}
        <Link href="/login" className="font-medium text-[color:var(--text-strong)] hover:underline">
          {t.auth.loginLink}
        </Link>
      </p>
    </form>
  );
}
