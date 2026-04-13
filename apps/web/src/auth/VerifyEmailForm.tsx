"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "@/lib/i18n";

export function VerifyEmailForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  const verifyEmail = useMutation(
    trpc.auth.verifyEmail.mutationOptions({
      onSuccess: () => setStatus("success"),
      onError: (err) => {
        setError(err.message);
        setStatus("error");
      },
    }),
  );

  useEffect(() => {
    if (token) {
      verifyEmail.mutate({ token });
    } else {
      setStatus("error");
      setError("Missing verification token");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-bold">{t.auth.verifyEmailTitle}</h1>

      {status === "verifying" && <p className="text-gray-600">{t.auth.verifyingEmail}</p>}
      {status === "success" && (
        <>
          <p className="text-green-600">{t.auth.emailVerified}</p>
          <Link href="/dashboard" className="text-sm font-medium text-gray-900 hover:underline">
            {t.dashboard.title}
          </Link>
        </>
      )}
      {status === "error" && (
        <p className="text-red-600">{error}</p>
      )}
    </div>
  );
}
