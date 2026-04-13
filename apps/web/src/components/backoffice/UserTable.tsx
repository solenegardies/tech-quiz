"use client";

import { useMutation } from "@tanstack/react-query";
import { trpc, queryClient } from "@/lib/trpc";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
};

interface UserTableProps {
  users: User[];
  total: number;
}

export function UserTable({ users, total }: UserTableProps) {
  const { t } = useTranslation();

  const toggleActive = useMutation(
    trpc.backoffice.toggleUserActive.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["backoffice", "listUsers"] });
      },
    }),
  );

  const updateRole = useMutation(
    trpc.backoffice.updateUserRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["backoffice", "listUsers"] });
      },
    }),
  );

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {t.backoffice.totalUsers}: {total}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 font-medium text-gray-500">{t.backoffice.email}</th>
              <th className="pb-3 font-medium text-gray-500">{t.backoffice.name}</th>
              <th className="pb-3 font-medium text-gray-500">{t.backoffice.role}</th>
              <th className="pb-3 font-medium text-gray-500">{t.backoffice.status}</th>
              <th className="pb-3 font-medium text-gray-500">{t.backoffice.actions}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100">
                <td className="py-3">{user.email}</td>
                <td className="py-3">
                  {user.firstName} {user.lastName ?? ""}
                </td>
                <td className="py-3">
                  <Badge variant={user.role === "ADMIN" ? "warning" : "default"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="py-3">
                  <Badge variant={user.isActive ? "success" : "danger"}>
                    {user.isActive ? t.backoffice.active : t.backoffice.inactive}
                  </Badge>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        toggleActive.mutate({
                          userId: user.id,
                          isActive: !user.isActive,
                        })
                      }
                    >
                      {t.backoffice.toggleActive}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        updateRole.mutate({
                          userId: user.id,
                          role: user.role === "ADMIN" ? "USER" : "ADMIN",
                        })
                      }
                    >
                      {t.backoffice.changeRole}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
