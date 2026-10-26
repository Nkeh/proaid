"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Settings2, RotateCcw, FastForward, Users } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { ROLE_HOME, useRole } from "@/lib/data/session";
import { useAllBookings, fastForwardToMonth6 } from "@/lib/data/bookings";
import { useAllProviders } from "@/lib/data/providers";
import { useT } from "@/lib/i18n";

/** Pages that make sense for more than one role - the demo panel keeps the user here on a role switch. Everything else redirects to the new role's home. */
const SHARED_PATH_PREFIXES = ["/booking/", "/search", "/provider/"];

function isSharedPath(pathname: string): boolean {
  return SHARED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function DemoPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const role = useRole();
  const open = useAppStore((s) => s.demoPanelOpen);
  const setOpen = useAppStore((s) => s.setDemoPanelOpen);
  const setRole = useAppStore((s) => s.setRole);
  const resetDemoData = useAppStore((s) => s.resetDemoData);

  const bookings = useAllBookings();
  const providers = useAllProviders();
  const monthlyBookings = bookings.filter(
    (b) => b.contractType === "MONTHLY" && b.currentMonth < Math.min(6, b.durationMonths)
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
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

  if (pathname === "/") return null;

  function providerName(providerId: string) {
    return providers.find((p) => p.id === providerId)?.name ?? providerId;
  }

  function handleSwitchRole(newRole: "EMPLOYER" | "PROVIDER" | "ADMIN") {
    setRole(newRole);
    if (!isSharedPath(pathname)) {
      router.push(ROLE_HOME[newRole]!);
    }
    setOpen(false);
    toast.success(`${t.nav[newRole === "EMPLOYER" ? "roleEmployer" : newRole === "PROVIDER" ? "roleProvider" : "roleAdmin"]}`);
  }

  function handleFastForward() {
    if (!selectedBookingId) return;
    fastForwardToMonth6(selectedBookingId);
    setSelectedBookingId("");
    toast.success(t.demo.fastForwardSuccess);
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
                <FastForward className="h-4 w-4" /> {t.demo.fastForward}
              </p>
              <p className="mb-2 text-xs text-muted-foreground">{t.demo.fastForwardHint}</p>
              {monthlyBookings.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t.demo.noEligibleBookings}</p>
              ) : (
                <div className="flex gap-2">
                  <Select value={selectedBookingId} onValueChange={(v) => setSelectedBookingId(v ?? "")}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={t.demo.selectBookingPlaceholder}>
                        {(() => {
                          const selected = monthlyBookings.find((b) => b.id === selectedBookingId);
                          return selected
                            ? `${providerName(selected.providerId)} - month ${selected.currentMonth}`
                            : t.demo.selectBookingPlaceholder;
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {monthlyBookings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {providerName(b.providerId)} - month {b.currentMonth}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleFastForward} disabled={!selectedBookingId}>
                    {t.demo.goButton}
                  </Button>
                </div>
              )}
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
