"use client";

import { useEffect } from "react";
import { useHasHydrated } from "@/lib/data/session";
import { useLocale } from "@/lib/i18n";
import { Logo } from "@/components/brand/logo";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHasHydrated();
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Logo />
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return <>{children}</>;
}
