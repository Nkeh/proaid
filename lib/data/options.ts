import type { Category, City, Neighbourhood, SpokenLanguage, WorkType } from "./types";

export const CATEGORY_OPTIONS: Category[] = [
  "NANNY",
  "HOUSE_HELP",
  "COOK",
  "ELDERLY_CAREGIVER",
  "HOUSEMATE_SUPPORT",
];

export const NEIGHBOURHOOD_OPTIONS: Neighbourhood[] = [
  // Douala
  "BONAPRISO",
  "AKWA",
  "BONANJO",
  "BONAMOUSSADI",
  "MAKEPE",
  "KOTTO",
  "LOGPOM",
  "DEIDO",
  "BONABERI",
  "NDOGBONG",
  // Bamenda
  "UP_STATION",
  "NKWEN",
  "OLD_TOWN",
  "MANKON",
  "NTARIKON",
];

export const CITY_OPTIONS: City[] = ["DOUALA", "BAMENDA"];

export const NEIGHBOURHOODS_BY_CITY: Record<City, Neighbourhood[]> = {
  DOUALA: [
    "BONAPRISO",
    "AKWA",
    "BONANJO",
    "BONAMOUSSADI",
    "MAKEPE",
    "KOTTO",
    "LOGPOM",
    "DEIDO",
    "BONABERI",
    "NDOGBONG",
  ],
  BAMENDA: ["UP_STATION", "NKWEN", "OLD_TOWN", "MANKON", "NTARIKON"],
};

export const WORK_TYPE_OPTIONS: WorkType[] = ["LIVE_IN", "LIVE_OUT", "PART_TIME"];

export const LANGUAGE_OPTIONS: SpokenLanguage[] = ["ENGLISH", "FRENCH", "PIDGIN"];
