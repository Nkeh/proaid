import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Locale } from "@/lib/i18n/dictionary";
import { canTransition as canTransitionContract, nextStatus as nextStatusContract } from "@/lib/booking";
import { calculateShortJobFee, SRS_V2_FEE_CONFIG } from "@/src/domain/fees";
import {
  markLoyaltyMonthFunded,
  markLoyaltyMonthRemoved,
  nextLoyaltyMonthNumber,
  removeUnfundedMonthsForContract,
  type LoyaltyMonthRecord,
} from "@/src/domain/loyalty";
import {
  canTransition as canTransitionPeriod,
  nextStatus as nextStatusPeriod,
  type DisputeOutcome,
} from "@/src/domain/paymentPeriod";
import {
  addDays,
  generateHalfAndHalfPeriods,
  generateMonthlyPeriods,
  prorateFinalContractMonth,
} from "@/src/domain/schedule";
import type {
  AppNotification,
  Booking,
  Dispute,
  DisputeCategory,
  DisputeDecisionOutcome,
  Employer,
  NotificationKind,
  OfferContractStatus,
  Provider,
  Role,
  ScheduleType,
  StoredPaymentPeriod,
  Transaction,
} from "@/lib/data/types";
import {
  DEMO_TODAY,
  EMPLOYER_ID,
  GRACE_MBAH_ID,
  buildAdminStats,
  buildEmployer,
  buildProviders,
  buildSeedHalfAndHalfOffer,
  buildSeedLoyaltyAndBooking,
  buildSeedShortJobBooking,
  buildSeedTransactions,
} from "@/lib/data/seed";

export interface CreateOfferInput {
  providerId: string;
  contractKind: Booking["contractKind"];
  scheduleType?: ScheduleType;
  startDate: string;
  durationMonths: number;
  endDate?: string;
  wage: number;
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

function fakeOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

interface AppState {
  hasHydrated: boolean;
  language: Locale;
  role: Role | null;
  /** The demo's fixed "business clock" — never read from Date.now() (see CLAUDE.md). */
  demoDate: string;
  providers: Provider[];
  employer: Employer;
  bookings: Booking[];
  loyaltyHistory: LoyaltyMonthRecord[];
  transactions: Transaction[];
  disputes: Dispute[];
  notifications: AppNotification[];
  demoPanelOpen: boolean;

  setHasHydrated: (v: boolean) => void;
  setLanguage: (l: Locale) => void;
  setRole: (r: Role | null) => void;
  setDemoPanelOpen: (v: boolean) => void;

  approveProvider: (id: string) => void;
  rejectProvider: (id: string, reason: string) => void;
  toggleShortlist: (providerId: string) => void;

  makeOffer: (input: CreateOfferInput) => string;
  counterOffer: (id: string, newWage: number) => void;
  acceptOffer: (id: string) => void;
  declineOffer: (id: string) => void;
  withdrawOffer: (id: string) => void;
  signContract: (id: string, role: Role, fullName: string) => string;
  fundPeriod: (bookingId: string, periodId: string, method: PaymentMethod, phoneNumber: string) => boolean;
  fundShortJob: (bookingId: string, method: PaymentMethod, phoneNumber: string) => boolean;
  confirmShortJobCompletion: (id: string) => void;
  giveNotice: (bookingId: string) => void;
  cancelOffer: (bookingId: string) => void;
  terminateContract: (bookingId: string, reason: string) => void;
  requestReplacement: (bookingId: string, newProviderId: string) => string;

  raiseDispute: (
    bookingId: string,
    periodId: string | undefined,
    role: Role,
    category: DisputeCategory,
    description: string
  ) => void;
  resolveDispute: (disputeId: string, decision: DisputeDecisionOutcome, refundAmount?: number) => void;

  submitReview: (id: string, rating: number, comment: string) => void;
  sendMessage: (bookingId: string, role: Role, senderName: string, text: string) => void;

