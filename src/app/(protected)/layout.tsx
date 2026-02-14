"use client";

import { TopBar } from "@/components/layout/topbar";
import { ToastProvider } from "@/components/ui/toast";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </ToastProvider>
  );
}
