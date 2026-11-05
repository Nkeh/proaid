import { SRS_V2_FEE_CONFIG, calculateShortJobFee } from "@/src/domain/fees";
import type { LoyaltyMonthRecord } from "@/src/domain/loyalty";
import { addDays, addMonthsClamped, generateMonthlyPeriods } from "@/src/domain/schedule";
import type {
  AdminStats,
  Booking,
  CommissionStat,
  Employer,
  PlacementStat,
  Provider,
  Referee,
  SubmittedDocument,
  Transaction,
  VettingChecklist,
} from "./types";

/** The demo's fixed "business clock" default — see store/useAppStore.ts's `demoDate`. */
export const DEMO_TODAY = "2026-11-05";

const AVATAR_COLORS = [
  "#0F5E5A",
  "#E8A33D",
  "#4F9B96",
  "#C97F1F",
  "#8AA6A4",
  "#B5651D",
  "#2F6E6A",
  "#D98E2B",
];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function colorFor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]!;
}

function daysAgoFrom(today: string, n: number): string {
  // today is "YYYY-MM-DD"; this only needs to produce a plausible past ISO date for seed display,
  // so a simple calendar-day subtraction via Date is acceptable here (seed data, not domain logic).
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

const FULL_VETTING: VettingChecklist = {
  identityConfirmed: "PASS",
  criminalRecordClear: "PASS",
  referee1Confirmed: "PASS",
  referee2Confirmed: "PASS",
  medicalFitness: "PASS",
  skillsConfirmed: "PASS",
};

const PARTIAL_VETTING: VettingChecklist = {
  identityConfirmed: "PASS",
  criminalRecordClear: "PENDING",
  referee1Confirmed: "PENDING",
  referee2Confirmed: "PENDING",
  medicalFitness: "PENDING",
  skillsConfirmed: "PENDING",
};

const DEFAULT_REFEREES: Referee[] = [
  { name: "Referee One", phone: "+237 650 00 00 01", relationship: "Former employer", yearsKnown: 3 },
  { name: "Referee Two", phone: "+237 650 00 00 02", relationship: "Family friend", yearsKnown: 5 },
];

function approvedDocuments(): SubmittedDocument[] {
  return [
    { id: "idCard", labelKey: "idCard", status: "SUBMITTED" },
    { id: "criminalRecord", labelKey: "criminalRecord", status: "SUBMITTED", expiresOn: "2027-06-01" },
    { id: "medicalCertificate", labelKey: "medicalCertificate", status: "SUBMITTED", expiresOn: "2027-06-01" },
  ];
}

function pendingDocuments(): SubmittedDocument[] {
  return [
    { id: "idCard", labelKey: "idCard", status: "SUBMITTED" },
    { id: "criminalRecord", labelKey: "criminalRecord", status: "MISSING" },
    { id: "medicalCertificate", labelKey: "medicalCertificate", status: "MISSING" },
  ];
}

interface ProviderSeed {
  name: string;
  category: Provider["category"];
  city: Provider["city"];
  neighbourhood: Provider["neighbourhood"];
  yearsExperience: number;
  languages: Provider["languages"];
  workType: Provider["workType"];
  monthlyRate: number;
  isPerJobRate?: boolean;
  bio: string;
  bioFr: string;
  skills: string[];
  skillsFr: string[];
  rating: number;
  status?: Provider["status"];
  availability?: Provider["availability"];
  reviews: {
    authorName: string;
    rating: number;
    comment: string;
    commentFr: string;
    daysAgo: number;
  }[];
  phone: string;
}

const PROVIDER_SEEDS: ProviderSeed[] = [
  {
    name: "Grace Mbah",
    category: "NANNY",
    city: "DOUALA",
    neighbourhood: "BONAMOUSSADI",
    yearsExperience: 6,
    languages: ["ENGLISH", "FRENCH", "PIDGIN"],
    workType: "LIVE_OUT",
    monthlyRate: 150_000,
    bio: "Warm, experienced nanny who has cared for children aged 6 months to 10 years. Strong on routine, homework help and first aid.",
    bioFr:
      "Nounou chaleureuse et expérimentée, ayant accompagné des enfants de 6 mois à 10 ans. Solide sur les routines, l'aide aux devoirs et les premiers secours.",
    skills: ["Infant care", "Homework help", "First aid certified", "Meal prep for kids"],
    skillsFr: ["Soins aux nourrissons", "Aide aux devoirs", "Certifiée premiers secours", "Préparation des repas pour enfants"],
    rating: 4.8,
    availability: "ENGAGED",
    reviews: [
      {
        authorName: "Mireille T.",
        rating: 5,
        comment: "Grace has been with our twins for over a year. Patient, punctual, and the kids adore her.",
        commentFr: "Grace s'occupe de nos jumeaux depuis plus d'un an. Patiente, ponctuelle, et les enfants l'adorent.",
        daysAgo: 40,
      },
      {
        authorName: "Paul K.",
        rating: 5,
        comment: "Excellent communication and very trustworthy. Highly recommend.",
        commentFr: "Excellente communication et très fiable. Je recommande vivement.",
        daysAgo: 95,
      },
    ],
    phone: "+237 677 12 34 56",
  },
  {
    name: "Solange Fomekong",
    category: "NANNY",
    city: "DOUALA",
    neighbourhood: "BONAPRISO",
    yearsExperience: 4,
    languages: ["FRENCH", "PIDGIN"],
    workType: "LIVE_IN",
    monthlyRate: 90_000,
    bio: "Gentle, live-in nanny experienced with toddlers and newborns. Comfortable managing a full daily routine.",
    bioFr: "Nounou logée, douce et expérimentée avec les tout-petits et les nouveau-nés. À l'aise pour gérer une routine quotidienne complète.",
    skills: ["Newborn care", "Potty training", "Light housekeeping"],
    skillsFr: ["Soins aux nouveau-nés", "Apprentissage de la propreté", "Ménage léger"],
    rating: 4.6,
    reviews: [
      {
        authorName: "Hervé D.",
        rating: 5,
        comment: "Solange moved in with us and it's been a smooth transition for our baby.",
        commentFr: "Solange s'est installée chez nous et la transition a été facile pour notre bébé.",
        daysAgo: 60,
      },
    ],
    phone: "+237 691 22 33 44",
  },
  {
    name: "Blandine Ngo Bitang",
    category: "NANNY",
    city: "DOUALA",
    neighbourhood: "AKWA",
    yearsExperience: 8,
    languages: ["ENGLISH", "FRENCH", "PIDGIN"],
    workType: "LIVE_IN",
    monthlyRate: 130_000,
    bio: "Senior nanny with 8 years across three households, specialising in school-age children and homework support.",
    bioFr: "Nounou senior avec 8 ans d'expérience dans trois foyers, spécialisée dans les enfants d'âge scolaire et le soutien aux devoirs.",
    skills: ["School-age supervision", "Tutoring basics", "Meal planning"],
    skillsFr: ["Supervision scolaire", "Bases du soutien scolaire", "Planification des repas"],
    rating: 4.9,
    status: "UNDER_REVIEW",
    reviews: [
      {
        authorName: "Chantal M.",
        rating: 5,
        comment: "Worked with Blandine at a previous family - extremely dependable.",
        commentFr: "J'ai travaillé avec Blandine dans une précédente famille - extrêmement fiable.",
        daysAgo: 300,
      },
    ],
    phone: "+237 655 44 55 66",
  },
  {
    name: "Marthe Ngassa",
    category: "HOUSE_HELP",
    city: "DOUALA",
    neighbourhood: "DEIDO",
    yearsExperience: 5,
    languages: ["FRENCH", "PIDGIN"],
    workType: "PART_TIME",
    monthlyRate: 25_000,
    isPerJobRate: true,
    bio: "Efficient part-time cleaner, available for deep cleans and regular upkeep of apartments and houses.",
    bioFr: "Agent d'entretien efficace à temps partiel, disponible pour des nettoyages approfondis et l'entretien régulier d'appartements et de maisons.",
    skills: ["Deep cleaning", "Laundry & ironing", "Organising"],
    skillsFr: ["Nettoyage en profondeur", "Lessive et repassage", "Organisation"],
    rating: 4.4,
    reviews: [
      {
        authorName: "Yves B.",
        rating: 4,
        comment: "Does a thorough job every time, flexible with scheduling.",
        commentFr: "Fait un travail minutieux à chaque fois, flexible sur les horaires.",
        daysAgo: 20,
      },
    ],
    phone: "+237 699 55 66 77",
  },
  {
    name: "Odette Kemadjou",
    category: "HOUSE_HELP",
    city: "DOUALA",
    neighbourhood: "BONABERI",
    yearsExperience: 2,
    languages: ["FRENCH"],
    workType: "LIVE_OUT",
    monthlyRate: 60_000,
    bio: "Reliable house help focused on daily cleaning and laundry for busy households.",
    bioFr: "Aide ménagère fiable, spécialisée dans le nettoyage quotidien et la lessive pour les foyers occupés.",
    skills: ["Daily cleaning", "Laundry", "Dishwashing"],
    skillsFr: ["Nettoyage quotidien", "Lessive", "Vaisselle"],
    rating: 4.2,
    reviews: [
      {
        authorName: "Fabrice O.",
        rating: 4,
        comment: "Good value, still building experience but very willing.",
        commentFr: "Bon rapport qualité-prix, encore en apprentissage mais très volontaire.",
        daysAgo: 10,
      },
    ],
    phone: "+237 678 66 77 88",
  },
  {
    name: "Pauline Essomba",
    category: "HOUSE_HELP",
    city: "DOUALA",
    neighbourhood: "KOTTO",
    yearsExperience: 7,
    languages: ["ENGLISH", "FRENCH", "PIDGIN"],
    workType: "LIVE_OUT",
    monthlyRate: 70_000,
    bio: "Highly organised housekeeper with 7 years managing large homes, including inventory and light cooking.",
    bioFr: "Femme de ménage très organisée avec 7 ans d'expérience dans la gestion de grandes maisons, y compris l'inventaire et la cuisine légère.",
    skills: ["Household management", "Inventory tracking", "Light cooking"],
    skillsFr: ["Gestion du foyer", "Suivi des stocks", "Cuisine légère"],
    rating: 4.7,
    reviews: [
      {
        authorName: "Diane S.",
        rating: 5,
        comment: "Pauline runs our household smoothly - couldn't ask for more.",
        commentFr: "Pauline gère notre foyer sans accroc - on ne pourrait pas demander mieux.",
        daysAgo: 75,
      },
    ],
    phone: "+237 696 77 88 99",
  },
  {
    name: "Jacqueline Ndive",
    category: "COOK",
    city: "DOUALA",
    neighbourhood: "BONANJO",
    yearsExperience: 9,
    languages: ["ENGLISH", "FRENCH"],
    workType: "LIVE_IN",
    monthlyRate: 120_000,
    bio: "Professional home cook with 9 years of experience in Cameroonian and continental cuisine, trained in food hygiene.",
    bioFr: "Cuisinière professionnelle avec 9 ans d'expérience en cuisine camerounaise et continentale, formée à l'hygiène alimentaire.",
    skills: ["Cameroonian cuisine", "Meal planning", "Food hygiene certified"],
    skillsFr: ["Cuisine camerounaise", "Planification des repas", "Certifiée en hygiène alimentaire"],
    rating: 4.9,
    availability: "ENGAGED",
    reviews: [
      {
        authorName: "Esther N.",
        rating: 5,
        comment: "Jacqueline's ndolé is the best we've had - always on time and spotless kitchen.",
        commentFr: "Le ndolé de Jacqueline est le meilleur qu'on ait mangé - toujours à l'heure et une cuisine impeccable.",
        daysAgo: 25,
      },
    ],
    phone: "+237 674 88 99 00",
  },
  {
    name: "Florence Abena",
    category: "COOK",
    city: "DOUALA",
    neighbourhood: "LOGPOM",
    yearsExperience: 3,
    languages: ["FRENCH", "PIDGIN"],
    workType: "PART_TIME",
    monthlyRate: 65_000,
    bio: "Part-time cook specialising in quick, healthy weekday meals for families.",
    bioFr: "Cuisinière à temps partiel spécialisée dans les repas sains et rapides pour familles en semaine.",
    skills: ["Quick healthy meals", "Meal prepping", "Budget shopping"],
    skillsFr: ["Repas sains et rapides", "Préparation à l'avance", "Achats maîtrisés"],
    rating: 4.3,
    reviews: [
      {
        authorName: "Sonia K.",
        rating: 4,
        comment: "Good variety of dishes within our budget.",
        commentFr: "Bonne variété de plats dans notre budget.",
        daysAgo: 15,
      },
    ],
    phone: "+237 697 99 00 11",
  },
  {
    name: "Agnes Tabe",
    category: "ELDERLY_CAREGIVER",
    city: "DOUALA",
    neighbourhood: "BONAMOUSSADI",
    yearsExperience: 10,
    languages: ["ENGLISH", "FRENCH", "PIDGIN"],
    workType: "LIVE_IN",
    monthlyRate: 160_000,
    bio: "Certified caregiver with 10 years supporting elderly clients, including mobility assistance and medication reminders.",
    bioFr: "Aidante certifiée avec 10 ans d'expérience auprès de personnes âgées, y compris l'aide à la mobilité et les rappels de médicaments.",
    skills: ["Mobility assistance", "Medication reminders", "Companionship"],
    skillsFr: ["Aide à la mobilité", "Rappels de médicaments", "Compagnie"],
    rating: 5.0,
    reviews: [
      {
        authorName: "Rodrigue F.",
        rating: 5,
        comment: "Agnes cares for my mother with incredible patience and professionalism.",
        commentFr: "Agnes s'occupe de ma mère avec une patience et un professionnalisme incroyables.",
        daysAgo: 55,
      },
    ],
    phone: "+237 654 11 22 33",
  },
  {
    name: "Celestine Mballa",
    category: "ELDERLY_CAREGIVER",
    city: "DOUALA",
    neighbourhood: "MAKEPE",
    yearsExperience: 6,
    languages: ["FRENCH", "PIDGIN"],
    workType: "LIVE_IN",
    monthlyRate: 140_000,
    bio: "Compassionate live-in caregiver experienced with post-surgery recovery and daily living assistance.",
    bioFr: "Aidante logée et bienveillante, expérimentée dans le suivi post-opératoire et l'assistance à la vie quotidienne.",
    skills: ["Post-surgery care", "Daily living assistance", "Light meal prep"],
    skillsFr: ["Soins post-opératoires", "Assistance à la vie quotidienne", "Préparation de repas légers"],
    rating: 4.8,
    reviews: [
      {
        authorName: "Innocent T.",
        rating: 5,
        comment: "Took wonderful care of my father during his recovery.",
        commentFr: "A très bien pris soin de mon père pendant sa convalescence.",
        daysAgo: 85,
      },
    ],
    phone: "+237 693 22 33 44",
  },
  {
    name: "Delphine Njoya",
    category: "ELDERLY_CAREGIVER",
    city: "BAMENDA",
    neighbourhood: "NKWEN",
    yearsExperience: 4,
    languages: ["ENGLISH", "FRENCH"],
    workType: "LIVE_OUT",
    monthlyRate: 100_000,
    bio: "Attentive caregiver providing daytime support, including meal prep and accompanying clients to appointments.",
    bioFr: "Aidante attentive proposant un accompagnement en journée, incluant la préparation des repas et l'accompagnement aux rendez-vous.",
    skills: ["Daytime support", "Appointment accompaniment", "Meal prep"],
    skillsFr: ["Accompagnement en journée", "Accompagnement aux rendez-vous", "Préparation des repas"],
    rating: 4.5,
    status: "INTERVIEW_SCHEDULED",
    reviews: [],
    phone: "+237 676 33 44 55",
  },
  {
    name: "Honoré Biya Essiane",
    category: "HOUSEMATE_SUPPORT",
    city: "DOUALA",
    neighbourhood: "BONAPRISO",
    yearsExperience: 3,
    languages: ["ENGLISH", "FRENCH", "PIDGIN"],
    workType: "LIVE_IN",
    monthlyRate: 110_000,
    bio: "Friendly live-in housemate support, helpful for professionals and expatriates who need everyday assistance and company.",
    bioFr: "Soutien de vie partagée amical et logé, utile pour les professionnels et expatriés ayant besoin d'une aide quotidienne et de compagnie.",
    skills: ["Errands & logistics", "Light housekeeping", "Companionship"],
    skillsFr: ["Courses et logistique", "Ménage léger", "Compagnie"],
    rating: 4.4,
    reviews: [
      {
        authorName: "Thierry M.",
        rating: 4,
        comment: "Great help settling in after relocating to Douala.",
        commentFr: "Très bonne aide pour mon installation après mon déménagement à Douala.",
        daysAgo: 30,
      },
    ],
    phone: "+237 698 44 55 66",
  },
  {
    name: "Sandrine Owona",
    category: "HOUSEMATE_SUPPORT",
    city: "BAMENDA",
    neighbourhood: "UP_STATION",
    yearsExperience: 2,
    languages: ["FRENCH", "PIDGIN"],
    workType: "PART_TIME",
    monthlyRate: 55_000,
    bio: "Part-time housemate support for light errands, tidying and company for busy professionals.",
    bioFr: "Soutien de vie partagée à temps partiel pour les courses légères, le rangement et la compagnie des professionnels occupés.",
    skills: ["Errands", "Tidying", "Flexible scheduling"],
    skillsFr: ["Courses", "Rangement", "Horaires flexibles"],
    rating: 4.1,
    reviews: [
      {
        authorName: "Olga R.",
        rating: 4,
        comment: "Reliable for a few hours a week, friendly demeanor.",
        commentFr: "Fiable pour quelques heures par semaine, caractère agréable.",
        daysAgo: 12,
      },
    ],
    phone: "+237 652 55 66 77",
  },
];

export function buildProviders(today: string = DEMO_TODAY): Provider[] {
  return PROVIDER_SEEDS.map((seed, index) => {
    const status = seed.status ?? "APPROVED";
    const id = `provider-${index + 1}`;
    const isApproved = status === "APPROVED";
    return {
      id,
      name: seed.name,
      initials: initialsOf(seed.name),
      avatarColor: colorFor(index),
      category: seed.category,
      city: seed.city,
      neighbourhood: seed.neighbourhood,
      yearsExperience: seed.yearsExperience,
      languages: seed.languages,
      workType: seed.workType,
      monthlyRate: seed.monthlyRate,
      isPerJobRate: seed.isPerJobRate ?? false,
      bio: seed.bio,
      bioFr: seed.bioFr,
      skills: seed.skills,
      skillsFr: seed.skillsFr,
      vetting: isApproved ? FULL_VETTING : PARTIAL_VETTING,
      referees: DEFAULT_REFEREES,
      rating: seed.rating,
      reviews: seed.reviews.map((r, rIndex) => ({
        id: `${id}-review-${rIndex + 1}`,
        authorName: r.authorName,
        rating: r.rating,
        comment: r.comment,
        commentFr: r.commentFr,
        date: daysAgoFrom(today, r.daysAgo),
      })),
      status,
      availability: seed.availability ?? "AVAILABLE",
      interviewSlot: status === "INTERVIEW_SCHEDULED" ? daysAgoFrom(today, -3) : undefined,
      phone: seed.phone,
      momoNumber: seed.phone,
      documents: isApproved ? approvedDocuments() : pendingDocuments(),
    };
  });
}

export const GRACE_MBAH_ID = "provider-1";
export const JACQUELINE_NDIVE_ID = "provider-7";

export function buildEmployer(): Employer {
  return {
    id: "employer-1",
    name: "Mrs. Esther Ngwa",
    initials: "EN",
    avatarColor: "#0F5E5A",
    city: "DOUALA",
    neighbourhood: "BONAMOUSSADI",
    phone: "+237 670 12 34 56",
    shortlistedProviderIds: [],
  };
}

export const EMPLOYER_ID = "employer-1";
export const ADMIN_NAME = "ProAid Admin";

/**
 * Seed scenario: the employer already has 10 funded loyalty months from an earlier contract
 * (lightweight synthetic backfill — no fully-modeled booking behind it, per the approved plan),
 * plus an active 6-month Monthly nanny contract (Jacqueline Ndive) continuing from loyalty
 * month 11, two periods already funded.
 */
export function buildSeedLoyaltyAndBooking(today: string = DEMO_TODAY): {
  loyaltyHistory: LoyaltyMonthRecord[];
  booking: Booking;
} {
  const backfill: LoyaltyMonthRecord[] = Array.from({ length: 10 }, (_, i) => ({
    loyaltyMonthNumber: i + 1,
    employerId: EMPLOYER_ID,
    contractId: "prior-contract-seed",
    contractMonthNumber: i + 1,
    monthStartDate: daysAgoFrom(today, (10 - i) * 30),
    state: "FUNDED" as const,
  }));

  const contractId = "booking-seed-1";
  const startDate = daysAgoFrom(today, 60).slice(0, 10);
  const { periods, loyaltyRecords } = generateMonthlyPeriods(
    EMPLOYER_ID,
    contractId,
    startDate,
    6,
    120_000,
    backfill,
    SRS_V2_FEE_CONFIG
  );

  // Fund and release the first two periods; leave the rest as generated (awaiting funding).
  // Period 2 is FUNDED with its payment date set to tomorrow: dispute-raisable right now, and one
  // clock-advance (1 day) auto-releases it per BR-PAY-5. Period 3's funding window end is set to
  // today: one clock-advance (1 day) flips it to Overdue per BR-PAY-4.
  const fundedPeriods = periods.map((period, index) => {
    if (index === 0) {
      return { ...period, id: `${contractId}-period-1`, status: "RELEASED" as const };
    }
    if (index === 1) {
      return {
        ...period,
        id: `${contractId}-period-2`,
        status: "FUNDED" as const,
        paymentDate: addDays(today, 1),
      };
    }
    if (index === 2) {
      return {
        ...period,
        id: `${contractId}-period-${index + 1}`,
        status: "AWAITING_FUNDING" as const,
        fundingWindowEndDate: today,
      };
    }
    return { ...period, id: `${contractId}-period-${index + 1}`, status: "AWAITING_FUNDING" as const };
  });

  const loyaltyHistory = [
    ...backfill,
    { ...loyaltyRecords[0], state: "FUNDED" as const },
    { ...loyaltyRecords[1], state: "FUNDED" as const },
    ...loyaltyRecords.slice(2),
  ];

  const booking: Booking = {
    id: contractId,
    providerId: JACQUELINE_NDIVE_ID,
    employerId: EMPLOYER_ID,
    category: "COOK",
    contractKind: "LONG_CONTRACT",
    scheduleType: "MONTHLY",
    status: "ACTIVE",
    startDate,
    durationMonths: 6,
    wage: 120_000,
    notes: "Weekday lunches and dinners for a family of four. Mild spice preferred.",
    employerSignature: { signed: true, fullName: "Esther Ngwa", timestamp: daysAgoFrom(today, 61) },
    providerSignature: { signed: true, fullName: "Jacqueline Ndive", timestamp: daysAgoFrom(today, 61) },
    messages: [
      {
        id: "booking-seed-1-msg-1",
        senderRole: "EMPLOYER",
        senderName: "Mrs. Esther Ngwa",
        text: "Hi Jacqueline, excited to have you starting this week!",
        textFr: "Bonjour Jacqueline, ravie de vous avoir dès cette semaine !",
        timestamp: daysAgoFrom(today, 60),
      },
      {
        id: "booking-seed-1-msg-2",
        senderRole: "PROVIDER",
        senderName: "Jacqueline Ndive",
        text: "Thank you Mrs. Ngwa, looking forward to it. Any allergies I should know about?",
        textFr: "Merci Mme Ngwa, j'ai hâte. Y a-t-il des allergies que je devrais connaître ?",
        timestamp: daysAgoFrom(today, 59),
      },
    ],
    periods: fundedPeriods,
    offerRounds: 0,
    createdAt: daysAgoFrom(today, 62),
    updatedAt: daysAgoFrom(today, 30),
  };

  return { loyaltyHistory, booking };
}

/** Seed scenario: a completed one-off short job (BR-FEE-1: flat 14% commission, paid once). */
export function buildSeedShortJobBooking(today: string = DEMO_TODAY): {
  booking: Booking;
  transactions: Transaction[];
} {
  const bookingId = "booking-seed-2";
  const wage = 30_000;
  const fee = calculateShortJobFee(wage, SRS_V2_FEE_CONFIG);
  const startDate = daysAgoFrom(today, 5).slice(0, 10);
  const signedAt = daysAgoFrom(today, 5);
  const completedAt = daysAgoFrom(today, 4);

  const booking: Booking = {
    id: bookingId,
    providerId: GRACE_MBAH_ID,
    employerId: EMPLOYER_ID,
    category: "NANNY",
    contractKind: "SHORT_JOB",
    status: "COMPLETED",
    startDate,
    durationMonths: 1,
    wage,
    notes: "One Saturday evening of babysitting for a birthday party.",
    employerSignature: { signed: true, fullName: "Esther Ngwa", timestamp: signedAt },
    providerSignature: { signed: true, fullName: "Grace Mbah", timestamp: signedAt },
    messages: [],
    periods: [],
    offerRounds: 0,
    createdAt: daysAgoFrom(today, 6),
    updatedAt: completedAt,
  };

  const transactions: Transaction[] = [
    {
      id: `${bookingId}-txn-fund`,
      type: "FUNDING",
      bookingId,
      amount: fee.employerPays,
      description: "Short job funded",
      descriptionFr: "Travail ponctuel financé",
      timestamp: signedAt,
      reference: "MOMO-FUND-2000",
    },
    {
      id: `${bookingId}-txn-commission`,
      type: "COMMISSION",
      bookingId,
      amount: fee.commission,
      description: "Commission recognized, short job",
      descriptionFr: "Commission reconnue, travail ponctuel",
      timestamp: signedAt,
      reference: "COMM-2000",
    },
    {
      id: `${bookingId}-txn-payout`,
      type: "PAYOUT",
      bookingId,
      amount: wage,
      description: "Payout, short job completed",
      descriptionFr: "Paiement, travail ponctuel terminé",
      timestamp: completedAt,
      reference: "PAYOUT-2000",
    },
  ];

  return { booking, transactions };
}

/**
 * Seed scenario: a 4-month Half and Half long contract offer awaiting the provider's signature
 * (employer has already signed) — demonstrates BR-PAY-3's twice-per-contract funding schedule
 * before any period exists (periods are only generated once both parties have signed).
 */
export function buildSeedHalfAndHalfOffer(today: string = DEMO_TODAY): Booking {
  const bookingId = "booking-seed-3";
  const durationMonths = 4;
  const startDate = addDays(today, 7);
  const endDate = addDays(addMonthsClamped(startDate, durationMonths), -1);
  const signedAt = daysAgoFrom(today, 0);

  const booking: Booking = {
    id: bookingId,
    providerId: GRACE_MBAH_ID,
    employerId: EMPLOYER_ID,
    category: "NANNY",
    contractKind: "LONG_CONTRACT",
    scheduleType: "HALF_AND_HALF",
    status: "PENDING_SIGNATURES",
    startDate,
    durationMonths,
    endDate,
    wage: 75_000,
    notes: "Part-time holiday-season childcare, four-month contract paid in two halves.",
    employerSignature: { signed: true, fullName: "Esther Ngwa", timestamp: signedAt },
    providerSignature: { signed: false, fullName: null, timestamp: null },
    messages: [
      {
        id: `${bookingId}-msg-1`,
        senderRole: "EMPLOYER",
        senderName: "Mrs. Esther Ngwa",
        text: "Hi Grace, here's the four-month offer we discussed, paid in two halves.",
        textFr: "Bonjour Grace, voici l'offre de quatre mois dont nous avons parlé, payée en deux moitiés.",
        timestamp: signedAt,
      },
    ],
    periods: [],
    offerRounds: 0,
    createdAt: signedAt,
    updatedAt: signedAt,
  };

  return booking;
}

export function buildSeedTransactions(booking: Booking): Transaction[] {
  const transactions: Transaction[] = [];
  booking.periods.forEach((period, index) => {
    if (period.status === "RELEASED" || period.status === "FUNDED") {
      transactions.push({
        id: `txn-fund-${index + 1}`,
        type: "FUNDING",
        bookingId: booking.id,
        amount: period.employerPaysTotal,
        description: `Period ${index + 1} funded`,
        descriptionFr: `Période ${index + 1} financée`,
        timestamp: period.startDate,
        reference: `MOMO-FUND-${1000 + index}`,
      });
      transactions.push({
        id: `txn-commission-${index + 1}`,
        type: "COMMISSION",
        bookingId: booking.id,
        amount: period.commissionTotal,
        description: `Commission recognized, period ${index + 1}`,
        descriptionFr: `Commission reconnue, période ${index + 1}`,
        timestamp: period.startDate,
        reference: `COMM-${1000 + index}`,
      });
    }
    if (period.status === "RELEASED") {
      transactions.push({
        id: `txn-payout-${index + 1}`,
        type: "PAYOUT",
        bookingId: booking.id,
        amount: period.wageTotal,
        description: `Payout to provider, period ${index + 1}`,
        descriptionFr: `Paiement au prestataire, période ${index + 1}`,
        timestamp: period.paymentDate,
        reference: `PAYOUT-${1000 + index}`,
      });
    }
  });
  return transactions;
}

const PLACEMENT_COUNTS = [4, 7, 9, 14, 18, 23];
const COMMISSION_COUNTS = [95_000, 158_000, 203_000, 312_000, 398_000, 512_000];

export function buildAdminStats(
  providers: Provider[],
  overduePeriods: number,
  openDisputes: number
): AdminStats {
  const now = new Date(`${DEMO_TODAY}T00:00:00Z`);
  const placementsPerMonth: PlacementStat[] = PLACEMENT_COUNTS.map((count, idx) => {
    const monthsBack = PLACEMENT_COUNTS.length - 1 - idx;
    const d = new Date(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1);
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      placements: count,
    };
  });

  const commissionPerMonth: CommissionStat[] = COMMISSION_COUNTS.map((commission, idx) => {
    const monthsBack = COMMISSION_COUNTS.length - 1 - idx;
    const d = new Date(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1);
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      commission,
    };
  });

  const activeProviders = providers.filter((p) => p.status === "APPROVED").length;
  const pendingVerifications = providers.filter(
    (p) => p.status !== "APPROVED" && p.status !== "REJECTED" && p.status !== "SUSPENDED"
  ).length;

  return {
    placementsPerMonth,
    commissionPerMonth,
    totalContractValue: 8_450_000,
    totalCommission: COMMISSION_COUNTS.reduce((sum, v) => sum + v, 0),
    activeProviders,
    pendingVerifications,
    overduePeriods,
    openDisputes,
  };
}
