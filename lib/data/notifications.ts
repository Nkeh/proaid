import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Dictionary, Locale } from "../i18n/dictionary";
import { formatMoney } from "../format";
import type { AppNotification, Role } from "./types";

export function useNotificationsFor(audience: Role, userId: string | null): AppNotification[] {
  const notifications = useAppStore((s) => s.notifications);
  return useMemo(
    () =>
      notifications
        .filter((n) => n.audience === audience && (n.userId === null || n.userId === userId))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [notifications, audience, userId]
  );
}

export function useUnreadCountFor(audience: Role, userId: string | null): number {
  return useAppStore(
    (s) =>
      s.notifications.filter(
        (n) => n.audience === audience && (n.userId === null || n.userId === userId) && !n.read
      ).length
  );
}

export function markAllNotificationsRead(audience: Role, userId: string | null): void {
  useAppStore.getState().markAllNotificationsRead(audience, userId);
}

/** Renders a notification's text in the current locale from its structured kind + params. */
export function renderNotification(n: AppNotification, t: Dictionary, locale: Locale): string {
  const name = n.params.name ?? "";
  const amountText = n.params.amount !== undefined ? formatMoney(n.params.amount, locale) : "";
  const level = n.params.level ?? 0;

  switch (n.kind) {
    case "PROVIDER_ACCEPTED":
      return t.notifications.providerAccepted(name);
    case "PROVIDER_DECLINED":
      return t.notifications.providerDeclined(name);
    case "PROVIDER_COUNTERED":
      return t.notifications.providerCountered(name);
    case "CONTRACT_SIGNED":
      return t.notifications.contractSigned(name);
    case "PERIOD_FUNDED":
      return t.notifications.periodFunded(amountText);
    case "PERIOD_OVERDUE":
      return t.notifications.periodOverdue;
    case "PAYOUT_RELEASED":
      return t.notifications.payoutReleased(amountText);
    case "CONTRACT_COMPLETED":
      return t.notifications.contractCompleted(name);
    case "NEW_MESSAGE":
      return t.notifications.newMessage(name);
    case "PROVIDER_APPROVED":
      return t.notifications.providerApproved;
    case "PROVIDER_REJECTED":
      return t.notifications.providerRejected;
    case "NEW_OFFER":
      return t.notifications.newOffer(name);
    case "LOYALTY_LEVEL_UP":
      return t.notifications.loyaltyLevelUp(level);
    case "DISPUTE_RAISED":
      return t.notifications.disputeRaised;
    case "DISPUTE_RESOLVED":
      return t.notifications.disputeResolved;
    case "REPLACEMENT_OFFERED":
      return t.notifications.replacementOffered;
    default:
      return "";
  }
}
