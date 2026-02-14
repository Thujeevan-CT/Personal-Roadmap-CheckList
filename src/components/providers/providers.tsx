"use client";

import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "./query-provider";

const SessionProviderAny = SessionProvider as React.ComponentType<{ children: React.ReactNode }>;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderAny>
      <QueryProvider>{children}</QueryProvider>
    </SessionProviderAny>
  );
}
