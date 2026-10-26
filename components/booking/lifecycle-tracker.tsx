import { Check, X } from "lucide-react";
import { BOOKING_LIFECYCLE_ORDER, type BookingStatus } from "@/lib/booking";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LifecycleTracker({ status }: { status: BookingStatus }) {
  const t = useT();

  if (status === "DECLINED" || status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <X className="h-4 w-4" />
        </span>
        <p className="text-sm font-medium text-destructive">{t.statusLabels[status]}</p>
      </div>
    );
  }

  const currentIndex = BOOKING_LIFECYCLE_ORDER.indexOf(status);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
      {BOOKING_LIFECYCLE_ORDER.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:gap-2">
            <div className="flex items-center gap-2 sm:flex-col">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isComplete && !isCurrent && "border-border text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              {index < BOOKING_LIFECYCLE_ORDER.length - 1 && (
                <span
                  className={cn(
                    "hidden h-0.5 flex-1 sm:block",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                  style={{ minWidth: 24 }}
                />
              )}
            </div>
            <p
              className={cn(
                "pb-4 text-xs font-medium sm:pb-0 sm:text-center",
                isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t.statusLabels[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
