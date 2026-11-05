"use client";

import { useT } from "@/lib/i18n";

export function DemoBanner() {
  const t = useT();

  return (
    <div className="bg-amber-500/15 py-1.5 text-center text-xs font-medium text-amber-900 dark:text-amber-200 print:hidden">
      {t.demo.bannerText}
    </div>
  );
}