  advanceDemoClock: (days: number) => void;
  setDemoDateTo: (iso: string) => void;
  setEmployerLoyaltyMonth: (targetFundedMonths: number) => void;

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

/** The period the UI treats as "current": the first one not yet released/refunded/cancelled. */
function findCurrentPeriod(booking: Booking): StoredPaymentPeriod | undefined {
  return booking.periods.find(
    (p) => !["RELEASED", "REFUNDED", "PARTLY_REFUNDED", "PAYOUT_FAILED", "CANCELLED"].includes(p.status)
  );
}

function buildInitialDomainState() {
  const providers = buildProviders();
  const employer = buildEmployer();
  const { loyaltyHistory, booking } = buildSeedLoyaltyAndBooking();
  const { booking: shortJobBooking, transactions: shortJobTransactions } = buildSeedShortJobBooking();
  const halfAndHalfBooking = buildSeedHalfAndHalfOffer();
  const transactions = [...buildSeedTransactions(booking), ...shortJobTransactions];
  return {
    providers,
    employer,
    bookings: [booking, shortJobBooking, halfAndHalfBooking],
    loyaltyHistory,
    transactions,
    disputes: [] as Dispute[],
    notifications: [] as AppNotification[],
    demoDate: DEMO_TODAY,
  };
}

/** Marks every commission line of a period's contract months as FUNDED in the loyalty ledger. */
function applyPeriodFundedToLoyalty(
  history: LoyaltyMonthRecord[],
  employerId: string,
  bookingId: string,
  period: StoredPaymentPeriod
): LoyaltyMonthRecord[] {
  let next = history;
  for (const line of period.commissionLines) {
    next = markLoyaltyMonthFunded(next, employerId, bookingId, line.contractMonthNumber);
  }
  return next;
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
                  status: "APPROVED" as const,
                  vetting: {
                    identityConfirmed: "PASS" as const,
                    criminalRecordClear: "PASS" as const,
                    referee1Confirmed: "PASS" as const,
                    referee2Confirmed: "PASS" as const,
                    medicalFitness: "PASS" as const,
                    skillsConfirmed: "PASS" as const,
                  },
                  documents: p.documents.map((d) => ({ ...d, status: "SUBMITTED" as const })),
                }
              : p
          ),
          notifications: pushNotification(state.notifications, "PROVIDER", id, "PROVIDER_APPROVED"),
        }));
      },

      rejectProvider: (id, reason) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, status: "REJECTED" as const, rejectionReason: reason } : p
          ),
          notifications: pushNotification(state.notifications, "PROVIDER", id, "PROVIDER_REJECTED"),
        }));
      },

      toggleShortlist: (providerId) => {
        set((state) => {
          const isShortlisted = state.employer.shortlistedProviderIds.includes(providerId);
          return {
            employer: {
              ...state.employer,
              shortlistedProviderIds: isShortlisted
                ? state.employer.shortlistedProviderIds.filter((id) => id !== providerId)
                : [...state.employer.shortlistedProviderIds, providerId],
            },
          };
        });
      },

      makeOffer: (input) => {
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
          contractKind: input.contractKind,
          scheduleType: input.contractKind === "LONG_CONTRACT" ? input.scheduleType : undefined,
          status: "OFFER_SENT",
          startDate: input.startDate,
          durationMonths: input.contractKind === "SHORT_JOB" ? 1 : input.durationMonths,
          endDate: input.endDate,
          wage: input.wage,
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
          periods: [],
          offerRounds: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((s) => ({
          bookings: [booking, ...s.bookings],
          notifications: pushNotification(
            s.notifications,
            "PROVIDER",
            input.providerId,
            "NEW_OFFER",
            { name: s.employer.name },
            id
          ),
        }));

        return id;
      },

      counterOffer: (id, newWage) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || booking.offerRounds >= 3) return state;
          if (!canTransitionContract(booking.status, "COUNTER")) return state;
          const status = nextStatusContract(booking.status, "COUNTER");
          return {
            bookings: state.bookings.map((b) =>
              b.id === id
                ? { ...b, status, wage: newWage, offerRounds: b.offerRounds + 1, updatedAt: nowIso() }
                : b
            ),
            notifications: pushNotification(
              state.notifications,
              "EMPLOYER",
              booking.employerId,
              "PROVIDER_COUNTERED",
              {},
              id
            ),
          };
        });
      },

      acceptOffer: (id) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || !canTransitionContract(booking.status, "ACCEPT")) return state;
          const status = nextStatusContract(booking.status, "ACCEPT");
          const provider = state.providers.find((p) => p.id === booking.providerId);
          return {
            bookings: state.bookings.map((b) => (b.id === id ? { ...b, status, updatedAt: nowIso() } : b)),
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

      declineOffer: (id) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || !canTransitionContract(booking.status, "DECLINE")) return state;
          const status = nextStatusContract(booking.status, "DECLINE");
          const provider = state.providers.find((p) => p.id === booking.providerId);
          return {
            bookings: state.bookings.map((b) => (b.id === id ? { ...b, status, updatedAt: nowIso() } : b)),
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

      withdrawOffer: (id) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || !canTransitionContract(booking.status, "WITHDRAW")) return state;
          const status = nextStatusContract(booking.status, "WITHDRAW");
          return {
            bookings: state.bookings.map((b) => (b.id === id ? { ...b, status, updatedAt: nowIso() } : b)),
          };
        });
      },

      signContract: (id, role, fullName) => {
        const otp = fakeOtp();
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || booking.status !== "PENDING_SIGNATURES") return state;

          const employerSigned = role === "EMPLOYER" ? true : booking.employerSignature.signed;
          const providerSigned = role === "PROVIDER" ? true : booking.providerSignature.signed;
          const timestamp = nowIso();

          let status: OfferContractStatus = booking.status;
          let periods = booking.periods;
          let loyaltyHistory = state.loyaltyHistory;

          if (employerSigned && providerSigned) {
            status = nextStatusContract(booking.status, "SIGN", {
              employerSigned: true,
              providerSigned: true,
            });

            if (booking.contractKind === "LONG_CONTRACT") {
              const generated =
                booking.scheduleType === "HALF_AND_HALF"
                  ? generateHalfAndHalfPeriods(
                      booking.employerId,
                      booking.id,
                      booking.startDate,
                      booking.endDate ?? booking.startDate,
                      booking.durationMonths,
                      booking.wage,
                      loyaltyHistory,
                      SRS_V2_FEE_CONFIG
                    )
                  : generateMonthlyPeriods(
                      booking.employerId,
                      booking.id,
                      booking.startDate,
                      booking.durationMonths,
                      booking.wage,
                      loyaltyHistory,
                      SRS_V2_FEE_CONFIG
                    );

              periods = generated.periods.map((p, i) => ({
                ...p,
                id: `${booking.id}-period-${i + 1}`,
                status: nextStatusPeriod(p.status, "OPEN_FUNDING_WINDOW"),
              }));
              loyaltyHistory = [...loyaltyHistory, ...generated.loyaltyRecords];
            }
          }

          const updated: Booking = {
            ...booking,
            status,
            periods,
            employerSignature:
              role === "EMPLOYER" ? { signed: true, fullName, timestamp, otpCode: otp } : booking.employerSignature,
            providerSignature:
              role === "PROVIDER" ? { signed: true, fullName, timestamp, otpCode: otp } : booking.providerSignature,
            updatedAt: timestamp,
          };

          const otherRole: Role = role === "EMPLOYER" ? "PROVIDER" : "EMPLOYER";
          const otherUserId = otherRole === "EMPLOYER" ? booking.employerId : booking.providerId;

          return {
            bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
            loyaltyHistory,
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
        return otp;
      },

      fundPeriod: (bookingId, periodId, method, phoneNumber) => {
        void method;
        void phoneNumber;
        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) return false;
        const period = booking.periods.find((p) => p.id === periodId);
        if (!period) return false;
        if (!canTransitionPeriod(period.status, "FUND")) return false;

        const timestamp = nowIso();
        const fundingTxn: Transaction = {
          id: uid("txn"),
          type: "FUNDING",
          bookingId,
          amount: period.employerPaysTotal,
          description: `Period ${period.periodNumber} funded`,
          descriptionFr: `Période ${period.periodNumber} financée`,
          timestamp,
          reference: fakeReference(),
        };
        const commissionTxn: Transaction = {
          id: uid("txn"),
          type: "COMMISSION",
          bookingId,
          amount: period.commissionTotal,
          description: `Commission recognized, period ${period.periodNumber}`,
          descriptionFr: `Commission reconnue, période ${period.periodNumber}`,
          timestamp,
          reference: fakeReference(),
        };

        const updatedPeriod: StoredPaymentPeriod = { ...period, status: nextStatusPeriod(period.status, "FUND") };
        const isFirstPeriod = period.periodNumber === 1;
        let bookingStatus = booking.status;
        if (isFirstPeriod && booking.status === "SIGNED") {
          bookingStatus = nextStatusContract(booking.status, "FUND", { contractLength: "LONG" });
        } else if (booking.status === "SUSPENDED") {
          bookingStatus = nextStatusContract(booking.status, "FUND");
        }

        const loyaltyHistory = applyPeriodFundedToLoyalty(
          state.loyaltyHistory,
          booking.employerId,
          booking.id,
          updatedPeriod
        );

        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: bookingStatus,
                  periods: b.periods.map((p) => (p.id === periodId ? updatedPeriod : p)),
                  updatedAt: timestamp,
                }
              : b
          ),
          loyaltyHistory,
          transactions: [commissionTxn, fundingTxn, ...s.transactions],
          notifications: pushNotification(
            s.notifications,
            "PROVIDER",
            booking.providerId,
            "PERIOD_FUNDED",
            { amount: period.wageTotal },
            bookingId
          ),
        }));
        return true;
      },

      fundShortJob: (bookingId, method, phoneNumber) => {
        void method;
        void phoneNumber;
        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking || booking.contractKind !== "SHORT_JOB") return false;
        if (!canTransitionContract(booking.status, "FUND")) return false;

        const fee = calculateShortJobFee(booking.wage, SRS_V2_FEE_CONFIG);
        const status = nextStatusContract(booking.status, "FUND", { contractLength: "SHORT" });
        const timestamp = nowIso();

        const fundingTxn: Transaction = {
          id: uid("txn"),
          type: "FUNDING",
          bookingId,
          amount: fee.employerPays,
          description: "Short job funded",
          descriptionFr: "Travail ponctuel financé",
          timestamp,
          reference: fakeReference(),
        };
        const commissionTxn: Transaction = {
          id: uid("txn"),
          type: "COMMISSION",
          bookingId,
          amount: fee.commission,
          description: "Commission recognized, short job",
          descriptionFr: "Commission reconnue, travail ponctuel",
          timestamp,
          reference: fakeReference(),
        };

        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, status, updatedAt: timestamp } : b)),
          transactions: [commissionTxn, fundingTxn, ...s.transactions],
          notifications: pushNotification(
            s.notifications,
            "PROVIDER",
            booking.providerId,
            "PERIOD_FUNDED",
            { amount: fee.workerReceives },
            bookingId
          ),
        }));
        return true;
      },

      confirmShortJobCompletion: (id) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || !canTransitionContract(booking.status, "CONFIRM")) return state;
          const status = nextStatusContract(booking.status, "CONFIRM");
          const timestamp = nowIso();
          const payoutTxn: Transaction = {
            id: uid("txn"),
            type: "PAYOUT",
            bookingId: id,
            amount: booking.wage,
            description: "Payout, short job completed",
            descriptionFr: "Paiement, travail ponctuel terminé",
            timestamp,
            reference: fakeReference(),
          };
          return {
            bookings: state.bookings.map((b) => (b.id === id ? { ...b, status, updatedAt: timestamp } : b)),
            transactions: [payoutTxn, ...state.transactions],
            notifications: pushNotification(
              state.notifications,
              "PROVIDER",
              booking.providerId,
              "PAYOUT_RELEASED",
              { amount: booking.wage },
              id
            ),
          };
        });
      },

      giveNotice: (bookingId) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking || !canTransitionContract(booking.status, "GIVE_NOTICE")) return state;
          const status = nextStatusContract(booking.status, "GIVE_NOTICE");
          return {
            bookings: state.bookings.map((b) =>
              b.id === bookingId ? { ...b, status, noticeGivenAt: nowIso(), updatedAt: nowIso() } : b
            ),
          };
        });
      },

      cancelOffer: (bookingId) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking || !canTransitionContract(booking.status, "CANCEL")) return state;
          const status = nextStatusContract(booking.status, "CANCEL");
          const loyaltyHistory = removeUnfundedMonthsForContract(
            state.loyaltyHistory,
            booking.employerId,
            booking.id
          );
          return {
            bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, status, updatedAt: nowIso() } : b)),
            loyaltyHistory,
          };
        });
      },

      terminateContract: (bookingId, reason) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking || !canTransitionContract(booking.status, "TERMINATE")) return state;
          const status = nextStatusContract(booking.status, "TERMINATE");
          const timestamp = nowIso();

          let transactions = state.transactions;
          const current = findCurrentPeriod(booking);
          let periods = booking.periods;

          // BR-CAN-2: if the current period is already funded but not yet released, prorate it
          // by days actually worked (Monthly schedules only — see src/domain/ASSUMPTIONS.md).
          if (
            current &&
            current.status === "FUNDED" &&
            booking.scheduleType === "MONTHLY" &&
            current.commissionLines.length === 1
          ) {
            const line = current.commissionLines[0];
            const totalDays = Math.max(1, Math.min(31, 1 + (Date.parse(current.endDate) - Date.parse(current.startDate)) / 86_400_000));
            const actualDays = Math.max(
              0,
              Math.min(totalDays, 1 + (Date.parse(state.demoDate) - Date.parse(current.startDate)) / 86_400_000)
            );
            const prorated = prorateFinalContractMonth(
              line.wage,
              Math.round(actualDays),
              Math.round(totalDays),
              line.loyaltyMonthNumber,
              SRS_V2_FEE_CONFIG
            );
            const refundAmount = current.employerPaysTotal - (prorated.wage + prorated.commission);
            const payoutTxn: Transaction = {
              id: uid("txn"),
              type: "PAYOUT",
              bookingId,
              amount: prorated.wage,
              description: "Prorated final payout on termination",
              descriptionFr: "Paiement final proratisé à la résiliation",
              timestamp,
              reference: fakeReference(),
            };
            const refundTxn: Transaction = {
              id: uid("txn"),
              type: "REFUND",
              bookingId,
              amount: Math.max(0, refundAmount),
              description: "Refund of unused wage and commission on termination",
              descriptionFr: "Remboursement du salaire et de la commission non utilisés à la résiliation",
              timestamp,
              reference: fakeReference(),
            };
            transactions = [refundTxn, payoutTxn, ...transactions];
            periods = periods.map((p) =>
              p.id === current.id ? { ...p, status: nextStatusPeriod("RELEASING", "PAYOUT_CONFIRMED") } : p
            );
          }

          // Cancel every still-cancellable future period (SCHEDULED/AWAITING_FUNDING).
          periods = periods.map((p) =>
            canTransitionPeriod(p.status, "CANCEL") ? { ...p, status: nextStatusPeriod(p.status, "CANCEL") } : p
          );

          const loyaltyHistory = removeUnfundedMonthsForContract(
            state.loyaltyHistory,
            booking.employerId,
            booking.id
          );

          return {
            bookings: state.bookings.map((b) =>
              b.id === bookingId
                ? { ...b, status, periods, terminationReason: reason, updatedAt: timestamp }
                : b
            ),
            loyaltyHistory,
            transactions,
            notifications: pushNotification(
              state.notifications,
              "PROVIDER",
              booking.providerId,
              "REPLACEMENT_OFFERED",
              {},
              bookingId
            ),
          };
        });
      },

      requestReplacement: (bookingId, newProviderId) => {
        const state = get();
        const original = state.bookings.find((b) => b.id === bookingId);
        if (!original) throw new Error("Original booking not found");

        const id = uid("booking");
        const timestamp = nowIso();
        const replacement: Booking = {
          ...original,
          id,
          providerId: newProviderId,
          status: "OFFER_SENT",
          startDate: state.demoDate,
          periods: [],
          offerRounds: 0,
          employerSignature: { signed: false, fullName: null, timestamp: null },
          providerSignature: { signed: false, fullName: null, timestamp: null },
          messages: [],
          replacementOfBookingId: bookingId,
          terminationReason: undefined,
          review: undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((s) => ({
          bookings: [replacement, ...s.bookings],
          notifications: pushNotification(
            s.notifications,
            "PROVIDER",
            newProviderId,
            "NEW_OFFER",
            { name: s.employer.name },
            id
          ),
        }));

        return id;
      },

      raiseDispute: (bookingId, periodId, role, category, description) => {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId);
          if (!booking) return state;

          let periods = booking.periods;
          if (periodId) {
            const period = booking.periods.find((p) => p.id === periodId);
            if (!period || !canTransitionPeriod(period.status, "RAISE_DISPUTE")) return state;
            periods = booking.periods.map((p) =>
              p.id === periodId ? { ...p, status: nextStatusPeriod(p.status, "RAISE_DISPUTE"), disputeId: undefined } : p
            );
          }

          const disputeId = uid("dispute");
          const dispute: Dispute = {
            id: disputeId,
            bookingId,
            periodId,
            raisedBy: role,
            category,
            description,
            status: "OPEN",
            createdAt: nowIso(),
          };
          if (periodId) {
            periods = periods.map((p) => (p.id === periodId ? { ...p, disputeId } : p));
          }

          const otherRole: Role = role === "EMPLOYER" ? "PROVIDER" : "EMPLOYER";
          const otherUserId = otherRole === "EMPLOYER" ? booking.employerId : booking.providerId;

          return {
            bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, periods, updatedAt: nowIso() } : b)),
            disputes: [dispute, ...state.disputes],
            notifications: pushNotification(state.notifications, otherRole, otherUserId, "DISPUTE_RAISED", {}, bookingId),
          };
        });
      },

      resolveDispute: (disputeId, decision, refundAmount) => {
        set((state) => {
          const dispute = state.disputes.find((d) => d.id === disputeId);
          if (!dispute || dispute.status !== "OPEN") return state;
          const booking = state.bookings.find((b) => b.id === dispute.bookingId);
          if (!booking) return state;

          const outcome: DisputeOutcome = decision;
          const timestamp = nowIso();
          let transactions = state.transactions;
          let loyaltyHistory = state.loyaltyHistory;
          let periods = booking.periods;

          if (dispute.periodId) {
            const period = booking.periods.find((p) => p.id === dispute.periodId);
            if (period && canTransitionPeriod(period.status, "DECIDE_DISPUTE", { disputeOutcome: outcome })) {
              let newStatus = nextStatusPeriod(period.status, "DECIDE_DISPUTE", { disputeOutcome: outcome });
              if (newStatus === "RELEASING") {
                newStatus = nextStatusPeriod("RELEASING", "PAYOUT_CONFIRMED");
                transactions = [
                  {
                    id: uid("txn"),
                    type: "PAYOUT",
                    bookingId: booking.id,
                    amount: period.wageTotal,
                    description: "Payout released after dispute decision",
                    descriptionFr: "Paiement libéré après décision de litige",
                    timestamp,
                    reference: fakeReference(),
                  },
                  ...transactions,
                ];
              } else {
                const amount = refundAmount ?? (decision === "FULL_REFUND" ? period.employerPaysTotal : 0);
                transactions = [
                  {
                    id: uid("txn"),
                    type: "REFUND",
                    bookingId: booking.id,
                    amount,
                    description: "Refund issued after dispute decision",
                    descriptionFr: "Remboursement émis après décision de litige",
                    timestamp,
                    reference: fakeReference(),
                  },
                  ...transactions,
                ];
                if (decision === "FULL_REFUND") {
                  for (const line of period.commissionLines) {
                    loyaltyHistory = markLoyaltyMonthRemoved(
                      loyaltyHistory,
                      booking.employerId,
                      booking.id,
                      line.contractMonthNumber
                    );
                  }
                }
              }
              periods = booking.periods.map((p) => (p.id === period.id ? { ...p, status: newStatus } : p));
            }
          }

          const otherUserId = dispute.raisedBy === "EMPLOYER" ? booking.employerId : booking.providerId;
          const otherRole: Role = dispute.raisedBy === "EMPLOYER" ? "EMPLOYER" : "PROVIDER";

          return {
            bookings: state.bookings.map((b) => (b.id === booking.id ? { ...b, periods, updatedAt: timestamp } : b)),
            disputes: state.disputes.map((d) =>
              d.id === disputeId ? { ...d, status: "RESOLVED", decision, refundAmount, resolvedAt: timestamp } : d
            ),
            loyaltyHistory,
            transactions,
            notifications: pushNotification(state.notifications, otherRole, otherUserId, "DISPUTE_RESOLVED", {}, booking.id),
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
            notifications: pushNotification(state.notifications, otherRole, otherUserId, "NEW_MESSAGE", { name: senderName }, bookingId),
          };
        });
      },

      advanceDemoClock: (days) => {
        const state = get();
        const newDate = addDays(state.demoDate, days);
        get().setDemoDateTo(newDate);
      },

      setDemoDateTo: (iso) => {
        set((state) => {
          let transactions = state.transactions;
          let notifications = state.notifications;
          const loyaltyHistory = state.loyaltyHistory;

          const bookings = state.bookings.map((booking) => {
            if (booking.contractKind === "SHORT_JOB") {
              if (booking.status === "FUNDED") {
                const fundedAt = Date.parse(booking.updatedAt);
                const hoursSinceFunded = (Date.parse(`${iso}T00:00:00.000Z`) - fundedAt) / 3_600_000;
                const hasOpenDispute = state.disputes.some((d) => d.bookingId === booking.id && d.status === "OPEN");
                if (hoursSinceFunded >= 48 && !hasOpenDispute) {
                  const status = nextStatusContract(booking.status, "CONFIRM");
                  transactions = [
                    {
                      id: uid("txn"),
                      type: "PAYOUT",
                      bookingId: booking.id,
                      amount: booking.wage,
                      description: "Payout, short job auto-confirmed",
                      descriptionFr: "Paiement, travail ponctuel auto-confirmé",
                      timestamp: nowIso(),
                      reference: fakeReference(),
                    },
                    ...transactions,
                  ];
                  notifications = pushNotification(
                    notifications,
                    "PROVIDER",
                    booking.providerId,
                    "PAYOUT_RELEASED",
                    { amount: booking.wage },
                    booking.id
                  );
                  return { ...booking, status, updatedAt: nowIso() };
                }
              }
              return booking;
            }

            let bookingStatus = booking.status;
            const periods = booking.periods.map((period) => {
              let next = period;
              if (next.status === "AWAITING_FUNDING" && iso > next.fundingWindowEndDate) {
                next = { ...next, status: nextStatusPeriod(next.status, "OVERDUE") };
                notifications = pushNotification(
                  notifications,
                  "PROVIDER",
                  booking.providerId,
                  "PERIOD_OVERDUE",
                  {},
                  booking.id
                );
                if (bookingStatus === "ACTIVE") {
                  bookingStatus = nextStatusContract(bookingStatus, "OVERDUE_SUSPEND");
                }
              }
              if (next.status === "FUNDED" && iso >= next.paymentDate) {
                const releasing = nextStatusPeriod(next.status, "REACH_PAYMENT_DATE");
                next = { ...next, status: nextStatusPeriod(releasing, "PAYOUT_CONFIRMED") };
                transactions = [
                  {
                    id: uid("txn"),
                    type: "PAYOUT",
                    bookingId: booking.id,
                    amount: next.wageTotal,
                    description: `Payout to provider, period ${next.periodNumber}`,
                    descriptionFr: `Paiement au prestataire, période ${next.periodNumber}`,
                    timestamp: nowIso(),
                    reference: fakeReference(),
                  },
                  ...transactions,
                ];
                notifications = pushNotification(
                  notifications,
                  "PROVIDER",
                  booking.providerId,
                  "PAYOUT_RELEASED",
                  { amount: next.wageTotal },
                  booking.id
                );
              }
              return next;
            });

            const allReleased = periods.length > 0 && periods.every((p) => p.status === "RELEASED");
            if (allReleased && (bookingStatus === "ACTIVE" || bookingStatus === "ENDING")) {
              bookingStatus = nextStatusContract(bookingStatus, "COMPLETE");
              notifications = pushNotification(
                notifications,
                "PROVIDER",
                booking.providerId,
                "CONTRACT_COMPLETED",
                {},
                booking.id
              );
            }

            return { ...booking, status: bookingStatus, periods, updatedAt: nowIso() };
          });

          return { demoDate: iso, bookings, transactions, notifications, loyaltyHistory };
        });
      },

      setEmployerLoyaltyMonth: (targetFundedMonths) => {
        set((state) => {
          const employerId = EMPLOYER_ID;
          const current = nextLoyaltyMonthNumber(state.loyaltyHistory, employerId) - 1;
          if (targetFundedMonths <= current) return state;
          const additions: LoyaltyMonthRecord[] = Array.from(
            { length: targetFundedMonths - current },
            (_, i) => ({
              loyaltyMonthNumber: current + i + 1,
              employerId,
              contractId: "demo-panel-backfill",
              contractMonthNumber: current + i + 1,
              monthStartDate: state.demoDate,
              state: "FUNDED" as const,
            })
          );
          return { loyaltyHistory: [...state.loyaltyHistory, ...additions] };
        });
      },

      markAllNotificationsRead: (audience, userId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.audience === audience && (n.userId === null || n.userId === userId) ? { ...n, read: true } : n
          ),
        }));
      },

      resetDemoData: () => {
        set(() => ({ ...buildInitialDomainState() }));
      },
    }),
    {
      name: "proaid-demo-store-v2",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        language: state.language,
        role: state.role,
        demoDate: state.demoDate,
        providers: state.providers,
        employer: state.employer,
        bookings: state.bookings,
        loyaltyHistory: state.loyaltyHistory,
        transactions: state.transactions,
        disputes: state.disputes,
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

export { buildAdminStats, findCurrentPeriod };
