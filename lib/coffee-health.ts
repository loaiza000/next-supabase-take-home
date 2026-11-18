export const PAGE_SIZE = 50;

export const countries = [
  "Australia", "Belgium", "Brazil", "Canada", "China", "Finland", "France",
  "Germany", "India", "Italy", "Japan", "Mexico", "Netherlands", "Norway",
  "South Korea", "Spain", "Sweden", "Switzerland", "UK", "USA",
] as const;
export const genders = ["Female", "Male", "Other"] as const;
export const sleepQualities = ["Excellent", "Fair", "Good", "Poor"] as const;
export const stressLevels = ["High", "Low", "Medium"] as const;

export type CoffeeHealthRow = {
  id: number;
  age: number;
  gender: string;
  country: string;
  coffee_intake: number;
  caffeine_mg: number;
  sleep_hours: number;
  sleep_quality: string;
  bmi: number;
  heart_rate: number;
  stress_level: string;
  physical_activity_hours: number;
  health_issues: string;
  occupation: string;
  smoking: boolean;
  alcohol_consumption: boolean;
};

type SearchParams = Record<string, string | string[] | undefined>;

export type Filters = {
  country: string;
  gender: string;
  sleepQuality: string;
  stressLevel: string;
  minAge: number | null;
  maxAge: number | null;
  after: number | null;
  before: number | null;
};

function single(value: string | string[] | undefined) {
  if (Array.isArray(value)) throw new Error("A filter can only be provided once.");
  return value ?? "";
}

function choice(value: string, options: readonly string[], label: string) {
  if (value && !options.includes(value)) throw new Error(`Invalid ${label} filter.`);
  return value;
}

function integer(value: string, label: string, min: number, max: number) {
  if (!value) return null;
  if (!/^\d+$/.test(value)) throw new Error(`Invalid ${label}.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`Invalid ${label}.`);
  }
  return parsed;
}

export function parseFilters(params: SearchParams): Filters {
  const minAge = integer(single(params.minAge), "minimum age", 0, 120);
  const maxAge = integer(single(params.maxAge), "maximum age", 0, 120);
  const after = integer(single(params.after), "cursor", 1, 2_147_483_647);
  const before = integer(single(params.before), "cursor", 1, 2_147_483_647);
  if (minAge !== null && maxAge !== null && minAge > maxAge) {
    throw new Error("Minimum age must be at most maximum age.");
  }
  if (after !== null && before !== null) throw new Error("Choose one page direction.");
  return {
    country: choice(single(params.country), countries, "country"),
    gender: choice(single(params.gender), genders, "gender"),
    sleepQuality: choice(single(params.sleepQuality), sleepQualities, "sleep quality"),
    stressLevel: choice(single(params.stressLevel), stressLevels, "stress level"),
    minAge, maxAge, after, before,
  };
}

export function pageUrl(filters: Filters, direction?: "after" | "before", cursor?: number) {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.sleepQuality) params.set("sleepQuality", filters.sleepQuality);
  if (filters.stressLevel) params.set("stressLevel", filters.stressLevel);
  if (filters.minAge !== null) params.set("minAge", String(filters.minAge));
  if (filters.maxAge !== null) params.set("maxAge", String(filters.maxAge));
  if (direction && cursor !== undefined) params.set(direction, String(cursor));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
