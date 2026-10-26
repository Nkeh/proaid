import type {
  AdminStats,
  Booking,
  Employer,
  FeeStat,
  PlacementStat,
  Provider,
  SubmittedDocument,
  Transaction,
  VerificationChecklist,
  Wallet,
} from "./types";

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

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const FULL_VERIFICATION: VerificationChecklist = {
  idVerified: true,
  referencesConfirmed: true,
  medicalCertificate: true,
  skillsCheck: true,
};

const PARTIAL_VERIFICATION: VerificationChecklist = {
  idVerified: true,
  referencesConfirmed: false,
  medicalCertificate: false,
  skillsCheck: false,
};

function approvedDocuments(): SubmittedDocument[] {
  return [
    { id: "idCard", labelKey: "idCard", status: "SUBMITTED" },
    { id: "proofOfAddress", labelKey: "proofOfAddress", status: "SUBMITTED" },
    { id: "referenceLetter", labelKey: "referenceLetter", status: "SUBMITTED" },
    { id: "medicalCertificate", labelKey: "medicalCertificate", status: "SUBMITTED" },
  ];
}

function pendingDocuments(): SubmittedDocument[] {
  return [
    { id: "idCard", labelKey: "idCard", status: "SUBMITTED" },
    { id: "proofOfAddress", labelKey: "proofOfAddress", status: "SUBMITTED" },
    { id: "referenceLetter", labelKey: "referenceLetter", status: "MISSING" },
    { id: "medicalCertificate", labelKey: "medicalCertificate", status: "MISSING" },
  ];
}

