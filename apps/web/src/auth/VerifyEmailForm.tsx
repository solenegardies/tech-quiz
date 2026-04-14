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
      onError: (err: Error) => {
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
      setError(t.authPages.missingToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-3xl font-semibold text-[color:var(--text-strong)]">
        {t.auth.verifyEmailTitle}
      </h2>

      {status === "verifying" && <p className="text-[color:var(--text-soft)]">{t.auth.verifyingEmail}</p>}
      {status === "success" && (
        <>
          <p className="text-[color:var(--success)]">{t.auth.emailVerified}</p>
          <Link href="/dashboard" className="text-sm font-medium text-[color:var(--text-strong)] hover:underline">
            {t.dashboard.title}
          </Link>
        </>
      )}
      {status === "error" && <p className="text-[color:var(--danger)]">{error}</p>}
    </div>
  );
}
