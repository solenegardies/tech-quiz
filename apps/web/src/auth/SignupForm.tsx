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
      onError: (err) => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">{t.auth.signupTitle}</h1>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
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

      <Button type="submit" isLoading={signup.isPending} className="w-full">
        {t.auth.signupButton}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {t.auth.hasAccount}{" "}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          {t.auth.loginLink}
        </Link>
      </p>
    </form>
  );
}
