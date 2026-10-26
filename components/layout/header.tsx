"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAppStore } from "@/store/useAppStore";
import { useRole } from "@/lib/data/session";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header() {
  const role = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setRole = useAppStore((s) => s.setRole);

  const navLinks: { href: string; label: string }[] = [];
  if (role === "EMPLOYER") {
    navLinks.push(
      { href: "/employer", label: t.nav.dashboard },
      { href: "/search", label: t.nav.search },
      { href: "/wallet", label: t.nav.wallet }
    );
  } else if (role === "PROVIDER") {
    navLinks.push({ href: "/provider-dashboard", label: t.nav.dashboard });
  } else if (role === "ADMIN") {
    navLinks.push({ href: "/admin", label: t.nav.admin });
  }

  function handleLogout() {
    setRole(null);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-primary",
                pathname === link.href ? "bg-secondary text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs font-semibold"
            onClick={() => setLanguage(language === "en" ? "fr" : "en")}
            aria-label={t.nav.switchLanguage}
          >
            {t.nav.switchLanguage}
          </Button>

          {role && <NotificationBell role={role} />}

          {role ? (
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={handleLogout}>
              {t.nav.logout}
            </Button>
          ) : (
            <Button
              size="sm"
              className="hidden sm:inline-flex"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              {t.nav.login}
            </Button>
          )}

          {navLinks.length > 0 && (
            <Sheet>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" />}
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1 px-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-3 text-base font-medium hover:bg-secondary"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {role && (
                    <Button variant="outline" className="mt-4" onClick={handleLogout}>
                      {t.nav.logout}
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
