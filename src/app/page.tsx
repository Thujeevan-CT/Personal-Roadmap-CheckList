"use client";

import { signIn } from "next-auth/react";
import { Map, ListTodo, GitBranch, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Map,
    title: "Visual roadmaps",
    description: "Build interactive flowcharts for goals like relocation, certifications, or launches.",
  },
  {
    icon: ListTodo,
    title: "Track progress",
    description: "Checklists at every level with aggregated completion at a glance.",
  },
  {
    icon: GitBranch,
    title: "Hierarchical execution",
    description: "Roadmap → Module → Submodule. Structure that scales with your plan.",
  },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:py-16 lg:pl-[10%] lg:pr-12 xl:pl-[15%]">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <Map className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">
              MyFlow
            </span>
          </div>
          <p className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
            Structured goal execution, simplified.
          </p>
          <p className="body-text text-[var(--color-text-secondary)] mb-10">
            Create roadmaps, break them into modules and submodules, track progress with checklists, and keep notes and files in one place.
          </p>

          <ul className="space-y-5">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-md bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="heading-md text-[var(--color-text-primary)] mb-0.5">
                    {title}
                  </h3>
                  <p className="body-sm text-[var(--color-text-secondary)]">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-shrink-0 w-full lg:w-[420px] flex items-center justify-center p-6 lg:p-12 bg-[var(--color-surface)] lg:bg-[var(--color-bg)] lg:border-l border-[var(--color-border)]">
        <div className="w-full max-w-[360px]">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-8 lg:p-10">
            <h2 className="heading-lg text-[var(--color-text-primary)] mb-1 text-center lg:text-left">
              Welcome back
            </h2>
            <p className="body-text text-[var(--color-text-secondary)] mb-8 text-center lg:text-left">
              Sign in with your Google account to continue.
            </p>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full h-11 border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-medium"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              icon={
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              }
            >
              Sign in with Google
            </Button>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-[var(--color-text-tertiary)]">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="caption">
                Personal use only · Single-user system
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
