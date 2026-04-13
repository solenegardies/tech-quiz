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
      onError: (err) => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">{t.auth.loginTitle}</h1>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
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
        <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
          {t.auth.forgotPassword}
        </Link>
      </div>

      <Button type="submit" isLoading={login.isPending} className="w-full">
        {t.auth.loginButton}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {t.auth.noAccount}{" "}
        <Link href="/signup" className="font-medium text-gray-900 hover:underline">
          {t.auth.signupLink}
        </Link>
      </p>
    </form>
  );
}
