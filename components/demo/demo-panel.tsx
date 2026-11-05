"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Settings2, RotateCcw, Clock, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { ROLE_HOME, useRole } from "@/lib/data/session";
import { useAllBookings } from "@/lib/data/bookings";
import { advanceDemoClock, setDemoDateTo, setEmployerLoyaltyMonth, useDemoDate } from "@/lib/data/clock";
import { addDays } from "@/src/domain/schedule";
import { useT, useLocale } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

/** Pages that make sense for more than one role - the demo panel keeps the user here on a role switch. Everything else redirects to the new role's home. */
const SHARED_PATH_PREFIXES = ["/demo/booking/", "/demo/search", "/demo/provider/"];

function isSharedPath(pathname: string): boolean {
  return SHARED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function DemoPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const role = useRole();
  const open = useAppStore((s) => s.demoPanelOpen);
  const setOpen = useAppStore((s) => s.setDemoPanelOpen);
  const setRole = useAppStore((s) => s.setRole);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const demoDate = useDemoDate();

  const bookings = useAllBookings();
  const [loyaltyMonthInput, setLoyaltyMonthInput] = useState("");
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.shiftKey && (e.key === "D" || e.key === "d")) {
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  function handleSwitchRole(newRole: "EMPLOYER" | "PROVIDER" | "ADMIN") {
    setRole(newRole);
    if (!isSharedPath(pathname)) {
      router.push(ROLE_HOME[newRole]!);
    }
    setOpen(false);
    toast.success(`${t.nav[newRole === "EMPLOYER" ? "roleEmployer" : newRole === "PROVIDER" ? "roleProvider" : "roleAdmin"]}`);
  }

  function nextFundingDeadline(): string | undefined {
    const dates = bookings
      .flatMap((b) => b.periods)
      .filter((p) => p.status === "AWAITING_FUNDING")
      .map((p) => p.fundingWindowEndDate)
      .sort();
    return dates[0] ? addDays(dates[0], 1) : undefined;
  }

  function nextPaymentDate(): string | undefined {
    const dates = bookings
      .flatMap((b) => b.periods)
      .filter((p) => p.status === "FUNDED")
      .map((p) => p.paymentDate)
      .sort();
    return dates[0];
  }

  function handleAdvanceOneDay() {
    advanceDemoClock(1);
    toast.success(t.demo.advanceSuccess);
  }

  function handleAdvanceToFundingDeadline() {
    const target = nextFundingDeadline();
    if (!target) return;
    setDemoDateTo(target);
    toast.success(t.demo.advanceSuccess);
  }

  function handleAdvanceToPaymentDate() {
    const target = nextPaymentDate();
    if (!target) return;
    setDemoDateTo(target);
    toast.success(t.demo.advanceSuccess);
  }

  function handleSetLoyaltyMonth() {
    const value = Number(loyaltyMonthInput);
    if (!Number.isInteger(value) || value < 1) return;
    setEmployerLoyaltyMonth(value);
    setLoyaltyMonthInput("");
    toast.success(t.demo.advanceSuccess);
  }

  function handleReset() {
    resetDemoData();
    setConfirmResetOpen(false);
    setOpen(false);
    toast.success(t.demo.resetSuccess);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 h-12 gap-2 rounded-full px-5 shadow-lg print:hidden"
        size="lg"
      >
        <Settings2 className="h-4 w-4" />
        {t.demo.openPanel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.demo.panelTitle}</DialogTitle>
            <DialogDescription>{t.demo.shortcutHint}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4" /> {t.demo.switchRole}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={role === "EMPLOYER" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSwitchRole("EMPLOYER")}
                >
                  {t.nav.roleEmployer}
                </Button>
                <Button
                  variant={role === "PROVIDER" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSwitchRole("PROVIDER")}
                >
                  {t.nav.roleProvider}
                </Button>
                <Button
                  variant={role === "ADMIN" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSwitchRole("ADMIN")}
                >
                  {t.nav.roleAdmin}
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4" /> {t.demo.dateLabel}: {formatDate(demoDate, locale)}
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={handleAdvanceOneDay}>
                  {t.demo.advanceOneDay}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdvanceToFundingDeadline}
                  disabled={!nextFundingDeadline()}
                >
                  {t.demo.advanceToFundingDeadline}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdvanceToPaymentDate}
                  disabled={!nextPaymentDate()}
                >
                  {t.demo.advanceToPaymentDate}
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4" /> {t.demo.setLoyaltyMonthLabel}
              </p>
              <p className="mb-2 text-xs text-muted-foreground">{t.demo.setLoyaltyMonthHint}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  value={loyaltyMonthInput}
                  onChange={(e) => setLoyaltyMonthInput(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSetLoyaltyMonth} disabled={!loyaltyMonthInput}>
                  {t.demo.goButton}
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <RotateCcw className="h-4 w-4" /> {t.demo.resetData}
              </p>
              <Button variant="destructive" size="sm" onClick={() => setConfirmResetOpen(true)}>
                {t.demo.resetData}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.demo.resetConfirmTitle}</DialogTitle>
            <DialogDescription>{t.demo.resetConfirmBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmResetOpen(false)}>
              {t.demo.cancelButton}
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              {t.demo.resetButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
