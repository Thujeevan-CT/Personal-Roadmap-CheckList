"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sun, Moon, Monitor, LayoutDashboard, Plus } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useUIStore } from "@/stores/ui-store";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";

function ThemeSelector() {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  function handleChange(t: Theme) {
    setTheme(t);
    applyTheme(t);
  }

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun className="h-4 w-4" />, label: "Light" },
    { value: "dark", icon: <Moon className="h-4 w-4" />, label: "Dark" },
    { value: "system", icon: <Monitor className="h-4 w-4" />, label: "System" },
  ];

  return (
    <div className="px-3 py-1">
      <p className="caption text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Theme</p>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer ${
              theme === opt.value
                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserAvatar() {
  const { data: session, status } = useSession();
  const name = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-[var(--color-surface)] animate-pulse" />
    );
  }

  return (
    <Dropdown
      trigger={
        <button className="h-8 w-8 rounded-full bg-[var(--color-primary)] text-white text-xs font-medium flex items-center justify-center cursor-pointer">
          {initials}
        </button>
      }
    >
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{name}</p>
        <p className="text-xs text-[var(--color-text-tertiary)]">{email}</p>
      </div>
      <DropdownSeparator />
      <ThemeSelector />
      <DropdownSeparator />
      <DropdownItem
        icon={<LogOut className="h-4 w-4" />}
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </DropdownItem>
    </Dropdown>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-3 h-8 rounded-[6px] text-sm font-medium transition-colors no-underline
        ${
          active
            ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex items-center px-4 gap-2 sticky top-0 z-10">
      <Link href="/dashboard" className="heading-md text-[var(--color-primary)] no-underline mr-2">
        MyFlow
      </Link>
      <nav className="flex items-center gap-0.5">
        <NavLink
          href="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />
        <NavLink
          href="/dashboard?new=1"
          icon={<Plus className="h-4 w-4" />}
          label="New Roadmap"
          active={false}
        />
      </nav>
      <div className="flex-1" />
      <UserAvatar />
    </header>
  );
}
