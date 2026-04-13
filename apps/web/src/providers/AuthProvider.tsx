"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

type User = {
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

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery(trpc.auth.me.queryOptions());

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
