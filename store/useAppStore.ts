import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Locale } from "@/lib/i18n/dictionary";
import { calculateFee } from "@/lib/fees";
import { canTransition, nextStatus, resolveAfterConfirmation, toBookingLike } from "@/lib/booking";
import type {
  AppNotification,
  Booking,
  Employer,
  NotificationKind,
  Provider,
  Role,
  Transaction,
  Wallet,
} from "@/lib/data/types";
import {
  EMPLOYER_ID,
  GRACE_MBAH_ID,
  buildAdminStats,
  buildEmployer,
  buildProviders,
  buildSeedBooking,
  buildWalletAndTransactions,
} from "@/lib/data/seed";

export interface CreateBookingInput {
  providerId: string;
  contractType: Booking["contractType"];
  startDate: string;
  durationMonths: number;
  amount: number;
  notes: string;
}

export type PaymentMethod = "MTN" | "ORANGE";

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function fakeReference(): string {
  return `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface AppState {
  hasHydrated: boolean;
  language: Locale;
  role: Role | null;
  providers: Provider[];
  employer: Employer;
  bookings: Booking[];
  wallet: Wallet;
  notifications: AppNotification[];
  demoPanelOpen: boolean;

  setHasHydrated: (v: boolean) => void;
  setLanguage: (l: Locale) => void;
  setRole: (r: Role | null) => void;
  setDemoPanelOpen: (v: boolean) => void;

  approveProvider: (id: string) => void;
  rejectProvider: (id: string, reason: string) => void;

  createBooking: (input: CreateBookingInput) => string;
  acceptBooking: (id: string) => void;
  declineBooking: (id: string) => void;
  signContract: (id: string, role: Role, fullName: string) => void;
  fundBooking: (id: string, method: PaymentMethod, phoneNumber: string) => boolean;
  confirmService: (id: string) => void;
  cancelBooking: (id: string) => void;
  submitReview: (id: string, rating: number, comment: string) => void;
  sendMessage: (bookingId: string, role: Role, senderName: string, text: string) => void;
  fastForwardToMonth6: (bookingId: string) => void;

  topUpWallet: (amount: number, method: PaymentMethod, phoneNumber: string) => void;

  markAllNotificationsRead: (audience: Role, userId: string | null) => void;

  resetDemoData: () => void;
}

function pushNotification(
  notifications: AppNotification[],
  audience: Role,
  userId: string | null,
  kind: NotificationKind,
  params: AppNotification["params"] = {},
  bookingId?: string
): AppNotification[] {
  const n: AppNotification = {
    id: uid("notif"),
    audience,
    userId,
    kind,
    params,
    timestamp: nowIso(),
    read: false,
    bookingId,
  };
  return [n, ...notifications];
}

function buildInitialDomainState() {
  const providers = buildProviders();
  const employer = buildEmployer();
  const seedBooking = buildSeedBooking();
  const wallet = buildWalletAndTransactions(seedBooking);
  return { providers, employer, bookings: [seedBooking], wallet, notifications: [] as AppNotification[] };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      language: "en",
      role: null,
      ...buildInitialDomainState(),
      demoPanelOpen: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),
      setLanguage: (l) => set({ language: l }),
      setRole: (r) => set({ role: r }),
      setDemoPanelOpen: (v) => set({ demoPanelOpen: v }),

      approveProvider: (id) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "APPROVED",
                  verification: {
                    idVerified: true,
                    referencesConfirmed: true,
                    medicalCertificate: true,
                    skillsCheck: true,
                  },
                  documents: p.documents.map((d) => ({ ...d, status: "SUBMITTED" as const })),
                }
              : p
          ),
          notifications: pushNotification(state.notifications, "PROVIDER", id, "PROVIDER_APPROVED"),
        }));
      },

      rejectProvider: (id) => {
        set((state) => ({
          providers: state.providers.map((p) => (p.id === id ? { ...p, status: "REJECTED" } : p)),
          notifications: pushNotification(state.notifications, "PROVIDER", id, "PROVIDER_REJECTED"),
        }));
      },

      createBooking: (input) => {
        const state = get();
        const provider = state.providers.find((p) => p.id === input.providerId);
        if (!provider) throw new Error("Provider not found");

        const id = uid("booking");
        const timestamp = nowIso();
        const booking: Booking = {
          id,
          providerId: input.providerId,
          employerId: EMPLOYER_ID,
          category: provider.category,
          contractType: input.contractType,
          status: "REQUESTED",
          startDate: input.startDate,
          durationMonths: input.contractType === "SHORT_TERM" ? 1 : input.durationMonths,
          currentMonth: 1,
          amount: input.amount,
          notes: input.notes,
          employerSignature: { signed: false, fullName: null, timestamp: null },
          providerSignature: { signed: false, fullName: null, timestamp: null },
          messages: input.notes
            ? [
                {
                  id: uid("msg"),
                  senderRole: "EMPLOYER",
                  senderName: state.employer.name,
                  text: input.notes,
                  timestamp,
                },
              ]
            : [],
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((s) => ({
          bookings: [booking, ...s.bookings],
          notifications: pushNotification(
            s.notifications,
            "PROVIDER",
            input.providerId,
            "NEW_REQUEST",
            { name: s.employer.name },
            id
          ),
        }));

        return id;
      },

      acceptBooking: (id) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || !canTransition(toBookingLike(booking), "ACCEPT")) return state;
          const newStatus = nextStatus(toBookingLike(booking), "ACCEPT");
          const provider = state.providers.find((p) => p.id === booking.providerId);
          return {
            bookings: state.bookings.map((b) =>
              b.id === id ? { ...b, status: newStatus, updatedAt: nowIso() } : b
            ),
            notifications: pushNotification(
              state.notifications,
              "EMPLOYER",
              booking.employerId,
              "PROVIDER_ACCEPTED",
              { name: provider?.name ?? "" },
              id
            ),
          };
        });
      },

      declineBooking: (id) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || !canTransition(toBookingLike(booking), "DECLINE")) return state;
          const newStatus = nextStatus(toBookingLike(booking), "DECLINE");
          const provider = state.providers.find((p) => p.id === booking.providerId);
          return {
            bookings: state.bookings.map((b) =>
              b.id === id ? { ...b, status: newStatus, updatedAt: nowIso() } : b
            ),
            notifications: pushNotification(
              state.notifications,
              "EMPLOYER",
              booking.employerId,
              "PROVIDER_DECLINED",
              { name: provider?.name ?? "" },
              id
            ),
          };
        });
      },

      signContract: (id, role, fullName) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || !canTransition(toBookingLike(booking), "SIGN")) return state;

          const employerSigned = role === "EMPLOYER" ? true : booking.employerSignature.signed;
          const providerSigned = role === "PROVIDER" ? true : booking.providerSignature.signed;
          const timestamp = nowIso();
          const status = nextStatus(toBookingLike(booking), "SIGN", { employerSigned, providerSigned });

          const updated: Booking = {
            ...booking,
            status,
            employerSignature:
              role === "EMPLOYER"
                ? { signed: true, fullName, timestamp }
                : booking.employerSignature,
            providerSignature:
              role === "PROVIDER"
                ? { signed: true, fullName, timestamp }
                : booking.providerSignature,
            updatedAt: timestamp,
          };

          const otherRole: Role = role === "EMPLOYER" ? "PROVIDER" : "EMPLOYER";
          const otherUserId = otherRole === "EMPLOYER" ? booking.employerId : booking.providerId;

          return {
            bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
            notifications: pushNotification(
              state.notifications,
              otherRole,
              otherUserId,
              "CONTRACT_SIGNED",
              { name: fullName },
              id
            ),
          };
        });
      },

      fundBooking: (id, method, phoneNumber) => {
        void method;
        void phoneNumber;
        const state = get();
        const booking = state.bookings.find((b) => b.id === id);
        if (!booking || !canTransition(toBookingLike(booking), "FUND")) return false;
        if (state.wallet.balance < booking.amount) return false;
        const newStatus = nextStatus(toBookingLike(booking), "FUND");

        const provider = state.providers.find((p) => p.id === booking.providerId);
        const timestamp = nowIso();
        const txn: Transaction = {
          id: uid("txn"),
          type: "FUNDING",
          bookingId: id,
          amount: booking.amount,
          description: `Escrow funded for ${provider?.name ?? "provider"} - month ${booking.currentMonth}`,
          descriptionFr: `Escrow financé pour ${provider?.name ?? "le prestataire"} - mois ${booking.currentMonth}`,
          timestamp,
          reference: fakeReference(),
        };

        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: newStatus, updatedAt: timestamp } : b
          ),
          wallet: {
            balance: s.wallet.balance - booking.amount,
            escrowHeld: s.wallet.escrowHeld + booking.amount,
            transactions: [txn, ...s.wallet.transactions],
          },
          notifications: pushNotification(
            s.notifications,
            "PROVIDER",
            booking.providerId,
            "WALLET_FUNDED",
            { amount: booking.amount },
            id
          ),
        }));
        return true;
      },

      confirmService: (id) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || !canTransition(toBookingLike(booking), "CONFIRM_SERVICE")) return state;

          const provider = state.providers.find((p) => p.id === booking.providerId);
          const { feeAmount, providerAmount } = calculateFee({
            contractType: booking.contractType,
            amount: booking.amount,
            monthNumber: booking.currentMonth,
          });

          const timestamp = nowIso();
          const feeTxn: Transaction = {
            id: uid("txn"),
            type: "FEE",
            bookingId: id,
            amount: feeAmount,
            description: `Platform fee - ${provider?.name ?? "provider"}, month ${booking.currentMonth}`,
            descriptionFr: `Frais de plateforme - ${provider?.name ?? "prestataire"}, mois ${booking.currentMonth}`,
            timestamp,
            reference: fakeReference(),
          };
          const payoutTxn: Transaction = {
            id: uid("txn"),
            type: "PAYOUT",
            bookingId: id,
            amount: providerAmount,
            description: `Payout to ${provider?.name ?? "provider"} - month ${booking.currentMonth}`,
            descriptionFr: `Paiement à ${provider?.name ?? "prestataire"} - mois ${booking.currentMonth}`,
            timestamp,
            reference: fakeReference(),
          };

          const resolution = resolveAfterConfirmation(toBookingLike(booking));
          const updated: Booking = {
            ...booking,
            status: resolution.status,
            currentMonth: resolution.currentMonth,
            updatedAt: timestamp,
          };

          let notifications = pushNotification(
            state.notifications,
            "EMPLOYER",
            booking.employerId,
            "SERVICE_CONFIRMED",
            { name: provider?.name ?? "" },
            id
          );
          notifications = pushNotification(
            notifications,
            "PROVIDER",
            booking.providerId,
            "PAYOUT_RELEASED",
            { amount: providerAmount },
            id
          );
          if (resolution.status === "COMPLETED") {
            notifications = pushNotification(
              notifications,
              "EMPLOYER",
              booking.employerId,
              "BOOKING_COMPLETED",
              { name: provider?.name ?? "" },
              id
            );
            notifications = pushNotification(
              notifications,
              "PROVIDER",
              booking.providerId,
              "BOOKING_COMPLETED",
              { name: state.employer.name },
              id
            );
          }

          return {
            bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
            wallet: {
              ...state.wallet,
              escrowHeld: state.wallet.escrowHeld - booking.amount,
              transactions: [payoutTxn, feeTxn, ...state.wallet.transactions],
            },
            notifications,
          };
        });
      },

      cancelBooking: (id) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || !canTransition(toBookingLike(booking), "CANCEL")) return state;
          const newStatus = nextStatus(toBookingLike(booking), "CANCEL");
          return {
            bookings: state.bookings.map((b) => (b.id === id ? { ...b, status: newStatus, updatedAt: nowIso() } : b)),
          };
        });
      },

      submitReview: (id, rating, comment) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || booking.status !== "COMPLETED" || booking.review) return state;

          const timestamp = nowIso();
          const providers = state.providers.map((p) => {
            if (p.id !== booking.providerId) return p;
            const newReview = {
              id: uid("review"),
              authorName: state.employer.name,
              rating,
              comment,
              commentFr: comment,
              date: timestamp,
            };
            const reviews = [newReview, ...p.reviews];
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            return { ...p, reviews, rating: Math.round(avg * 10) / 10 };
          });

          return {
            providers,
            bookings: state.bookings.map((b) =>
              b.id === id ? { ...b, review: { rating, comment, date: timestamp } } : b
            ),
          };
        });
      },

      sendMessage: (bookingId, role, senderName, text) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking) return state;
          const message = { id: uid("msg"), senderRole: role, senderName, text, timestamp: nowIso() };
          const otherRole: Role = role === "EMPLOYER" ? "PROVIDER" : "EMPLOYER";
          const otherUserId = otherRole === "EMPLOYER" ? booking.employerId : booking.providerId;
          return {
            bookings: state.bookings.map((b) =>
              b.id === bookingId ? { ...b, messages: [...b.messages, message], updatedAt: nowIso() } : b
            ),
            notifications: pushNotification(
              state.notifications,
              otherRole,
              otherUserId,
              "NEW_MESSAGE",
              { name: senderName },
              bookingId
            ),
          };
        });
      },

      fastForwardToMonth6: (bookingId) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking || booking.contractType !== "MONTHLY") return state;
          const target = Math.min(6, booking.durationMonths);
          if (booking.currentMonth >= target) return state;
          return {
            bookings: state.bookings.map((b) =>
              b.id === bookingId ? { ...b, currentMonth: target } : b
            ),
          };
        });
      },

      topUpWallet: (amount, method, phoneNumber) => {
        void method;
        void phoneNumber;
        set((state) => {
          const txn: Transaction = {
            id: uid("txn"),
            type: "FUNDING",
            bookingId: null,
            amount,
            description: "Wallet top-up via mobile money",
            descriptionFr: "Rechargement du portefeuille via mobile money",
            timestamp: nowIso(),
            reference: fakeReference(),
          };
          return {
            wallet: {
              ...state.wallet,
              balance: state.wallet.balance + amount,
              transactions: [txn, ...state.wallet.transactions],
            },
          };
        });
      },

      markAllNotificationsRead: (audience, userId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.audience === audience && (n.userId === null || n.userId === userId)
              ? { ...n, read: true }
              : n
          ),
        }));
      },

      resetDemoData: () => {
        set(() => ({ ...buildInitialDomainState() }));
      },
    }),
    {
      name: "proaid-demo-store",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        language: state.language,
        role: state.role,
        providers: state.providers,
        employer: state.employer,
        bookings: state.bookings,
        wallet: state.wallet,
        notifications: state.notifications,
      }),
    }
  )
);

export const CURRENT_PROVIDER_ID = GRACE_MBAH_ID;
export const CURRENT_EMPLOYER_ID = EMPLOYER_ID;

export function getCurrentUserId(role: Role | null): string | null {
  if (role === "EMPLOYER") return CURRENT_EMPLOYER_ID;
  if (role === "PROVIDER") return CURRENT_PROVIDER_ID;
  return null;
}

export { buildAdminStats };
