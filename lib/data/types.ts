import type { ContractKind } from "@/src/domain/fees";
import type { OfferContractStatus } from "@/src/domain/offerContract";
import type { PaymentPeriod } from "@/src/domain/schedule";

export type Role = "EMPLOYER" | "PROVIDER" | "ADMIN";

export type City = "DOUALA" | "BAMENDA";

export type Category =
  | "NANNY"
  | "HOUSE_HELP"
  | "COOK"
  | "ELDERLY_CAREGIVER"
  | "HOUSEMATE_SUPPORT";

export type Neighbourhood =
  // Douala
  | "BONAPRISO"
  | "AKWA"
  | "BONANJO"
  | "BONAMOUSSADI"
  | "MAKEPE"
  | "KOTTO"
  | "LOGPOM"
  | "DEIDO"
  | "BONABERI"
  | "NDOGBONG"
  // Bamenda
  | "UP_STATION"
  | "NKWEN"
  | "OLD_TOWN"
  | "MANKON"
  | "NTARIKON";

export type WorkType = "LIVE_IN" | "LIVE_OUT" | "PART_TIME";

export type SpokenLanguage = "ENGLISH" | "FRENCH" | "PIDGIN";

export type Availability = "AVAILABLE" | "ENGAGED" | "UNAVAILABLE";

/** SRS §7.1 Provider Verification states. */
export type ProviderStatus =
  | "PROFILE_INCOMPLETE"
  | "SUBMITTED"
  | "INTERVIEW_SCHEDULED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RENEWAL_REQUIRED"
  | "SUSPENDED";

export type VettingCheckResult = "PASS" | "FAIL" | "NOT_APPLICABLE" | "PENDING";

/** FR-KYC-03: the six-check vetting checklist an officer records. */
export interface VettingChecklist {
  identityConfirmed: VettingCheckResult;
  criminalRecordClear: VettingCheckResult;
  referee1Confirmed: VettingCheckResult;
  referee2Confirmed: VettingCheckResult;
  medicalFitness: VettingCheckResult;
  skillsConfirmed: VettingCheckResult;
}

export interface Referee {
  name: string;
  phone: string;
  relationship: string;
  yearsKnown: number;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  commentFr: string;
  date: string; // ISO date
}

export interface SubmittedDocument {
  id: string;
  labelKey: string; // dictionary key, e.g. "docs.idCard"
  status: "SUBMITTED" | "MISSING";
  expiresOn?: string; // ISO date, for criminal record extract / medical certificate (FR-KYC-05)
}

export interface Provider {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  category: Category;
  city: City;
  neighbourhood: Neighbourhood;
  yearsExperience: number;
  languages: SpokenLanguage[];
  workType: WorkType;
  monthlyRate: number; // XAF; for cleaners/short jobs this is a per-job rate
  isPerJobRate: boolean;
  bio: string;
  bioFr: string;
  skills: string[];
  skillsFr: string[];
  vetting: VettingChecklist;
  referees: Referee[];
  rating: number;
  reviews: Review[];
  status: ProviderStatus;
  availability: Availability;
  interviewSlot?: string; // ISO datetime, once booked (FR-KYC-02)
  rejectionReason?: string;
  phone: string;
  momoNumber: string;
  documents: SubmittedDocument[];
}

export interface Employer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  city: City;
  neighbourhood: Neighbourhood;
  phone: string;
  shortlistedProviderIds: string[];
}

export interface JobRequest {
  id: string;
  employerId: string;
  category: Category;
  city: City;
  startDate: string;
  workType: WorkType;
  wageOffered: number;
  description: string;
  createdAt: string;
  expiresAt: string;
  interestedProviderIds: string[];
}

export interface Message {
  id: string;
  senderRole: Role;
  senderName: string;
  text: string;
  /** French variant for seeded demo messages. User-typed messages omit this and just show `text`. */
  textFr?: string;
  timestamp: string; // ISO datetime
}

export interface SignatureRecord {
  signed: boolean;
  fullName: string | null;
  timestamp: string | null;
  /** The OTP code shown on-screen at the moment of signing (simulated — FR-CON-01). */
  otpCode?: string | null;
}

/** A payment period as stored on a booking: the domain's pure PaymentPeriod plus store-level identity. */
export interface StoredPaymentPeriod extends PaymentPeriod {
  id: string;
  disputeId?: string;
}

