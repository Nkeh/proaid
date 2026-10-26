import type { BookingStatus } from "../booking";
import type { ContractType } from "../fees";

export type Role = "EMPLOYER" | "PROVIDER" | "ADMIN";

export type Category =
  | "NANNY"
  | "HOUSE_HELP"
  | "COOK"
  | "ELDERLY_CAREGIVER"
  | "HOUSEMATE_SUPPORT";

export type Neighbourhood =
  | "BONAPRISO"
  | "AKWA"
  | "BONANJO"
  | "BONAMOUSSADI"
  | "MAKEPE"
  | "KOTTO"
  | "LOGPOM"
  | "DEIDO"
  | "BONABERI"
  | "NDOGBONG";

export type WorkType = "LIVE_IN" | "LIVE_OUT" | "PART_TIME";

export type SpokenLanguage = "ENGLISH" | "FRENCH" | "PIDGIN";

export type ProviderStatus = "APPROVED" | "PENDING_VERIFICATION" | "REJECTED";

export interface VerificationChecklist {
  idVerified: boolean;
  referencesConfirmed: boolean;
  medicalCertificate: boolean;
  skillsCheck: boolean;
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
}

export interface Provider {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  category: Category;
  neighbourhood: Neighbourhood;
  yearsExperience: number;
  languages: SpokenLanguage[];
  workType: WorkType;
  monthlyRate: number; // XAF; for cleaners this is a per-job rate
  isPerJobRate: boolean;
  bio: string;
  bioFr: string;
  skills: string[];
  skillsFr: string[];
  verification: VerificationChecklist;
  rating: number;
  reviews: Review[];
  status: ProviderStatus;
  phone: string;
  momoNumber: string;
  documents: SubmittedDocument[];
}

export interface Employer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  neighbourhood: Neighbourhood;
  phone: string;
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
}

export interface Booking {
  id: string;
  providerId: string;
  employerId: string;
  category: Category;
  contractType: ContractType;
  status: BookingStatus;
  startDate: string; // ISO date
  durationMonths: number; // 1 for short-term
  currentMonth: number; // 1-indexed
  amount: number; // agreed amount per month, or total for short-term
  notes: string;
  employerSignature: SignatureRecord;
  providerSignature: SignatureRecord;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  review?: {
    rating: number;
    comment: string;
    date: string;
  };
}

export type TransactionType = "FUNDING" | "FEE" | "PAYOUT";

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

export interface Wallet {
  balance: number;
  escrowHeld: number;
  transactions: Transaction[];
}

export type NotificationKind =
  | "PROVIDER_ACCEPTED"
  | "PROVIDER_DECLINED"
  | "CONTRACT_SIGNED"
  | "WALLET_FUNDED"
  | "PAYOUT_RELEASED"
  | "SERVICE_CONFIRMED"
  | "BOOKING_COMPLETED"
  | "NEW_MESSAGE"
  | "PROVIDER_APPROVED"
  | "PROVIDER_REJECTED"
  | "NEW_REQUEST";

/** Notifications store structured data, not rendered text, so they stay correctly
 * translated even if the user switches language after the notification was created. */
export interface AppNotification {
  id: string;
  audience: Role;
  userId: string | null; // the specific provider/employer this notification is for
  kind: NotificationKind;
  params: { name?: string; amount?: number };
  timestamp: string;
  read: boolean;
  bookingId?: string;
}

export interface PlacementStat {
  month: string; // e.g. "2026-05"
  label: string; // short label e.g. "May"
  placements: number;
}

export interface FeeStat {
  month: string;
  label: string;
  fees: number;
}

export interface AdminStats {
  placementsPerMonth: PlacementStat[];
  feesPerMonth: FeeStat[];
  totalContractValue: number;
  totalPlatformFees: number;
  activeProviders: number;
  pendingVerifications: number;
}
