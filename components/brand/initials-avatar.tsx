import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
} as const;

export function InitialsAvatar({
  initials,
  color,
  size = "md",
  className,
}: {
  initials: string;
  color: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        SIZE_CLASSES[size],
        className
      )}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
