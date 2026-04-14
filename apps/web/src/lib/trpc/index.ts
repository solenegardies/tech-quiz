"use client";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { QueryClient } from "@tanstack/react-query";
import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import type { AnyRouter } from "@trpc/server";

type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  profilePicture: string | null;
  createdAt: string;
};

type BackofficeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
};

type QueryProcedure<Input = void, Output = unknown> = {
  queryOptions: (...args: Input extends void ? [] : [input: Input]) => UseQueryOptions<
    Output,
    Error,
    Output,
    readonly unknown[]
  >;
};

type MutationProcedure<Input = void, Output = unknown> = {
  mutationOptions: (
    options?: UseMutationOptions<Output, Error, Input extends void ? void : Input, unknown>,
  ) => UseMutationOptions<Output, Error, Input extends void ? void : Input, unknown>;
};

type TrpcFacade = {
  auth: {
    me: QueryProcedure<void, AuthUser | null>;
    login: MutationProcedure<{ email: string; password: string }, unknown>;
    signup: MutationProcedure<
      { email: string; password: string; firstName: string; lastName?: string },
      unknown
    >;
    signout: MutationProcedure<void, unknown>;
    createPassword: MutationProcedure<{ password: string }, unknown>;
    requestPasswordReset: MutationProcedure<{ email: string }, unknown>;
    resetPassword: MutationProcedure<{ token: string; password: string }, unknown>;
    requestEmailVerification: MutationProcedure<void, unknown>;
    verifyEmail: MutationProcedure<{ token: string }, unknown>;
  };
  backoffice: {
    listUsers: QueryProcedure<
      { skip: number; take: number; search?: string },
      { users: BackofficeUser[]; total: number }
    >;
    toggleUserActive: MutationProcedure<{ userId: string; isActive: boolean }, { success: boolean }>;
    updateUserRole: MutationProcedure<{ userId: string; role: string }, { success: boolean }>;
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const trpcClient = createTRPCClient<AnyRouter>({
  links: [
    httpBatchLink({
      url: "/api",
      fetch(url, options) {
        return fetch(url, { ...options, credentials: "include" });
      },
    }),
  ],
});

const trpcProxy = createTRPCOptionsProxy<AnyRouter>({
  client: trpcClient,
  queryClient,
});

export const trpc = trpcProxy as unknown as TrpcFacade;
