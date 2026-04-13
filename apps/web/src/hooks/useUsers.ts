"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export function useUsers(params: { skip?: number; take?: number; search?: string } = {}) {
  return useQuery(
    trpc.backoffice.listUsers.queryOptions({
      skip: params.skip ?? 0,
      take: params.take ?? 20,
      search: params.search,
    }),
  );
}
