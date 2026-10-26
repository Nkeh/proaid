import { HeartHandshake } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-semibold text-foreground", className)}
      aria-label="ProAid"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <HeartHandshake className="h-5 w-5" strokeWidth={2.25} />
      </span>
      {!iconOnly && <span className="text-lg tracking-tight">ProAid</span>}
    </Link>
  );
}
