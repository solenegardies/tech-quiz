"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/lib/i18n";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { trpc } from "@/lib/trpc";

export default function DashboardClient() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  const requestVerification = useMutation(
    trpc.auth.requestEmailVerification.mutationOptions(),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t.dashboard.title}</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t.dashboard.welcome}, {user?.firstName}!
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              <span>{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Role:</span>{" "}
              <span className="capitalize">{user?.role?.toLowerCase()}</span>
            </div>
          </div>

          {user && !user.isEmailVerified && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
              <p className="text-sm text-yellow-800">{t.dashboard.emailNotVerified}</p>
              <Button
                variant="secondary"
                onClick={() => requestVerification.mutate()}
                isLoading={requestVerification.isPending}
              >
                {t.dashboard.verifyEmailButton}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