interface ProviderSeed {
  name: string;
  category: Provider["category"];
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
      {
        authorName: "Astrid N.",
        rating: 4,
        comment: "Great with homework routines. Sometimes arrives a few minutes late.",
        commentFr: "Très bonne avec les devoirs. Arrive parfois quelques minutes en retard.",
        daysAgo: 150,
      },
    ],
    phone: "+237 677 12 34 56",
  },
  {
    name: "Solange Fomekong",
    category: "NANNY",
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
      {
        authorName: "Linda A.",
        rating: 4,
        comment: "Reliable and caring, communicates mostly in French.",
        commentFr: "Fiable et attentionnée, communique surtout en français.",
        daysAgo: 130,
      },
    ],
    phone: "+237 691 22 33 44",
  },
  {
    name: "Blandine Ngo Bitang",
    category: "NANNY",
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
    status: "PENDING_VERIFICATION",
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
    reviews: [
      {
        authorName: "Esther N.",
        rating: 5,
        comment: "Jacqueline's ndolé is the best we've had - always on time and spotless kitchen.",
        commentFr: "Le ndolé de Jacqueline est le meilleur qu'on ait mangé - toujours à l'heure et une cuisine impeccable.",
        daysAgo: 25,
      },
      {
        authorName: "Marc L.",
        rating: 5,
        comment: "Very professional, adapts menus to dietary needs easily.",
        commentFr: "Très professionnelle, adapte facilement les menus aux besoins alimentaires.",
        daysAgo: 110,
      },
    ],
    phone: "+237 674 88 99 00",
  },
  {
    name: "Florence Abena",
    category: "COOK",
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
    name: "Emmanuel Nkeng",
    category: "COOK",
    neighbourhood: "NDOGBONG",
    yearsExperience: 5,
    languages: ["ENGLISH", "PIDGIN"],
    workType: "LIVE_OUT",
    monthlyRate: 95_000,
    bio: "Versatile cook trained in both local and continental dishes, previously worked for an expatriate family.",
    bioFr: "Cuisinier polyvalent formé à la cuisine locale et continentale, a précédemment travaillé pour une famille expatriée.",
    skills: ["Continental cuisine", "Meal planning", "Grocery management"],
    skillsFr: ["Cuisine continentale", "Planification des repas", "Gestion des courses"],
    rating: 4.6,
    status: "PENDING_VERIFICATION",
    reviews: [
      {
        authorName: "James O.",
        rating: 5,
        comment: "Cooked for our family for two years before we relocated - excellent cook.",
        commentFr: "A cuisiné pour notre famille pendant deux ans avant notre déménagement - excellent cuisinier.",
        daysAgo: 400,
      },
    ],
    phone: "+237 679 00 11 22",
  },
  {
    name: "Agnes Tabe",
    category: "ELDERLY_CAREGIVER",
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
      {
        authorName: "Clarisse B.",
        rating: 5,
        comment: "Could not have asked for a better caregiver for my grandmother.",
        commentFr: "Je ne pouvais pas espérer une meilleure aidante pour ma grand-mère.",
        daysAgo: 200,
      },
    ],
    phone: "+237 654 11 22 33",
  },
  {
    name: "Celestine Mballa",
    category: "ELDERLY_CAREGIVER",
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
    neighbourhood: "AKWA",
    yearsExperience: 4,
    languages: ["ENGLISH", "FRENCH"],
    workType: "LIVE_OUT",
    monthlyRate: 100_000,
    bio: "Attentive caregiver providing daytime support, including meal prep and accompanying clients to appointments.",
    bioFr: "Aidante attentive proposant un accompagnement en journée, incluant la préparation des repas et l'accompagnement aux rendez-vous.",
    skills: ["Daytime support", "Appointment accompaniment", "Meal prep"],
    skillsFr: ["Accompagnement en journée", "Accompagnement aux rendez-vous", "Préparation des repas"],
    rating: 4.5,
    reviews: [
      {
        authorName: "Nadine P.",
        rating: 4,
        comment: "Very attentive and communicates well with the family.",
        commentFr: "Très attentive et communique bien avec la famille.",
        daysAgo: 45,
      },
    ],
    phone: "+237 676 33 44 55",
  },
  {
    name: "Honoré Biya Essiane",
    category: "HOUSEMATE_SUPPORT",
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
    neighbourhood: "KOTTO",
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

export function buildProviders(): Provider[] {
  return PROVIDER_SEEDS.map((seed, index) => {
    const status = seed.status ?? "APPROVED";
    const id = `provider-${index + 1}`;
    return {
      id,
      name: seed.name,
      initials: initialsOf(seed.name),
      avatarColor: colorFor(index),
      category: seed.category,
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
      verification: status === "APPROVED" ? FULL_VERIFICATION : PARTIAL_VERIFICATION,
      rating: seed.rating,
      reviews: seed.reviews.map((r, rIndex) => ({
        id: `${id}-review-${rIndex + 1}`,
        authorName: r.authorName,
        rating: r.rating,
        comment: r.comment,
        commentFr: r.commentFr,
        date: daysAgo(r.daysAgo),
      })),
      status,
      phone: seed.phone,
      momoNumber: seed.phone,
      documents: status === "APPROVED" ? approvedDocuments() : pendingDocuments(),
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
    neighbourhood: "BONAMOUSSADI",
    phone: "+237 670 12 34 56",
  };
}

export const EMPLOYER_ID = "employer-1";
export const ADMIN_NAME = "ProAid Admin";

export function buildSeedBooking(): Booking {
  const topUpDate = daysAgo(55);
  return {
    id: "booking-seed-1",
    providerId: JACQUELINE_NDIVE_ID,
    employerId: EMPLOYER_ID,
    category: "COOK",
    contractType: "MONTHLY",
    status: "FUNDED",
    startDate: daysAgo(50),
    durationMonths: 6,
    currentMonth: 2,
    amount: 120_000,
    notes: "Weekday lunches and dinners for a family of four. Mild spice preferred.",
    employerSignature: { signed: true, fullName: "Esther Ngwa", timestamp: topUpDate },
    providerSignature: { signed: true, fullName: "Jacqueline Ndive", timestamp: topUpDate },
    messages: [
      {
        id: "booking-seed-1-msg-1",
        senderRole: "EMPLOYER",
        senderName: "Mrs. Esther Ngwa",
        text: "Hi Jacqueline, excited to have you starting this week!",
        textFr: "Bonjour Jacqueline, ravie de vous avoir dès cette semaine !",
        timestamp: daysAgo(50),
      },
      {
        id: "booking-seed-1-msg-2",
        senderRole: "PROVIDER",
        senderName: "Jacqueline Ndive",
        text: "Thank you Mrs. Ngwa, looking forward to it. Any allergies I should know about?",
        textFr: "Merci Mme Ngwa, j'ai hâte. Y a-t-il des allergies que je devrais connaître ?",
        timestamp: daysAgo(49),
      },
      {
        id: "booking-seed-1-msg-3",
        senderRole: "EMPLOYER",
        senderName: "Mrs. Esther Ngwa",
        text: "No allergies, just mild spice for the kids please.",
        textFr: "Aucune allergie, juste peu épicé pour les enfants s'il vous plaît.",
        timestamp: daysAgo(49),
      },
    ],
    createdAt: daysAgo(51),
    updatedAt: daysAgo(5),
  };
}

export function buildWalletAndTransactions(booking: Booking): Wallet {
  const transactions: Transaction[] = [
    {
      id: "txn-1",
      type: "FUNDING",
      bookingId: null,
      amount: 1_000_000,
      description: "Wallet top-up via MTN MoMo",
      descriptionFr: "Rechargement du portefeuille via MTN MoMo",
      timestamp: daysAgo(55),
      reference: "MOMO-TOPUP-88213",
    },
    {
      id: "txn-2",
      type: "FUNDING",
      bookingId: booking.id,
      amount: 120_000,
      description: "Escrow funded for Jacqueline Ndive - month 1",
      descriptionFr: "Escrow financé pour Jacqueline Ndive - mois 1",
      timestamp: daysAgo(50),
      reference: "MOMO-FUND-10234",
    },
    {
      id: "txn-3",
      type: "FEE",
      bookingId: booking.id,
      amount: 15_600,
      description: "Platform fee - Jacqueline Ndive, month 1",
      descriptionFr: "Frais de plateforme - Jacqueline Ndive, mois 1",
      timestamp: daysAgo(20),
      reference: "FEE-10234",
    },
    {
      id: "txn-4",
      type: "PAYOUT",
      bookingId: booking.id,
      amount: 104_400,
      description: "Payout to Jacqueline Ndive - month 1",
      descriptionFr: "Paiement à Jacqueline Ndive - mois 1",
      timestamp: daysAgo(20),
      reference: "PAYOUT-10234",
    },
    {
      id: "txn-5",
      type: "FUNDING",
      bookingId: booking.id,
      amount: 120_000,
      description: "Escrow funded for Jacqueline Ndive - month 2",
      descriptionFr: "Escrow financé pour Jacqueline Ndive - mois 2",
      timestamp: daysAgo(5),
      reference: "MOMO-FUND-10298",
    },
  ];

  const totalIn = transactions
    .filter((t) => t.type === "FUNDING")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutOfBalance = transactions
    .filter((t) => t.type === "FUNDING" && t.bookingId !== null)
    .reduce((sum, t) => sum + t.amount, 0);
  const topUps = transactions
    .filter((t) => t.type === "FUNDING" && t.bookingId === null)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = topUps - totalOutOfBalance;
  const escrowHeld = booking.status === "FUNDED" || booking.status === "ACCEPTED" || booking.status === "CONTRACT_SIGNED"
    ? 120_000
    : 0;

  void totalIn;

  return { balance, escrowHeld, transactions };
}

const PLACEMENT_COUNTS = [4, 7, 9, 14, 18, 23];
const FEE_COUNTS = [95_000, 158_000, 203_000, 312_000, 398_000, 512_000];

export function buildAdminStats(providers: Provider[]): AdminStats {
  const now = new Date();
  const placementsPerMonth: PlacementStat[] = PLACEMENT_COUNTS.map((count, idx) => {
    const monthsBack = PLACEMENT_COUNTS.length - 1 - idx;
    const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      placements: count,
    };
  });

  const feesPerMonth: FeeStat[] = FEE_COUNTS.map((fees, idx) => {
    const monthsBack = FEE_COUNTS.length - 1 - idx;
    const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      fees,
    };
  });

  const activeProviders = providers.filter((p) => p.status === "APPROVED").length;
  const pendingVerifications = providers.filter((p) => p.status === "PENDING_VERIFICATION").length;

  const totalContractValue = 8_450_000;
  const totalPlatformFees = FEE_COUNTS.reduce((sum, v) => sum + v, 0);

  return {
    placementsPerMonth,
    feesPerMonth,
    totalContractValue,
    totalPlatformFees,
    activeProviders,
    pendingVerifications,
  };
}
