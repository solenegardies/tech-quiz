"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { trpc, queryClient } from "@/lib/trpc";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/lib/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  const signout = useMutation(
    trpc.auth.signout.mutationOptions({
      onSuccess: () => {
        queryClient.clear();
        router.push("/login");
      },
    }),
  );

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-gray-900">
            SaaS
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            {t.nav.dashboard}
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/backoffice" className="text-sm text-gray-600 hover:text-gray-900">
              {t.nav.backoffice}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="text-xs text-gray-500 hover:text-gray-900 uppercase"
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>
          <span className="text-sm text-gray-600">{user?.firstName}</span>
          <Button variant="ghost" onClick={() => signout.mutate()} isLoading={signout.isPending}>
            {t.auth.signout}
          </Button>
        </div>
      </div>
    </header>
  );
}
