"use client";

import { Logo } from "@/components/brand/logo";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6">
        <Logo />
        <p className="max-w-xl text-sm text-muted-foreground">{t.landing.footerTagline}</p>
        <p className="max-w-2xl text-xs text-muted-foreground">{t.landing.footerNotAgency}</p>
        <p className="text-xs text-muted-foreground">
          &copy; {year} ProAid Cameroon. {t.landing.footerRights}
        </p>
      </div>
    </footer>
  );
}