export type ScheduleType = "MONTHLY" | "HALF_AND_HALF";

export interface Booking {
  id: string;
  providerId: string;
  employerId: string;
  category: Category;
  contractKind: ContractKind; // SHORT_JOB | LONG_CONTRACT
  scheduleType?: ScheduleType; // LONG_CONTRACT only
  status: OfferContractStatus;
  startDate: string; // ISO date
  durationMonths: number; // 1 for a short job
  endDate?: string; // required for HALF_AND_HALF; optional/open-ended for MONTHLY (OD-13)
  openEnded?: boolean;
  /** Per-month wage for a long contract; the one-time total wage for a short job. */
  wage: number;
  notes: string;
  employerSignature: SignatureRecord;
  providerSignature: SignatureRecord;
  messages: Message[];
  /** Long contracts only — short jobs track money via `status` alone (BR-PAY-7). */
  periods: StoredPaymentPeriod[];
  offerRounds: number; // counter-offer rounds used so far (max 3, FR-OFF rules)
  noticeGivenAt?: string;
  replacementOfBookingId?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
  review?: {
    rating: number;
    comment: string;
    date: string;
  };
}

export type DisputeCategory =
  | "NON_PAYMENT"
  | "UNSAFE_CONDITIONS"
  | "BREACH_OF_CONTRACT"
  | "SERVICE_QUALITY"
  | "OTHER";

export type DisputeDecisionOutcome = "FULL_RELEASE" | "PARTIAL_RELEASE_WITH_REFUND" | "FULL_REFUND";

/**
 * A simplified stand-in for SRS §7.4's full Dispute state machine (Open -> In Review ->
 * Mediation -> Resolved -> Appeal -> Closed): the demo goes straight from Open to Resolved with
 * one decision. This is a deliberate demo-scope simplification, not a claim that the full state
 * machine exists in src/domain — it doesn't yet (tracked in docs/ITERATION_1B.md).
 */
export interface Dispute {
  id: string;
  bookingId: string;
  /** For a long contract, the StoredPaymentPeriod.id on hold; undefined for a short job. */
  periodId?: string;
  raisedBy: Role;
  category: DisputeCategory;
  description: string;
  status: "OPEN" | "RESOLVED";
  decision?: DisputeDecisionOutcome;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

export type TransactionType = "FUNDING" | "COMMISSION" | "PAYOUT" | "REFUND";

export interface Transaction {
  id: string;
  type: TransactionType;
  bookingId: string | null;
  amount: number;
  description: string;
  descriptionFr: string;
  timestamp: string;
  reference: string;
}

export type NotificationKind =
  | "PROVIDER_ACCEPTED"
  | "PROVIDER_DECLINED"
  | "PROVIDER_COUNTERED"
  | "CONTRACT_SIGNED"
  | "PERIOD_FUNDED"
  | "PERIOD_OVERDUE"
  | "PAYOUT_RELEASED"
  | "CONTRACT_COMPLETED"
  | "NEW_MESSAGE"
  | "PROVIDER_APPROVED"
  | "PROVIDER_REJECTED"
  | "NEW_OFFER"
  | "LOYALTY_LEVEL_UP"
  | "DISPUTE_RAISED"
  | "DISPUTE_RESOLVED"
  | "REPLACEMENT_OFFERED";

/** Notifications store structured data, not rendered text, so they stay correctly
 * translated even if the user switches language after the notification was created. */
export interface AppNotification {
  id: string;
  audience: Role;
  userId: string | null; // the specific provider/employer this notification is for
  kind: NotificationKind;
  params: { name?: string; amount?: number; level?: number };
  timestamp: string;
  read: boolean;
  bookingId?: string;
}

export interface PlacementStat {
  month: string; // e.g. "2026-05"
  placements: number;
}

export interface CommissionStat {
  month: string;
  commission: number;
}

export interface AdminStats {
  placementsPerMonth: PlacementStat[];
  commissionPerMonth: CommissionStat[];
  totalContractValue: number;
  totalCommission: number;
  activeProviders: number;
  pendingVerifications: number;
  overduePeriods: number;
  openDisputes: number;
}

export type { ContractKind } from "@/src/domain/fees";
export type { LoyaltyMonthRecord } from "@/src/domain/loyalty";
export type { OfferContractStatus } from "@/src/domain/offerContract";
export type { PaymentPeriodStatus } from "@/src/domain/paymentPeriod";
