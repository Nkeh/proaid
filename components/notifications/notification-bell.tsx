"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useT, useLocale } from "@/lib/i18n";
import { useCurrentUserId } from "@/lib/data/session";
import {
  markAllNotificationsRead,
  renderNotification,
  useNotificationsFor,
  useUnreadCountFor,
} from "@/lib/data/notifications";
import { formatDateTime } from "@/lib/format";
import type { Role } from "@/lib/data/types";

export function NotificationBell({ role }: { role: Role }) {
  const t = useT();
  const locale = useLocale();
  const userId = useCurrentUserId();
  const notifications = useNotificationsFor(role, userId);
  const unreadCount = useUnreadCountFor(role, userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="relative" aria-label={t.notifications.title} />}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-amber px-1 text-[10px] text-amber-foreground">
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">{t.notifications.title}</span>
          {notifications.length > 0 && (
            <button
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => markAllNotificationsRead(role, userId)}
            >
              {t.notifications.markAllRead}
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t.notifications.noNotifications}
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`border-b border-border px-4 py-3 text-sm last:border-0 ${
                  n.read ? "opacity-60" : "bg-secondary/40"
                }`}
              >
                <p className="text-foreground">{renderNotification(n, t, locale)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(n.timestamp, locale)}
                </p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
