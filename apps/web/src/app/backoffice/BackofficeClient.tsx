"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/lib/i18n";
import { useUsers } from "@/hooks/useUsers";
import { Header } from "@/components/layout/Header";
import { UserTable } from "@/components/backoffice/UserTable";
import { Input } from "@/components/ui/Input";

export default function BackofficeClient() {
  const { t } = useTranslation();
  const { isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading } = useUsers({
    skip: page * pageSize,
    take: pageSize,
    search: search || undefined,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t.backoffice.userManagement}</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6 max-w-xs">
            <Input
              placeholder={t.common.search}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>

          {isLoading ? (
            <p className="text-gray-500">{t.common.loading}</p>
          ) : data ? (
            <>
              <UserTable users={data.users} total={data.total} />
              {data.total > pageSize && (
                <div className="flex gap-2 mt-4 justify-center">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    &larr;
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    {page + 1} / {Math.ceil(data.total / pageSize)}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={(page + 1) * pageSize >= data.total}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
